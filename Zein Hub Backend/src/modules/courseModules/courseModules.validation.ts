import Joi from 'joi';

export const createModuleSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required().messages({
    'string.empty': 'Module title is required',
    'any.required': 'Module title is required',
  }),
  description: Joi.string().trim().max(2000).allow(null, '').optional(),
  order: Joi.number().integer().min(0).optional(),
  isPublished: Joi.boolean().default(true),
});

export const updateModuleSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().max(2000).allow(null, '').optional(),
  order: Joi.number().integer().min(0).optional(),
  isPublished: Joi.boolean().optional(),
}).min(1);

export const reorderModuleSchema = Joi.object({
  order: Joi.number().integer().min(0).required().messages({
    'any.required': 'order number is required for reordering',
  }),
});
