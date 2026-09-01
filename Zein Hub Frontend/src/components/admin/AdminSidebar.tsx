'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  Layers,
  Users,
  FileCheck,
  UserCheck,
  Star,
  BarChart3,
  Award,
  Video,
  ClipboardList,
  MessageSquare,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import clsx from 'clsx';

export function AdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { t, direction, language } = useLanguage();
  const isAr = language === 'ar';

  const navItems = [
    { label: isAr ? 'لوحة التحكم' : 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: isAr ? 'البرامج التدريبية' : 'Training Programs', href: '/admin/programs', icon: GraduationCap },
    { label: isAr ? 'المسارات والتخصصات' : 'Tracks & Disciplines', href: '/admin/tracks', icon: Layers },
    { label: isAr ? 'المدربون والخبراء' : 'Instructors & Faculty', href: '/admin/instructors', icon: Users },
    { label: isAr ? 'طلبات الالتحاق' : 'Applications', href: '/admin/applications', icon: FileCheck },
    { label: isAr ? 'إدارة وسجل الطلاب' : 'Students Management', href: '/admin/enrollments', icon: UserCheck },
    { label: isAr ? 'رسائل واستفسارات التواصل' : 'Contact Inquiries', href: '/admin/contact-messages', icon: MessageSquare },
    { label: isAr ? 'التقييمات والآراء' : 'Reviews Moderation', href: '/admin/reviews', icon: Star },
    { label: isAr ? 'التقارير والتحليلات' : 'Reports & Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: isAr ? 'الشهادات المعتمدة' : 'Certificates', href: '/admin/certificates', icon: Award },
    { label: isAr ? 'الجلسات المباشرة' : 'Live Sessions', href: '/admin/live-sessions', icon: Video },
    { label: isAr ? 'الحضور والغياب' : 'Attendance', href: '/admin/attendance', icon: ClipboardList },
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
            <Link href="/admin" className="flex items-center gap-3 group">
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
                  {isAr ? 'لوحة الإدارة العليا' : 'Super Admin Panel'}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 block mb-2 font-mono">
              {isAr ? 'القائمة الرئيسية' : 'MAIN NAVIGATION'}
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
        <div className="p-4 border-t border-gray-100 dark:border-navy-800">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-gold-500 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-navy-900 text-white flex items-center justify-center font-bold text-[10px]">
                N
              </div>
              <span>{isAr ? 'زيارة الموقع العام' : 'Public Website'}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </aside>
    </>
  );
}
