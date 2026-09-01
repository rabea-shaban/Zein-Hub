"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { getPrograms } from "@/lib/content";
import { PROGRAM_TRACKS } from "@/data/tracks";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Program } from "@/types/program";
import { api } from "@/lib/api";
import { mapBackendProgramToFrontend } from "@/components/programs/ProgramsPageClient";
import {
  ArrowLeft,
  ArrowRight,
  Radio,
  Clock,
  Video,
  Award,
  Mic,
  Cpu,
  TrendingUp,
  Coins,
} from "lucide-react";

export function FeaturedPrograms() {
  const initialPrograms = getPrograms();
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const { direction, language, t } = useLanguage();
  const isAr = language === "ar";

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await api.get<any[]>("/programs", { params: { limit: 50 } });
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((item: any) =>
            mapBackendProgramToFrontend(item, initialPrograms)
          );
          setPrograms(mapped);
        }
      } catch (e) {
        // Fallback gracefully
      }
    }
    loadPrograms();
  }, []);

  const openProgram = programs.find((p) => p.status === "open") || programs[0];
  const upcomingPrograms = programs
    .filter((p) => p.id !== openProgram?.id)
    .slice(0, 3);

  const iconMap: Record<string, typeof Mic> = {
    Mic,
    Cpu,
    TrendingUp,
  };

  const openTitle =
    language === "en" && openProgram?.titleEn
      ? openProgram.titleEn
      : openProgram?.title;
  const openSubtitle =
    language === "en" && openProgram?.subtitleEn
      ? openProgram.subtitleEn
      : openProgram?.subtitle;
  const openCategory =
    language === "en" && openProgram?.categoryEn
      ? openProgram.categoryEn
      : openProgram?.category;
  const openFormat =
    language === "en" && openProgram?.formatEn
      ? openProgram.formatEn
      : openProgram?.format;

  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800/80 relative transition-colors duration-300">
      <Container className="space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-bold shadow-sm">
            
            <span>{t.featuredProgramsBadge}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.5]">
            {t.featuredProgramsTitle}
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-[2.0] max-w-[65ch] mx-auto">
            {t.featuredProgramsSubtitle}
          </p>
        </div>

        {/* 3 Main Tracks Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROGRAM_TRACKS.map((track, idx) => {
            const Icon = iconMap[track.iconName] || Mic;
            const trackTitle = language === "en" ? track.titleEn : track.title;
            const trackDesc =
              language === "en" ? track.descriptionEn : track.description;

            return (
              <div
                key={track.id}
                className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 hover:border-gold-500/40 shadow-sm space-y-3.5 text-start transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 w-fit rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-gold-600 dark:text-gold-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-gold-600 dark:text-gold-400">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {trackTitle}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-[1.85]">
                  {trackDesc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Prominently Featured OPEN Program */}
        {openProgram && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider font-mono">
              <Radio className="h-4 w-4 animate-pulse text-red-500" />
              <span>{t.openEnrollmentHeadline}</span>
            </div>

            <div className="bg-white dark:bg-navy-900/90 rounded-3xl border border-gold-500/30 overflow-hidden shadow-xl p-6 sm:p-8 lg:p-10 relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Image & Media Area */}
                <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] bg-navy-950 border border-slate-200 dark:border-navy-800">
                  <Image
                    src={openProgram.image}
                    alt={openTitle || "Program"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 start-4 end-4 flex items-center justify-between text-white text-xs font-mono">
                    <span className="px-2.5 py-1 rounded bg-red-600/90 font-bold">
                      {isAr ? "متاح للتسجيل الآن" : "OPEN FOR ENROLLMENT"}
                    </span>
                    <span className="font-bold">
                      {openProgram.durationWeeks} {isAr ? "أسابيع" : "Weeks"}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-7 space-y-6 text-start">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-500/10 text-gold-700 dark:text-gold-400 border border-gold-500/20">
                        {openCategory}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        • {openFormat}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                      {openTitle}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-2xl">
                      {openSubtitle}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-navy-800 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Clock className="h-4 w-4 text-gold-500 shrink-0" />
                      <span>
                        {openProgram.durationWeeks} {isAr ? "أسابيع" : "Weeks"} ({openProgram.totalHours} {isAr ? "ساعة" : "hrs"})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Video className="h-4 w-4 text-gold-500 shrink-0" />
                      <span>
                        {isAr ? "استوديوهات حقيقية" : "Live Studio Hours"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Coins className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        3,500 {isAr ? "ج.م" : "EGP"}
                      </span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link href={`/programs/${openProgram.slug}/apply`}>
                      <Button
                        size="lg"
                        className="bg-gold-500 hover:bg-gold-600 text-navy-950 font-black px-7 py-3 shadow-gold-glow text-sm gap-2"
                      >
                        <span>{t.applyNow}</span>
                        {direction === "rtl" ? (
                          <ArrowLeft className="h-4 w-4" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </Link>

                    <Link href={`/programs/${openProgram.slug}`}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-slate-300 dark:border-navy-700 bg-transparent text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-850 text-sm font-bold"
                      >
                        {t.viewDetails}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3 Upcoming/Other Programs Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {isAr ? "باقي البرامج التدريبية المعتمدة" : "Other Accredited Programs"}
            </h3>
            <Link
              href="/programs"
              className="text-xs sm:text-sm font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1"
            >
              <span>{t.exploreProgramsCTA}</span>
              {direction === "rtl" ? (
                <ArrowLeft className="h-3.5 w-3.5" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
