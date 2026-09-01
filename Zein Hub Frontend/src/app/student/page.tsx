'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  GraduationCap,
  FileCheck2,
  Video,
  Award,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Layers,
  BookOpen,
  Zap,
  Play,
  TrendingUp,
  AlertCircle,
  FileText,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface EnrolledCourseItem {
  enrollment: {
    _id: string;
    programId?: {
      _id?: string;
      titleAr?: string;
      titleEn?: string;
      slug?: string;
      coverImageUrl?: string;
      durationWeeks?: number;
      totalHours?: number;
      status?: string;
    };
    status: string;
    enrolledAt: string;
    progressPercentage?: number;
  };
  progress?: {
    completionPercentage: number;
    completedLessonsCount: number;
    lastActivityAt?: string;
  };
}

export default function StudentDashboardPage() {
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrolledCourseItem[]>([]);
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Student Action Tasks
  const [actionTasks, setActionTasks] = useState([
    {
      id: 'task-1',
      titleAr: 'تسليم التطبيق الصوتي العملي (إعلان تجاري - 30 ثانية)',
      titleEn: 'Submit Audio Studio Take (Commercial Voice-Over)',
      courseAr: 'دبلوم التعليق الصوتي والفوكاليز',
      courseEn: 'Voice-Over Diploma',
      dueDateAr: 'الخميس القادم — 11:59 م',
      dueDateEn: 'Next Thursday — 11:59 PM',
      type: 'submission',
      completed: false,
      href: '/student/assignments',
    },
    {
      id: 'task-2',
      titleAr: 'مشاهدة درس: ضبط مخارج الحروف وتلوين النبرة',
      titleEn: 'Watch Lesson: Phonetics & Intonation Control',
      courseAr: 'التقديم والإلقاء الإخباري',
      courseEn: 'News Anchoring & Presentation',
      dueDateAr: 'خلال 48 ساعة',
      dueDateEn: 'Within 48 Hours',
      type: 'lesson',
      completed: true,
      href: '/student/programs',
    },
    {
      id: 'task-3',
      titleAr: 'حضور ورشة الاستوديو الحية: محاكاة غرفة الأخبار',
      titleEn: 'Attend Live Masterclass: Newsroom Simulation',
      courseAr: 'التقديم والإلقاء الإخباري',
      courseEn: 'News Anchoring & Presentation',
      dueDateAr: 'السبت القادم — 6:00 م',
      dueDateEn: 'Next Saturday — 6:00 PM',
      type: 'live',
      completed: false,
      href: '/student/live-sessions',
    },
  ]);

  useEffect(() => {
    async function loadStudentData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Student Enrollments
        const res = await api.get<any>('/enrollments/me');
        const list = Array.isArray(res.data) ? res.data : res.data?.enrollments || [];
        setEnrollments(list);

        // 2. Fetch Student Certificates Count
        try {
          const certRes = await api.get<any>('/certificates/me');
          const certList = Array.isArray(certRes.data) ? certRes.data : certRes.data?.certificates || [];
          setCertificatesCount(certList.length);
        } catch {
          setCertificatesCount(0);
        }
      } catch (err: any) {
        console.warn('Enrollment fetch fallback or error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, []);

  const toggleTask = (taskId: string) => {
    setActionTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const totalEnrolled = enrollments.length;
  const activeCount = enrollments.filter(
    (e) => e.enrollment?.status === 'active' || !e.enrollment?.status
  ).length;

  const avgProgress =
    totalEnrolled > 0
      ? Math.round(
          enrollments.reduce(
            (acc, e) =>
              acc +
              (e.progress?.completionPercentage ?? e.enrollment?.progressPercentage ?? 0),
            0
          ) / totalEnrolled
        )
      : 0;

  const stats = [
    {
      titleAr: 'الكورسات المسجل بها',
      titleEn: 'Enrolled Courses',
      value: totalEnrolled || 1,
      subAr: `${activeCount || 1} كورس نشط حالياً`,
      subEn: `${activeCount || 1} Active Courses`,
      icon: GraduationCap,
      color: 'from-gold-500/20 to-gold-500/5 text-gold-500 border-gold-500/20',
      href: '/student/programs',
    },
    {
      titleAr: 'التكليفات والتطبيقات',
      titleEn: 'Pending Takes',
      value: actionTasks.filter((t) => !t.completed).length,
      subAr: 'تطبيقات عملية للاستوديو',
      subEn: 'Required studio takes',
      icon: FileCheck2,
      color: 'from-blue-500/20 to-blue-500/5 text-blue-500 border-blue-500/20',
      href: '/student/assignments',
    },
    {
      titleAr: 'جلسات الاستوديو المباشرة',
      titleEn: 'Live Studio Labs',
      value: 1,
      subAr: 'ورشة حية مجدولة هذا الأسبوع',
      subEn: 'Scheduled this week',
      icon: Video,
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500 border-emerald-500/20',
      href: '/student/live-sessions',
    },
    {
      titleAr: 'الشهادات المكتسبة',
      titleEn: 'Certificates Earned',
      value: certificatesCount,
      subAr: 'شهادات معتمدة برقم توثيق',
      subEn: 'Verified credentials',
      icon: Award,
      color: 'from-purple-500/20 to-purple-500/5 text-purple-500 border-purple-500/20',
      href: '/student/certificates',
    },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 font-cairo text-start">
      {/* 🌟 1. Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-navy-950 to-navy-900 border border-gold-500/30 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 text-xs font-bold font-mono">
              
              <span>{isAr ? 'بوابة المتدربين واستوديوهات Zein Hub' : 'Zein Hub Student Studio Hub'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-cairo tracking-tight">
              {isAr
                ? `أهلاً بك يا بطل، ${user?.fullName || 'المتدرب المتميز'}`
                : `Welcome Back, ${user?.fullName || 'Student'}`}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl font-cairo leading-relaxed">
              {isAr
                ? 'تابع رحلتك التدريبية في صناعة الإعلام والتعليق الصوتي بصعيد مصر. أنجز تكليفاتك الأسبوعية، استمع لملاحظات المدربين، وشارك في ورش البث الحي المباشرة.'
                : 'Track your media and voice journey in Upper Egypt. Complete weekly studio takes, review faculty feedback, and join live broadcast workshops.'}
            </p>
          </div>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
            <Link
              href="/student/programs"
              className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 font-cairo"
            >
              <Play className="w-4 h-4 fill-navy-950" />
              <span>{isAr ? 'متابعة دروس الكورس' : 'Continue Learning'}</span>
            </Link>

            <Link
              href="/student/assignments"
              className="px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-white border border-navy-700 text-xs font-bold transition-all flex items-center justify-center gap-2 font-cairo"
            >
              <FileCheck2 className="w-4 h-4 text-gold-400" />
              <span>{isAr ? 'تسليم التكليفات والتطبيقات' : 'Submit Studio Takes'}</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 📊 2. KPIs Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <Link
              key={i}
              href={st.href}
              className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm hover:border-gold-500/30 transition-all hover:shadow-md group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 font-cairo">
                  {isAr ? st.titleAr : st.titleEn}
                </span>
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${st.color} border flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-mono">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-gold-500" /> : st.value}
              </div>

              <div className="text-[11px] text-gray-400 mt-1.5 flex items-center justify-between font-cairo">
                <span>{isAr ? st.subAr : st.subEn}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gold-500 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 🌟 3. Main Grid: Action Tasks & Enrolled Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Enrolled Courses & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Enrolled Courses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-gold-500" />
                <h2 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
                  {isAr ? 'كورساتي ودبلوماتي التدريبية' : 'My Enrolled Programs'}
                </h2>
              </div>

              <Link
                href="/student/programs"
                className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 font-cairo"
              >
                <span>{isAr ? 'عرض كافة المواد' : 'View All Modules'}</span>
                <Arrow className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-400 bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
                <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل كورساتك...' : 'Loading courses...'}</span>
              </div>
            ) : enrollments.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 space-y-3">
                <GraduationCap className="w-10 h-10 mx-auto text-gray-300 dark:text-navy-700" />
                <p className="text-sm font-bold text-navy-900 dark:text-white font-cairo">
                  {isAr ? 'لم تشترك في برامج تدريبية بعد' : 'No courses enrolled yet'}
                </p>
                <span className="text-xs text-gray-400 font-cairo block">
                  {isAr
                    ? 'استعرض دبلومات وبرامج Zein Hub في الصوت والإعلام، واشترك بنقرة واحدة فوراً!'
                    : 'Explore media and voice programs at Zein Hub and enroll in 1-click!'}
                </span>
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold font-cairo"
                >
                  
                  <span>{isAr ? 'استعراض البرامج المتاحة' : 'Explore Programs'}</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4 hover:border-gold-500/30 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <StatusBadge status={item.enrollment.status || 'active'} />
                          <span className="text-[11px] font-mono text-gray-400">
                            {prog?.durationWeeks || 6} {isAr ? 'أسابيع' : 'Weeks'}
                          </span>
                        </div>

                        <h3 className="font-bold text-navy-900 dark:text-white font-cairo text-sm leading-snug">
                          {title || (isAr ? 'برنامج تدريبي تطبيقي' : 'Training Program')}
                        </h3>

                        {/* Progress Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-xs font-bold font-cairo">
                            <span className="text-gray-400">{isAr ? 'نسبة التقدم:' : 'Progress:'}</span>
                            <span className="text-gold-500 font-mono">{progressPct}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 dark:bg-navy-950 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold-500 rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 dark:border-navy-800 flex items-center justify-between gap-2">
                        <Link
                          href={`/programs/${prog?.slug || prog?._id}`}
                          target="_blank"
                          className="p-2 rounded-xl bg-gray-50 dark:bg-navy-950 text-gray-500 hover:text-gold-500 border border-gray-200 dark:border-navy-800 transition-all"
                          title={isAr ? 'صفحة البرنامج' : 'Program Page'}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href="/student/programs"
                          className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all font-cairo flex items-center gap-1.5 shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-navy-950" />
                          <span>{isAr ? 'متابعة الدروس' : 'Resume Modules'}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Upcoming Live Studio Sessions */}
          <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-navy-900 dark:text-white font-cairo">
                  {isAr ? 'جلسات البث المباشر وورش الاستوديو' : 'Upcoming Live Studio Workshops'}
                </h3>
              </div>

              <Link
                href="/student/live-sessions"
                className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 font-cairo"
              >
                <span>{isAr ? 'جدول المواعيد' : 'Schedule'}</span>
                <Arrow className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500 text-navy-950 text-[10px] font-bold">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>{isAr ? 'جلسة تفاعلية قادمة' : 'Upcoming Live Workshop'}</span>
                </div>
                <h4 className="font-bold text-navy-900 dark:text-white text-sm font-cairo">
                  {isAr ? 'محاكاة البث الإخباري وقراءة الأوتوكيو' : 'News Anchoring & Teleprompter Simulation'}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    {isAr ? 'السبت القادم — 6:00 مساءً' : 'Saturday — 6:00 PM'}
                  </span>
                  <span>•</span>
                  <span>{isAr ? 'مدة الجلسة: 90 دقيقة' : '90 Mins'}</span>
                </div>
              </div>

              <Link
                href="/student/live-sessions"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 text-xs font-bold transition-all font-cairo shrink-0 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                <Video className="w-4 h-4" />
                <span>{isAr ? 'رابط الدخول للبث' : 'Join Studio Live'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Required Action Tasks & Checklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-gold-500" />
              <h2 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'المهام والتكليفات المطلوبة' : 'Required Action Items'}
              </h2>
            </div>

            <Link
              href="/student/assignments"
              className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 font-cairo"
            >
              <span>{isAr ? 'عرض الكل' : 'View All'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-3.5">
            <p className="text-xs text-gray-400 font-cairo pb-2 border-b border-gray-100 dark:border-navy-800">
              {isAr
                ? 'قائمة التطبيقات العملية والتكليفات المجدولة لك من قِبل مدربك:'
                : 'Your pending practical tasks and assignments assigned by faculty:'}
            </p>

            <div className="space-y-3">
              {actionTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                    task.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
                      : 'bg-gray-50 dark:bg-navy-950 border-gray-100 dark:border-navy-800 hover:border-gold-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-gray-300 dark:border-navy-700 hover:border-gold-500'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-1 text-start flex-1">
                      <h4
                        className={`text-xs font-bold font-cairo leading-snug ${
                          task.completed
                            ? 'line-through text-gray-400'
                            : 'text-navy-900 dark:text-white'
                        }`}
                      >
                        {isAr ? task.titleAr : task.titleEn}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-cairo">
                        <span className="text-gold-600 dark:text-gold-400 font-semibold">
                          {isAr ? task.courseAr : task.courseEn}
                        </span>
                        <span className="font-mono text-gray-400">
                          {isAr ? task.dueDateAr : task.dueDateEn}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!task.completed && (
                    <div className="pt-2 border-t border-gray-100 dark:border-navy-800 flex justify-end">
                      <Link
                        href={task.href}
                        className="text-[11px] font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 font-cairo"
                      >
                        <span>{isAr ? 'بدء الإنجاز والتسليم' : 'Complete Task'}</span>
                        <Arrow className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
