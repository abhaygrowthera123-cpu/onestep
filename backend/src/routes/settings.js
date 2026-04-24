import { Router } from 'express';
import { SiteSetting } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Joi from 'joi';

const router = Router();

const storeSchema = Joi.object({
  name: Joi.string().max(120),
  gstin: Joi.string().max(20).allow('', null),
  supportEmail: Joi.string().email().allow('', null),
  supportPhone: Joi.string().max(20).allow('', null),
  gstDisplayText: Joi.string().max(500).allow('', null),
});

/** GET /api/v1/settings/public — no auth */
router.get('/public', async (_req, res, next) => {
  try {
    const row = await SiteSetting.findByPk('store');
    const defaults = {
      name: 'OneStep Hub',
      gstin: '',
      supportEmail: '',
      supportPhone: '',
      gstDisplayText: 'Prices inclusive of GST where applicable',
    };
    if (!row?.value) return res.json(defaults);
    try {
      return res.json({ ...defaults, ...JSON.parse(row.value) });
    } catch {
      return res.json(defaults);
    }
  } catch (e) {
    next(e);
  }
});

/** GET /api/v1/settings — admin */
router.get('/', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const rows = await SiteSetting.findAll();
    const out = {};
    for (const r of rows) {
      try {
        out[r.key] = JSON.parse(r.value);
      } catch {
        out[r.key] = r.value;
      }
    }
    res.json(out);
  } catch (e) {
    next(e);
  }
});

/** PUT /api/v1/settings/store — admin */
router.put('/store', authenticate, requireAdmin, validate(storeSchema), async (req, res, next) => {
  try {
    await SiteSetting.upsert({
      key: 'store',
      value: JSON.stringify(req.body),
    });
    res.json(req.body);
  } catch (e) {
    next(e);
  }
});

export default router;
