import Joi from 'joi';
import { LessonContentType } from '../../constants/content.enum.js';

export const createLessonSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required().messages({
    'string.empty': 'Lesson title is required',
    'any.required': 'Lesson title is required',
  }),
  description: Joi.string().trim().max(2000).allow(null, '').optional(),
  order: Joi.number().integer().min(0).optional(),
  contentType: Joi.string()
    .valid(...Object.values(LessonContentType))
    .default(LessonContentType.VIDEO),
  contentUrl: Joi.string().trim().uri().allow(null, '').optional(),
  textBody: Joi.string().allow(null, '').optional(),
  resources: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().trim().required(),
        fileUrl: Joi.string().trim().uri().required(),
        type: Joi.string().trim().default('pdf'),
      })
    )
    .default([]),
  durationMinutes: Joi.number().integer().min(1).default(10),
  isFreePreview: Joi.boolean().default(false),
  isPublished: Joi.boolean().default(true),
});

export const updateLessonSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().max(2000).allow(null, '').optional(),
  order: Joi.number().integer().min(0).optional(),
  contentType: Joi.string()
    .valid(...Object.values(LessonContentType))
    .optional(),
  contentUrl: Joi.string().trim().uri().allow(null, '').optional(),
  textBody: Joi.string().allow(null, '').optional(),
  resources: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().trim().required(),
        fileUrl: Joi.string().trim().uri().required(),
        type: Joi.string().trim().default('pdf'),
      })
    )
    .optional(),
  durationMinutes: Joi.number().integer().min(1).optional(),
  isFreePreview: Joi.boolean().optional(),
  isPublished: Joi.boolean().optional(),
}).min(1);

export const publishLessonSchema = Joi.object({
  isPublished: Joi.boolean().required().messages({
    'any.required': 'isPublished boolean is required',
  }),
});

export const reorderLessonSchema = Joi.object({
  order: Joi.number().integer().min(0).required().messages({
    'any.required': 'order is required',
  }),
});
