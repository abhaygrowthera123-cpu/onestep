import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { SiteSetting, User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { instance: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId };
}

/**
 * POST /api/v1/wallet/add — Create Razorpay order for wallet top-up
 */
router.post('/add', authenticate, async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount < 1 || amount > 50000) {
      return res.status(400).json({ error: 'Amount must be between ₹1 and ₹50,000' });
    }

    const rz = getRazorpay();
    if (!rz) {
      return res.status(503).json({ error: 'Online payments not configured' });
    }

    const user = await User.findByPk(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const amountPaise = Math.round(amount * 100);
    const receipt = `WALLET-${req.user.uid.slice(0, 10)}-${Date.now()}`.slice(0, 40);

    const razorpayOrder = await rz.instance.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: { type: 'wallet_topup', userId: req.user.uid },
    });

    res.json({
      razorpay: {
        keyId: rz.keyId,
        orderId: razorpayOrder.id,
        amount: amountPaise,
        currency: 'INR',
        name: process.env.STORE_DISPLAY_NAME || 'OneStep Hub',
        description: `Wallet Top-up ₹${amount}`,
        prefill: { email: user.email, contact: user.phone || '' },
      },
    });
  } catch (e) {
    logger.error(`Wallet add failed: ${e.message}`);
    next(e);
  }
});

/**
 * POST /api/v1/wallet/verify — Verify Razorpay payment and credit wallet
 */
router.post('/verify', authenticate, async (req, res, next) => {
  try {
    const rz = getRazorpay();
    if (!rz) return res.status(503).json({ error: 'Payments not configured' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const existing = await SiteSetting.findByPk(`wallet_topup:${razorpay_payment_id}`);
    if (existing) {
      const user = await User.findByPk(req.user.uid);
      return res.json({
        success: true,
        walletBalance: Number(user?.walletBalance || 0),
        duplicate: true,
      });
    }

    const payment = await rz.instance.payments.fetch(razorpay_payment_id);
    if (!payment || payment.order_id !== razorpay_order_id || payment.status !== 'captured') {
      return res.status(400).json({ error: 'Payment is not captured or does not match order' });
    }
    if (payment.currency !== 'INR') {
      return res.status(400).json({ error: 'Unsupported payment currency' });
    }

    const paidAmount = Math.round((Number(payment.amount) / 100) * 100) / 100;
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const userIdFromNotes = payment.notes?.userId;
    if (userIdFromNotes && userIdFromNotes !== req.user.uid) {
      return res.status(403).json({ error: 'Payment does not belong to this user' });
    }

    await User.increment('walletBalance', { by: paidAmount, where: { uid: req.user.uid } });
    await SiteSetting.create({
      key: `wallet_topup:${razorpay_payment_id}`,
      value: JSON.stringify({
        userId: req.user.uid,
        amount: paidAmount,
        orderId: razorpay_order_id,
        processedAt: new Date().toISOString(),
      }),
    });

    const updatedUser = await User.findByPk(req.user.uid);

    logger.info('Wallet top-up successful', {
      userId: req.user.uid,
      amount: paidAmount,
      newBalance: updatedUser.walletBalance,
      razorpayPaymentId: razorpay_payment_id,
    });

    res.json({
      success: true,
      walletBalance: Number(updatedUser.walletBalance),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/v1/wallet/balance — Get current wallet balance
 */
router.get('/balance', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ walletBalance: Number(user.walletBalance || 0) });
  } catch (e) {
    next(e);
  }
});

export default router;
