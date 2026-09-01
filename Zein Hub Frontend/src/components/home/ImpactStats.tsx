"use client";

import { Container } from "@/components/layout/Container";
import { getImpactStats } from "@/lib/content";
import { useLanguage } from "@/context/LanguageContext";
import { Users, Clock, MapPin, Award } from "lucide-react";

export function ImpactStats() {
  const stats = getImpactStats();
  const { language } = useLanguage();

  const iconMap: Record<string, typeof Users> = {
    Users,
    Clock,
    MapPin,
    Award,
  };

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-navy-900/90 border-b border-slate-200 dark:border-navy-800/80 relative transition-colors duration-300">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {stats.map((stat) => {
            const Icon = iconMap[stat.iconName] || Users;
            const label = language === "en" && stat.labelEn ? stat.labelEn : stat.label;
            const detail = language === "en" && stat.detailEn ? stat.detailEn : stat.detail;

            return (
              <div
                key={stat.id}
                className="rounded-2xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800/90 p-4 sm:p-6 text-center space-y-1.5 sm:space-y-2 hover:border-gold-500/40 hover:shadow-lg transition-all group"
              >
                <div className="mx-auto w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-gold-600 dark:text-gold-400 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                  {stat.value}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{label}</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 sm:line-clamp-none">{detail}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
