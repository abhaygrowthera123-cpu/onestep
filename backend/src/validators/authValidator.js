import Joi from 'joi';

export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const registerSyncSchema = Joi.object({
  uid: Joi.string().required(),
  email: Joi.string().email().required(),
  displayName: Joi.string().trim().max(100).allow('', null),
  photoURL: Joi.string().uri().allow('', null),
  phone: Joi.string().pattern(/^\+?\d{10,15}$/).allow('', null),
  role: Joi.string().valid('user').default('user'), // users can't self-assign roles
}).unknown(true); // allow extra Firebase fields

export const updateProfileSchema = Joi.object({
  displayName: Joi.string().trim().min(1).max(100),
  phone: Joi.string().pattern(/^\+?\d{10,15}$/).allow('', null),
  photoURL: Joi.string().uri({ allowRelative: true }).allow('', null),
  wishlist: Joi.array(),
  sellerShopName: Joi.string().trim().max(120).allow('', null),
  sellerGstin: Joi.string().trim().max(20).allow('', null),
  sellerPhone: Joi.string().trim().max(20).allow('', null),
}).min(1);

export const updateRoleSchema = Joi.object({
  role: Joi.string().valid('user', 'seller', 'admin').required(),
});
