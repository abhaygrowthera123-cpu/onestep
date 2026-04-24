import { Router } from 'express';
import { Op } from 'sequelize';
import { Product, ProductVariant } from '../models/index.js';
import { authenticate, requireAdmin, requireSeller } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validators/productValidator.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';
import logger from '../utils/logger.js';
import slugify from 'slugify';
import Joi from 'joi';

// ── Variant Validators ─────────────────────────────────────────
const createVariantSchema = Joi.object({
  sku: Joi.string().trim().max(50),
  size: Joi.string().trim().allow('', null),
  color: Joi.string().trim().allow('', null),
  material: Joi.string().trim().allow('', null),
  stock: Joi.number().integer().min(0).default(0),
  price: Joi.number().positive().precision(2).allow(null),
  image: Joi.string().uri({ allowRelative: true }).allow('', null),
  isActive: Joi.boolean().default(true),
});

const updateVariantSchema = Joi.object({
  sku: Joi.string().trim().max(50),
  size: Joi.string().trim().allow('', null),
  color: Joi.string().trim().allow('', null),
  material: Joi.string().trim().allow('', null),
  stock: Joi.number().integer().min(0),
  price: Joi.number().positive().precision(2).allow(null),
  image: Joi.string().uri({ allowRelative: true }).allow('', null),
  isActive: Joi.boolean(),
}).min(1);

const updateStockSchema = Joi.object({
  stock: Joi.number().integer().min(0).required(),
});

const router = Router();

/**
 * Generate a unique slug from product name.
 */
async function generateSlug(name, existingId = null) {
  let slug = slugify(name, { lower: true, strict: true });
  const where = { slug };
  if (existingId) where.id = { [Op.ne]: existingId };

  let existing = await Product.findOne({ where });
  if (existing) {
    const suffix = Date.now().toString(36);
    slug = `${slug}-${suffix}`;
  }
  return slug;
}

/**
 * Auto-generate SKU from product + variant info.
 */
