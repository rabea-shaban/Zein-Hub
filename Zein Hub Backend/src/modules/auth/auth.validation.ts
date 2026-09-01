import Joi from 'joi';

export const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name cannot exceed 100 characters',
    'any.required': 'Full name is required',
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'any.required': 'Password is required',
  }),
  phone: Joi.string().trim().allow(null, '').optional().messages({
    'string.base': 'Phone number must be a valid string',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().optional().messages({
    'string.base': 'Refresh token must be a string',
  }),
});
