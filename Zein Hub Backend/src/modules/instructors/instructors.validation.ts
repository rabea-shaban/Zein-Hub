import Joi from 'joi';

export const createInstructorSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Full name is required',
    'any.required': 'Full name is required',
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.empty': 'Email address is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email address is required',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
  phone: Joi.string().trim().allow(null, '').optional(),
  specializationTrackId: Joi.string().hex().length(24).allow(null, '').optional(),
  trackId: Joi.string().hex().length(24).allow(null, '').optional(),
  specializations: Joi.array().items(Joi.string().trim()).default([]),
  bio: Joi.string().trim().min(10).required().messages({
    'string.empty': 'Instructor bio is required',
    'any.required': 'Instructor bio is required',
  }),
  experienceYears: Joi.number().integer().min(0).default(0),
  assignedPrograms: Joi.array()
    .items(Joi.string().hex().length(24).allow(null, ''))
    .default([]),
  photoUrl: Joi.string().trim().uri().allow(null, '').optional(),
  reelUrl: Joi.string().trim().uri().allow(null, '').optional(),
  socialLinks: Joi.object({
    linkedin: Joi.string().trim().uri().allow(null, '').optional(),
    twitter: Joi.string().trim().uri().allow(null, '').optional(),
    youtube: Joi.string().trim().uri().allow(null, '').optional(),
    portfolio: Joi.string().trim().uri().allow(null, '').optional(),
  }).optional(),
});

export const updateInstructorAdminSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string().trim().allow(null, '').optional(),
  password: Joi.string().min(8).max(128).optional(),
  specializationTrackId: Joi.string().hex().length(24).allow(null, '').optional(),
  specializations: Joi.array().items(Joi.string().trim()).optional(),
  bio: Joi.string().trim().min(10).optional(),
  experienceYears: Joi.number().integer().min(0).optional(),
  assignedPrograms: Joi.array().items(Joi.string().hex().length(24)).optional(),
  photoUrl: Joi.string().trim().uri().allow(null, '').optional(),
  reelUrl: Joi.string().trim().uri().allow(null, '').optional(),
  socialLinks: Joi.object({
    linkedin: Joi.string().trim().uri().allow(null, '').optional(),
    twitter: Joi.string().trim().uri().allow(null, '').optional(),
    youtube: Joi.string().trim().uri().allow(null, '').optional(),
    portfolio: Joi.string().trim().uri().allow(null, '').optional(),
  }).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const updateInstructorSelfSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string().trim().allow(null, '').optional(),
  password: Joi.string().min(8).max(128).optional(),
  newPassword: Joi.string().min(8).max(128).optional(),
  currentPassword: Joi.string().min(6).max(128).optional(),
  avatarUrl: Joi.string().trim().allow(null, '').optional(),
  photoUrl: Joi.string().trim().allow(null, '').optional(),
  bio: Joi.string().trim().min(5).allow(null, '').optional(),
  specializations: Joi.array().items(Joi.string().trim()).optional(),
  experienceYears: Joi.number().integer().min(0).optional(),
  reelUrl: Joi.string().trim().allow(null, '').optional(),
  socialLinks: Joi.object({
    linkedin: Joi.string().trim().allow(null, '').optional(),
    twitter: Joi.string().trim().allow(null, '').optional(),
    youtube: Joi.string().trim().allow(null, '').optional(),
    portfolio: Joi.string().trim().allow(null, '').optional(),
    facebook: Joi.string().trim().allow(null, '').optional(),
    instagram: Joi.string().trim().allow(null, '').optional(),
    website: Joi.string().trim().allow(null, '').optional(),
    github: Joi.string().trim().allow(null, '').optional(),
  }).optional(),
}).min(1);

export const changeInstructorStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    'any.required': 'isActive boolean status is required',
  }),
});

export const updateAssignedProgramsSchema = Joi.object({
  assignedPrograms: Joi.array()
    .items(Joi.string().hex().length(24))
    .required()
    .messages({
      'any.required': 'assignedPrograms array of program IDs is required',
    }),
});
