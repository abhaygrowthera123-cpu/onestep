import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  price: Joi.number().positive().precision(2).required(),
  discountPrice: Joi.number().positive().precision(2).allow(null),
  category: Joi.string().trim().required(),
  brand: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().uri({ allowRelative: true })).min(1).required(),
  sizes: Joi.array().items(Joi.string()).allow(null),
  colors: Joi.array().items(Joi.string()).allow(null),
  stock: Joi.number().integer().min(0).default(0),
  isTrending: Joi.boolean().default(false),
  isRecommended: Joi.boolean().default(false),
  minOrderQty: Joi.number().integer().min(1).default(1),
  tags: Joi.array().items(Joi.string().trim()).default([]),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()).default({}),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200),
  description: Joi.string().allow('', null),
  price: Joi.number().positive().precision(2),
  discountPrice: Joi.number().positive().precision(2).allow(null),
  category: Joi.string().trim(),
  brand: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().uri({ allowRelative: true })).min(1),
  sizes: Joi.array().items(Joi.string()).allow(null),
  colors: Joi.array().items(Joi.string()).allow(null),
  stock: Joi.number().integer().min(0),
  isTrending: Joi.boolean(),
  isRecommended: Joi.boolean(),
  minOrderQty: Joi.number().integer().min(1),
  tags: Joi.array().items(Joi.string().trim()),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()),
}).min(1);

export const productQuerySchema = Joi.object({
  category: Joi.string().trim(),
  isTrending: Joi.string().valid('true', 'false'),
  search: Joi.string().trim().max(100).allow(''),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  rating: Joi.number().min(0).max(5),
  sort: Joi.string().valid('price-low', 'price-high', 'rating', 'newest'),
  tag: Joi.string().trim().max(50),
  sellerId: Joi.string().trim(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
