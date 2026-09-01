'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Video,
  FileCheck2,
  ClipboardList,
  User,
  ExternalLink,
  BookOpen,
  LogOut,
  Award,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export function InstructorSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { direction, language } = useLanguage();
  const { user, logout } = useAuth();
  const isAr = language === 'ar';

  const navItems = [
    { label: isAr ? 'لوحة المحاضر' : 'Dashboard Overview', href: '/instructor', icon: LayoutDashboard, exact: true },
    { label: isAr ? 'برامجي التدريبية والدروس' : 'My Programs & Modules', href: '/instructor/programs', icon: GraduationCap },
    { label: isAr ? 'الطلاب المشتركون في برامجي' : 'My Enrolled Students', href: '/instructor/students', icon: Users },
    { label: isAr ? 'الجلسات الحية والاستوديوهات' : 'Live Studio Sessions', href: '/instructor/live-sessions', icon: Video },
    { label: isAr ? 'تسليمات وتكليفات الطلاب' : 'Submissions & Grading', href: '/instructor/submissions', icon: FileCheck2 },
    { label: isAr ? 'سجل الحضور والغياب' : 'Attendance Records', href: '/instructor/attendance', icon: ClipboardList },
    { label: isAr ? 'الملف الشخصي والمهني' : 'Profile & Bio', href: '/instructor/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed lg:sticky top-0 h-screen w-72 bg-white dark:bg-navy-900 ltr:border-r rtl:border-l border-slate-200 dark:border-navy-800 z-50 transition-transform duration-300 flex flex-col justify-between font-cairo shadow-xl lg:shadow-none',
          direction === 'rtl'
            ? isOpen
              ? 'right-0 translate-x-0'
              : '-right-full lg:right-0 lg:translate-x-0'
            : isOpen
            ? 'left-0 translate-x-0'
            : '-left-full lg:left-0 lg:translate-x-0'
        )}
      >
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/instructor" className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-gold-500/40 shadow-md shadow-gold-500/10 overflow-hidden p-1 shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/images/logo/logo.png"
                  alt="Zein Hub Logo"
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h2 className="font-extrabold text-navy-900 dark:text-white text-base leading-tight">
                  Zein Hub
                </h2>
                <span className="text-[10px] font-bold text-gold-500 tracking-wider block">
                  {isAr ? 'بوابة المدربين والخبراء' : 'Instructor Faculty Portal'}
                </span>
              </div>
            </Link>
          </div>

          {/* Instructor Quick Profile Card */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-start space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-xs">
                {user?.fullName?.charAt(0) || 'M'}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-navy-900 dark:text-white block truncate">
                  {user?.fullName || (isAr ? 'المحاضر المعتمد' : 'Faculty Coach')}
                </span>
                <span className="text-[10px] text-gray-400 font-mono block">
                  {user?.email || 'instructor@zeinhub.com'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 block mb-2 font-mono">
              {isAr ? 'قائمة التدريب والمتابعة' : 'FACULTY NAVIGATION'}
            </span>

            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 text-navy-950 font-black shadow-md shadow-gold-500/25 border border-gold-400/40'
                      : 'text-gray-600 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-navy-800'
                  )}
                >
                  <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-navy-950' : 'text-gray-400')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-gray-100 dark:border-navy-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-gold-500 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-navy-900 text-white flex items-center justify-center font-bold text-[10px]">
                Z
              </div>
              <span>{isAr ? 'الموقع العام' : 'Public Website'}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>

          <button
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
