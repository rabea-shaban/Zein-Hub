import Joi from 'joi';
import { AttendanceStatus } from '../../constants/content.enum.js';

export const markAttendanceSchema = Joi.object({
  studentId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid student ID format',
    'any.required': 'Student ID is required',
  }),
  status: Joi.string()
    .valid(...Object.values(AttendanceStatus))
    .default(AttendanceStatus.PRESENT),
  attendanceMinutes: Joi.number().integer().min(0).allow(null).optional(),
  joinedAt: Joi.date().iso().allow(null).optional(),
  leftAt: Joi.date().iso().allow(null).optional(),
  notes: Joi.string().trim().max(1000).allow(null, '').optional(),
});

export const bulkMarkAttendanceSchema = Joi.object({
  attendanceRecords: Joi.array().items(markAttendanceSchema).min(1).required().messages({
    'array.min': 'At least one attendance record is required',
    'any.required': 'Attendance records array is required',
  }),
});
