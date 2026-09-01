"use client";

import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { getTestimonials } from "@/lib/content";
import { useLanguage } from "@/context/LanguageContext";
import { Quote, MessageSquareQuote } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = getTestimonials();
  const { language, t } = useLanguage();

  return (
    <section className="py-12 sm:py-20 bg-slate-50 dark:bg-navy-950 border-b border-slate-200 dark:border-navy-800/80 relative transition-colors duration-300">
      <Container>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4 mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-gold-700 dark:text-gold-400 text-xs font-bold">
            <MessageSquareQuote className="h-3.5 w-3.5" />
            <span>{t.testimonialsBadge}</span>
          </div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            {t.testimonialsTitle}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed">
            {t.testimonialsSubtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial) => {
            const name = language === "en" && testimonial.nameEn ? testimonial.nameEn : testimonial.name;
            const role = language === "en" && testimonial.roleEn ? testimonial.roleEn : testimonial.role;
            const city = language === "en" && testimonial.cityEn ? testimonial.cityEn : testimonial.city;
            const programTitle = language === "en" && testimonial.programTitleEn ? testimonial.programTitleEn : testimonial.programTitle;
            const quote = language === "en" && testimonial.quoteEn ? testimonial.quoteEn : testimonial.quote;

            return (
              <Card
                key={testimonial.id}
                className="relative p-5 sm:p-7 bg-white dark:bg-navy-900/80 border border-slate-200 dark:border-navy-800 flex flex-col justify-between hover:border-gold-500/40 hover:shadow-xl transition-all rounded-2xl text-start"
              >
                <div>
                  <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-gold-500/30 mb-3 sm:mb-4" />
                  <p className="text-xs sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed italic mb-4 sm:mb-6">
                    &ldquo;{quote}&rdquo;
                  </p>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center gap-3 sm:gap-3.5">
                  <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border border-gold-500/40 shrink-0">
                    <Image
                      src={testimonial.avatar}
                      alt={name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{name}</h4>
                    <p className="text-[11px] sm:text-xs text-gold-600 dark:text-gold-400 font-medium mt-0.5">
                      {role} — <span className="text-slate-500 dark:text-slate-400">{city}</span>
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px] sm:max-w-[200px] mt-0.5">
                      {programTitle}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
