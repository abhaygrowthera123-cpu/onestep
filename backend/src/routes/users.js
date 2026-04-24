import { Router } from 'express';
import { User } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSyncSchema, updateProfileSchema, updateRoleSchema } from '../validators/authValidator.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';
import logger from '../utils/logger.js';

const router = Router();

// GET /api/v1/users — admin only, paginated
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { count, rows } = await User.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    res.json(paginatedResponse(rows, count, { page, limit }));
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/users/me — get own profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.uid, {
      include: ['addresses']
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/users/:uid — admin only
router.get('/:uid', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.uid, {
      include: ['addresses']
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
});


// POST /api/v1/users — sync user on login (auth required)
router.post('/', authenticate, validate(registerSyncSchema), async (req, res, next) => {
  try {
    const [user] = await User.findOrCreate({
      where: { uid: req.user.uid },
      defaults: { ...req.body, uid: req.user.uid },
    });
    
    // Refresh to get associations if needed
    const syncedUser = await User.findByPk(user.uid, {
      include: ['addresses']
    });
    
    res.json(syncedUser);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/users/me — update own profile
router.patch('/me', authenticate, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.update(req.body);
    logger.info('Profile updated', { userId: req.user.uid });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/users/:uid/wallet — admin credit/debit store wallet (delta in ₹)
router.patch('/:uid/wallet', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const delta = Number(req.body.delta);
    if (!Number.isFinite(delta)) {
      return res.status(400).json({ error: 'Body must include numeric delta (INR)' });
    }
    const user = await User.findByPk(req.params.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const nextBal = Math.max(0, Number(user.walletBalance || 0) + delta);
    await user.update({ walletBalance: nextBal });
    logger.info('Wallet adjusted', { targetUid: req.params.uid, delta, adminUid: req.user.uid });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/users/:uid — update any user (legacy + admin compat)
router.patch('/:uid', authenticate, validate(updateProfileSchema), async (req, res, next) => {
  try {
    if (req.user.uid !== req.params.uid && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Cannot update other users' });
    }
    const user = await User.findByPk(req.params.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.update(req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/users/:uid/role — admin only
router.patch('/:uid/role', authenticate, requireAdmin, validate(updateRoleSchema), async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.update({ role });
    logger.info('User role changed', { targetUid: req.params.uid, newRole: role, adminUid: req.user.uid });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/users/:uid/block — admin only (toggle block)
router.patch('/:uid/block', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot block an admin account' });
    }
    const isActive = !user.isActive;
    await user.update({ isActive });
    logger.info(`User ${isActive ? 'unblocked' : 'blocked'}`, { targetUid: req.params.uid, adminUid: req.user.uid });
    res.json({ ...user.toJSON(), isActive });
  } catch (error) {
    next(error);
  }
});

export default router;
