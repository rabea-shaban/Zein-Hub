"use client";

import { Container } from "@/components/layout/Container";
import { MediaPreview } from "@/components/ui/MediaPreview";
import { TARGET_REGIONS } from "@/lib/constants";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin, Building, ShieldCheck } from "lucide-react";

export function AboutHero() {
  const { language, t } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10 space-y-14">
        {/* Top Header */}
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-bold shadow-sm">
            
            <span>{t.aboutHeroBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.35]">
            {t.aboutHeroTitle}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-[1.9] max-w-[68ch] mx-auto">
            {t.aboutHeroDesc}
          </p>
        </div>

        {/* Visual Storytelling Media Showcase Banner (Item 18) */}
        <div className="max-w-4xl mx-auto">
          <MediaPreview
            posterSrc="/media/hero/studio-hero.svg"
            title={language === "en" ? "Zein Hub — The First Professional Media Training Hub in Upper Egypt" : "منصة Zein Hub — أول بيئة تدريب إعلامي احترافي في صعيد مصر"}
            subtitle={language === "en" ? "State-of-the-art newsroom equipment, studio cameras, and audio suites" : "تجهيزات غرف الأخبار، كاميرات البث 4K، ومعامل الصوت العازلة"}
            badgeText={language === "en" ? "Our Studio Vision" : "بيئة التدريب"}
            aspectRatio="wide"
          />
        </div>

        {/* 3 Pillars of Founding Story */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-start">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-gold-600 dark:text-gold-400">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {language === "en" ? "Decentralizing Media Education" : "كسر المركزية الإعلامية"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-[1.8]">
              {language === "en"
                ? "Bringing international newsroom standards and studio infrastructure directly to Upper Egypt without requiring relocation."
                : "نقل المعايير والخبرات المتراكمة لكبرى القنوات وغرف الأخبار مباشرة إلى مدن ومحافظات الصعيد دون الحاجة للاغتراب."}
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-gold-600 dark:text-gold-400">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {language === "en" ? "Authentic Regional Storytelling" : "أصالة السرد المحلي"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-[1.8]">
              {language === "en"
                ? "Empowering youth in the South to document their own heritage and human stories with broadcast-quality visuals and sound."
                : "تمكين شباب الجنوب من سرد وتوثيق قضاياهم وثقافتهم وتراثهم الإنساني بأصواتهم الخاصة وبأعلى جودة بصرية وصوتية."}
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-gold-600 dark:text-gold-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {language === "en" ? "Rigorous Broadcast Standards" : "معايير مهنية صارمة"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-[1.8]">
              {language === "en"
                ? "Training according to international journalistic codes of ethics using the same toolkits and software adopted globally."
                : "التدريب وفق ميثاق الشرف الصحفي الدولي مع استخدام نفس الأدوات والبرمجيات المعتمدة في منصات البث العالمية."}
            </p>
          </div>
        </div>

        {/* Target Regions Chips */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-start">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
            <MapPin className="h-4 w-4 text-gold-500" />
            <span>{t.scopeLabel}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {TARGET_REGIONS.map((region) => (
              <span
                key={region.id}
                className="text-xs bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl font-medium"
              >
                {language === "en" ? region.nameEn : region.nameAr}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
