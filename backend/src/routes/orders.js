import { Router } from 'express';
import Razorpay from 'razorpay';
import { Op } from 'sequelize';
import { Order, Product, User, SiteSetting, sequelize } from '../models/index.js';
import { authenticate, requireAdmin, requireSeller } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  requestReturnSchema,
} from '../validators/orderValidator.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';
import { ORDER_STATUS_TRANSITIONS } from '../utils/constants.js';
import { normalizeOrderAddress } from '../utils/orderAddress.js';
import { renderInvoiceHtml } from '../utils/invoiceHtml.js';
import logger from '../utils/logger.js';

const router = Router();

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OSH-${date}-${rand}`;
}

// GET /api/v1/orders — auth required; users see own, admins see all
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};
    if (req.user?.role !== 'admin') {
      where.userId = req.user.uid;
    } else if (req.query.userId) {
      where.userId = req.query.userId;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json(paginatedResponse(rows, count, { page, limit }));
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/orders/seller — orders containing seller's products
router.get('/seller', authenticate, requireSeller, async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const sellerUid = req.user.uid;
    const myProducts = await Product.findAll({
      where: { sellerId: sellerUid },
      attributes: ['id'],
    });
    const productIds = myProducts.map((p) => p.id);
    if (!productIds.length) {
      return res.json(paginatedResponse([], 0, { page, limit }));
    }

    // Items are JSON; use DB-side LIKE filtering instead of loading all recent orders in memory.
    const where = {
      [Op.or]: productIds.map((id) => ({ items: { [Op.like]: `%"productId":"${id}"%` } })),
    };
    const { count, rows } = await Order.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json(paginatedResponse(rows, count, { page, limit }));
  } catch (e) {
    next(e);
  }
});

// GET /api/v1/orders/:id/invoice — HTML invoice
router.get('/:id/invoice', authenticate, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user?.role !== 'admin' && order.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let storeName = 'OneStep Hub';
    let storeGstin = '';
    try {
      const s = await SiteSetting.findByPk('store');
      if (s?.value) {
        const j = JSON.parse(s.value);
        storeName = j.name || storeName;
        storeGstin = j.gstin || '';
      }
    } catch { /* */ }

    const html = renderInvoiceHtml(order, { storeName, storeGstin });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    next(e);
  }
});

// GET /api/v1/orders/:id — auth required
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (req.user?.role !== 'admin' && order.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/orders — legacy COD-style create (prefer /checkout)
router.post(
  '/',
  authenticate,
  (req, res, next) => {
    req.body.address = normalizeOrderAddress(req.body.address);
    next();
  },
  validate(createOrderSchema),
  async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
      const { items, totalAmount, address, paymentMethod } = req.body;

      for (const item of items) {
        const product = await Product.findByPk(item.productId, {
          lock: true,
          transaction,
        });
        if (!product) {
          await transaction.rollback();
          return res.status(400).json({ error: `Product "${item.name}" not found` });
        }
        if (product.stock < item.quantity) {
          await transaction.rollback();
          return res.status(400).json({
            error: `Insufficient stock for "${item.name}". Available: ${product.stock}`,
          });
        }
      }

      const orderNumber = generateOrderNumber();
      const order = await Order.create(
        {
          orderNumber,
          userId: req.user.uid,
          items,
          subtotalAmount: totalAmount,
          discountAmount: 0,
          walletAmount: 0,
          totalAmount,
          address,
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
          status: 'pending',
        },
        { transaction }
      );

      for (const item of items) {
        await Product.decrement('stock', {
          by: item.quantity,
          where: { id: item.productId },
          transaction,
        });
      }

      await transaction.commit();

      logger.info('Order created', {
        orderId: order.id,
        orderNumber,
        userId: req.user.uid,
        total: totalAmount,
      });

      res.status(201).json(order);
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
);

// PATCH /api/v1/orders/:id/request-return — buyer
router.patch(
  '/:id/request-return',
  authenticate,
  validate(requestReturnSchema),
  async (req, res, next) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order || order.userId !== req.user.uid) {
        return res.status(404).json({ error: 'Order not found' });
      }
      const allowed = ORDER_STATUS_TRANSITIONS[order.status] || [];
      if (!allowed.includes('return_requested')) {
        return res.status(400).json({ error: 'Return is not available for this order state' });
      }
      await order.update({
        status: 'return_requested',
        returnReason: req.body.reason,
        returnRequestedAt: new Date(),
      });
      res.json(order);
    } catch (e) {
      next(e);
    }
  }
);

// PATCH /api/v1/orders/:id/status — admin only
router.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  validate(updateOrderStatusSchema),
  async (req, res, next) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      const { status, trackingId, trackingUrl, courierName, cancelReason, notes } = req.body;

      const allowedNext = ORDER_STATUS_TRANSITIONS[order.status] || [];
      if (!allowedNext.includes(status)) {
        return res.status(400).json({
          error: `Cannot transition from "${order.status}" to "${status}". Allowed: [${allowedNext.join(', ')}]`,
        });
      }

      const updateData = { status };
      if (trackingId) updateData.trackingId = trackingId;
      if (trackingUrl) updateData.trackingUrl = trackingUrl;
      if (courierName) updateData.courierName = courierName;
      if (cancelReason) updateData.cancelReason = cancelReason;
      if (notes) updateData.notes = notes;
      if (status === 'shipped') updateData.shippedAt = new Date();
      if (status === 'delivered') updateData.deliveredAt = new Date();

      if (status === 'cancelled' && order.status !== 'cancelled') {
        const transaction = await sequelize.transaction();
        try {
          for (const item of order.items) {
            await Product.increment('stock', {
              by: item.quantity,
              where: { id: item.productId },
              transaction,
            });
          }
          await order.update(updateData, { transaction });
          await transaction.commit();
        } catch (txError) {
          await transaction.rollback();
          throw txError;
        }
      } else {
        await order.update(updateData);
      }

      logger.info('Order status updated', {
        orderId: order.id,
        from: order.status,
        to: status,
        adminId: req.user.uid,
      });

      res.json(order);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/orders/:id/refund — admin: initiate Razorpay refund
router.post(
  '/:id/refund',
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.findByPk(req.params.id, { transaction });
      if (!order) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.paymentStatus === 'refunded') {
        await transaction.rollback();
        return res.json({ success: true, message: 'Already refunded', order });
      }

      const paymentId = order.razorpayPaymentId || order.paymentId;

      // If paid via Razorpay — initiate refund through Razorpay API
      if (paymentId && order.paymentMethod === 'razorpay') {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
          await transaction.rollback();
          return res.status(503).json({ error: 'Razorpay not configured — manual refund required' });
        }

        const rz = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const amountPaise = Math.round(Number(order.totalAmount) * 100);

        try {
          await rz.payments.refund(paymentId, {
            amount: amountPaise,
            speed: 'normal',
            notes: {
              orderNumber: order.orderNumber,
              reason: req.body.reason || 'Customer return/refund',
            },
          });
        } catch (rzErr) {
          await transaction.rollback();
          logger.error(`Razorpay refund failed: ${rzErr.message}`);
          return res.status(502).json({
            error: `Razorpay refund failed: ${rzErr.error?.description || rzErr.message}`,
          });
        }
      }

      // Restore wallet amount if wallet was used
      const walletAmt = Number(order.walletAmount || 0);
      if (walletAmt > 0) {
        await User.increment({ walletBalance: walletAmt }, {
          where: { uid: order.userId },
          transaction,
        });
      }

      // Update order status
      await order.update({
        status: 'refunded',
        paymentStatus: 'refunded',
      }, { transaction });

      await transaction.commit();

      logger.info('Order refunded', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        walletRestored: walletAmt,
        adminId: req.user.uid,
      });

      res.json({ success: true, order });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
);

export default router;

