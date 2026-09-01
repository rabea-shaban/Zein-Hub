'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { InstructorSidebar } from '@/components/instructor/InstructorSidebar';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Menu, Sun, Moon, Globe, User, ShieldCheck, ShieldAlert, LogIn, Loader2 } from 'lucide-react';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, role, isLoading } = useAuth();
  const isAr = language === 'ar';

  // 1. Loading State while checking JWT & Authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-white font-cairo">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-300">
          {isAr ? 'جارٍ التحقق من صلاحيات المحاضر والمدرب...' : 'Verifying Instructor Permissions...'}
        </p>
      </div>
    );
  }

  const normalizedRole = role?.toLowerCase();
  const isAuthorized = normalizedRole === 'instructor' || normalizedRole === 'super_admin';

  // 2. Strict Auth Guard: Unauthenticated or Unauthorized Access Denied
  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 font-cairo">
        <div className="max-w-md w-full bg-navy-900 border border-navy-800 rounded-3xl p-8 text-center text-white shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold mb-2">
            {isAr ? 'غير مصرح لك بالدخول (403 Forbidden)' : 'Access Denied (403 Forbidden)'}
          </h2>

          <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
            {isAr
              ? 'بوابة التدريب مخصصة لحسابات المحاضرين والمدربين المعتمدين لدى Zein Hub. يرجى تسجيل الدخول بحساب مدرب للمتابعة.'
              : 'This portal is restricted to authorized Zein Hub faculty instructors. Please sign in with your instructor account to continue.'}
          </p>

          <div className="space-y-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold transition-all shadow-lg shadow-gold-500/20 text-xs sm:text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>{isAr ? 'تسجيل الدخول إلى حساب المحاضر' : 'Sign In as Instructor'}</span>
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-navy-800 hover:bg-navy-750 text-gray-300 text-xs font-bold transition-colors"
            >
              <span>{isAr ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Instructor View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex transition-colors duration-300 font-cairo">
      {/* Responsive Instructor Sidebar */}
      <InstructorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border-b border-gray-200 dark:border-navy-800 px-4 sm:px-8 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800 lg:hidden"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">
                {isAr ? 'لوحة تدريب الخبراء' : 'Faculty LMS Portal'}
              </span>
              <span className="text-gray-300 dark:text-navy-700">•</span>
              <span className="text-xs font-bold text-gold-600 dark:text-gold-400 font-mono">
                Zein Hub Upper Egypt
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:border-gold-500/50 transition-all border border-transparent"
            >
              <Globe className="w-3.5 h-3.5 text-gold-500" />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-200 text-xs hover:border-gold-500/50 transition-all border border-transparent"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-gold-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* User Profile Pill */}
            <Link
              href="/instructor/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-700 dark:text-gold-400 text-xs font-bold hover:bg-gold-500/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">
                {user?.fullName || (isAr ? 'المحاضر المعتمد' : 'Instructor')}
              </span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
