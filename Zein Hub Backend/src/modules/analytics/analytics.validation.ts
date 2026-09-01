import Joi from 'joi';

export const analyticsQuerySchema = Joi.object({
  programId: Joi.string().hex().length(24).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

export const reportPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  programId: Joi.string().hex().length(24).optional(),
  status: Joi.string().optional(),
});

export const programReportParamSchema = Joi.object({
  programId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid program ID format',
    'any.required': 'Program ID is required',
  }),
});
