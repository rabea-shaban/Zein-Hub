"use client";

import * as React from "react";
import Link from "next/link";
import { Program } from "@/types/program";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { ProgramApplyModal } from "@/components/programs/ProgramApplyModal";
import { useLanguage } from "@/context/LanguageContext";
import { AlertCircle, ArrowLeft, ArrowRight, Layers } from "lucide-react";

interface ProgramApplyPageClientProps {
  program: Program;
}

export function ProgramApplyPageClient({
  program,
}: ProgramApplyPageClientProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(true);
  const { language, direction, t } = useLanguage();

  const isOpen = program.status === "open";
  const title = language === "en" && program.titleEn ? program.titleEn : program.title;
  const subtitle = language === "en" && program.subtitleEn ? program.subtitleEn : program.subtitle;

  return (
    <div className="bg-slate-50 dark:bg-navy-950 min-h-screen py-16 transition-colors duration-300">
      <Container className="max-w-3xl">
        {isOpen ? (
          /* Active Open Program Registration Container */
          <div className="rounded-3xl bg-white dark:bg-navy-900 border border-gold-500/40 p-8 sm:p-12 shadow-2xl space-y-8 text-start">
            <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-navy-800">
              <span className="text-xs font-bold text-gold-600 dark:text-gold-400 font-mono">
                ON AIR • ENROLLMENT OPEN
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {t.applyModalTitle}: {title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Launch Apply Modal or Direct Form */}
            <ProgramApplyModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              program={program}
            />

            {!isModalOpen && (
              <div className="pt-4 text-center">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold"
                >
                  {t.applyNowShort}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Coming Soon Program Notice (Requirement 10) */
          <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-8 sm:p-12 shadow-2xl text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400">
              <AlertCircle className="h-8 w-8" />
            </div>

            <div className="space-y-3 max-w-lg mx-auto">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {t.enrollmentNotOpenTitle}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.enrollmentNotOpenDesc}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href={`/programs/${program.slug}`}>
                <Button
                  className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold px-6 py-3.5"
                >
                  <span>{t.backToPrograms}</span>
                </Button>
              </Link>

              <Link href="/programs">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200 hover:bg-slate-100 font-bold px-6 py-3.5"
                >
                  <Layers className="h-4 w-4 ml-2" />
                  <span>{t.viewAllPrograms}</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
