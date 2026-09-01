"use client";

import { Container } from "@/components/layout/Container";
import { getPhilosophyPillars } from "@/lib/content";
import { useLanguage } from "@/context/LanguageContext";
import { CheckCircle } from "lucide-react";

export function TrainingPhilosophy() {
  const pillars = getPhilosophyPillars();
  const { language, t } = useLanguage();

  return (
    <section className="py-20 bg-slate-100 dark:bg-navy-900/60 border-b border-slate-200 dark:border-navy-800 relative transition-colors duration-300">
      <Container>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-bold">
            
            <span>{language === "en" ? "OUR PEDAGOGY" : "فلسفتنا ومنهجنا"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            {t.philosophyTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.philosophySubtitle}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((item) => {
            const label = language === "en" && item.labelEn ? item.labelEn : item.label;
            const title = language === "en" && item.titleEn ? item.titleEn : item.title;
            const description = language === "en" && item.descriptionEn ? item.descriptionEn : item.description;

            return (
              <div
                key={item.id}
                className="rounded-3xl bg-white dark:bg-navy-950/90 border border-slate-200 dark:border-navy-800 p-8 space-y-4 hover:border-gold-500/40 hover:shadow-xl transition-all flex flex-col justify-between text-start"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gold-700 dark:text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
                      {label}
                    </span>
                    <span className="font-mono text-xl font-black text-slate-400 dark:text-slate-500">
                      {item.num}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pt-1">
                    {title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-navy-900 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle className="h-4 w-4 text-gold-500 shrink-0" />
                  <span>{language === "en" ? "Standard across all our tracks" : "معيار أساسي في كافة برامجنا"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
