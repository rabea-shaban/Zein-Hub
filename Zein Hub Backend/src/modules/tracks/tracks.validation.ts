import Joi from 'joi';

export const createTrackSchema = Joi.object({
  nameAr: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Arabic track name is required',
    'any.required': 'Arabic track name is required',
  }),
  nameEn: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'English track name is required',
    'any.required': 'English track name is required',
  }),
  slug: Joi.string().trim().lowercase().optional(),
  descriptionAr: Joi.string().trim().allow(null, '').optional(),
  descriptionEn: Joi.string().trim().allow(null, '').optional(),
  iconUrl: Joi.string().trim().uri().allow(null, '').optional(),
  order: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

export const updateTrackSchema = Joi.object({
  nameAr: Joi.string().trim().min(2).max(100).optional(),
  nameEn: Joi.string().trim().min(2).max(100).optional(),
  slug: Joi.string().trim().lowercase().optional(),
  descriptionAr: Joi.string().trim().allow(null, '').optional(),
  descriptionEn: Joi.string().trim().allow(null, '').optional(),
  iconUrl: Joi.string().trim().uri().allow(null, '').optional(),
  order: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);
