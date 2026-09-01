"use client";

import Image from "next/image";
import { Instructor } from "@/types/instructor";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface InstructorCardProps {
  instructor: Instructor;
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  const { language, t } = useLanguage();

  const name = language === "en" && instructor.nameEn ? instructor.nameEn : instructor.name;
  const title = language === "en" && instructor.titleEn ? instructor.titleEn : instructor.title;
  const bio = language === "en" && instructor.bioEn ? instructor.bioEn : instructor.bio;
  
  const rawSpec: any = language === "en" && instructor.specializationEn ? instructor.specializationEn : instructor.specialization;
  const specializationsList: string[] = Array.isArray(rawSpec)
    ? rawSpec
    : typeof rawSpec === "string" && rawSpec.trim()
    ? (rawSpec as string).split(/[,،/•]+/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <Card className="text-center overflow-hidden bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-navy-800 hover:border-gold-500/50 hover:shadow-2xl transition-all duration-300 rounded-3xl group flex flex-col justify-between">
      <CardHeader className="pt-8 pb-3 items-center">
        {/* Prominent Professional Vector Portrait */}
        <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full overflow-hidden mb-4 border-2 border-gold-500/50 shadow-xl group-hover:scale-105 transition-transform duration-300 bg-navy-950 p-0.5">
          <Image
            src={instructor.avatar || "/images/instructors/tarek-el-zein.png"}
            alt={name || "Instructor"}
            fill
            className="object-cover"
          />
        </div>

        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-colors">
          {name}
        </h3>
        <p className="text-xs sm:text-sm text-gold-600 dark:text-gold-400 font-semibold mt-1">
          {title}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 pb-8 px-6 sm:px-7">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-[1.8] line-clamp-3">
          {bio}
        </p>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
          <Award className="h-3.5 w-3.5 text-gold-500" />
          <span>{t.experienceYearsBadge} {instructor.experienceYears || 10}+ {t.years}</span>
        </div>

        {/* Specialization Tags */}
        {specializationsList.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 pt-2">
            {specializationsList.map((spec, sIdx) => (
              <Badge
                key={sIdx}
                variant="default"
                className="bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800 text-[11px] px-2.5 py-0.5"
              >
                {spec}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
