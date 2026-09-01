"use client";

import { Container } from "@/components/layout/Container";
import { getWhyZeinHubItems } from "@/lib/content";
import { useLanguage } from "@/context/LanguageContext";
import {
  Video,
  Award,
  Users,
  Film,
  Zap,
  MapPin,
} from "lucide-react";

export function WhyZeinHub() {
  const features = getWhyZeinHubItems();
  const { language, t } = useLanguage();

  const iconMap: Record<string, typeof Video> = {
    Video,
    Users,
    Film,
    Zap,
    MapPin,
    Award,
  };

  return (
    <section className="py-12 sm:py-20 bg-slate-100 dark:bg-navy-900/60 border-b border-slate-200 dark:border-navy-800/80 relative transition-colors duration-300">
      <Container>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white dark:bg-navy-800 border border-slate-300 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-bold">
            
            <span>{t.whyBadge}</span>
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t.whyTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed">
            {t.whySubtitle}
          </p>
        </div>

        {/* 6 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, idx) => {
            const Icon = iconMap[feature.iconName] || Award;
            const title = language === "en" && feature.titleEn ? feature.titleEn : feature.title;
            const description = language === "en" && feature.descriptionEn ? feature.descriptionEn : feature.description;

            return (
              <div
                key={feature.id}
                className="group relative rounded-2xl bg-white dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 p-5 sm:p-7 hover:border-gold-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-start"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-gold-600 dark:text-gold-400 group-hover:bg-gold-500 group-hover:text-navy-950 group-hover:border-gold-400 transition-all duration-300 shadow-md">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {description}
                  </p>
                </div>

                <div className="pt-4 mt-3 sm:pt-5 sm:mt-4 border-t border-slate-100 dark:border-navy-900 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>{language === "en" ? "Professional Standard" : "معيار احترافي"}</span>
                  <span className="text-gold-600 dark:text-gold-500/70 font-mono">0{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
