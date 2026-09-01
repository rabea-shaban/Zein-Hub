"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Home, BookOpen, Radio } from "lucide-react";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="py-24 md:py-36 bg-slate-50 dark:bg-navy-950 min-h-[75vh] flex items-center justify-center relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <Container className="text-center max-w-2xl space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-mono font-bold">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          <span>{t.notFoundBadge}</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-400 dark:from-white dark:to-slate-500 font-mono">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.notFoundTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {t.notFoundSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link href="/">
            <Button
              size="lg"
              className="bg-gold-500 hover:bg-gold-600 text-navy-950 font-black border border-gold-400 shadow-gold-glow px-7 py-3.5 text-sm gap-2"
            >
              <Home className="h-4 w-4" />
              <span>{t.navHome}</span>
            </Button>
          </Link>

          <Link href="/programs">
            <Button
              variant="outline"
              size="lg"
              className="border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-850 hover:text-slate-950 dark:hover:text-white px-7 py-3.5 text-sm font-bold gap-2"
            >
              <BookOpen className="h-4 w-4 text-gold-500" />
              <span>{t.exploreProgramsCTA}</span>
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
