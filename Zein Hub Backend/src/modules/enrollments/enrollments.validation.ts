import Joi from 'joi';
import { EnrollmentStatus } from '../../constants/enrollmentStatus.enum.js';

export const updateEnrollmentStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(EnrollmentStatus))
    .required()
    .messages({
      'any.required': 'Enrollment status is required',
      'any.only': 'Status must be active, completed, or dropped',
    }),
  finalGrade: Joi.number().min(0).max(100).allow(null).optional(),
  certificateUrl: Joi.string().trim().uri().allow(null, '').optional(),
});
