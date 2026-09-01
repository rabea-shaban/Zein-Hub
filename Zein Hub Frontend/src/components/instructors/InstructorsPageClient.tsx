"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { InstructorsDirectory } from "@/components/instructors/InstructorsDirectory";
import { TrustCTA } from "@/components/about/TrustCTA";
import { Instructor } from "@/types/instructor";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Award, ShieldCheck } from "lucide-react";

interface InstructorsPageClientProps {
  instructors: Instructor[];
}

export function mapBackendInstructorToFrontend(
  raw: any,
  fallbackInstructors: Instructor[]
): Instructor {
  const rawName =
    raw.fullName ||
    (typeof raw.userId === "object" && raw.userId?.fullName) ||
    raw.user?.fullName ||
    raw.name ||
    "";

  const matchFallback = fallbackInstructors.find(
    (f) =>
      f.name === rawName ||
      f.id === raw._id ||
      f.id === raw.id ||
      f.nameEn?.toLowerCase() === rawName.toLowerCase()
  );

  const rawBio =
    raw.bio ||
    raw.instructorProfile?.bio ||
    matchFallback?.bio ||
    "خبير ومدرب إعلامي معتمد في منصة Zein Hub.";

  const rawSpecs =
    raw.specializations ||
    raw.instructorProfile?.specializations ||
    matchFallback?.specialization ||
    ["التدريب الإعلامي والصوتي"];

  const years =
    raw.experienceYears ||
    raw.instructorProfile?.experienceYears ||
    matchFallback?.experienceYears ||
    10;

  return {
    id: raw._id || raw.id || matchFallback?.id || "inst-1",
    name: rawName || matchFallback?.name || "محاضر معتمد",
    nameEn: raw.fullNameEn || matchFallback?.nameEn || rawName || "Certified Instructor",
    title: matchFallback?.title || "خبير ومحاضر إعلامي معتمد",
    titleEn: matchFallback?.titleEn || "Certified Media Instructor & Faculty Coach",
    bio: rawBio,
    bioEn:
      raw.bioEn ||
      raw.instructorProfile?.bioEn ||
      matchFallback?.bioEn ||
      "Certified media instructor and senior faculty coach at Zein Hub.",
    avatar:
      raw.avatarUrl ||
      raw.photoUrl ||
      matchFallback?.avatar ||
      "/images/instructors/tarek.png",
    specialization: rawSpecs,
    specializationEn: matchFallback?.specializationEn || rawSpecs,
    experienceYears: years,
    featured: Boolean(raw.isFeatured ?? matchFallback?.featured ?? true),
    roleType: matchFallback?.roleType || "مدرب رئيسي",
    roleTypeEn: matchFallback?.roleTypeEn || "Lead Instructor",
    formerAffiliations: matchFallback?.formerAffiliations || [
      "إذاعة وتلفزيون صعيد مصر",
      "قطاع الأخبار والإنتاج الصوتي",
    ],
    formerAffiliationsEn: matchFallback?.formerAffiliationsEn || [
      "Upper Egypt Radio & TV",
      "Broadcast News & Audio Hubs",
    ],
    philosophyQuote:
      matchFallback?.philosophyQuote ||
      "التدريب الحقيقي يبدأ خلف الميكروفون وأمام الكاميرا داخل الاستوديو.",
    philosophyQuoteEn:
      matchFallback?.philosophyQuoteEn ||
      "True media mastery begins behind the studio microphone and under the live camera lights.",
    coursesTaught: matchFallback?.coursesTaught || ["التعليق الصوتي والفوكاليز الرقمي"],
    coursesTaughtEn: matchFallback?.coursesTaughtEn || ["Voice-Over & Digital Vocalise"],
    achievements: matchFallback?.achievements || [
      "تأهيل وتدريب أكثر من 500 مذيع وصانع محتوى في صعيد مصر",
    ],
    achievementsEn: matchFallback?.achievementsEn || [
      "Mentored and graduated over 500 broadcasters and creators across Upper Egypt",
    ],
    socialLinks: matchFallback?.socialLinks || {},
  };
}

export function InstructorsPageClient({
  instructors: initialInstructors,
}: InstructorsPageClientProps) {
  const { language, t } = useLanguage();
  const [instructorsList, setInstructorsList] = useState<Instructor[]>(initialInstructors);

  useEffect(() => {
    async function loadBackendInstructors() {
      try {
        const res = await api.get<any>("/instructors", {
          params: { limit: 50 },
        });
        const rawList = Array.isArray(res.data)
          ? res.data
          : res.data?.instructors || [];

        if (rawList && rawList.length > 0) {
          const mapped = rawList.map((raw: any) =>
            mapBackendInstructorToFrontend(raw, initialInstructors)
          );
          setInstructorsList(mapped);
        }
      } catch (err) {
        console.warn("Using initial instructors data fallback:", err);
      }
    }

    loadBackendInstructors();
  }, [initialInstructors]);

  return (
    <div className="py-12 md:py-20 space-y-16 bg-slate-50 dark:bg-navy-950 min-h-screen transition-colors duration-300">
      <Container className="space-y-16">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-bold">
            
            <span>
              {language === "en"
                ? "MASTER PRACTITIONERS & TITANS"
                : "نخبة الخبراء والممارسين"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
            {t.facultyHeading}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {t.instructorsHeroSubtitle}
          </p>

          {/* Quick Mentorship Quality Points */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 text-xs text-slate-700 dark:text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 px-3.5 py-2 rounded-xl shadow-sm">
              <Award className="h-4 w-4 text-gold-500" />
              <span>
                {language === "en"
                  ? "Average 12+ Years Industry Experience"
                  : "معدل خبرة يتجاوز 12 عاماً للمدرب"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 px-3.5 py-2 rounded-xl shadow-sm">
              <ShieldCheck className="h-4 w-4 text-gold-500" />
              <span>
                {language === "en"
                  ? "Direct 1-on-1 Mentorship & Feedback"
                  : "إشراف وتوجيه فردي مباشر"}
              </span>
            </div>
          </div>
        </div>

        {/* Directory with interactive modals */}
        <InstructorsDirectory instructors={instructorsList} />

        {/* Trust CTA */}
        <div className="pt-8">
          <TrustCTA />
        </div>
      </Container>
    </div>
  );
}
