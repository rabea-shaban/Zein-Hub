'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import {
  Video,
  Radio,
  Calendar,
  Clock,
  User,
  ExternalLink,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

interface LiveSessionItem {
  _id: string;
  title: string;
  description?: string;
  programId?: {
    _id: string;
    title?: string;
    titleAr?: string;
    titleEn?: string;
    slug?: string;
  };
  instructorId?: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    email?: string;
  };
  startTime: string;
  endTime: string;
  meetingUrl?: string;
  provider?: 'google_meet' | 'zoom' | 'teams';
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  location?: string;
}

export default function StudentLiveSessionsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [sessions, setSessions] = useState<LiveSessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLiveSessions() {
      try {
        setLoading(true);

        // 1. Fetch student enrolled programs for strict filtering
        const enrolledProgIds = new Set<string>();
        try {
          const enrRes = await api.get<any>('/enrollments/me');
          const enrollments = Array.isArray(enrRes.data) ? enrRes.data : enrRes.data?.enrollments || [];
          enrollments.forEach((e: any) => {
            const pId = typeof e.programId === 'object' ? e.programId?._id : e.programId;
            if (pId) enrolledProgIds.add(pId.toString());
          });
        } catch (e) {
          console.warn('Enrollments check warning:', e);
        }

        // 2. Fetch Sessions
        const res = await api.get<any>('/sessions');
        const list = Array.isArray(res.data) ? res.data : res.data?.sessions || [];

        if (enrolledProgIds.size > 0) {
          const filtered = list.filter((sess: any) => {
            const sessProgId = typeof sess.programId === 'object' ? sess.programId?._id?.toString() : sess.programId?.toString();
            return sessProgId && enrolledProgIds.has(sessProgId);
          });
          setSessions(filtered);
        } else {
          setSessions(list);
        }
      } catch (err) {
        console.warn('Live sessions fetch warning:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLiveSessions();
  }, []);

  return (
    <div className="p-4 sm:p-8 space-y-8 font-cairo text-start">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-cairo">
          {isAr ? 'استوديوهات البث المباشر والورش الحية' : 'Live Studio Masterclasses'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1 font-cairo">
          {isAr
            ? 'جلسات تدريب حية وتوجيه صوتي وتلفزيوني مباشر مع كبار الخبراء والإعلاميين'
            : 'Interactive live studio drills and vocalise masterclasses with faculty coaches'}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400 dark:text-gray-400">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
          <span className="text-xs font-bold">{isAr ? 'جارٍ جلب مواعيد الجلسات الحية...' : 'Loading live masterclasses...'}</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 space-y-3 shadow-sm">
          <Radio className="w-12 h-12 mx-auto text-gold-500" />
          <h3 className="text-base font-bold text-navy-900 dark:text-white">
            {isAr ? 'لا توجد جلسات بث مباشر مجدولة حالياً' : 'No Live Sessions Scheduled'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto">
            {isAr
              ? 'سيتم إشعارك فور قيام المحاضرين بجدولة جلسات استوديو أو ورش عمل تفاعلية جديدة.'
              : 'You will receive notifications whenever instructors schedule new studio workshops.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const isLive = session.status === 'live';
            const isCompleted = session.status === 'completed';
            const progTitle = isAr
              ? session.programId?.titleAr || session.programId?.title || session.programId?.titleEn || 'البرنامج التدريبي المعتمد'
              : session.programId?.titleEn || session.programId?.title || session.programId?.titleAr || 'Certified Training Program';

            const instructorName = session.instructorId?.fullName || (isAr ? 'فريق تدريب Zein Hub' : 'Faculty Master Coach');

            const dateStr = session.startTime
              ? new Date(session.startTime).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : isAr ? 'قريباً' : 'Upcoming';

            const timeStr = session.startTime
              ? `${new Date(session.startTime).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}${session.endTime ? ` - ${new Date(session.endTime).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}` : ''}`
              : '06:00 PM';

            const providerLabel =
              session.provider === 'zoom'
                ? 'Zoom'
                : session.provider === 'teams'
                ? 'MS Teams'
                : 'Google Meet';

            return (
              <div
                key={session._id}
                className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-5 hover:border-gold-500/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono">
                      {isLive ? (
                        <span className="px-3 py-1 rounded-full bg-rose-500 text-white animate-pulse flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5" />
                          <span>{isAr ? 'بث مباشر الآن 🔴' : 'LIVE NOW 🔴'}</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-gray-400">
                          {isAr ? 'جلسة منتهية' : 'Completed Session'}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <Radio className="w-3 h-3" />
                          <span>{isAr ? 'جلسة بث مجدولة' : 'Scheduled Live Session'}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-navy-900 dark:text-white font-cairo">
                      {session.title}
                    </h3>

                    <span className="text-xs text-gold-700 dark:text-gold-400 font-bold block">
                      {progTitle}
                    </span>
                  </div>

                  {session.meetingUrl && !isCompleted && (
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 self-start sm:self-auto font-cairo"
                    >
                      <Video className="w-4 h-4" />
                      <span>{isAr ? `الانضمام للبث المباشر (${providerLabel})` : `Join Live (${providerLabel})`}</span>
                    </a>
                  )}
                </div>

                {/* Session Info Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center gap-2 text-slate-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{dateStr}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center gap-2 text-slate-700 dark:text-gray-300">
                    <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{timeStr}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center gap-2 font-cairo text-slate-700 dark:text-gray-300">
                    <User className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>{isAr ? `المدرب: ${instructorName}` : `Coach: ${instructorName}`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
