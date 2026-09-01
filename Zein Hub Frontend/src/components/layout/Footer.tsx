"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "./Container";
import { SITE_CONFIG, TARGET_REGIONS } from "@/lib/constants";
import { MapPin, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { language, t } = useLanguage();

  const navLinks = [
    { label: t.navHome, href: "/" },
    { label: t.navPrograms, href: "/programs" },
    { label: t.navAbout, href: "/about" },
    { label: t.navInstructors, href: "/instructors" },
    { label: t.navContact, href: "/contact" },
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-slate-700 dark:text-slate-200 transition-colors duration-300">
      <Container className="py-10 sm:py-14 md:py-18">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 text-start">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-900 border border-gold-500/40 shadow-md shadow-gold-500/10 shrink-0 overflow-hidden p-1">
                <Image
                  src="/images/logo/logo.png"
                  alt="Zein Hub Logo"
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                  {t.brandName}
                </span>
                <span className="text-xs sm:text-sm text-gold-600 dark:text-gold-400 font-bold">
                  {t.brandSlogan}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              {t.brandDescription}
            </p>

            {/* Target Regions */}
            <div className="space-y-2 pt-1 sm:pt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold-500" />
                <span>{t.footerCoverage}</span>
              </span>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {TARGET_REGIONS.map((region) => (
                  <span
                    key={region.id}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-[10px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium"
                  >
                    {language === "en" ? region.nameEn : region.nameAr}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 sm:space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {t.footerQuickLinks}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details & Socials */}
          <div className="md:col-span-4 space-y-3 sm:space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {t.footerContact}
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold-500 shrink-0" />
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
                >
                  {SITE_CONFIG.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold-500 shrink-0" />
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors dir-ltr font-mono"
                >
                  {SITE_CONFIG.phone}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                {t.footerSocials}
              </span>
              <div className="flex items-center gap-2">
                {Object.entries(SITE_CONFIG.socials).map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-[11px] text-slate-600 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 hover:border-gold-500/40 transition-colors font-medium capitalize"
                  >
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-100 dark:border-navy-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} {t.brandName}. {t.allRightsReserved}
          </p>
          <p className="text-gold-600 dark:text-gold-400 font-semibold font-sans">
            {t.brandSlogan}
          </p>
        </div>
      </Container>
    </footer>
  );
}
