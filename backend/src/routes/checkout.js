import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Order, Product, User, Coupon, sequelize } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { checkoutSchema, verifyPaymentSchema, cancelCheckoutSchema } from '../validators/orderValidator.js';
import { normalizeOrderAddress } from '../utils/orderAddress.js';
import { applyCoupon, incrementCouponUsage } from '../services/couponService.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';

const router = Router();

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OSH-${date}-${rand}`;
}

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { instance: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId };
}

/**
 * POST /api/v1/checkout — unified checkout (COD, wallet, Razorpay)
 */
router.post('/', authenticate, validate(checkoutSchema), async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { items: requestItems, paymentMethod, couponCode, walletAmount: walletReq } = req.body;
    const address = normalizeOrderAddress(req.body.address);
    if (!address?.line1 || !address?.pincode) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid shipping address' });
    }

    const user = await User.findByPk(req.user.uid, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch all products involved and build verified items list
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of requestItems) {
      const product = await Product.findByPk(item.productId, { lock: true, transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(400).json({ error: `Product not found: ${item.name || item.productId}` });
      }

      // Stock checks
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
      }

      const price = Number(product.discountPrice || product.price);
      const line = price * item.quantity;
      subtotal += line;

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        price: price,
        quantity: item.quantity,
        image: product.images?.[0],
        size: item.size,
        color: item.color,
      });
    }
    subtotal = Math.round(subtotal * 100) / 100;

    let discount = 0;
    let couponRow = null;
    if (couponCode) {
      const applied = await applyCoupon(couponCode, subtotal);
      if (applied.error) {
        await transaction.rollback();
        return res.status(400).json({ error: applied.error });
      }
      discount = applied.discount;
      couponRow = applied.coupon;
    }

    let walletUse = Math.min(Number(walletReq || 0), Number(user.walletBalance || 0), subtotal - discount);
    walletUse = Math.max(0, Math.round(walletUse * 100) / 100);

    let total = subtotal - discount - walletUse;
    total = Math.round(total * 100) / 100;

    const gstNote = process.env.GST_DISPLAY_TEXT || 'Prices inclusive of GST where applicable';

    const isOnline = ['razorpay', 'upi', 'card'].includes(paymentMethod);

    if (total <= 0 && !isOnline) {
      // Fully covered by wallet + coupon
      if (walletUse > 0) {
        await User.decrement('walletBalance', { by: walletUse, where: { uid: req.user.uid }, transaction });
      }
      const orderNumber = generateOrderNumber();
      const order = await Order.create({
        orderNumber,
        userId: req.user.uid,
        items: verifiedItems,
        subtotalAmount: subtotal,
        discountAmount: discount,
        walletAmount: walletUse,
        couponCode: couponRow ? couponRow.code : null,
        totalAmount: 0,
        address,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'wallet',
        paymentStatus: 'paid',
        status: 'pending',
        gstNote,
      }, { transaction });

      for (const item of verifiedItems) {
        await Product.decrement('stock', { by: item.quantity, where: { id: item.productId }, transaction });
      }
      if (couponRow) {
        await incrementCouponUsage(couponRow.id);
        await Order.update({ couponRedeemed: true }, { where: { id: order.id }, transaction });
      }
      await transaction.commit();

      sendOrderConfirmationEmail(user.email, {
        orderNumber: order.orderNumber,
        totalAmount: 0,
        paymentMethod: 'wallet',
        paymentStatus: 'paid',
      }).catch(() => {});

      return res.status(201).json({ order, razorpay: null });
    }

    if (isOnline) {
      const rz = getRazorpay();
      if (!rz) {
        await transaction.rollback();
        return res.status(503).json({
          error: 'Online payments are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET or pay by COD.',
        });
      }

      if (total <= 0) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Nothing to charge online — use wallet/coupon adjustment.' });
      }

      const orderNumber = generateOrderNumber();
      const amountPaise = Math.round(total * 100);

      const order = await Order.create({
        orderNumber,
        userId: req.user.uid,
        items: verifiedItems,
        subtotalAmount: subtotal,
        discountAmount: discount,
        walletAmount: walletUse,
        couponCode: couponRow ? couponRow.code : null,
        totalAmount: total,
        address,
        paymentMethod,
        paymentStatus: 'awaiting_payment',
        status: 'pending',
        gstNote,
      }, { transaction });

      if (walletUse > 0) {
        await User.decrement('walletBalance', { by: walletUse, where: { uid: req.user.uid }, transaction });
      }

      for (const item of verifiedItems) {
        await Product.decrement('stock', { by: item.quantity, where: { id: item.productId }, transaction });
      }

      let razorpayOrder;
      const isMockEnabled = process.env.RAZORPAY_ENABLE_MOCK === 'true';

      if (isMockEnabled) {
        razorpayOrder = { id: `order_mock_${Math.random().toString(36).substring(7)}` };
        logger.info(`MOCK PAYMENT: Created mock order ${razorpayOrder.id} for testing.`);
      } else {
        try {
          const keyId = process.env.RAZORPAY_KEY_ID;
          if (!keyId || keyId.includes('yourkeyhere')) {
            throw new Error('RAZORPAY_KEY_ID is missing or contains placeholder values. Please set valid keys in the .env file or enable RAZORPAY_ENABLE_MOCK=true.');
          }

          const receipt = orderNumber.replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
          razorpayOrder = await rz.instance.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt: receipt || order.id.replace(/-/g, '').slice(0, 40),
            notes: { orderNumber, userId: req.user.uid },
          });
        } catch (e) {
          await transaction.rollback();
          
          // Improved error extraction
          let errorMsg = 'Unknown Razorpay error';
          if (e.error?.description) errorMsg = e.error.description;
          else if (e.message) errorMsg = e.message;
          else if (typeof e === 'string') errorMsg = e;
          else if (e.description) errorMsg = e.description;

          logger.error(`Razorpay order create failed: ${errorMsg}`, { 
            error: typeof e === 'object' ? JSON.stringify(e) : e 
          });
          
          const statusCode = (errorMsg.includes('KEY_ID') || errorMsg.includes('placeholder')) ? 400 : 502;
          return res.status(statusCode).json({ 
            error: errorMsg.includes('placeholder')
              ? 'Payments are not yet configured. Admin needs to set valid Razorpay keys or enable mock mode.'
              : `Payment provider error: ${errorMsg}` 
          });
        }
      }

      await order.update({ razorpayOrderId: razorpayOrder.id }, { transaction });
      await transaction.commit();

      return res.status(201).json({
        order,
        razorpay: {
          keyId: rz.keyId,
          orderId: razorpayOrder.id,
          amount: amountPaise,
          currency: 'INR',
          name: process.env.STORE_DISPLAY_NAME || 'OneStep Hub',
          description: `Order ${orderNumber}`,
          prefill: { email: user.email, contact: user.phone || address.phone },
          isMock: isMockEnabled,
        },
      });
    }

    // COD
    if (walletUse > 0) {
      await User.decrement('walletBalance', { by: walletUse, where: { uid: req.user.uid }, transaction });
    }

    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      userId: req.user.uid,
      items: verifiedItems,
      subtotalAmount: subtotal,
      discountAmount: discount,
      walletAmount: walletUse,
      couponCode: couponRow ? couponRow.code : null,
      totalAmount: total,
      address,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'pending',
      gstNote,
    }, { transaction });

    for (const item of verifiedItems) {
      await Product.decrement('stock', { by: item.quantity, where: { id: item.productId }, transaction });
    }
    if (couponRow) {
      await incrementCouponUsage(couponRow.id);
      await order.update({ couponRedeemed: true }, { transaction });
    }
    await transaction.commit();

    sendOrderConfirmationEmail(user.email, {
      orderNumber: order.orderNumber,
      totalAmount: total,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
    }).catch(() => {});

    return res.status(201).json({ order, razorpay: null });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

/**
 * POST /api/v1/checkout/verify — Razorpay payment signature
 */
router.post('/verify', authenticate, validate(verifyPaymentSchema), async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isMockEnabled = process.env.RAZORPAY_ENABLE_MOCK === 'true';

    if (!isMockEnabled && !secret) return res.status(503).json({ error: 'Payments not configured' });

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (isMockEnabled && razorpay_signature === 'mock_signature') {
      logger.info(`MOCK PAYMENT VERIFIED: Signature verification skipped for order ${orderId}`);
    } else {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
      if (expected !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
    }

    const order = await Order.findByPk(orderId);
    if (!order || order.userId !== req.user.uid) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.paymentStatus === 'paid') {
      if (order.couponCode && !order.couponRedeemed) {
        const c = await Coupon.findOne({ where: { code: order.couponCode } });
        if (c) {
          await incrementCouponUsage(c.id);
          await order.update({ couponRedeemed: true });
        }
      }
      return res.json({ success: true, order });
    }
    if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ error: 'Order mismatch' });
    }

    await order.update({
      paymentStatus: 'paid',
      razorpayPaymentId: razorpay_payment_id,
      paymentId: razorpay_payment_id,
    });

    if (order.couponCode && !order.couponRedeemed) {
      const c = await Coupon.findOne({ where: { code: order.couponCode } });
      if (c) await incrementCouponUsage(c.id);
      await order.update({ couponRedeemed: true });
    }

    const user = await User.findByPk(req.user.uid);
    if (user) {
      sendOrderConfirmationEmail(user.email, {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: 'paid',
      }).catch(() => {});
    }

    res.json({ success: true, order });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/v1/checkout/cancel — abandon online payment, restore stock & wallet
 */
router.post('/cancel', authenticate, validate(cancelCheckoutSchema), async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.body.orderId, { transaction });
    if (!order || order.userId !== req.user.uid) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.paymentStatus !== 'awaiting_payment') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    for (const item of order.items) {
      await Product.increment('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction,
      });
    }

    const walletAmt = Number(order.walletAmount || 0);
    if (walletAmt > 0) {
      await User.increment({ walletBalance: walletAmt }, { where: { uid: order.userId }, transaction });
    }

    await order.update({
      status: 'cancelled',
      paymentStatus: 'failed',
      cancelReason: 'Payment abandoned or failed',
    }, { transaction });

    await transaction.commit();
    res.json({ success: true });
  } catch (e) {
    await transaction.rollback();
    next(e);
  }
});

export default router;
