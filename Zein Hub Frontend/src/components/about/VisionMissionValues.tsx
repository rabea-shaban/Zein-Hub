"use client";

import { Container } from "@/components/layout/Container";
import { getCoreValues } from "@/lib/content";
import { useLanguage } from "@/context/LanguageContext";
import { Target, Compass, ShieldCheck, Video, Users, Zap } from "lucide-react";

export function VisionMissionValues() {
  const values = getCoreValues();
  const { language, t } = useLanguage();

  const iconMap: Record<string, typeof ShieldCheck> = {
    ShieldCheck,
    Video,
    Users,
    Zap,
  };

  const visionText =
    language === "en"
      ? "To become the premier accredited training hub in Upper Egypt for nurturing broadcast and digital media leaders, building the most trusted bridge connecting Southern creative talents with regional and global newsrooms."
      : "أن نكون المركز الرائد والأول المعتمد في صعيد مصر لصناعة وتمكين الكفاءات الإعلامية وصنّاع المحتوى، وبناء الجسر الأكثر موثوقية الذي يربط المواهب الشابة في الجنوب بغرف الأخبار وشبكات الإنتاج الإقليمية والدولية.";

  const missionText =
    language === "en"
      ? "Delivering rigorous, hands-on masterclasses combining timeless journalistic integrity with cutting-edge digital production tools, under the direct mentorship of seasoned industry anchors, ensuring every trainee graduates with a verified portfolio ready for immediate employment."
      : "تقديم برامج تدريبية تطبيقية مكثفة تجمع بين الأصالة التحريرية وأحدث أدوات الإنتاج الرقمي، تحت إشراف نخبة من كبار الخبراء الممارسين، لتمكين كل متدرب من امتلاك أدواته الفنية وبناء محفظة أعمال (Portfolio) تؤهله فوراً لسوق العمل.";

  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 transition-colors duration-300">
      <Container className="space-y-16 sm:space-y-20">
        {/* Vision & Mission Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Vision */}
          <div className="rounded-3xl bg-white dark:bg-navy-900 border border-gold-500/30 p-7 sm:p-10 space-y-5 shadow-xl relative overflow-hidden text-start">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400">
                <Target className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-snug">{t.visionTitle}</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-[2.05]">
              {visionText}
            </p>
          </div>

          {/* Mission */}
          <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 p-7 sm:p-10 space-y-5 shadow-xl relative overflow-hidden text-start">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-gold-600 dark:text-gold-400">
                <Compass className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-snug">{t.missionTitle}</h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-[2.05]">
              {missionText}
            </p>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="space-y-10 sm:space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider font-mono">
              {language === "en" ? "GUIDING VALUES" : "المبادئ التوجيهية"}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug">
              {t.valuesHeading}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => {
              const Icon = iconMap[val.iconName] || ShieldCheck;
              const title = language === "en" && val.titleEn ? val.titleEn : val.title;
              const description = language === "en" && val.descriptionEn ? val.descriptionEn : val.description;

              return (
                <div
                  key={val.id}
                  className="rounded-3xl bg-white dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 p-6 sm:p-7 space-y-4 hover:border-gold-500/40 hover:shadow-xl transition-all flex flex-col justify-between text-start"
                >
                  <div className="space-y-3.5">
                    <div className="p-3 w-fit rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-gold-600 dark:text-gold-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{title}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-[1.85]">
                      {description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-navy-900 text-[11px] font-mono text-gold-600 dark:text-gold-500/60">
                    VALUE 0{idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
