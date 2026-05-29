import { Router } from 'express';
import { Contact, Newsletter } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createContactSchema, subscribeNewsletterSchema } from '../validators/contactValidator.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';
import logger from '../utils/logger.js';

const router = Router();

// POST /api/contact — public, stores contact form submissions
router.post('/', validate(createContactSchema), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({ success: true, message: 'Message sent successfully', id: contact.id });
  } catch (err) {
    logger.error(`Failed to send contact message: ${err.message}`);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST /api/newsletter — public, stores newsletter subscriptions
router.post('/newsletter', validate(subscribeNewsletterSchema), async (req, res) => {
  try {
    const { email } = req.body;
    const [sub, created] = await Newsletter.findOrCreate({
      where: { email },
      defaults: { email },
    });
    if (!created) {
      res.json({ success: true, message: 'Already subscribed' }); return;
    }
    res.status(201).json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    logger.error(`Failed to subscribe newsletter: ${err.message}`);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

/** GET /api/v1/contact — admin inbox */
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = {};
    if (req.query.isRead === 'true') where.isRead = true;
    if (req.query.isRead === 'false') where.isRead = false;
    const { count, rows } = await Contact.findAndCountAll({
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

/** PATCH /api/v1/contact/:id/read — admin */
router.patch('/:id/read', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const msg = await Contact.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Not found' });
    await msg.update({ isRead: true });
    res.json(msg);
  } catch (e) {
    next(e);
  }
});

/** GET /api/v1/contact/newsletter — admin list */
router.get('/newsletter/list', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { count, rows } = await Newsletter.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json(paginatedResponse(rows, count, { page, limit }));
  } catch (e) {
    next(e);
  }
});

export default router;
