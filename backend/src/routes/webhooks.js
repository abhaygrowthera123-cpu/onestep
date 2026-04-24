import { Router } from 'express';
import crypto from 'crypto';
import { Order, Product, User } from '../models/index.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * Razorpay sends webhook as JSON body (raw buffer mounted in index.js)
 */
router.post('/razorpay', async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn('RAZORPAY_WEBHOOK_SECRET not set — webhook ignored');
    return res.status(503).json({ error: 'Webhook not configured' });
  }

  const sig = req.headers['x-razorpay-signature'];
  if (!sig || !Buffer.isBuffer(req.body)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  if (expected !== sig) {
    logger.warn('Razorpay webhook signature mismatch');
    return res.status(400).json({ error: 'Bad signature' });
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  try {
    const event = payload.event;
    const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity;

    if (event === 'payment.captured' && entity) {
      const razorpayOrderId = entity.order_id;
      const paymentId = entity.id;
      const order = await Order.findOne({ where: { razorpayOrderId } });
      if (order && order.paymentStatus === 'awaiting_payment') {
        await order.update({
          paymentStatus: 'paid',
          razorpayPaymentId: paymentId,
          paymentId,
        });
        logger.info(`Webhook: order ${order.id} marked paid`);
      }
    }

    if (event === 'payment.failed' && entity) {
      const razorpayOrderId = entity.order_id;
      const order = await Order.findOne({ where: { razorpayOrderId } });
      if (order && order.paymentStatus === 'awaiting_payment') {
        // Restore stock
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            await Product.increment('stock', {
              by: item.quantity,
              where: { id: item.productId },
            });
          }
        }

        // Restore wallet balance if used
        const walletAmt = Number(order.walletAmount || 0);
        if (walletAmt > 0) {
          await User.increment({ walletBalance: walletAmt }, {
            where: { uid: order.userId },
          });
        }

        await order.update({
          status: 'cancelled',
          paymentStatus: 'failed',
          cancelReason: `Payment failed: ${entity.error_description || entity.error_reason || 'Unknown error'}`,
        });
        logger.info(`Webhook: order ${order.id} cancelled due to payment failure`);
      }
    }

    // Handle refund events from Razorpay
    if (event === 'refund.processed' || event === 'refund.created') {
      const refundEntity = payload.payload?.refund?.entity;
      if (refundEntity) {
        const paymentId = refundEntity.payment_id;
        const order = await Order.findOne({
          where: { razorpayPaymentId: paymentId },
        });
        if (order && order.paymentStatus !== 'refunded') {
          await order.update({
            paymentStatus: 'refunded',
            status: 'refunded',
          });
          logger.info(`Webhook: order ${order.id} marked refunded`);
        }
      }
    }
  } catch (e) {
    logger.error(`Webhook handler error: ${e.message}`);
    return res.status(500).json({ error: 'Handler failed' });
  }

  res.json({ ok: true });
});

export default router;
