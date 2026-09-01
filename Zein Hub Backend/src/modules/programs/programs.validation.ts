import Joi from 'joi';
import { ProgramStatus } from '../../constants/programStatus.enum.js';

const curriculumWeekValidation = Joi.object({
  weekNumber: Joi.number().integer().min(1).required(),
  title: Joi.string().trim().required(),
  titleEn: Joi.string().trim().allow('', null).optional(),
  description: Joi.string().trim().required(),
  descriptionEn: Joi.string().trim().allow('', null).optional(),
  topics: Joi.array().items(Joi.string().trim()).default([]),
  topicsEn: Joi.array().items(Joi.string().trim()).default([]),
  practicalProject: Joi.string().trim().required(),
  practicalProjectEn: Joi.string().trim().allow('', null).optional(),
});

const capstoneProjectValidation = Joi.object({
  title: Joi.string().trim().required(),
  titleEn: Joi.string().trim().allow('', null).optional(),
  description: Joi.string().trim().required(),
  descriptionEn: Joi.string().trim().allow('', null).optional(),
  deliverable: Joi.string().trim().required(),
  deliverableEn: Joi.string().trim().allow('', null).optional(),
});

export const createProgramSchema = Joi.object({
  titleAr: Joi.string().trim().min(2).max(200).required().messages({
    'string.empty': 'Arabic program title is required',
    'any.required': 'Arabic program title is required',
  }),
  titleEn: Joi.string().trim().min(2).max(200).required().messages({
    'string.empty': 'English program title is required',
    'any.required': 'English program title is required',
  }),
  slug: Joi.string().trim().lowercase().optional(),
  trackId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid Track ID format',
    'string.length': 'Invalid Track ID length',
    'any.required': 'Track ID is required',
  }),
  instructorId: Joi.string().hex().length(24).allow(null, '').optional(),
  descriptionAr: Joi.string().trim().min(10).required().messages({
    'string.empty': 'Arabic description is required',
    'any.required': 'Arabic description is required',
  }),
  descriptionEn: Joi.string().trim().allow(null, '').optional(),
  objectives: Joi.array().items(Joi.string().trim()).default([]),
  targetAudience: Joi.array().items(Joi.string().trim()).default([]),
  targetAudienceEn: Joi.array().items(Joi.string().trim()).default([]),
  learningOutcomes: Joi.array().items(Joi.string().trim()).default([]),
  learningOutcomesEn: Joi.array().items(Joi.string().trim()).default([]),
  curriculum: Joi.array().items(curriculumWeekValidation).default([]),
  toolsAndGear: Joi.array().items(Joi.string().trim()).default([]),
  toolsAndGearEn: Joi.array().items(Joi.string().trim()).default([]),
  capstoneProject: capstoneProjectValidation.optional(),
  prerequisites: Joi.array().items(Joi.string().trim()).default([]),
  prerequisitesEn: Joi.array().items(Joi.string().trim()).default([]),
  locationDetails: Joi.string().trim().allow(null, '').optional(),
  locationDetailsEn: Joi.string().trim().allow(null, '').optional(),
  status: Joi.string()
    .valid(...Object.values(ProgramStatus))
    .default(ProgramStatus.COMING_SOON),
  isFeatured: Joi.boolean().default(false),
  coverImageUrl: Joi.string().trim().allow(null, '').optional(),
  promoVideoUrl: Joi.string().trim().allow(null, '').optional(),
  durationWeeks: Joi.number().integer().min(1).default(4),
  durationHours: Joi.number().min(1).optional(),
  totalHours: Joi.number().min(1).default(20),
  price: Joi.number().min(0).default(0),
  currency: Joi.string().trim().default('EGP'),
  level: Joi.string().trim().allow(null, '').optional(),
  order: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

export const updateProgramSchema = Joi.object({
  titleAr: Joi.string().trim().min(2).max(200).optional(),
  titleEn: Joi.string().trim().min(2).max(200).optional(),
  slug: Joi.string().trim().lowercase().optional(),
  trackId: Joi.string().hex().length(24).optional(),
  instructorId: Joi.string().hex().length(24).allow(null, '').optional(),
  descriptionAr: Joi.string().trim().min(10).optional(),
  descriptionEn: Joi.string().trim().allow(null, '').optional(),
  objectives: Joi.array().items(Joi.string().trim()).optional(),
  targetAudience: Joi.array().items(Joi.string().trim()).optional(),
  targetAudienceEn: Joi.array().items(Joi.string().trim()).optional(),
  learningOutcomes: Joi.array().items(Joi.string().trim()).optional(),
  learningOutcomesEn: Joi.array().items(Joi.string().trim()).optional(),
  curriculum: Joi.array().items(curriculumWeekValidation).optional(),
  toolsAndGear: Joi.array().items(Joi.string().trim()).optional(),
  toolsAndGearEn: Joi.array().items(Joi.string().trim()).optional(),
  capstoneProject: capstoneProjectValidation.optional(),
  prerequisites: Joi.array().items(Joi.string().trim()).optional(),
  prerequisitesEn: Joi.array().items(Joi.string().trim()).optional(),
  locationDetails: Joi.string().trim().allow(null, '').optional(),
  locationDetailsEn: Joi.string().trim().allow(null, '').optional(),
  status: Joi.string()
    .valid(...Object.values(ProgramStatus))
    .optional(),
  isFeatured: Joi.boolean().optional(),
  coverImageUrl: Joi.string().trim().allow(null, '').optional(),
  promoVideoUrl: Joi.string().trim().allow(null, '').optional(),
  durationWeeks: Joi.number().integer().min(1).optional(),
  durationHours: Joi.number().min(1).optional(),
  totalHours: Joi.number().min(1).optional(),
  price: Joi.number().min(0).optional(),
  currency: Joi.string().trim().optional(),
  level: Joi.string().trim().allow(null, '').optional(),
  order: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const changeProgramStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ProgramStatus))
    .required()
    .messages({
      'any.required': 'Status is required',
    }),
});

export const assignInstructorSchema = Joi.object({
  instructorProfileId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid Instructor Profile ID format',
    'string.length': 'Invalid Instructor Profile ID length',
    'any.required': 'Instructor Profile ID is required',
  }),
});
