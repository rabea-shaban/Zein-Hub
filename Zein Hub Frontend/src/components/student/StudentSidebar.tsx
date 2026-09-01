'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  Video,
  Award,
  BookOpen,
  User,
  LogOut,
  Layers,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export function StudentSidebar({
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
    { label: isAr ? 'لوحة الطالب والمهام' : 'Student Dashboard', href: '/student', icon: LayoutDashboard, exact: true },
    { label: isAr ? 'كورساتي ودبلوماتي' : 'My Enrolled Courses', href: '/student/programs', icon: GraduationCap },
    { label: isAr ? 'التكليفات والتطبيقات' : 'Assignments & Takes', href: '/student/assignments', icon: FileCheck2 },
    { label: isAr ? 'استوديوهات البث المباشر' : 'Live Studio Sessions', href: '/student/live-sessions', icon: Video },
    { label: isAr ? 'شهاداتي وإنجازاتي' : 'My Certificates', href: '/student/certificates', icon: Award },
    { label: isAr ? 'استعراض كافة البرامج' : 'Explore All Programs', href: '/programs', icon: BookOpen },
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
            <Link href="/student" className="flex items-center gap-3 group">
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
                  {isAr ? 'بوابة المتدربين والطلاب' : 'Student Learning Portal'}
                </span>
              </div>
            </Link>
          </div>

          {/* Student Profile Card */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-start space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-xs">
                {user?.fullName?.charAt(0) || 'S'}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-navy-900 dark:text-white block truncate">
                  {user?.fullName || (isAr ? 'طالب متدرب' : 'Student')}
                </span>
                <span className="text-[10px] text-gray-400 font-mono block truncate">
                  {user?.email || 'student@zeinhub.com'}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items List */}
          <nav className="space-y-1.5 text-start">
            <span className="text-[11px] font-bold text-gray-400 px-3 uppercase tracking-wider block mb-2">
              {isAr ? 'المنهج والتدريب' : 'Curriculum & Hub'}
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all',
                    isActive
                      ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20 font-black'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800'
                  )}
                >
                  <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-navy-950' : 'text-gray-400')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-6 border-t border-gray-100 dark:border-navy-800 space-y-2">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
