"use client";

import Link from "next/link";
import Image from "next/image";
import { Program } from "@/types/program";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Clock, ArrowLeft, ArrowRight, Video, Radio } from "lucide-react";

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const { language, direction, t } = useLanguage();

  const title = language === "en" && program.titleEn ? program.titleEn : program.title;
  const subtitle = language === "en" && program.subtitleEn ? program.subtitleEn : program.subtitle;
  const category = language === "en" && program.categoryEn ? program.categoryEn : program.category;
  const format = language === "en" && program.formatEn ? program.formatEn : program.format;
  const learningOutcomes = language === "en" && program.learningOutcomesEn ? program.learningOutcomesEn : program.learningOutcomes;

  const isOpen = program.status === "open";

  return (
    <Card
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white dark:bg-navy-900/90 transition-all duration-300 ${
        isOpen
          ? "border-2 border-gold-500 shadow-xl hover:shadow-gold-glow/40 hover:scale-[1.01]"
          : "border border-slate-200 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700 hover:shadow-lg"
      }`}
    >
      <div>
        {/* Cover Image Container */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-navy-950">
          <Image
            src={program.image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent" />

          {/* Status Badges on Top */}
          <div className="absolute top-3.5 right-3.5 rtl:right-3.5 ltr:left-3.5 ltr:right-auto flex flex-wrap gap-1.5 z-10">
            {isOpen ? (
              <Badge className="bg-gold-500 text-navy-950 font-black text-xs border-none px-3 py-1 shadow-gold-glow flex items-center gap-1.5">
                <Radio className="h-3 w-3 animate-pulse text-red-600" />
                <span>{t.statusOpen}</span>
              </Badge>
            ) : (
              <Badge className="bg-navy-950/80 backdrop-blur-md text-slate-300 border border-slate-700 text-xs font-semibold px-2.5 py-0.5">
                {t.statusComingSoon}
              </Badge>
            )}

            <Badge variant="gold" className="text-xs font-bold shadow-md">
              {category}
            </Badge>
          </div>

          {/* Quick Specs Bar at Bottom of Image */}
          <div className="absolute bottom-3 right-3.5 left-3.5 flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="h-3.5 w-3.5 text-gold-400" />
              {program.durationWeeks} {t.weeksUnit} ({program.totalHours} {t.hoursUnit})
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Video className="h-3.5 w-3.5 text-gold-400" />
              {format}
            </span>
          </div>
        </div>

        {/* Content Body with clear visual rhythm */}
        <div className="p-6 sm:p-7 space-y-4 text-start">
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-colors line-clamp-1 leading-snug">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-[1.9]">
              {subtitle}
            </p>
          </div>

          {/* Quick Learning Outcomes Preview */}
          {learningOutcomes && learningOutcomes.length > 0 && (
            <div className="pt-3 space-y-2 border-t border-slate-100 dark:border-navy-850">
              {learningOutcomes.slice(0, 2).map((outcome, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 line-clamp-1"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mt-1.5 shrink-0" />
                  <span className="leading-normal">{outcome}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Action */}
      <div className="p-6 sm:p-7 pt-0">
        <Link href={`/programs/${program.slug}`} className="block w-full">
          {isOpen ? (
            <Button
              className="w-full justify-between bg-gold-500 hover:bg-gold-600 text-navy-950 font-black border border-gold-400 shadow-gold-glow transition-all text-xs sm:text-sm py-3.5"
            >
              <span>{t.applyNowShort}</span>
              {direction === "rtl" ? (
                <ArrowLeft className="h-4 w-4 text-navy-950" />
              ) : (
                <ArrowRight className="h-4 w-4 text-navy-950" />
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-between border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 font-bold transition-all text-xs sm:text-sm py-3.5"
            >
              <span>{t.learnMore}</span>
              {direction === "rtl" ? (
                <ArrowLeft className="h-4 w-4 text-slate-500" />
              ) : (
                <ArrowRight className="h-4 w-4 text-slate-500" />
              )}
            </Button>
          )}
        </Link>
      </div>
    </Card>
  );
}
