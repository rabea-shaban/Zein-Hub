"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { MediaPreview } from "@/components/ui/MediaPreview";
import { useLanguage } from "@/context/LanguageContext";
import {
  Radio,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Video,
  Award,
} from "lucide-react";

export function HeroSection() {
  const { direction, language, t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200 dark:border-navy-800/80 bg-navy-50 dark:bg-navy-950 transition-colors duration-300">
      {/* Subtle Official Gold Glows */}
      <div className="absolute top-1/4 right-1/2 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-gold-500/10 dark:bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-navy-500/5 dark:bg-navy-600/10 rounded-full blur-2xl pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Main Slogan & Headline Content (6 cols) */}
          <div className="lg:col-span-6 space-y-7 sm:space-y-8 text-center lg:text-start">
            {/* Upper Egypt Official Brand Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs sm:text-sm font-bold shadow-sm mb-1">
              <span className="flex h-2.5 w-2.5 rounded-full bg-gold-500 animate-pulse shrink-0" />
              <span className="truncate">{t.brandName} • {t.brandSlogan}</span>
            </div>

            {/* Official Slogan Headline (Items 3, 4, 5) */}
            <div className="space-y-2">
              <span className="block text-xl sm:text-2xl md:text-3xl font-extrabold text-gold-600 dark:text-gold-400 tracking-wide font-sans">
                {t.brandSloganPrefix}
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.35] sm:leading-[1.4]">
                {language === "en" ? (
                  <>
                    We Create the{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 dark:from-gold-300 dark:via-gold-400 dark:to-gold-500">
                      Media of Tomorrow
                    </span>
                  </>
                ) : (
                  <>
                    بنصنع{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 dark:from-gold-300 dark:via-gold-400 dark:to-gold-500">
                      إعلام المستقبل
                    </span>
                  </>
                )}
              </h1>

              {/* Subtle Gold Accent Divider Waveform (Item 5) */}
              <div className="flex items-center gap-2 pt-2 justify-center lg:justify-start opacity-70">
                <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-gold-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                <div className="h-0.5 w-24 bg-gradient-to-r from-gold-500 to-transparent" />
              </div>
            </div>

            {/* Brand Statement Paragraph (Item 6) */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-[2.0] max-w-[65ch] mx-auto lg:mx-0 font-normal">
              {t.brandStatement}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/programs" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-navy-950 font-black border border-gold-400 shadow-gold-glow px-8 py-4 text-sm sm:text-base hover:scale-[1.02] transition-all gap-2"
                >
                  <span>{t.heroExploreCTA}</span>
                  {direction === "rtl" ? (
                    <ArrowLeft className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </Link>

              <Link href="/about" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-950 dark:hover:text-white px-7 py-4 text-sm sm:text-base font-bold transition-all"
                >
                  <span>{t.heroAboutCTA}</span>
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-slate-200 dark:border-navy-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 text-start">
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <Video className="h-4 w-4 text-gold-500 shrink-0" />
                <span className="leading-normal">{t.heroTrust1}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-gold-500 shrink-0" />
                <span className="leading-normal">{t.heroTrust2}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <Award className="h-4 w-4 text-gold-500 shrink-0" />
                <span className="leading-normal">{t.heroTrust3}</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase Centerpiece (6 cols) */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0">
            <MediaPreview
              posterSrc="/media/hero/studio-hero.svg"
              title={language === "en" ? "Zein Hub — From Upper Egypt, We Create the Media of Tomorrow" : "Zein Hub — من الصعيد.. بنصنع إعلام المستقبل"}
              subtitle={language === "en" ? "Broadcast studios, vocal suites, and digital newsrooms" : "استوديوهات البث التلفزيوني وهندسة الصوت ومعامل الذكاء الاصطناعي"}
              badgeText={t.onAir}
              aspectRatio="video"
              priority={true}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
