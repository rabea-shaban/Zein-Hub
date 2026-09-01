"use client";

import * as React from "react";
import { Program } from "@/types/program";
import { ProgramCard } from "./ProgramCard";
import { Input } from "@/components/ui/input";
import { PROGRAM_TRACKS } from "@/data/tracks";
import { useLanguage } from "@/context/LanguageContext";
import { Search, Filter, BookOpen, Layers, Mic, Cpu, TrendingUp, Radio } from "lucide-react";

interface ProgramsCatalogProps {
  programs: Program[];
}

export function ProgramsCatalog({ programs }: ProgramsCatalogProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTrack, setSelectedTrack] = React.useState<string>("all");
  const { language, t } = useLanguage();

  const iconMap: Record<string, typeof Mic> = {
    Mic,
    Cpu,
    TrendingUp,
  };

  // Priority sorting: 'open' status first, then featured, then coming-soon / closed
  const sortPrograms = React.useCallback((list: Program[]) => {
    return [...list].sort((a, b) => {
      const statusWeight = (s: string) => (s === "open" ? 0 : s === "coming-soon" ? 1 : 2);
      const weightA = statusWeight(a.status);
      const weightB = statusWeight(b.status);
      if (weightA !== weightB) return weightA - weightB;

      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, []);

  // 4 Tabs: All + 3 Tracks with dynamic accurate counts
  const trackTabs = React.useMemo(() => {
    return [
      {
        id: "all",
        label:
          language === "en"
            ? `All Tracks (${programs.length})`
            : `جميع المسارات (${programs.length})`,
      },
      ...PROGRAM_TRACKS.map((trk) => {
        const count = programs.filter((p) => p.trackId === trk.id).length;
        const trackTitle = language === "en" ? trk.titleEn : trk.title;
        return {
          id: trk.id,
          label: `${trackTitle} (${count})`,
        };
      }),
    ];
  }, [language, programs]);

  // Filtered & Priority-Sorted Programs
  const filteredPrograms = React.useMemo(() => {
    const matched = programs.filter((p) => {
      const title = language === "en" && p.titleEn ? p.titleEn : p.title;
      const subtitle = language === "en" && p.subtitleEn ? p.subtitleEn : p.subtitle;
      const desc = language === "en" && p.descriptionEn ? p.descriptionEn : p.description;

      const matchesSearch =
        searchQuery.trim() === "" ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTrack =
        selectedTrack === "all" || p.trackId === selectedTrack;

      return matchesSearch && matchesTrack;
    });

    return sortPrograms(matched);
  }, [programs, searchQuery, selectedTrack, language, sortPrograms]);

  return (
    <div className="space-y-12">
      {/* Search & Track Navigation Tabs */}
      <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-8 shadow-xl space-y-6 transition-colors duration-300">
        {/* Search Input Field */}
        <div className="relative">
          <Search className="absolute right-4 rtl:right-4 ltr:left-4 ltr:right-auto top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === "en"
                ? "Search programs by title or keyword..."
                : "ابحث في البرامج بالاسم أو الكلمة المفتاحية..."
            }
            className="w-full h-13 pr-12 rtl:pr-12 ltr:pl-12 ltr:pr-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-sm sm:text-base transition-colors"
          />
        </div>

        {/* 3 Main Tracks Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-navy-850">
          {trackTabs.map((tab) => {
            const isSelected = selectedTrack === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTrack(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                  isSelected
                    ? "bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20 scale-[1.02]"
                    : "bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300 hover:border-gold-500/40 hover:text-gold-600 dark:hover:text-gold-400"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Rendered by Track Sections */}
      {selectedTrack === "all" && !searchQuery.trim() ? (
        /* Render 3 Track Groups with Structured Headers */
        <div className="space-y-16">
          {PROGRAM_TRACKS.map((track, trackIdx) => {
            const trackPrograms = sortPrograms(
              programs.filter((p) => p.trackId === track.id)
            );
            const Icon = iconMap[track.iconName] || Mic;
            const trackTitle = language === "en" ? track.titleEn : track.title;
            const trackDesc = language === "en" ? track.descriptionEn : track.description;

            return (
              <div key={track.id} className="space-y-6">
                {/* Track Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-navy-800 text-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400 shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-gold-600 dark:text-gold-400">
                          TRACK 0{trackIdx + 1}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                          {trackTitle}
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                        {trackDesc}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300 w-fit">
                    {trackPrograms.length}{" "}
                    {language === "en"
                      ? trackPrograms.length === 1
                        ? "Program"
                        : "Programs"
                      : trackPrograms.length === 1
                      ? "برنامج"
                      : trackPrograms.length === 2
                      ? "برنامجان"
                      : trackPrograms.length <= 10
                      ? "برامج"
                      : "برنامجاً"}
                  </span>
                </div>

                {/* 4 Program Cards in Grid (Open programs first) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                  {trackPrograms.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Filtered/Search Results Flat Grid */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 px-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gold-500" />
              <span>
                {language === "en" ? "Matching Programs:" : "البرامج المطابقة:"}{" "}
                <strong className="text-slate-900 dark:text-white font-mono">
                  {filteredPrograms.length}
                </strong>
              </span>
            </div>

            {(searchQuery || selectedTrack !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTrack("all");
                }}
                className="text-xs text-gold-600 dark:text-gold-400 hover:underline font-bold"
              >
                {language === "en" ? "Reset Filters" : "إعادة تعيين الفلاتر"}
              </button>
            )}
          </div>

          {filteredPrograms.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 p-8 space-y-3">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {language === "en"
                  ? "No training programs match your search criteria."
                  : "لا توجد برامج تدريبية مطابقة لمعايير البحث الحالية."}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTrack("all");
                }}
                className="text-xs text-gold-600 dark:text-gold-400 font-bold hover:underline"
              >
                {language === "en" ? "View all programs" : "عرض كافة البرامج"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
