import Joi from 'joi';
import { ContactMessageStatus } from '../../models/contactMessage.model.js';

export const createContactMessageSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'الاسم الكامل مطلوب',
    'string.min': 'يجب أن يكون الاسم من حرفين على الأقل',
  }),
  email: Joi.string().trim().email().required().messages({
    'any.required': 'البريد الإلكتروني مطلوب',
    'string.email': 'صيغة البريد الإلكتروني غير صحيحة',
  }),
  phone: Joi.string().trim().min(6).max(30).required().messages({
    'any.required': 'رقم الهاتف مطلوب',
  }),
  governorate: Joi.string().trim().min(2).max(50).required().messages({
    'any.required': 'المحافظة مطلوبة',
  }),
  inquiryType: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'نوع الاستفسار مطلوب',
  }),
  message: Joi.string().trim().min(5).max(3000).required().messages({
    'any.required': 'نص الرسالة مطلوب',
    'string.min': 'يجب أن تكون الرسالة من 5 أحرف على الأقل',
  }),
});

export const updateContactMessageStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ContactMessageStatus))
    .required()
    .messages({
      'any.required': 'حالة الرسالة مطلوبة',
    }),
  adminNotes: Joi.string().trim().max(1000).allow(null, '').optional(),
});
