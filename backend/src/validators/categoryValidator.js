import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  description: Joi.string().trim().max(500).allow('', null),
  image: Joi.string().uri({ allowRelative: true }).allow('', null),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  description: Joi.string().trim().max(500).allow('', null),
  image: Joi.string().uri({ allowRelative: true }).allow('', null),
}).min(1);
