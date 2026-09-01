'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Menu, LogOut, Moon, Sun, ShieldCheck, Globe } from 'lucide-react';

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const isAr = language === 'ar';

  const userRoleLabel =
    user?.role === 'super_admin'
      ? (isAr ? 'الإدارة العليا' : 'Super Admin')
      : user?.role === 'instructor'
      ? (isAr ? 'محاضر معتمد' : 'Certified Instructor')
      : (isAr ? 'إدارة' : 'Admin');

  const displayName = isAr
    ? (!user?.fullName || user.fullName === 'Super Admin' ? 'المشرف العام' : user.fullName)
    : (!user?.fullName || user.fullName === 'المشرف العام' ? 'Super Administrator' : user.fullName);

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md border-b border-gray-100 dark:border-navy-800 px-6 flex items-center justify-between transition-colors">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-gray-700 dark:text-gray-200 lg:hidden hover:bg-gray-100 dark:hover:bg-navy-900 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
            {t.adminPanelTitle}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-cairo">
            {t.adminWelcome}, {displayName}
          </p>
        </div>
      </div>

      {/* Language, Theme, Profile and Logout */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-800 hover:border-gold-500/50 hover:text-gold-600 dark:hover:text-gold-400 transition-all"
          aria-label="Toggle Language"
          title="تبديل اللغة / Switch Language"
        >
          <Globe className="h-3.5 w-3.5 text-gold-500" />
          <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-gray-600 dark:text-gold-400 bg-gray-50 dark:bg-navy-900 hover:bg-gray-100 dark:hover:bg-navy-850 transition-colors"
          aria-label="Toggle Theme"
          title="تبديل المظهر / Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Admin / Instructor Profile Pill */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-navy-800 bg-gray-50 dark:bg-navy-900/60">
          <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-start">
            <span className="block text-xs font-bold text-navy-900 dark:text-white leading-tight font-cairo">
              {displayName}
            </span>
            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-none font-cairo">
              {userRoleLabel}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-all font-cairo"
          title={t.logoutBtn}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">{t.logoutBtn}</span>
        </button>
      </div>
    </header>
  );
}
