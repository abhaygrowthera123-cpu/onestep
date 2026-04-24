import { Router } from 'express';
import { Contact, Newsletter } from '../models/index.js';
import { validate } from '../middleware/validate.js';
import { createContactSchema, subscribeNewsletterSchema } from '../validators/contactValidator.js';
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

export default router;
