"use client";

import { Container } from "@/components/layout/Container";
import { MediaPreview } from "@/components/ui/MediaPreview";
import { useLanguage } from "@/context/LanguageContext";
import { Video, Film, Radio, CheckCircle2 } from "lucide-react";

export function TrainingShowcase() {
  const { language, t } = useLanguage();

  const galleryItems = [
    {
      id: 1,
      posterSrc: "/media/gallery/gallery-1.svg",
      title: language === "en" ? "Live TV Studio & News Rehearsal" : "استوديو الإلقاء والتحاور التلفزيوني الحي",
      subtitle: language === "en" ? "Multi-camera broadcast switching & teleprompter training" : "محاكاة غرف الأخبار، الأوتوكيو، والربط الإخباري الميداني",
      badgeText: language === "en" ? "TV Studio" : "استوديو الأخبار",
    },
    {
      id: 2,
      posterSrc: "/media/gallery/gallery-2.svg",
      title: language === "en" ? "Mobile Journalism (MoJo) Field Production" : "صحافة الموبايل والسرد البصري الميداني",
      subtitle: language === "en" ? "Smartphone 4K cinematic rigs & on-location audio" : "تصوير ميداني باحترافية، مثبتات حركة، وهندسة صوتية بالهاتف",
      badgeText: language === "en" ? "MoJo Field" : "تصوير ميداني",
    },
    {
      id: 3,
      posterSrc: "/media/gallery/gallery-3.svg",
      title: language === "en" ? "Podcast Suite & Sound Mastering" : "استوديو تسجيل وهندسة البودكاست",
      subtitle: language === "en" ? "Acoustic booths, broadcast mics & DAW sound design" : "عزل صوتي، ميكروفونات بث، ومعالجة ترددات احترافية",
      badgeText: language === "en" ? "Audio Suite" : "هندسة صوت",
    },
    {
      id: 4,
      posterSrc: "/media/gallery/gallery-4.svg",
      title: language === "en" ? "Investigative Film & Capstone Jury" : "مناقشة مشاريع التخرج والتحقيقات",
      subtitle: language === "en" ? "Documentary screening before leading editors" : "مناقشة التحقيقات المصورة أمام لجان تحكيم إقليمية",
      badgeText: language === "en" ? "Capstone Jury" : "لجنة تحكيم",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-navy-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800/80 relative transition-colors duration-300">
      <Container>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-bold shadow-sm">
            <Film className="h-3.5 w-3.5 text-gold-500" />
            <span>{language === "en" ? "Training Environment" : "من أجواء التدريب"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            {language === "en" ? "Inside Zein Hub Studio & Media Hubs" : "بيئة استوديوهات ومعامل Zein Hub التدريبية"}
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {language === "en"
              ? "A complete real-world media simulation equipped with broadcasting suites, cinematic camera rigs, and high-fidelity sound mixing."
              : "تدريب عملي 100% داخل استوديوهات مجهزة بأحدث أدوات التصوير 4K، وحدات الصوت العازلة، وغرف المونتاج الميداني."}
          </p>
        </div>

        {/* 4-Item Media Showcase Grid (60% Visual, 40% Text Balance) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {galleryItems.map((item) => (
            <div key={item.id} className="space-y-3">
              <MediaPreview
                posterSrc={item.posterSrc}
                title={item.title}
                subtitle={item.subtitle}
                badgeText={item.badgeText}
                aspectRatio="video"
              />
              <div className="p-4 rounded-2xl bg-white dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-gold-500 shrink-0" />
                  <span>{item.title}</span>
                </div>
                <span className="text-[11px] font-mono text-gold-600 dark:text-gold-400 font-bold">
                  {item.badgeText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
