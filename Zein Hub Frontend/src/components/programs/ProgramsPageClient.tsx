"use client";

import React, { useState, useEffect } from "react";
import { Program } from "@/types/program";
import { Container } from "@/components/layout/Container";
import { ProgramsCatalog } from "./ProgramsCatalog";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import {} from "lucide-react";
import { mapBackendProgramToFrontend, normalizeTrackId } from "@/lib/programMapper";

export { mapBackendProgramToFrontend, normalizeTrackId };

interface ProgramsPageClientProps {
  programs: Program[];
}

export function ProgramsPageClient({ programs: initialPrograms }: ProgramsPageClientProps) {
  const { language, direction, t } = useLanguage();
  const [programsList, setProgramsList] = useState<Program[]>(initialPrograms);

  useEffect(() => {
    async function loadBackendPrograms() {
      try {
        const res = await api.get<any>("/programs", { params: { limit: 50 } });
        const rawList = Array.isArray(res.data)
          ? res.data
          : res.data?.programs || [];

        if (rawList && rawList.length > 0) {
          const mapped = rawList.map((raw: any) =>
            mapBackendProgramToFrontend(raw, initialPrograms)
          );
          setProgramsList(mapped);
        }
      } catch (err) {
        console.warn("Using initial program data fallback:", err);
      }
    }

    loadBackendPrograms();
  }, [initialPrograms]);

  return (
    <div className="bg-slate-50 dark:bg-navy-950 py-12 md:py-20 transition-colors duration-300 min-h-screen">
      <Container>
        <div className="space-y-12">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 dark:bg-gold-500/15 border border-gold-500/30 text-gold-600 dark:text-gold-400 text-xs sm:text-sm font-bold uppercase tracking-wider font-mono">
              
              <span>{language === "en" ? "Academic & Studio Tracks" : "المسارات الأكاديمية والاستوديو"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white font-cairo tracking-tight">
              {t.programsHeroTitle || (language === 'en' ? 'Programs & Diplomas' : 'البرامج والدبلومات')}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 font-cairo leading-relaxed max-w-2xl mx-auto">
              {t.programsCatalogSubtitle || (language === 'en' ? 'Explore our practical media tracks.' : 'استكشف مساراتنا التدريبية التخصصية.')}
            </p>
          </div>

          {/* Interactive Catalog Component with dynamic tracks & programs */}
          <ProgramsCatalog programs={programsList} />
        </div>
      </Container>
    </div>
  );
}
