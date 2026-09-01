'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ShieldAlert, LogIn, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-300 font-cairo">
          {language === 'ar' ? 'جارٍ التحقق من صلاحيات لوحة التحكم...' : 'Verifying Dashboard Permissions...'}
        </p>
      </div>
    );
  }

  const normalizedRole = role?.toLowerCase();
  const isAuthorized = normalizedRole === 'super_admin' || normalizedRole === 'instructor';

  // 2. Unauthenticated or Unauthorized Access Denied
  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-navy-900 border border-navy-800 rounded-3xl p-8 text-center text-white shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold font-cairo mb-2">
            {language === 'ar' ? 'غير مصرح لك بالدخول (403 Forbidden)' : 'Access Denied (403 Forbidden)'}
          </h2>

          <p className="text-gray-400 text-sm mb-8 font-cairo leading-relaxed">
            {language === 'ar'
              ? 'لوحة الإدارة والتدريب مخصصة لحسابات Super Admin و Instructor. يرجى تسجيل الدخول بالحساب المناسب للمتابعة.'
              : 'The management portal is restricted to Super Admin and Instructor accounts. Please log in with authorized credentials.'}
          </p>

          <div className="space-y-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold transition-all font-cairo shadow-lg shadow-gold-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'ar' ? 'تسجيل الدخول (Login)' : 'Sign In (Login)'}</span>
            </Link>

            <Link
              href="/"
              className="block text-xs font-semibold text-gray-400 hover:text-white transition-colors pt-2"
            >
              {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return to Home Page'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render Admin & Instructor Portal Shell
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex min-w-0 transition-colors duration-300 font-cairo">
      {/* Dynamic Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}
