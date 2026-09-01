import Joi from 'joi';
import { QuestionType } from '../../constants/content.enum.js';

export const createQuizSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required().messages({
    'string.empty': 'Quiz title is required',
    'any.required': 'Quiz title is required',
  }),
  description: Joi.string().trim().max(2000).allow(null, '').optional(),
  passingScore: Joi.number().integer().min(0).max(100).default(70),
  maxAttempts: Joi.number().integer().min(1).default(3),
  durationMinutes: Joi.number().integer().min(1).default(30),
  isPublished: Joi.boolean().default(true),
});

export const updateQuizSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().max(2000).allow(null, '').optional(),
  passingScore: Joi.number().integer().min(0).max(100).optional(),
  maxAttempts: Joi.number().integer().min(1).optional(),
  durationMinutes: Joi.number().integer().min(1).optional(),
  isPublished: Joi.boolean().optional(),
}).min(1);

export const createQuestionSchema = Joi.object({
  prompt: Joi.string().trim().min(3).required().messages({
    'string.empty': 'Question prompt is required',
    'any.required': 'Question prompt is required',
  }),
  type: Joi.string()
    .valid(...Object.values(QuestionType))
    .default(QuestionType.MCQ),
  options: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().trim().required(),
        isCorrect: Joi.boolean().required(),
      })
    )
    .min(2)
    .required()
    .messages({
      'array.min': 'Question must have at least 2 options',
      'any.required': 'Options array is required',
    }),
  explanation: Joi.string().trim().allow(null, '').optional(),
  points: Joi.number().integer().min(1).default(1),
  order: Joi.number().integer().min(0).optional(),
});

export const updateQuestionSchema = Joi.object({
  prompt: Joi.string().trim().min(3).optional(),
  type: Joi.string()
    .valid(...Object.values(QuestionType))
    .optional(),
  options: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().trim().required(),
        isCorrect: Joi.boolean().required(),
      })
    )
    .min(2)
    .optional(),
  explanation: Joi.string().trim().allow(null, '').optional(),
  points: Joi.number().integer().min(1).optional(),
  order: Joi.number().integer().min(0).optional(),
}).min(1);

export const submitQuizSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().hex().length(24).required(),
        selectedOptionIndices: Joi.array()
          .items(Joi.number().integer().min(0))
          .required(),
      })
    )
    .required()
    .messages({
      'any.required': 'Answers array is required',
    }),
});
