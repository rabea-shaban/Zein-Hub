import Joi from 'joi';
import { ReviewStatus } from '../../models/review.model.js';

export const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be between 1 and 5 stars',
    'number.max': 'Rating must be between 1 and 5 stars',
    'any.required': 'Star rating (1 - 5) is required',
  }),
  comment: Joi.string().trim().min(5).max(2000).required().messages({
    'string.min': 'Review feedback comment must be at least 5 characters',
    'string.max': 'Review feedback comment cannot exceed 2000 characters',
    'any.required': 'Review feedback comment is required',
  }),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  comment: Joi.string().trim().min(5).max(2000).optional(),
}).min(1);

export const moderateReviewSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ReviewStatus))
    .required()
    .messages({
      'any.required': 'Moderation status (approved / rejected) is required',
    }),
  moderationNotes: Joi.string().trim().max(1000).allow(null, '').optional(),
  isFeatured: Joi.boolean().optional(),
});

export const reviewQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  rating: Joi.number().integer().min(1).max(5).optional(),
  isFeatured: Joi.boolean().optional(),
  status: Joi.string()
    .valid(...Object.values(ReviewStatus))
    .optional(),
});
