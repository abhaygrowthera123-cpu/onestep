import { Router } from 'express';
import { Notification } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { paginatedResponse, parsePagination } from '../utils/pagination.js';
import { getUnreadCount } from '../services/notificationService.js';

const router = Router();

/** GET /api/v1/notifications — list for current user */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { count, rows } = await Notification.findAndCountAll({
      where: { userId: req.user.uid },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json(paginatedResponse(rows, count, { page, limit }));
  } catch (e) {
    next(e);
  }
});

/** GET /api/v1/notifications/unread-count */
router.get('/unread-count', authenticate, async (req, res, next) => {
  try {
    const count = await getUnreadCount(req.user.uid);
    res.json({ count });
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/v1/notifications/read-all */
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.uid, isRead: false } },
    );
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/v1/notifications/:id/read */
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const n = await Notification.findByPk(req.params.id);
    if (!n || n.userId !== req.user.uid) {
      return res.status(404).json({ error: 'Not found' });
    }
    await n.update({ isRead: true });
    res.json(n);
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/v1/notifications/:id */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const n = await Notification.findByPk(req.params.id);
    if (!n || n.userId !== req.user.uid) {
      return res.status(404).json({ error: 'Not found' });
    }
    await n.destroy();
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
