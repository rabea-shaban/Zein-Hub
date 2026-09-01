'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StudentSidebar } from '@/components/student/StudentSidebar';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Menu, Sun, Moon, Globe, User, ShieldAlert, LogIn, Loader2 } from 'lucide-react';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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
          {isAr ? 'جارٍ التحقق من حساب الطالب والاشتراكات...' : 'Verifying Student Account...'}
        </p>
      </div>
    );
  }

  // 2. Strict Auth Guard: Unauthenticated Access Denied
  if (!user) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 font-cairo">
        <div className="max-w-md w-full bg-navy-900 border border-navy-800 rounded-3xl p-8 text-center text-white shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold mb-2">
            {isAr ? 'تسجيل الدخول مطلوب' : 'Authentication Required'}
          </h2>

          <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
            {isAr
              ? 'يرجى تسجيل الدخول بحساب الطالب الخاص بك لمتابعة كورساتك المسجلة، تسليم التكليفات، ومواعيد ورش الاستوديو.'
              : 'Please sign in with your student account to access your courses, assignments, and studio sessions.'}
          </p>

          <div className="space-y-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold transition-all shadow-lg shadow-gold-500/20 text-xs sm:text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>{isAr ? 'تسجيل الدخول إلى حساب الطالب' : 'Sign In as Student'}</span>
            </Link>

            <Link
              href="/programs"
              className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-navy-800 hover:bg-navy-750 text-gray-300 text-xs font-bold transition-colors"
            >
              <span>{isAr ? 'تصفح البرامج التدريبية المتاحة' : 'Browse Training Programs'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Immersive Classroom Player: Remove outer dashboard sidebar & header for distraction-free LMS theatre mode
  const isClassroom = pathname.startsWith('/student/programs/') && pathname !== '/student/programs';
  if (isClassroom) {
    return <div className="min-h-screen bg-slate-50 dark:bg-navy-950 font-cairo transition-colors duration-300">{children}</div>;
  }

  // 4. Standard Dashboard View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex transition-colors duration-300 font-cairo">
      {/* Responsive Student Sidebar */}
      <StudentSidebar
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
                {isAr ? 'بوابة المتدربين' : 'Student Learning Hub'}
              </span>
              <span className="text-gray-300 dark:text-navy-700">•</span>
              <span className="text-xs font-bold text-gold-500 flex items-center gap-1 font-mono">
                
                <span>Zein Hub Studio</span>
              </span>
            </div>
          </div>

          {/* Quick Actions Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-navy-800 bg-gray-50 dark:bg-navy-950 text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-gold-500 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-gray-200 dark:border-navy-800 bg-gray-50 dark:bg-navy-950 text-gray-700 dark:text-gray-300 hover:border-gold-500 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-gold-400" />
              ) : (
                <Moon className="w-4 h-4 text-navy-800" />
              )}
            </button>

            <div className="h-6 w-[1px] bg-gray-200 dark:bg-navy-800 mx-1 hidden sm:block" />

            {/* Profile Avatar Badge */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold text-xs shadow-md shadow-gold-500/20">
                {user?.fullName?.charAt(0) || 'S'}
              </div>
              <div className="hidden md:block text-start">
                <span className="text-xs font-bold text-navy-900 dark:text-white block leading-tight">
                  {user?.fullName || 'Student'}
                </span>
                <span className="text-[10px] text-emerald-500 font-bold block">
                  {isAr ? 'طالب نشط' : 'Active Student'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Children Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
