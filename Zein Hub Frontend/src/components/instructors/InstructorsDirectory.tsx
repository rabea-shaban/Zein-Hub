"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Instructor } from "@/types/instructor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import {
  Award,
  BookOpen,
  Quote,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface InstructorsDirectoryProps {
  instructors: Instructor[];
}

export function InstructorsDirectory({
  instructors,
}: InstructorsDirectoryProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [activeModalInstructor, setActiveModalInstructor] =
    React.useState<Instructor | null>(null);
  const { language, direction, t } = useLanguage();

  const filterCategories = [
    { label: t.allTracks, value: "all" },
    { label: language === "en" ? "Investigative Journalism" : "صحافة استقصائية", value: "صحافة استقصائية" },
    { label: language === "en" ? "Mobile Journalism (MoJo)" : "صحافة الموبايل (MoJo)", value: "صحافة الموبايل" },
    { label: language === "en" ? "TV Anchoring" : "تقديم وإلقاء تلفزيوني", value: "تقديم تلفزيوني" },
    { label: language === "en" ? "Podcasting & Audio" : "إنتاج بودكاست وهندسة صوت", value: "بودكاست" },
  ];

  const filteredInstructors = React.useMemo(() => {
    if (selectedCategory === "all") return instructors;
    return instructors.filter((inst) =>
      inst.specialization.some((spec) =>
        spec.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    );
  }, [instructors, selectedCategory]);

  return (
    <div className="space-y-12">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
        {filterCategories.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? "bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20"
                  : "bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:border-gold-500/40 hover:text-gold-600 dark:hover:text-gold-400"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Instructors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredInstructors.map((instructor) => {
          const name = language === "en" && instructor.nameEn ? instructor.nameEn : instructor.name;
          const title = language === "en" && instructor.titleEn ? instructor.titleEn : instructor.title;
          const bio = language === "en" && instructor.bioEn ? instructor.bioEn : instructor.bio;
          const roleType = language === "en" && instructor.roleTypeEn ? instructor.roleTypeEn : (instructor.roleType || "مدرب رئيسي");
          const philosophyQuote = language === "en" && instructor.philosophyQuoteEn ? instructor.philosophyQuoteEn : instructor.philosophyQuote;
          const affiliations = language === "en" && instructor.formerAffiliationsEn ? instructor.formerAffiliationsEn : instructor.formerAffiliations;
          const coursesCount = instructor.coursesTaught?.length || 1;

          return (
            <Card
              key={instructor.id}
              className="text-center overflow-hidden bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-navy-800 hover:border-gold-500/50 hover:shadow-2xl transition-all duration-300 rounded-3xl group flex flex-col justify-between"
            >
              <div className="pt-8 pb-3 px-6 items-center space-y-4">
                {/* Avatar with Role Badge */}
                <div className="relative mx-auto h-32 w-32 rounded-full overflow-hidden border-2 border-gold-500/40 shadow-xl group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={instructor.avatar}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <Badge
                    variant="gold"
                    className="text-[11px] font-bold mx-auto mb-1"
                  >
                    {roleType}
                  </Badge>
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-colors">
                    {name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gold-600 dark:text-gold-400 font-semibold">
                    {title}
                  </p>
                </div>

                {/* Former Networks & Affiliations */}
                {affiliations && (
                  <div className="flex flex-wrap justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>{language === "en" ? "Formerly with:" : "سابقاً في:"}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {affiliations.join(" • ")}
                    </span>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 pt-1">
                  {bio}
                </p>

                {/* Philosophy Quote */}
                {philosophyQuote && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-850 text-start text-xs text-slate-600 dark:text-slate-300 italic flex items-start gap-2">
                    <Quote className="h-3.5 w-3.5 text-gold-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      &ldquo;{philosophyQuote}&rdquo;
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="p-6 pt-3 space-y-3 border-t border-slate-100 dark:border-navy-850">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-gold-500" />
                    <span>+{instructor.experienceYears} {t.years}</span>
                  </span>
                  <span className="font-mono text-gold-600 dark:text-gold-400 font-bold">
                    {coursesCount} {t.navPrograms}
                  </span>
                </div>

                <Button
                  onClick={() => setActiveModalInstructor(instructor)}
                  variant="outline"
                  className="w-full border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200 hover:bg-gold-500 hover:text-navy-950 hover:border-gold-400 font-bold text-xs"
                >
                  <span>{t.fullBiography}</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Interactive Full Profile Modal */}
      {activeModalInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-navy-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/30 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-start text-slate-900 dark:text-white space-y-6">
            {/* Close Button */}
            <button
              onClick={() => setActiveModalInstructor(null)}
              className="absolute top-5 left-5 rtl:left-5 ltr:right-5 ltr:left-auto p-2 rounded-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-2">
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-gold-500/50 shadow-xl shrink-0">
                <Image
                  src={activeModalInstructor.avatar}
                  alt={language === "en" && activeModalInstructor.nameEn ? activeModalInstructor.nameEn : activeModalInstructor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 text-center sm:text-start">
                <Badge variant="gold" className="text-xs font-bold mb-1">
                  {language === "en" && activeModalInstructor.roleTypeEn ? activeModalInstructor.roleTypeEn : (activeModalInstructor.roleType || "Lead Mentor")}
                </Badge>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {language === "en" && activeModalInstructor.nameEn ? activeModalInstructor.nameEn : activeModalInstructor.name}
                </h3>
                <p className="text-sm font-semibold text-gold-600 dark:text-gold-400">
                  {language === "en" && activeModalInstructor.titleEn ? activeModalInstructor.titleEn : activeModalInstructor.title}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <Award className="h-4 w-4 text-gold-500" />
                  <span>{t.experienceYearsBadge} {activeModalInstructor.experienceYears}+ {t.years}</span>
                </div>
              </div>
            </div>

            {/* Full Bio */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {language === "en" ? "Biography & Professional Background" : "السيرة الذاتية والخبرات"}
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {language === "en" && activeModalInstructor.bioEn ? activeModalInstructor.bioEn : activeModalInstructor.bio}
              </p>
            </div>

            {/* Philosophy Quote Box */}
            {(activeModalInstructor.philosophyQuote || activeModalInstructor.philosophyQuoteEn) && (
              <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-xs sm:text-sm text-gold-900 dark:text-gold-300 leading-relaxed italic flex items-start gap-2.5">
                <Quote className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
                <span>
                  &ldquo;{language === "en" && activeModalInstructor.philosophyQuoteEn ? activeModalInstructor.philosophyQuoteEn : activeModalInstructor.philosophyQuote}&rdquo;
                </span>
              </div>
            )}

            {/* Achievements List */}
            {activeModalInstructor.achievements && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t.achievementsHeading}
                </span>
                <div className="space-y-2">
                  {(language === "en" && activeModalInstructor.achievementsEn ? activeModalInstructor.achievementsEn : activeModalInstructor.achievements).map((ach: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4 text-gold-500 shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses Taught */}
            {activeModalInstructor.coursesTaught && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {t.supervisedCourses}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(language === "en" && activeModalInstructor.coursesTaughtEn ? activeModalInstructor.coursesTaughtEn : activeModalInstructor.coursesTaught).map((course: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-medium text-slate-800 dark:text-slate-200"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-gold-500" />
                      <span>{course}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex justify-end gap-3">
              <Button
                onClick={() => setActiveModalInstructor(null)}
                variant="outline"
                className="border-slate-300 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 font-bold"
              >
                {language === "en" ? "Close" : "إغلاق"}
              </Button>

              <Link href="/programs">
                <Button className="bg-gold-500 hover:bg-gold-600 text-navy-950 font-black gap-2">
                  <span>{t.exploreProgramsCTA}</span>
                  {direction === "rtl" ? (
                    <ArrowLeft className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
