"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Program } from "@/types/program";
import { Instructor } from "@/types/instructor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MediaPreview } from "@/components/ui/MediaPreview";
import { ProgramApplyModal } from "./ProgramApplyModal";
import { useLanguage } from "@/context/LanguageContext";
import {
  Clock,
  Video,
  Award,
  BookOpen,
  CheckCircle2,
  Share2,
  ArrowRight,
  ArrowLeft,
  Users,
  Film,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  PhoneCall,
  Check,
  Radio,
  AlertCircle,
  Play,
} from "lucide-react";

interface ProgramDetailClientProps {
  program: Program;
  instructor?: Instructor;
}

export function ProgramDetailClient({
  program,
  instructor,
}: ProgramDetailClientProps) {
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [expandedWeek, setExpandedWeek] = React.useState<number | null>(1);
  const { language, direction, t } = useLanguage();

  const isOpen = program.status === "open";

  const title = language === "en" && program.titleEn ? program.titleEn : program.title;
  const subtitle = language === "en" && program.subtitleEn ? program.subtitleEn : program.subtitle;
  const category = language === "en" && program.categoryEn ? program.categoryEn : program.category;
  const format = language === "en" && program.formatEn ? program.formatEn : program.format;
  const level = language === "en" && program.levelEn ? program.levelEn : program.level;
  const learningOutcomes = language === "en" && program.learningOutcomesEn ? program.learningOutcomesEn : program.learningOutcomes;
  const toolsAndGear = language === "en" && program.toolsAndGearEn ? program.toolsAndGearEn : program.toolsAndGear;
  const targetAudience = language === "en" && program.targetAudienceEn ? program.targetAudienceEn : program.targetAudience;
  const prerequisites = language === "en" && program.prerequisitesEn ? program.prerequisitesEn : program.prerequisites;

  const capstoneTitle = language === "en" && program.capstoneProject?.titleEn ? program.capstoneProject.titleEn : program.capstoneProject?.title;
  const capstoneDescription = language === "en" && program.capstoneProject?.descriptionEn ? program.capstoneProject.descriptionEn : program.capstoneProject?.description;
  const capstoneDeliverable = language === "en" && program.capstoneProject?.deliverableEn ? program.capstoneProject.deliverableEn : program.capstoneProject?.deliverable;

  const instructorName = instructor ? (language === "en" && instructor.nameEn ? instructor.nameEn : instructor.name) : "";
  const instructorTitle = instructor ? (language === "en" && instructor.titleEn ? instructor.titleEn : instructor.title) : "";
  const instructorBio = instructor ? (language === "en" && instructor.bioEn ? instructor.bioEn : instructor.bio) : "";

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="py-8 md:py-14 space-y-12">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-navy-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
            {t.navHome}
          </Link>
          <span>/</span>
          <Link href="/programs" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
            {t.navPrograms}
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200 font-medium truncate max-w-[200px] sm:max-w-none">
            {title}
          </span>
        </div>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 hover:border-gold-500/30 transition-all font-medium shadow-sm"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Share2 className="h-3.5 w-3.5" />}
          <span>{copied ? t.copiedLink : t.shareProgram}</span>
        </button>
      </div>

      {/* Program Hero Header (Text + Media Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left/Main Column: Title, Subtitle, Key Specs (7 cols) */}
        <div className="lg:col-span-7 space-y-6 text-start">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
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

              <Badge variant="gold" className="text-xs font-bold">
                {category}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.35]">
              {title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-[2.0] max-w-[65ch]">
              {subtitle}
            </p>
          </div>

          {/* Quick Specs Grid Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 shadow-md">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block flex items-center gap-1 font-mono">
                <Clock className="h-3.5 w-3.5 text-gold-500" />
                <span>{t.durationLabel}</span>
              </span>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                {program.durationWeeks} {t.weeksUnit} ({program.totalHours} {t.hoursUnit})
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block flex items-center gap-1 font-mono">
                <Video className="h-3.5 w-3.5 text-gold-500" />
                <span>{t.formatLabel}</span>
              </span>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate block">
                {format}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block flex items-center gap-1 font-mono">
                <Layers className="h-3.5 w-3.5 text-gold-500" />
                <span>{t.levelLabel}</span>
              </span>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate block">
                {level}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block flex items-center gap-1 font-mono">
                <Award className="h-3.5 w-3.5 text-gold-500" />
                <span>{t.certificateLabel}</span>
              </span>
              <span className="font-bold text-xs sm:text-sm text-gold-600 dark:text-gold-400 truncate block">
                {t.certificateVal}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Media Preview (5 cols) */}
        <div className="lg:col-span-5">
          <MediaPreview
            posterSrc={program.image}
            title={title}
            subtitle={language === "en" ? "Zein Hub Studio Masterclass" : "تدريب استوديو تطبيقي وعملي"}
            badgeText={isOpen ? t.statusOpen : t.statusComingSoon}
            aspectRatio="video"
            priority={true}
          />
        </div>
      </div>

      {/* Main Detail Grid Layout: Content (8 cols) + Sticky Action Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* Main Content Area (8 cols) */}
        <div className="lg:col-span-8 space-y-12 text-start">
          {/* 1. Learning Outcomes */}
          {learningOutcomes && learningOutcomes.length > 0 && (
            <div className="space-y-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 shadow-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {t.outcomesTitle}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {learningOutcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-850"
                  >
                    <CheckCircle2 className="h-4 w-4 text-gold-500 shrink-0 mt-1" />
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-[1.85] font-medium">
                      {outcome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Detailed Week-by-Week Curriculum Accordion */}
          {program.curriculum && program.curriculum.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-semibold">
                  <Layers className="h-3.5 w-3.5" />
                  <span>{t.curriculumTitle}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {t.curriculumTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {t.curriculumSubtitle}
                </p>
              </div>

              <div className="space-y-3.5">
                {program.curriculum.map((week) => {
                  const isExpanded = expandedWeek === week.weekNumber;
                  const weekTitle = language === "en" && week.titleEn ? week.titleEn : week.title;
                  const weekDesc = language === "en" && week.descriptionEn ? week.descriptionEn : week.description;
                  const weekTopics = language === "en" && week.topicsEn ? week.topicsEn : week.topics;
                  const weekProject = language === "en" && week.practicalProjectEn ? week.practicalProjectEn : week.practicalProject;

                  return (
                    <div
                      key={week.weekNumber}
                      className="rounded-2xl bg-white dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 overflow-hidden transition-all shadow-sm"
                    >
                      <button
                        onClick={() =>
                          setExpandedWeek(isExpanded ? null : week.weekNumber)
                        }
                        className="w-full p-5 text-start flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-navy-850 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400 font-mono font-bold text-xs shrink-0">
                            W{week.weekNumber}
                          </span>
                          <div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                              {t.weekLabel} 0{week.weekNumber}
                            </span>
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {weekTitle}
                            </h4>
                          </div>
                        </div>

                        <div className="text-gold-500 shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-6 pt-2 space-y-4 border-t border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 text-xs sm:text-sm">
                          <p className="text-slate-600 dark:text-slate-300 leading-[1.9]">
                            {weekDesc}
                          </p>

                          {weekTopics && weekTopics.length > 0 && (
                            <div className="space-y-2">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                                {language === "en" ? "Weekly Topics & Studio Applications:" : "محاور وتطبيقات هذا الأسبوع:"}
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {weekTopics.map((topic, tIdx) => (
                                  <div
                                    key={tIdx}
                                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500 shrink-0" />
                                    <span>{topic}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {weekProject && (
                            <div className="p-3.5 rounded-xl bg-gold-500/5 border border-gold-500/20 text-xs text-gold-900 dark:text-gold-300 flex items-start gap-2.5">
                              
                              <div>
                                <strong className="block text-slate-900 dark:text-white pb-0.5">
                                  {t.weeklyAssignment}
                                </strong>
                                <span className="leading-relaxed">{weekProject}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Capstone Project Showcase Box */}
          {program.capstoneProject && (
            <div className="rounded-3xl bg-white dark:bg-navy-900 border-2 border-gold-500/40 p-6 sm:p-8 space-y-4 shadow-xl text-slate-900 dark:text-white transition-colors duration-300">
              <div className="flex items-center gap-2 text-xs font-bold text-gold-600 dark:text-gold-400 font-mono">
                <Film className="h-4 w-4" />
                <span>{t.capstoneBadge}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {t.capstoneTitle}: {capstoneTitle}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-[1.9] max-w-[65ch]">
                {capstoneDescription}
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block font-mono">
                  {t.deliverableLabel}
                </span>
                <span className="font-bold text-gold-600 dark:text-gold-400 text-sm">
                  {capstoneDeliverable}
                </span>
              </div>
            </div>
          )}

          {/* 4. Instructor & Reel Video Section (Items 13, 14, 15, 16) */}
          <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 space-y-6 shadow-xl transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400">
                  <Award className="h-4 w-4" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {t.meetInstructor}
                </h3>
              </div>
              <span className="text-xs font-mono text-gold-600 dark:text-gold-400 font-bold">
                Faculty Spotlight
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Instructor Portrait & Bio (7 cols) */}
              <div className="md:col-span-7 flex flex-col sm:flex-row items-start gap-4">
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-gold-500/50 shrink-0 bg-navy-950">
                  <Image
                    src={instructor?.avatar || "/images/instructors/placeholder.svg"}
                    alt={instructorName || "Zein Hub Lead Instructor"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1.5 text-start">
                  <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {instructorName || (language === "en" ? "Voice-Over Lead Master" : "المشرف الأكاديمي لمسار الصوت")}
                  </h4>
                  <p className="text-xs sm:text-sm text-gold-600 dark:text-gold-400 font-medium">
                    {instructorTitle || (language === "en" ? "Senior Voice-Over & Vocalise Specialist" : "خبير التعليق الصوتي والفوكاليز الاستوديو")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-[1.8] line-clamp-3">
                    {instructorBio || (language === "en" ? "Decades of studio narration, commercial reads, and voice coaching across major satellite and regional networks." : "خبرة عملية في تسجيل الإعلانات الكبرى، الوثائقيات، وتدريب أجيال من المعلقين الصوتيين في مصر والوطن العربي.")}
                  </p>
                </div>
              </div>

              {/* Instructor Video Reel Preview (5 cols) */}
              <div className="md:col-span-5">
                <MediaPreview
                  posterSrc="/media/gallery/gallery-3.svg"
                  title={language === "en" ? "Instructor Voice Reel" : "ديمو ريل المحاضر الصوتي"}
                  subtitle={language === "en" ? "Watch studio recording demo" : "شاهد واستمع لنماذج الأداء الصوتي"}
                  badgeText="Reel Preview"
                  aspectRatio="video"
                />
              </div>
            </div>
          </div>

          {/* 5. Tools & Gear */}
          {toolsAndGear && toolsAndGear.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-gold-500" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {t.toolsTitle}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {toolsAndGear.map((tool: string, idx: number) => (
                  <div
                    key={idx}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium shadow-sm"
                  >
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Target Audience & Prerequisites */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {targetAudience && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3.5 shadow-sm">
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-gold-500" />
                  <span>{t.targetAudienceTitle}</span>
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {targetAudience.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {prerequisites && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3.5 shadow-sm">
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-4 w-4 text-gold-500" />
                  <span>{t.prerequisitesTitle}</span>
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {prerequisites.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Enrollment Card Sidebar (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4 text-start">
          <Card className="p-6 sm:p-7 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl shadow-2xl space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider block font-mono">
                {isOpen ? t.statusOpen : t.statusComingSoon}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {t.enrollmentBoxTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.enrollmentBoxSubtitle}
              </p>
            </div>

            {/* Quick Specs List */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-navy-800 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">{t.durationLabel}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{program.durationWeeks} {t.weeksUnit}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">{t.totalHoursLabel}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{program.totalHours} {t.hoursUnit}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">{t.weeklyHoursLabel}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{program.weeklyHours} {t.hoursPerWeek}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">{t.formatLabel}:</span>
                <span className="font-bold text-gold-600 dark:text-gold-400">{format}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">{t.certificateLabel}:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{t.certificateVal}</span>
              </div>
            </div>

            {/* Apply Button or Coming Soon Banner (Item 10 Business Rule) */}
            <div className="pt-2">
              {isOpen ? (
                <Button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-navy-950 font-black border border-gold-400 shadow-gold-glow py-4 text-base gap-2 hover:scale-[1.02] transition-all"
                  size="lg"
                >
                  <span>{t.applyNow}</span>
                  {direction === "rtl" ? (
                    <ArrowLeft className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <AlertCircle className="h-4 w-4 text-gold-500" />
                    <span>{t.enrollmentNotOpenTitle}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t.enrollmentNotOpenDesc}
                  </p>
                  <Link href="/programs" className="block w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-bold border-slate-300 dark:border-navy-700 hover:bg-gold-500 hover:text-navy-950 transition-colors"
                    >
                      <span>{t.backToPrograms}</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Direct Advisor Question Support */}
            <div className="pt-3 border-t border-slate-100 dark:border-navy-800 text-center space-y-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                {t.needAdvice}
              </span>
              <Link href="/contact" className="block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-bold text-gold-600 dark:text-gold-400 hover:bg-gold-500/10 gap-1.5"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>{t.talkToAdvisor}</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Trainee Registration Application Modal (Only for Open Program) */}
      {isOpen && (
        <ProgramApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          program={program}
        />
      )}
    </div>
  );
}
