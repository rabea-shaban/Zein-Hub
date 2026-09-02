'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations/admin.schemas';
import { FormField, inputClass } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';
import { LogIn, Lock, Mail, AlertCircle, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      const user = await login(data.email, data.password);
      const role = user.role?.toLowerCase();

      // Role-Based Smart Redirection
      if (role === 'super_admin') {
        router.push('/admin');
      } else if (role === 'instructor') {
        router.push('/instructor');
      } else {
        router.push('/student');
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'فشل تسجيل الدخول، يرجى التأكد من صحة البريد الإلكتروني وكلمة المرور'
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
          <h1 className="text-2xl font-black text-white">تسجيل الدخول الموحد</h1>
          <p className="text-xs text-gray-400 mt-1">بوابة الدخول الذكية للوحة الإدارة، وبوابة المحاضرين، ومنصة التدريب</p>
        </div>

        {/* Login Card */}
        <div className="bg-navy-900/90 backdrop-blur-xl border border-navy-800 rounded-3xl p-8 shadow-2xl">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email Field with RHF + Zod */}
            <FormField label="البريد الإلكتروني" error={errors.email?.message} required>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@example.com"
                  className={inputClass(!!errors.email)}
                />
                <Mail className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-sm transition-all shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>دخول المنظومة</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-gray-400 hover:text-gold-400 transition-colors">
            ← العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
