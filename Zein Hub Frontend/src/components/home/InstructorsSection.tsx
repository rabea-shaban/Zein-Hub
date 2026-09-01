"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { InstructorCard } from "@/components/instructors/InstructorCard";
import { getFeaturedInstructors } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Instructor } from "@/types/instructor";
import { api } from "@/lib/api";
import { mapBackendInstructorToFrontend } from "@/components/instructors/InstructorsPageClient";
import { Users, ArrowLeft, ArrowRight } from "lucide-react";

export function InstructorsSection() {
  const initialInstructors = getFeaturedInstructors();
  const [instructors, setInstructors] = useState<Instructor[]>(initialInstructors);
  const { direction, language, t } = useLanguage();
  const isAr = language === "ar";

  useEffect(() => {
    async function loadInstructors() {
      try {
        const res = await api.get<any[]>("/instructors/admin/all");
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Instructor[] = res.data
            .slice(0, 6)
            .map((item: any) =>
              mapBackendInstructorToFrontend(item, initialInstructors)
            );
          setInstructors(mapped);
        }
      } catch (e) {
        // Safe fallback
      }
    }
    loadInstructors();
  }, []);

  return (
    <section className="py-20 bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800/80 relative transition-colors duration-300">
      <Container>
        {/* Header with Link */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="space-y-3 max-w-2xl text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-bold">
              <Users className="h-3.5 w-3.5" />
              <span>{t.instructorsBadge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              {t.instructorsTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {t.instructorsSubtitle}
            </p>
          </div>

          <div>
            <Link href="/instructors">
              <Button
                variant="outline"
                className="border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-950 dark:hover:text-white gap-2 font-bold"
              >
                <span>{t.viewAllInstructors}</span>
                {direction === "rtl" ? (
                  <ArrowLeft className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      </Container>
    </section>
  );
}
