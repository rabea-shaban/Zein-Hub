"use client";

import { Container } from "@/components/layout/Container";
import { getTrainingStages } from "@/lib/content";
import { useLanguage } from "@/context/LanguageContext";
import {
  FileText,
  Video,
  Layers,
  Award,
  ArrowDownLeft,
  ArrowDownRight,
} from "lucide-react";

export function TrainingExperience() {
  const steps = getTrainingStages();
  const { language, direction, t } = useLanguage();

  const iconMap: Record<string, typeof FileText> = {
    FileText,
    Video,
    Layers,
    Award,
  };

  return (
    <section className="py-12 sm:py-20 bg-slate-50 dark:bg-navy-900/40 border-b border-slate-200 dark:border-navy-800/80 relative transition-colors duration-300">
      <Container>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-bold">
            
            <span>{t.journeyBadge}</span>
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t.journeyTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed">
            {t.journeySubtitle}
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = iconMap[item.iconName] || FileText;
            const title = language === "en" && item.titleEn ? item.titleEn : item.title;
            const description = language === "en" && item.descriptionEn ? item.descriptionEn : item.description;
            const tag = language === "en" && item.tagEn ? item.tagEn : item.tag;

            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-white dark:bg-navy-950/90 border border-slate-200 dark:border-navy-800 p-5 sm:p-6 flex flex-col justify-between hover:border-gold-500/50 hover:shadow-xl transition-all duration-300 group text-start"
              >
                {/* Step Top */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-gold-600/40 dark:text-gold-500/30 group-hover:text-gold-500 transition-colors">
                      {item.step}
                    </span>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-gold-600 dark:text-gold-400 group-hover:bg-gold-500 group-hover:text-navy-950 transition-all">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-900 text-gold-700 dark:text-gold-400/90 border border-slate-200 dark:border-navy-800 inline-block">
                    {tag}
                  </span>

                  <h3 className="font-bold text-sm sm:text-lg text-slate-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-colors">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Step Bottom Indicator */}
                <div className="pt-3 mt-4 sm:pt-4 sm:mt-6 border-t border-slate-100 dark:border-navy-900 flex items-center justify-between text-xs text-slate-500">
                  <span>{t.stagePrefix} {idx + 1} {t.stageOf} 4</span>
                  {direction === "rtl" ? (
                    <ArrowDownLeft className="h-4 w-4 text-gold-500/70" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-gold-500/70" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
