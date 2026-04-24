import { Router } from 'express';
import { Coupon } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Joi from 'joi';
import { applyCoupon } from '../services/couponService.js';

const router = Router();

const couponBody = Joi.object({
  code: Joi.string().min(3).max(32).required(),
  type: Joi.string().valid('percent', 'fixed').required(),
  value: Joi.number().positive().required(),
  minOrderAmount: Joi.number().min(0).default(0),
  maxDiscountAmount: Joi.number().positive().allow(null),
  usageLimit: Joi.number().integer().min(1).allow(null),
  expiresAt: Joi.date().allow(null),
  isActive: Joi.boolean().default(true),
});

/** POST /api/v1/coupons/validate — public, optional auth */
router.post('/validate', async (req, res) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    subtotal: Joi.number().positive().required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  const r = await applyCoupon(value.code, value.subtotal);
  if (r.error) return res.status(400).json({ error: r.error });
  res.json({
    valid: true,
    discount: r.discount,
    code: r.coupon.code,
  });
});

/** GET /api/v1/coupons — admin */
router.get('/', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

/** POST /api/v1/coupons — admin */
router.post('/', authenticate, requireAdmin, validate(couponBody), async (req, res, next) => {
  try {
    const data = { ...req.body, code: String(req.body.code).trim().toUpperCase() };
    const c = await Coupon.create(data);
    res.status(201).json(c);
  } catch (e) {
    next(e);
  }
});

const couponPatch = Joi.object({
  code: Joi.string().min(3).max(32),
  type: Joi.string().valid('percent', 'fixed'),
  value: Joi.number().positive(),
  minOrderAmount: Joi.number().min(0),
  maxDiscountAmount: Joi.number().positive().allow(null),
  usageLimit: Joi.number().integer().min(1).allow(null),
  expiresAt: Joi.date().allow(null),
  isActive: Joi.boolean(),
}).min(1);

/** PATCH /api/v1/coupons/:id — admin */
router.patch('/:id', authenticate, requireAdmin, validate(couponPatch), async (req, res, next) => {
  try {
    const c = await Coupon.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });
    const patch = { ...req.body };
    if (patch.code) patch.code = String(patch.code).trim().toUpperCase();
    await c.update(patch);
    res.json(c);
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/v1/coupons/:id — admin */
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const n = await Coupon.destroy({ where: { id: req.params.id } });
    if (!n) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
