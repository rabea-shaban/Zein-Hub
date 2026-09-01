'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerStudentSchema, RegisterStudentFormData } from '@/lib/validations/admin.schemas';
import { FormField, inputClass } from '@/components/ui/FormField';
import { api } from '@/lib/api';
import { UserPlus, Lock, Mail, User, Phone, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterStudentFormData>({
    resolver: zodResolver(registerStudentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const onSubmit = async (data: RegisterStudentFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await api.post('/auth/register', data);
      setSuccessMessage('تم إنشاء حساب الطالب بنجاح! جارٍ تحويلك لصفحة الدخول...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'فشل إنشاء الحساب، يرجى التأكد من صحة البيانات أو استخدام بريد آخر'
      );
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 font-cairo text-white">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-gold-500/40 shadow-xl shadow-gold-500/20 overflow-hidden p-1.5 group-hover:scale-105 transition-transform">
              <Image
                src="/images/logo/logo.png"
                alt="Zein Hub Logo"
                width={48}
                height={48}
                className="object-contain w-full h-full"
              />
            </div>
            <span className="text-2xl font-black tracking-wide text-white">Zein Hub</span>
          </Link>
          <h1 className="text-2xl font-black text-white">إنشاء حساب طالب جديد</h1>
          <p className="text-xs text-gray-400 mt-1">انضم إلى مجتمع التدريب الإعلامي الرائد في صعيد مصر</p>
        </div>

        {/* Register Card */}
        <div className="bg-navy-900/90 backdrop-blur-xl border border-navy-800 rounded-3xl p-8 shadow-2xl">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full Name */}
            <FormField label="الاسم الكامل" error={errors.fullName?.message} required>
              <div className="relative">
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="أحمد سمير"
                  className={inputClass(!!errors.fullName)}
                />
                <User className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </FormField>

            {/* Email */}
            <FormField label="البريد الإلكتروني" error={errors.email?.message} required>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  placeholder="ahmed@example.com"
                  className={inputClass(!!errors.email)}
                />
                <Mail className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </FormField>

            {/* Phone */}
            <FormField label="رقم الهاتف (اختياري)" error={errors.phone?.message}>
              <div className="relative">
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="+201012345678"
                  className={inputClass(!!errors.phone)}
                />
                <Phone className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </FormField>

            {/* Password Field with Show/Hide Toggle */}
            <FormField label="كلمة المرور" error={errors.password?.message} required>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••••••"
                  className={`${inputClass(!!errors.password)} pl-12`}
                />
                <Lock className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-400 hover:text-gold-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors focus:outline-none"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-sm transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ إنشاء الحساب...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>تسجيل الحساب الآن</span>
                </>
              )}
            </button>
          </form>

          {/* Already have an account */}
          <div className="mt-6 pt-6 border-t border-navy-800 text-xs text-center text-gray-400">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-gold-400 font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
