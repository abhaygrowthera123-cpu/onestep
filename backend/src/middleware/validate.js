/**
 * Joi validation middleware factory.
 *
 * Usage:
 *   import { validate } from '../middleware/validate.js';
 *   import Joi from 'joi';
 *
 *   const schema = Joi.object({ name: Joi.string().required() });
 *   router.post('/', validate(schema), handler);
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: messages,
      });
    }
    // Replace with sanitised values
    req[property] = value;
    next();
  };
};
