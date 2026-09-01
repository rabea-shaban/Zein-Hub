"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import {
  Radio,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";

export function FinalCTA() {
  const { direction, t } = useLanguage();

  return (
    <section className="py-12 sm:py-24 md:py-28 bg-gradient-to-b from-white via-slate-100 to-white dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 relative overflow-hidden transition-colors duration-300">
      {/* Background Media Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] h-[250px] sm:h-[350px] bg-gold-500/10 dark:bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-12 md:p-14 text-center space-y-6 sm:space-y-8 shadow-2xl relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-bold font-mono">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>{t.ctaBadge}</span>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {t.ctaTitlePart1}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 dark:from-gold-300 dark:via-gold-400 dark:to-gold-500">
                {t.ctaTitleHighlight}
              </span>{" "}
              {t.ctaTitlePart2}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
              {t.ctaSubtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-1 sm:pt-2">
            <Link href="/programs" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-navy-950 font-black border border-gold-400 shadow-gold-glow px-7 sm:px-9 py-3.5 sm:py-4 text-sm sm:text-base hover:scale-105 transition-all gap-2"
              >
                <span>{t.ctaApplyBtn}</span>
                {direction === "rtl" ? (
                  <ArrowLeft className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </Link>

            <Link href="/contact" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-850 hover:text-slate-950 dark:hover:text-white px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold"
              >
                <span>{t.navContact}</span>
              </Button>
            </Link>
          </div>

          <div className="pt-4 sm:pt-6 border-t border-slate-100 dark:border-navy-800 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              
              <span>{t.ctaTrust1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold-500" />
              <span>{t.ctaTrust2}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold-500" />
              <span>{t.ctaTrust3}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
