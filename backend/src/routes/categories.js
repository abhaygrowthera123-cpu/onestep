import { Router } from 'express';
import { Category, Product, sequelize } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidator.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const categories = await Category.findAll();
    // Attach product count per category
    const counts = await Product.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: { isActive: true },
      group: ['category'],
      raw: true,
    });
    const countMap = {};
    counts.forEach(c => { countMap[c.category] = parseInt(c.count, 10); });

    const result = categories.map(cat => ({
      ...cat.toJSON(),
      productCount: countMap[cat.name] || 0,
    }));
    res.json(result);
  } catch (err) {
    logger.error(`Failed to fetch categories: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) { res.status(404).json({ error: 'Category not found' }); return; }
    res.json(category);
  } catch { res.status(500).json({ error: 'Failed to fetch category' }); }
});

router.post('/', authenticate, requireAdmin, validate(createCategorySchema), async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    logger.error(`Failed to create category: ${err.message}`);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', authenticate, requireAdmin, validate(updateCategorySchema), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) { res.status(404).json({ error: 'Category not found' }); return; }
    await category.update(req.body);
    res.json(category);
  } catch (err) {
    logger.error(`Failed to update category: ${err.message}`);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) { res.status(404).json({ error: 'Category not found' }); return; }
    await category.destroy();
    res.status(204).send();
  } catch (err) {
    logger.error(`Failed to delete category: ${err.message}`);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
