import { Router } from 'express';
import { Review, Product, Order, User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';
import logger from '../utils/logger.js';
import Joi from 'joi';

const router = Router();

// ── Validators ─────────────────────────────────────────────────
const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().trim().max(150).allow('', null),
  comment: Joi.string().trim().max(2000).allow('', null),
  images: Joi.array().items(Joi.string().uri({ allowRelative: true })).max(5).default([]),
  orderId: Joi.string().allow('', null),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  title: Joi.string().trim().max(150).allow('', null),
  comment: Joi.string().trim().max(2000).allow('', null),
  images: Joi.array().items(Joi.string().uri({ allowRelative: true })).max(5),
}).min(1);


// GET /products/:productId/reviews — public
router.get('/:productId/reviews', async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);

    const { count, rows } = await Review.findAndCountAll({
      where: { productId: req.params.productId },
      include: [{
        model: User,
        attributes: ['displayName', 'photoURL'],
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json(paginatedResponse(rows, count, { page, limit }));
  } catch (error) {
    next(error);
  }
});

// POST /products/:productId/reviews — auth required, verified buyers only
router.post('/:productId/reviews', authenticate, validate(createReviewSchema), async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.uid;

    // Check product exists
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ where: { productId, userId } });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product. Edit your existing review instead.' });
    }

    // Check if user has purchased this product (verified buyer)
    let isVerified = false;
    const userOrders = await Order.findAll({
      where: {
        userId,
        status: 'delivered',
      },
    });

    for (const order of userOrders) {
      const items = order.items || [];
      if (items.some(item => item.productId === productId)) {
        isVerified = true;
        break;
      }
    }

    const review = await Review.create({
      ...req.body,
      productId,
      userId,
      isVerified,
    });

    // Recalculate product rating
    await recalculateProductRating(productId);

    logger.info('Review created', { reviewId: review.id, productId, rating: review.rating, isVerified });
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

// PUT /reviews/:id — update own review
router.put('/:id', authenticate, validate(updateReviewSchema), async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (review.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    await review.update(req.body);
    await recalculateProductRating(review.productId);

    logger.info('Review updated', { reviewId: review.id });
    res.json(review);
  } catch (error) {
    next(error);
  }
});

// DELETE /reviews/:id — delete own review or admin
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (review.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    const productId = review.productId;
    await review.destroy();
    await recalculateProductRating(productId);

    logger.info('Review deleted', { reviewId: req.params.id, productId });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});


// ── Helper: Recalculate Product Rating ─────────────────────────
async function recalculateProductRating(productId) {
  const reviews = await Review.findAll({ where: { productId } });
  const count = reviews.length;

  if (count === 0) {
    await Product.update({ rating: 0, reviewsCount: 0 }, { where: { id: productId } });
    return;
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / count;
  await Product.update(
    { rating: Math.round(avgRating * 10) / 10, reviewsCount: count },
    { where: { id: productId } }
  );
}


export default router;
