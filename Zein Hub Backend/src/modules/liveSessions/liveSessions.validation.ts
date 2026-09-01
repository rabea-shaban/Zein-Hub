import Joi from 'joi';
import { LiveSessionProvider, LiveSessionStatus } from '../../constants/content.enum.js';

export const createLiveSessionSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required().messages({
    'string.empty': 'Live session title is required',
    'any.required': 'Live session title is required',
  }),
  description: Joi.string().trim().max(3000).allow(null, '').optional(),
  provider: Joi.string()
    .valid(...Object.values(LiveSessionProvider))
    .default(LiveSessionProvider.GOOGLE_MEET),
  meetingUrl: Joi.string().trim().uri().required().messages({
    'string.uri': 'Valid meeting URL (e.g. Google Meet, Zoom, MS Teams) is required',
    'any.required': 'Meeting URL is required',
  }),
  meetingPassword: Joi.string().trim().max(100).allow(null, '').optional(),
  startTime: Joi.date().iso().required().messages({
    'any.required': 'Session start time is required',
  }),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required().messages({
    'date.greater': 'Session end time must be after start time',
    'any.required': 'Session end time is required',
  }),
  recordingUrl: Joi.string().trim().uri().allow(null, '').optional(),
});

export const updateLiveSessionSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().max(3000).allow(null, '').optional(),
  provider: Joi.string()
    .valid(...Object.values(LiveSessionProvider))
    .optional(),
  meetingUrl: Joi.string().trim().uri().optional(),
  meetingPassword: Joi.string().trim().max(100).allow(null, '').optional(),
  startTime: Joi.date().iso().optional(),
  endTime: Joi.date().iso().optional(),
  status: Joi.string()
    .valid(...Object.values(LiveSessionStatus))
    .optional(),
  recordingUrl: Joi.string().trim().uri().allow(null, '').optional(),
}).min(1);

export const updateLiveSessionStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(LiveSessionStatus))
    .required()
    .messages({
      'any.required': 'Live session status is required',
    }),
});