function generateSKU(productName, variant) {
  const prefix = productName.substring(0, 3).toUpperCase();
  const sizePart = variant.size ? `-${variant.size}` : '';
  const colorPart = variant.color ? `-${variant.color.substring(0, 3).toUpperCase()}` : '';
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${sizePart}${colorPart}-${rand}`;
}


// ═══════════════════════════════════════════════════════════════
//  PRODUCT ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /products — public, paginated, searchable, tag-filtered
router.get('/', validate(productQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { category, isTrending, search, minPrice, maxPrice, rating, sort, tag, sellerId } = req.query;
    const { page, limit, offset } = parsePagination(req.query);
    const where = { isActive: true };

    if (category) {
      const categoryList = category.split(',').map(c => c.trim());
      where.category = { [Op.or]: categoryList.map(c => ({ [Op.like]: c })) };
    }
    if (isTrending === 'true') where.isTrending = true;
    if (sellerId) where.sellerId = sellerId;

    // Price range filter (parameterised — safe)
    if (minPrice !== undefined && parseFloat(minPrice) > 0) {
        where.price = { ...where.price, [Op.gte]: parseFloat(minPrice) };
    }
    if (maxPrice !== undefined && parseFloat(maxPrice) < 1000000) {
        where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };
    }

    // Rating filter
    if (rating !== undefined && parseFloat(rating) > 0) {
        where.rating = { [Op.gte]: parseFloat(rating) };
    }

    // Search (name, description, category, tags)
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
      ];
    }

    // Tag-based filter (JSON contains)
    if (tag) {
      // MySQL JSON_CONTAINS or SQLite LIKE fallback
      where.tags = { [Op.like]: `%"${tag}"%` };
    }

    // Sorting
    let order = [['createdAt', 'DESC']];
    if (sort === 'price-low') order = [['price', 'ASC']];
    if (sort === 'price-high') order = [['price', 'DESC']];
    if (sort === 'rating') order = [['rating', 'DESC']];

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [{ model: ProductVariant, as: 'variants', where: { isActive: true }, required: false }],
    });

    res.json(paginatedResponse(rows, count, { page, limit }));
  } catch (error) {
    next(error);
  }
});

// GET /products/:id — public, includes variants + review summary
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: ProductVariant, as: 'variants' }],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// POST /products — admin/seller, with auto slug
router.post('/', authenticate, requireSeller, validate(createProductSchema), async (req, res, next) => {
  try {
    const slug = await generateSlug(req.body.name);
    const product = await Product.create({ ...req.body, slug, sellerId: req.user.uid });
    logger.info('Product created', { productId: product.id, slug });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// PUT /products/:id — admin/seller
router.put('/:id', authenticate, requireSeller, validate(updateProductSchema), async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Check ownership
    if (req.user.role !== 'admin' && product.sellerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    // Regenerate slug if name changed
    if (req.body.name && req.body.name !== product.name) {
      req.body.slug = await generateSlug(req.body.name, product.id);
    }

    await product.update(req.body);
    logger.info('Product updated', { productId: product.id });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// DELETE /products/:id — admin only
router.delete('/:id', authenticate, requireSeller, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Check ownership
    if (req.user.role !== 'admin' && product.sellerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }
    await product.update({ isActive: false }); // soft-delete
    logger.info('Product deactivated', { productId: req.params.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// GET /products/:id/low-stock — admin: check stock levels
router.get('/:id/stock-status', authenticate, requireSeller, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: ProductVariant, as: 'variants' }],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Check ownership
    if (req.user.role !== 'admin' && product.sellerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const variants = product.variants.map(v => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock,
      reservedStock: v.reservedStock,
      available: v.stock - v.reservedStock,
      isLow: (v.stock - v.reservedStock) <= 5,
    }));

    res.json({
      productId: product.id,
      name: product.name,
      productStock: product.stock,
      variantCount: variants.length,
      totalVariantStock: variants.reduce((sum, v) => sum + v.stock, 0),
      lowStockVariants: variants.filter(v => v.isLow),
      variants,
    });
  } catch (error) {
    next(error);
  }
});


// ═══════════════════════════════════════════════════════════════
//  VARIANT ROUTES
// ═══════════════════════════════════════════════════════════════

// POST /products/:id/variants — add a variant
router.post('/:id/variants', authenticate, requireSeller, validate(createVariantSchema), async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Check ownership
    if (req.user.role !== 'admin' && product.sellerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Auto-generate SKU if not provided
    const sku = req.body.sku || generateSKU(product.name, req.body);

    const variant = await ProductVariant.create({
      ...req.body,
      sku,
      productId: product.id,
    });

    // Update parent product total stock
    const totalVariantStock = await ProductVariant.sum('stock', {
      where: { productId: product.id, isActive: true },
    });
    await product.update({ stock: totalVariantStock || 0 });

    logger.info('Variant created', { variantId: variant.id, sku, productId: product.id });
    res.status(201).json(variant);
  } catch (error) {
    next(error);
  }
});

// GET /products/:id/variants — list variants
router.get('/:id/variants', async (req, res, next) => {
  try {
    const variants = await ProductVariant.findAll({
      where: { productId: req.params.id },
      order: [['size', 'ASC'], ['color', 'ASC']],
    });
    res.json(variants);
  } catch (error) {
    next(error);
  }
});

// PUT /products/:id/variants/:vid — update a variant
router.put('/:id/variants/:vid', authenticate, requireSeller, validate(updateVariantSchema), async (req, res, next) => {
  try {
    const variant = await ProductVariant.findOne({
      where: { id: req.params.vid, productId: req.params.id },
    });
    if (!variant) return res.status(404).json({ error: 'Variant not found' });

    // Check ownership
    const product = await Product.findByPk(req.params.id);
    if (req.user.role !== 'admin' && product?.sellerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await variant.update(req.body);

    // Sync parent stock
    const totalVariantStock = await ProductVariant.sum('stock', {
      where: { productId: req.params.id, isActive: true },
    });
    await Product.update({ stock: totalVariantStock || 0 }, { where: { id: req.params.id } });

    logger.info('Variant updated', { variantId: variant.id });
    res.json(variant);
  } catch (error) {
    next(error);
  }
});

// PATCH /products/:id/variants/:vid/stock — quick stock update
router.patch('/:id/variants/:vid/stock', authenticate, requireSeller, validate(updateStockSchema), async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (req.user.role !== 'admin' && product.sellerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const variant = await ProductVariant.findOne({
      where: { id: req.params.vid, productId: req.params.id },
    });
    if (!variant) return res.status(404).json({ error: 'Variant not found' });

    await variant.update({ stock: req.body.stock });

    // Sync parent stock
    const totalVariantStock = await ProductVariant.sum('stock', {
      where: { productId: req.params.id, isActive: true },
    });
    await Product.update({ stock: totalVariantStock || 0 }, { where: { id: req.params.id } });

    logger.info('Variant stock updated', { variantId: variant.id, newStock: req.body.stock });
    res.json({ ...variant.toJSON(), stock: req.body.stock });
  } catch (error) {
    next(error);
  }
});

// DELETE /products/:id/variants/:vid — remove a variant
router.delete('/:id/variants/:vid', authenticate, requireSeller, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (req.user.role !== 'admin' && product.sellerId !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const variant = await ProductVariant.findOne({
      where: { id: req.params.vid, productId: req.params.id },
    });
    if (!variant) return res.status(404).json({ error: 'Variant not found' });

    await variant.update({ isActive: false }); // soft-delete

    // Sync parent stock
    const totalVariantStock = await ProductVariant.sum('stock', {
      where: { productId: req.params.id, isActive: true },
    });
    await Product.update({ stock: totalVariantStock || 0 }, { where: { id: req.params.id } });

    logger.info('Variant deactivated', { variantId: req.params.vid });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
