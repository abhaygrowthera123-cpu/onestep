import Joi from 'joi';

export const createContactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().required(),
  subject: Joi.string().trim().max(200).allow('', null),
  message: Joi.string().trim().min(5).max(5000).required(),
});

export const subscribeNewsletterSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});
