'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, X, PhoneCall, Clock, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { SITE_CONFIG } from '@/lib/constants';

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const rawPhone = '201117231511';
  const displayPhone = '+20 11 17231511';
  const localPhone = '01117231511';

  const defaultWhatsappMsg = encodeURIComponent(
    isAr
      ? 'مرحباً منصة Zein Hub، أود الاستفسار عن البرامج التدريبية المتاحة.'
      : 'Hello Zein Hub, I would like to inquire about the available training programs.'
  );

  const whatsappUrl = `https://wa.me/${rawPhone}?text=${defaultWhatsappMsg}`;
  const callUrl = `tel:+${rawPhone}`;

  // Show after minor scroll or delay
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setHasScrolled(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Also auto show after 2 seconds
    const timer = setTimeout(() => setHasScrolled(true), 1500);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <aside
      aria-label={isAr ? 'أزرار التواصل السريع' : 'Quick Contact Actions'}
      className="fixed bottom-5 z-50 flex flex-col items-start gap-3 select-none ltr:right-5 rtl:left-5 sm:bottom-7 ltr:sm:right-7 rtl:sm:left-7 print:hidden"
    >
      {/* Expanded Quick Contact Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-80 max-w-[calc(100vw-2.5rem)] rounded-3xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-navy-700/80 shadow-2xl shadow-navy-950/20 dark:shadow-black/50 p-5 overflow-hidden text-start"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-navy-800">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20">
                  <MessageCircle className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-navy-900 animate-ping"></span>
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-navy-900"></span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{SITE_CONFIG.name}</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-800/40">
                      <Sparkles className="w-2.5 h-2.5" />
                      {isAr ? 'متاحون للرد' : 'Online'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAr ? 'تواصل مع فريق القبول والدعم مباشرة' : 'Connect directly with our admissions team'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                aria-label={isAr ? 'إغلاق' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-2.5">
              {/* WhatsApp Action */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight">
                      {isAr ? 'محادثة فورية عبر واتساب' : 'Chat on WhatsApp'}
                    </span>
                    <span className="text-[10px] text-emerald-100 font-mono dir-ltr">
                      {displayPhone}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-md">
                  {isAr ? 'ابدأ الآن' : 'Start'}
                </div>
              </a>

              {/* Direct Phone Call Action */}
              <a
                href={callUrl}
                className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-navy-950/80 hover:bg-slate-100 dark:hover:bg-navy-800/80 border border-slate-200/80 dark:border-navy-750 text-slate-800 dark:text-slate-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/20">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight">
                      {isAr ? 'اتصال هاتفـي مباشر' : 'Direct Phone Call'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono dir-ltr">
                      {localPhone} ({displayPhone})
                    </span>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 dark:bg-gold-500/20 px-2 py-1 rounded-lg border border-gold-500/20">
                  {isAr ? 'اتصال' : 'Call'}
                </div>
              </a>
            </div>

            {/* Working Hours Footer */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gold-500" />
                <span>{isAr ? 'ساعات العمل:' : 'Hours:'}</span>
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {SITE_CONFIG.workingHours}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Buttons Stack */}
      <div className="flex items-center gap-2.5">
        {/* Direct Call Quick Round Button */}
        <motion.a
          href={callUrl}
          initial={{ opacity: 0, scale: 0.5, y: 15 }}
          animate={{ opacity: hasScrolled ? 1 : 0.85, scale: 1, y: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/90 dark:bg-navy-900/90 backdrop-blur-md text-gold-400 border border-gold-500/40 shadow-lg shadow-navy-950/20 dark:shadow-black/40 hover:text-gold-300 hover:border-gold-400 transition-colors group"
          title={`${isAr ? 'اتصال مباشر:' : 'Call:'} ${displayPhone}`}
          aria-label={isAr ? `اتصال مباشر برقم ${displayPhone}` : `Call ${displayPhone}`}
        >
          <Phone className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <span className="sr-only">{displayPhone}</span>
        </motion.a>

        {/* WhatsApp Main Floating Button with Pulse & Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="relative"
        >
          {/* Animated Glowing Ring */}
          <span className="absolute -inset-1 rounded-full bg-emerald-500/30 blur-sm animate-pulse pointer-events-none"></span>

          {/* WhatsApp Action Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative flex items-center justify-center gap-2 h-12 px-3.5 sm:px-4 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-600/30 border border-emerald-400/40 hover:brightness-110 active:scale-95 transition-all duration-200"
            aria-label={isAr ? 'فتح قائمة التواصل عبر واتساب والاتصال' : 'Open WhatsApp and Call contact widget'}
            aria-expanded={isOpen}
          >
            {/* WhatsApp Icon */}
            <svg
              className="w-5 h-5 fill-current shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>

            <span className="text-xs font-bold whitespace-nowrap hidden sm:inline-block">
              {isAr ? 'تواصل معنا' : 'WhatsApp'}
            </span>

            {/* Status dot */}
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          </button>
        </motion.div>
      </div>
    </aside>
  );
}
