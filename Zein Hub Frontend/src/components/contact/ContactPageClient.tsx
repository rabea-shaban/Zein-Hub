"use client";

import { Container } from "@/components/layout/Container";
import { ContactFormSection } from "@/components/contact/ContactFormSection";
import { useLanguage } from "@/context/LanguageContext";
import { MessageSquare } from "lucide-react";

export function ContactPageClient() {
  const { language, t } = useLanguage();

  return (
    <div className="py-12 md:py-20 space-y-12 bg-slate-50 dark:bg-navy-950 min-h-screen transition-colors duration-300">
      <Container>
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-bold">
            
            <span>
              {language === "en"
                ? "ADMISSIONS & INQUIRY HUB"
                : "مركز الدعم والتسجيل"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
            {t.contactHeaderTitle}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {t.contactHeaderSubtitle}
          </p>
        </div>

        {/* Contact Form Section */}
        <ContactFormSection />
      </Container>
    </div>
  );
}
