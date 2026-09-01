"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Radio,
  Sun,
  Moon,
  Globe,
  Home,
  BookOpen,
  Info,
  Users,
  Mail,
  ArrowLeft,
  ArrowRight,
  Phone,
  LogIn,
  UserPlus,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Container } from "./Container";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { SITE_CONFIG } from "@/lib/constants";

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const { language, toggleLanguage, direction, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const isAr = language === 'ar';

  const navLinks = [
    { label: isAr ? 'الرئيسية' : 'Home', href: "/", icon: Home },
    { label: isAr ? 'البرامج التدريبية' : 'Programs', href: "/programs", icon: BookOpen },
    { label: isAr ? 'عن المنصة' : 'About', href: "/about", icon: Info },
    { label: isAr ? 'المدربون والخبراء' : 'Instructors', href: "/instructors", icon: Users },
    { label: isAr ? 'تواصل معنا' : 'Contact', href: "/contact", icon: Mail },
  ];

  // Prevent background scrolling when sidebar is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getDashboardLink = () => {
    if (user?.role === "super_admin") {
      return "/admin";
    }
    if (user?.role === "instructor") {
      return "/instructor";
    }
    return "/student";
  };

  const getDashboardLabel = () => {
    if (user?.role === "super_admin") return isAr ? "لوحة الإدارة" : "Admin Panel";
    if (user?.role === "instructor") return isAr ? "لوحة المحاضر" : "Faculty Portal";
    return isAr ? "لوحة الطالب والمهام" : "Student Dashboard";
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-navy-800/80 bg-white/90 dark:bg-navy-950/90 backdrop-blur-md transition-colors duration-300">
        <Container className="flex h-16 sm:h-18 items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-900 border border-gold-500/40 shadow-sm group-hover:border-gold-400 group-hover:scale-105 transition-all overflow-hidden p-1">
              <Image
                src="/images/logo/logo.png"
                alt="Zein Hub Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full"
                priority
              />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg leading-none text-slate-900 dark:text-white tracking-tight">
                {t.brandName}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20 whitespace-nowrap">
                {t.upperEgyptBadge}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Concise, no multi-line wrapping */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? "text-navy-950 bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 shadow-md shadow-gold-500/20 font-black"
                      : "text-slate-700 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-slate-100 dark:hover:bg-navy-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Controls, Auth & CTA */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500/50 hover:text-gold-600 dark:hover:text-gold-400 transition-all shrink-0"
              aria-label="Toggle Language"
              title="تبديل اللغة / Switch Language"
            >
              <Globe className="h-3.5 w-3.5 text-gold-500 shrink-0" />
              <span>{language === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500/50 hover:text-gold-600 dark:hover:text-gold-400 transition-all shrink-0"
              aria-label="Toggle Dark/Light Mode"
              title="تبديل المظهر / Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-gold-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-slate-700" />
              )}
            </button>

            {/* Auth Buttons / Profile Panel */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-bold transition-all shadow-sm whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{getDashboardLabel()}</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-all"
                  title={isAr ? "تسجيل الخروج" : "Logout"}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {/* Login Button */}
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-400 transition-all whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 text-gold-500" />
                  <span>{isAr ? "دخول" : "Login"}</span>
                </Link>

                {/* Student Register Button */}
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-navy-950 bg-gold-500 hover:bg-gold-400 border border-gold-400 shadow-sm shadow-gold-500/20 transition-all whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAr ? "تسجيل طالب" : "Register"}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger & Fast Controls */}
          <div className="flex items-center gap-1.5 lg:hidden">
            {isAuthenticated ? (
              <Link
                href={getDashboardLink()}
                className="p-1.5 rounded-lg bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30 text-xs font-bold"
              >
                <LayoutDashboard className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800"
              >
                {isAr ? "دخول" : "Login"}
              </Link>
            )}

            <button
              onClick={toggleLanguage}
              className="p-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800"
              aria-label="Toggle Language"
            >
              {language === "ar" ? "EN" : "عربي"}
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-gold-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-slate-700" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-900 focus:outline-none"
              aria-label="فتح القائمة الرئيسية"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <div
            className={`fixed inset-y-0 ${
              direction === "rtl" ? "left-0" : "right-0"
            } w-[85%] max-w-sm bg-white dark:bg-navy-950 p-6 shadow-2xl overflow-y-auto flex flex-col justify-between border-${
              direction === "rtl" ? "r" : "l"
            } border-slate-200 dark:border-navy-800`}
          >
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-gold-500/40 shadow-md overflow-hidden p-1">
                    <Image
                      src="/images/logo/logo.png"
                      alt="Zein Hub Logo"
                      width={40}
                      height={40}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      {t.brandName}
                    </h3>
                    <span className="text-[10px] text-gold-600 dark:text-gold-400 font-bold block">
                      {t.upperEgyptBadge}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5 text-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 block mb-2 font-mono">
                  {language === "en" ? "Navigation" : "أقسام المنصة"}
                </span>

                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-gold-500/10 dark:bg-navy-850 text-gold-700 dark:text-gold-400 border border-gold-500/30 font-bold shadow-sm"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-gold-600 dark:text-gold-400" : "text-slate-400"}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Auth Panel inside Mobile Drawer */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 space-y-2.5 text-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  {isAr ? "الحساب والمصادقة" : "Account & Authentication"}
                </span>

                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{user.fullName}</div>
                        <div className="text-[10px] text-gray-400">{user.email}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold border border-gold-500/20">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs shadow-sm"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>{getDashboardLabel()}</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-500/20"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isAr ? "تسجيل الخروج" : "Logout"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <LogIn className="w-3.5 h-3.5 text-gold-500" />
                      <span>{isAr ? "دخول" : "Login"}</span>
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isAr ? "تسجيل طالب" : "Register"}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-6 border-t border-slate-200 dark:border-navy-800 space-y-3">
              <Link href="/programs" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-gold-500 hover:bg-gold-600 text-navy-950 font-black py-3.5 gap-2 shadow-gold-glow text-sm">
                  <span>{t.exploreProgramsCTA}</span>
                  {direction === "rtl" ? (
                    <ArrowLeft className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Phone className="h-3.5 w-3.5 text-gold-500" />
                <span dir="ltr">{SITE_CONFIG.phone}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
