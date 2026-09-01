import Joi from 'joi';
import { AssignmentSubmissionType } from '../../constants/content.enum.js';

export const createAssignmentSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required().messages({
    'string.empty': 'Assignment title is required',
    'any.required': 'Assignment title is required',
  }),
  description: Joi.string().trim().max(3000).required().messages({
    'string.empty': 'Assignment description is required',
    'any.required': 'Assignment description is required',
  }),
  instructions: Joi.string().trim().max(5000).allow(null, '').optional(),
  submissionType: Joi.string()
    .valid(...Object.values(AssignmentSubmissionType))
    .default(AssignmentSubmissionType.AUDIO),
  maxScore: Joi.number().integer().min(1).max(1000).default(100),
  deadline: Joi.date().iso().allow(null).optional(),
  isPublished: Joi.boolean().default(true),
});

export const updateAssignmentSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().max(3000).optional(),
  instructions: Joi.string().trim().max(5000).allow(null, '').optional(),
  submissionType: Joi.string()
    .valid(...Object.values(AssignmentSubmissionType))
    .optional(),
  maxScore: Joi.number().integer().min(1).max(1000).optional(),
  deadline: Joi.date().iso().allow(null).optional(),
  isPublished: Joi.boolean().optional(),
}).min(1);

export const submitAssignmentSchema = Joi.object({
  fileUrl: Joi.string().trim().uri().allow(null, '').optional(),
  textContent: Joi.string().allow(null, '').optional(),
}).or('fileUrl', 'textContent');

export const gradeSubmissionSchema = Joi.object({
  grade: Joi.number().min(0).required().messages({
    'any.required': 'Grade is required',
  }),
  feedback: Joi.string().trim().max(2000).allow(null, '').optional(),
  status: Joi.string().valid('graded', 'needs_revision', 'submitted').optional(),
});
