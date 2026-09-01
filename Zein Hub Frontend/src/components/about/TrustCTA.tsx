"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

export function TrustCTA() {
  const { direction, t } = useLanguage();

  return (
    <section className="py-16 md:py-20 bg-slate-50 dark:bg-navy-950 transition-colors duration-300">
      <Container>
        <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{t.trustCtaBadge}</span>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              {t.trustCtaTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              {t.trustCtaDesc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link href="/programs">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-navy-950 font-black border border-gold-400 shadow-gold-glow px-8 py-3.5 gap-2"
              >
                <span>{t.exploreProgramsCTA}</span>
                {direction === "rtl" ? (
                  <ArrowLeft className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </Link>

            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-850 hover:text-slate-950 dark:hover:text-white px-8 py-3.5 font-bold"
              >
                <span>{t.trustCtaContactBtn}</span>
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
