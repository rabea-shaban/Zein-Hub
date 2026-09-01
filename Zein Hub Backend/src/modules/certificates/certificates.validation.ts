import Joi from 'joi';

export const certificateNumberParamSchema = Joi.object({
  certificateNumber: Joi.string().trim().min(5).max(50).required().messages({
    'string.empty': 'Certificate number is required',
    'any.required': 'Certificate number is required',
  }),
});
