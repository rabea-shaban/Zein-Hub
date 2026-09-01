"use client";

import { Container } from "@/components/layout/Container";
import { useLanguage } from "@/context/LanguageContext";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function ValueProposition() {
  const { t } = useLanguage();

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800/80 relative transition-colors duration-300">
      <Container>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-bold">
            
            <span>{t.valuePropBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.5]">
            {t.valuePropTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-[2.0] max-w-[65ch] mx-auto">
            {t.valuePropSubtitle}
          </p>
        </div>

        {/* 2-Column Problem vs Solution Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* The Problem / Market Gap */}
          <div className="rounded-3xl bg-slate-50 dark:bg-navy-900/90 border border-red-500/20 p-6 sm:p-9 space-y-6 shadow-xl relative overflow-hidden transition-colors text-start">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block font-mono">
                  Problem & Gap
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {t.challengeTitle}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-[2.0]">
              {t.challengeSub}
            </p>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-red-500 mt-2 shrink-0" />
                <span className="leading-[1.9]">{t.challengePoint1}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-red-500 mt-2 shrink-0" />
                <span className="leading-[1.9]">{t.challengePoint2}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-red-500 mt-2 shrink-0" />
                <span className="leading-[1.9]">{t.challengePoint3}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-red-500 mt-2 shrink-0" />
                <span className="leading-[1.9]">{t.challengePoint4}</span>
              </li>
            </ul>

            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/15 text-xs text-red-700 dark:text-red-300/90 font-medium leading-[1.8]">
              {t.challengeResult}
            </div>
          </div>

          {/* The Zein Hub Solution */}
          <div className="rounded-3xl bg-slate-50 dark:bg-navy-900/90 border border-gold-500/30 p-6 sm:p-9 space-y-6 shadow-xl relative overflow-hidden transition-colors text-start">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider block font-mono">
                  The Zein Hub Solution
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {t.solutionTitle}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-[2.0]">
              {t.solutionSub}
            </p>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-gold-500 shrink-0 mt-1" />
                <span className="leading-[1.9]">{t.solutionPoint1}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-gold-500 shrink-0 mt-1" />
                <span className="leading-[1.9]">{t.solutionPoint2}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-gold-500 shrink-0 mt-1" />
                <span className="leading-[1.9]">{t.solutionPoint3}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-gold-500 shrink-0 mt-1" />
                <span className="leading-[1.9]">{t.solutionPoint4}</span>
              </li>
            </ul>

            <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-xs text-gold-800 dark:text-gold-300 font-bold leading-[1.8]">
              {t.solutionResult}
            </div>
          </div>
        </div>

        {/* Supporting Regional Brand Slogan Banner (Item 7) */}
        <div className="mt-10 sm:mt-12 text-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-sm">
            
            <span>{t.regionalAnchorSlogan}</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
