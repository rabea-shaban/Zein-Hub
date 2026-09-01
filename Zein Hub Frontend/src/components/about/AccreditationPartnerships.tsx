"use client";

import { Container } from "@/components/layout/Container";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, Award, GraduationCap, Handshake, CheckCircle2 } from "lucide-react";

export function AccreditationPartnerships() {
  const { language, t } = useLanguage();

  return (
    <section className="py-20 bg-white dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800 transition-colors duration-300">
      <Container className="space-y-14">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{t.accreditationBadge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            {t.accreditationTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {t.accreditationSubtitle}
          </p>
        </div>

        {/* 3 Pillars of Standards & Credibility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
          <div className="p-7 rounded-3xl bg-slate-50 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 space-y-4">
            <div className="p-3 w-fit rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-gold-600 dark:text-gold-400">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {language === "en" ? "Independent Master Jury" : "تحكيم مهني مستقل"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === "en"
                ? "Capstone projects undergo formal defense before juries of veteran journalists and hiring directors from leading regional networks."
                : "تخضع مشاريع التخرج للتقييم والمناقشة من قبل لجان تحكيم تضم كبار الصحفيين ومسؤولي التوظيف في كبرى المنصات الإقليمية."}
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-700 dark:text-gold-400 font-medium pt-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{language === "en" ? "Hiring-Grade Standard" : "معيار توظيف فعلي"}</span>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-slate-50 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 space-y-4">
            <div className="p-3 w-fit rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-gold-600 dark:text-gold-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {language === "en" ? "Academic & University Alliances" : "شراكات أكاديمية وتدريبية"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === "en"
                ? "Active cooperation protocols with media faculties across Upper Egypt universities bridging the theory-practice gap."
                : "بروتوكولات تعاون مستمرة مع كليات الإعلام والاتصال بالجامعات في صعيد مصر لسد الفجوة العملية وتقديم ورش استوديو متقدمة."}
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-700 dark:text-gold-400 font-medium pt-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{language === "en" ? "Higher Education Synergy" : "تكامل مع التعليم الجامعي"}</span>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-slate-50 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 space-y-4">
            <div className="p-3 w-fit rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-gold-600 dark:text-gold-400">
              <Handshake className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {language === "en" ? "Distribution & Placement Network" : "شبكة توظيف ونشر"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === "en"
                ? "Connecting standout graduates and winning documentary projects with digital newsrooms for paid publishing and job placements."
                : "توصيل المتميزين والمشاريع الفائزة بغرف الأخبار والمواقع المستقلة لنشر أعمالهم ومنحهم فرص عمل كصحفيين وصنّاع محتوى ميدانيين."}
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-700 dark:text-gold-400 font-medium pt-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{language === "en" ? "Career Launch Support" : "دعم التوظيف والانتشار"}</span>
            </div>
          </div>
        </div>

        {/* Community & NGO Training Grants Banner */}
        <div className="rounded-3xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-900 dark:text-white text-start shadow-xl transition-colors duration-300">
          <div className="space-y-2">
            <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {t.communityPartnershipTitle}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {t.communityPartnershipDesc}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
