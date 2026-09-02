import { z } from 'zod';

// 1. Login Schema (Universal for all roles: Super Admin, Instructor, Student)
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('يرجى إدخال بريد إلكتروني صحيح (مثال: student@zeinhub.com)'),
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن لا تقل عن 6 أحرف'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// 2. Student Registration Schema
export const registerStudentSchema = z.object({
  fullName: z
    .string()
    .min(3, 'الاسم الكامل يجب أن يتكون من 3 أحرف على الأقل')
    .max(100, 'الاسم لا يمكن أن يتجاوز 100 حرف'),
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('يرجى إدخال بريد إلكتروني صحيح للالتحاق'),
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن لا تقل عن 6 أحرف'),
  phone: z
    .string()
    .optional(),
});

export type RegisterStudentFormData = z.infer<typeof registerStudentSchema>;

// 3. Program Creation Schema
export const createProgramSchema = z.object({
  titleAr: z
    .string()
    .min(3, 'عنوان البرنامج بالعربية يجب أن يتكون من 3 أحرف على الأقل')
    .max(150, 'العنوان لا يمكن أن يتجاوز 150 حرفاً'),
  titleEn: z
    .string()
    .min(3, 'العنوان بالإنجليزية مطلوب ويجب أن يتكون من 3 أحرف على الأقل')
    .max(150, 'العنوان لا يمكن أن يتجاوز 150 حرفاً'),
  slug: z
    .string()
    .min(3, 'الرابط المخصص مطلوب')
    .regex(/^[a-z0-9-]+$/, 'الرابط المخصص يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وفواصل (-) فقط'),
  trackId: z
    .string()
    .min(1, 'يرجى اختيار المسار التدريبي'),
  descriptionAr: z
    .string()
    .min(10, 'الوصف بالعربية يجب أن يكون 10 أحرف على الأقل'),
  descriptionEn: z
    .string()
    .optional(),
  durationWeeks: z
    .number()
    .min(1, 'المدة بالأسابيع يجب أن تكون أسبوع واحد على الأقل'),
  durationHours: z
    .number()
    .min(1, 'إجمالي الساعات يجب أن يكون ساعة واحدة على الأقل'),
  level: z
    .enum(['beginner', 'intermediate', 'advanced'] as const),
  status: z
    .enum(['open', 'coming-soon', 'closed'] as const),
  price: z
    .number()
    .min(0, 'الرسوم التدريبية لا يمكن أن تكون قيمة سالبة'),
  coverImageUrl: z
    .string()
    .optional(),
});

export type CreateProgramFormData = z.infer<typeof createProgramSchema>;

// 4. Instructor Creation Schema
export const createInstructorSchema = z.object({
  fullName: z
    .string()
    .min(3, 'اسم المحاضر يجب أن يتكون من 3 أحرف على الأقل')
    .max(100, 'الاسم لا يمكن أن يتجاوز 100 حرف'),
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('يرجى إدخال بريد إلكتروني صحيح للمحاضر'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن لا تقل عن 8 أحرف للأمان'),
  phone: z
    .string()
    .optional(),
  trackId: z
    .string()
    .min(1, 'يرجى اختيار المسار التدريبي التابع له'),
  specializations: z
    .string()
    .min(2, 'يرجى إدخال تخصص واحد على الأقل مفصول بفاصلة'),
  bio: z
    .string()
    .min(10, 'النبذة التعريفية للمحاضر يجب أن تتكون من 10 أحرف على الأقل'),
});

export type CreateInstructorFormData = z.infer<typeof createInstructorSchema>;

// 5. Track Creation Schema
export const createTrackSchema = z.object({
  nameAr: z
    .string()
    .min(3, 'اسم المسار بالعربية يجب أن يتكون من 3 أحرف على الأقل'),
  nameEn: z
    .string()
    .min(3, 'اسم المسار بالإنجليزية يجب أن يتكون من 3 أحرف على الأقل'),
  slug: z
    .string()
    .min(3, 'الرابط المخصص مطلوب')
    .regex(/^[a-z0-9-]+$/, 'الرابط المخصص يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وفواصل (-) فقط'),
  descriptionAr: z
    .string()
    .optional(),
  descriptionEn: z
    .string()
    .optional(),
});

export type CreateTrackFormData = z.infer<typeof createTrackSchema>;
