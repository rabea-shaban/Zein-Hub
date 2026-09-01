'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  GraduationCap,
  Play,
  Layers,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Calendar,
  BookOpen,
} from 'lucide-react';

export default function StudentProgramsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrograms() {
      try {
        setLoading(true);
        const res = await api.get<any>('/enrollments/me');
        const list = Array.isArray(res.data) ? res.data : res.data?.enrollments || [];
        setEnrollments(list);
      } catch (err) {
        console.warn('Failed to load student programs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  return (
    <div className="p-4 sm:p-8 space-y-8 font-cairo text-start">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'برامجي ودبلوماتي التدريبية' : 'My Enrolled Programs'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-cairo">
            {isAr
              ? 'متابعة المناهج الدراسية، الدروس المسجلة، والتطبيقات المعتمدة في استوديوهات Zein Hub'
              : 'Access your coursework, video lessons, and practical studio modules'}
          </p>
        </div>

        <Link
          href="/programs"
          className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto font-cairo"
        >
          
          <span>{isAr ? 'استعراض المزيد من البرامج' : 'Explore More Courses'}</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
          <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل برامجك التدريبية...' : 'Loading programs...'}</span>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-8 space-y-4">
          <GraduationCap className="w-12 h-12 mx-auto text-gray-300 dark:text-navy-700" />
          <h3 className="text-base font-bold text-navy-900 dark:text-white font-cairo">
            {isAr ? 'لا توجد برامج مسجل بها حالياً' : 'No Enrolled Programs Yet'}
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            {isAr
              ? 'تصفح مسارات الصوت والتقديم الإخباري والبودكاست واشترك بنقرة واحدة بحسابك.'
              : 'Browse our audio, broadcast, and podcast diplomas and enroll in 1-click.'}
          </p>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs"
          >
            <span>{isAr ? 'تصفح البرامج المتاحة' : 'Browse Courses'}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((item) => {
            const prog = item.enrollment?.programId;
            const title = isAr ? prog?.titleAr || prog?.titleEn : prog?.titleEn || prog?.titleAr;
            const progressPct =
              item.progress?.completionPercentage ??
              item.enrollment?.progressPercentage ??
              0;

            return (
              <div
                key={item.enrollment._id}
                className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-5 hover:border-gold-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={item.enrollment.status || 'active'} />
                    <span className="text-xs font-mono text-gray-400">
                      {prog?.durationWeeks || 6} {isAr ? 'أسابيع' : 'Weeks'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-navy-900 dark:text-white font-cairo leading-snug">
                    {title || (isAr ? 'برنامج تدريبي' : 'Training Program')}
                  </h3>

                  {/* Progress Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold font-cairo">
                      <span className="text-gray-400">{isAr ? 'نسبة التقدم بالمقرر:' : 'Curriculum Progress:'}</span>
                      <span className="text-gold-500 font-mono font-bold">{progressPct}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-navy-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 font-mono flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {isAr ? 'تاريخ البدء: ' : 'Started: '}
                      {new Date(item.enrollment.enrolledAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-navy-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/programs/${prog?.slug || prog?._id}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-gray-50 dark:bg-navy-950 text-gray-500 hover:text-gold-500 border border-gray-200 dark:border-navy-800 transition-all"
                    title={isAr ? 'الصفحة العامة للبرنامج' : 'Public Page'}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/student/programs/${prog?._id || prog?.slug}`}
                    className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all font-cairo flex items-center gap-1.5 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-navy-950" />
                    <span>{isAr ? 'متابعة الدروس والتطبيقات' : 'Watch Modules'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
