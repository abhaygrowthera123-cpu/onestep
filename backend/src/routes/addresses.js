import express from 'express';
import { Address } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Joi from 'joi';

const router = express.Router();

const addressSchema = Joi.object({
  name: Joi.string().max(50).default('Home'),
  addressLine1: Joi.string().required(),
  addressLine2: Joi.string().allow('', null),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  country: Joi.string().default('India'),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  isDefault: Joi.boolean().default(false),
  phoneNumber: Joi.string().pattern(/^[0-9]{10,12}$/).allow('', null)
});

// GET /api/v1/addresses - Get all user addresses
router.get('/', authenticate, async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { userId: req.user.uid },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// POST /api/v1/addresses - Add new address
router.post('/', authenticate, validate(addressSchema), async (req, res) => {
  try {
    // If setting as default, unset others
    if (req.body.isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.uid } });
    }

    const address = await Address.create({
      ...req.body,
      userId: req.user.uid
    });
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create address' });
  }
});

// PATCH /api/v1/addresses/:id - Update address
router.patch('/:id', authenticate, validate(addressSchema.fork(['addressLine1', 'city', 'state', 'zipCode'], (s) => s.optional())), async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { id: req.params.id, userId: req.user.uid }
    });

    if (!address) return res.status(404).json({ error: 'Address not found' });

    if (req.body.isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.uid } });
    }

    await address.update(req.body);
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// DELETE /api/v1/addresses/:id - Delete address
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deleted = await Address.destroy({
      where: { id: req.params.id, userId: req.user.uid }
    });
    if (!deleted) return res.status(404).json({ error: 'Address not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

export default router;
