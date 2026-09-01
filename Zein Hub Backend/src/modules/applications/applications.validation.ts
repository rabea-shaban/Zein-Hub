import Joi from 'joi';
import { ApplicationStatus } from '../../constants/applicationStatus.enum.js';

export const createApplicationSchema = Joi.object({
  programId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid Program ID format',
    'string.length': 'Invalid Program ID length',
    'any.required': 'Program ID is required to apply',
  }),
  motivation: Joi.string().trim().max(1000).allow(null, '').optional(),
  portfolioUrl: Joi.string().trim().uri().allow(null, '').optional(),
  audioSampleUrl: Joi.string().trim().uri().allow(null, '').optional(),
  governorate: Joi.string().trim().max(50).allow(null, '').optional(),
});

export const reviewApplicationSchema = Joi.object({
  status: Joi.string()
    .valid(ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED)
    .required()
    .messages({
      'any.required': 'Review status is required',
      'any.only': 'Status must be either accepted or rejected',
    }),
  reviewNotes: Joi.string().trim().max(1000).allow(null, '').optional(),
});
