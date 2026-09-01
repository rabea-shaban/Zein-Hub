"use client";

import * as React from "react";
import Image from "next/image";
import { Play, X, Radio, Volume2, Maximize2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface MediaPreviewProps {
  posterSrc: string;
  videoSrc?: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
  aspectRatio?: "video" | "square" | "wide";
  className?: string;
  priority?: boolean;
}

export function MediaPreview({
  posterSrc,
  videoSrc,
  title,
  subtitle,
  badgeText,
  aspectRatio = "video",
  className = "",
  priority = false,
}: MediaPreviewProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const { language } = useLanguage();

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "wide"
      ? "aspect-[21/9]"
      : "aspect-video";

  return (
    <>
      <div
        className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-navy-800 bg-navy-900 shadow-xl transition-all duration-300 hover:border-gold-500/50 ${aspectClass} ${className}`}
      >
        {/* Poster Image */}
        <Image
          src={posterSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 right-4 left-4 flex items-center justify-between pointer-events-none">
          {badgeText && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-950/80 backdrop-blur-md border border-gold-500/30 text-gold-400 text-[11px] font-bold">
              <Radio className="h-3 w-3 animate-pulse text-red-400" />
              <span>{badgeText}</span>
            </div>
          )}
          <span className="text-[10px] font-mono text-slate-300 bg-navy-950/70 backdrop-blur-md px-2 py-0.5 rounded border border-navy-800 ms-auto">
            4K UHD
          </span>
        </div>

        {/* Central Interactive Play Trigger */}
        <button
          onClick={() => setIsPlaying(true)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gold-500/20 backdrop-blur-md border-2 border-gold-500 flex items-center justify-center text-gold-400 shadow-gold-glow hover:scale-110 hover:bg-gold-500 hover:text-navy-950 transition-all duration-300 focus:outline-none"
          aria-label={`Play media preview: ${title}`}
        >
          <Play className="h-6 w-6 fill-current mr-[-2px] rtl:mr-[-2px] ltr:ml-[2px]" />
        </button>

        {/* Bottom Details Caption */}
        <div className="absolute bottom-4 right-4 left-4 text-start space-y-0.5 text-white pointer-events-none">
          <h4 className="font-bold text-sm sm:text-base text-white line-clamp-1 drop-shadow-md">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1 drop-shadow-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Interactive Video Modal Preview */}
      {isPlaying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl bg-navy-900 border border-gold-500/40 p-4 sm:p-6 shadow-2xl space-y-4">
            {/* Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-md">
                  {title}
                </h3>
              </div>
              <button
                onClick={() => setIsPlaying(false)}
                className="p-1.5 rounded-full bg-navy-950 text-slate-400 hover:text-white border border-navy-800 hover:border-gold-500/40 transition-colors"
                aria-label="Close video player"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Simulated Live Studio Broadcast Player */}
            <div className="relative aspect-video rounded-2xl bg-navy-950 overflow-hidden border border-navy-800 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="absolute inset-0 media-grid-pattern opacity-40 pointer-events-none" />
              
              <div className="relative z-10 w-16 h-16 rounded-full bg-gold-500/10 border-2 border-gold-500 flex items-center justify-center text-gold-400 animate-pulse">
                <Volume2 className="h-8 w-8" />
              </div>

              <div className="relative z-10 space-y-1 max-w-md">
                <h4 className="font-extrabold text-base sm:text-lg text-white">
                  {language === "en" ? "Broadcast Studio Stream Ready" : "بث الاستوديو التدريبي جاهز"}
                </h4>
                <p className="text-xs text-slate-400">
                  {language === "en"
                    ? "Interactive live preview from Zein Hub Studio recording suites."
                    : "محاكاة فورية لتجربة التدريب العملي في استوديوهات البث التابعة لـ Zein Hub."}
                </p>
              </div>

              <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-navy-900 border border-gold-500/30 text-gold-400 text-xs font-mono font-bold">
                <span>00:45 / 02:30</span>
                <span>•</span>
                <span>1080p 60FPS</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
