import Joi from 'joi';

export const lessonIdParamSchema = Joi.object({
  lessonId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid lesson ID format',
    'any.required': 'Lesson ID is required',
  }),
});

export const programIdParamSchema = Joi.object({
  programId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid program ID format',
    'any.required': 'Program ID is required',
  }),
});
