'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  Users,
  GraduationCap,
  FileCheck2,
  Video,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Play,
  Calendar,
  Award,
  ChevronRight,
  Loader2,
  ExternalLink,
  MessageSquare,
  Activity,
  PlusCircle,
  Eye,
  Layers,
  BookOpen,
} from 'lucide-react';

interface DashboardMetrics {
  totalAssignedPrograms: number;
  totalStudentsEnrolled: number;
  activeStudents: number;
  completedStudents: number;
  pendingSubmissionsToGrade: number;
  upcomingLiveSessionsCount: number;
}

interface AssignedProgram {
  _id: string;
  titleAr?: string;
  titleEn?: string;
  slug?: string;
  status: string;
  coverImageUrl?: string;
  durationWeeks?: number;
  instructorStats?: {
    totalStudents?: number;
    activeStudents?: number;
    pendingSubmissions?: number;
  };
}

interface EnrolledStudentItem {
  _id: string;
  studentId?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  };
  programId?: {
    _id?: string;
    titleAr?: string;
    titleEn?: string;
  };
  status: string;
  progressPercentage: number;
  enrolledAt: string;
}

export default function InstructorDashboardPage() {
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalAssignedPrograms: 0,
    totalStudentsEnrolled: 0,
    activeStudents: 0,
    completedStudents: 0,
    pendingSubmissionsToGrade: 0,
    upcomingLiveSessionsCount: 0,
  });
  const [assignedPrograms, setAssignedPrograms] = useState<AssignedProgram[]>([]);
  const [recentStudents, setRecentStudents] = useState<EnrolledStudentItem[]>([]);
  const [instructorProfile, setInstructorProfile] = useState<any>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // 1. Load Metrics & Assigned Programs
        const dashRes = await api.get<any>('/instructors/me/dashboard');
        if (dashRes.data) {
          if (dashRes.data.metrics) setMetrics(dashRes.data.metrics);
          if (dashRes.data.assignedPrograms) setAssignedPrograms(dashRes.data.assignedPrograms);
          if (dashRes.data.instructor) setInstructorProfile(dashRes.data.instructor);
        }

        // 2. Load Recent Enrolled Students
        const studentsRes = await api.get<any>('/instructors/me/students');
        const studentsList = Array.isArray(studentsRes.data)
          ? studentsRes.data
          : studentsRes.data?.students || [];
        setRecentStudents(studentsList.slice(0, 5));
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const stats = [
    {
      titleAr: 'إجمالي الطلاب بالمسارات',
      titleEn: 'Enrolled Students',
      value: metrics.totalStudentsEnrolled,
      subAr: `${metrics.activeStudents} يتدربون حالياً`,
      subEn: `${metrics.activeStudents} active learners`,
      icon: Users,
      color: 'from-blue-500/20 to-blue-500/5 text-blue-500 border-blue-500/20',
      href: '/instructor/students',
    },
    {
      titleAr: 'البرامج والكورسات المسندة',
      titleEn: 'Assigned Programs',
      value: metrics.totalAssignedPrograms,
      subAr: 'تحت إشرافك المباشر',
      subEn: 'Under your faculty supervision',
      icon: GraduationCap,
      color: 'from-gold-500/20 to-gold-500/5 text-gold-500 border-gold-500/20',
      href: '/instructor/programs',
    },
    {
      titleAr: 'تسليمات بانتظار التقييم',
      titleEn: 'Pending Submissions',
      value: metrics.pendingSubmissionsToGrade,
      subAr: 'تطبيقات ومشاريع عملية',
      subEn: 'Practical studio takes',
      icon: FileCheck2,
      color: 'from-amber-500/20 to-amber-500/5 text-amber-500 border-amber-500/20',
      href: '/instructor/submissions',
    },
    {
      titleAr: 'جلسات استوديو مجدولة',
      titleEn: 'Live Studio Sessions',
      value: metrics.upcomingLiveSessionsCount,
      subAr: 'بث وتدريب مباشر',
      subEn: 'Scheduled live masterclasses',
      icon: Video,
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500 border-emerald-500/20',
      href: '/instructor/live-sessions',
    },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 font-cairo text-start">
      {/* 🌟 1. Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-navy-950 to-navy-900 border border-gold-500/30 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 text-xs font-bold font-mono">
              
              <span>{isAr ? 'لوحة تدريب الخبراء والأكاديميين' : 'Master Faculty LMS Dashboard'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-cairo tracking-tight">
              {isAr
                ? `مرحباً بك يا كابتن، ${user?.fullName || 'المحاضر المعتمد'}`
                : `Welcome Back, Coach ${user?.fullName || 'Faculty Coach'}`}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl font-cairo leading-relaxed">
              {isAr
                ? 'لوحة إدارة ومتابعة تدريبات استوديوهات Zein Hub بصعيد مصر. تابع مساراتك التدريبية، قيّم تسليمات ومشاريع الطلاب، وأدر جلسات الاستوديو المباشرة بكل سهولة.'
                : 'Manage and oversee your studio masterclasses at Zein Hub Upper Egypt. Review student takes, track curriculum progress, and conduct live broadcast drills.'}
            </p>

            {instructorProfile?.specializations && instructorProfile.specializations.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-gray-400 font-bold">{isAr ? 'التخصصات:' : 'Tracks:'}</span>
                {instructorProfile.specializations.map((spec: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-navy-800/80 border border-navy-700 text-gold-300 text-[11px] font-semibold"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
            <Link
              href="/instructor/programs"
              className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 font-cairo"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{isAr ? 'إدارة المناهج والدروس' : 'Manage Curriculum'}</span>
            </Link>

            <Link
              href="/instructor/students"
              className="px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-white border border-navy-700 text-xs font-bold transition-all flex items-center justify-center gap-2 font-cairo"
            >
              <Users className="w-4 h-4" />
              <span>{isAr ? 'الطلاب المشتركون' : 'My Enrolled Students'}</span>
            </Link>

            <Link
              href="/instructor/live-sessions"
              className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 font-cairo"
            >
              <Video className="w-4 h-4" />
              <span>{isAr ? 'جدولة جلسة استوديو' : 'Schedule Live Session'}</span>
            </Link>
          </div>
        </div>
      </div>

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

      {/* 🌟 3. Main Grid: Assigned Programs & Recent Students Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Assigned Programs Roster */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gold-500" />
              <h2 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'برامجي التدريبية المسندة' : 'My Assigned Training Programs'}
              </h2>
            </div>

            <Link
              href="/instructor/programs"
              className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 font-cairo"
            >
              <span>{isAr ? 'عرض الكل وتعديل المناهج' : 'View All & Edit Modules'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400 bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
              <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل البرامج...' : 'Loading programs...'}</span>
            </div>
          ) : assignedPrograms.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800 space-y-2">
              <GraduationCap className="w-10 h-10 mx-auto text-gray-300 dark:text-navy-700" />
              <p className="text-sm font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'لم يتم إسناد برامج تدريبية لك بعد' : 'No training programs assigned yet'}
              </p>
              <span className="text-xs text-gray-400 font-cairo block">
                {isAr
                  ? 'يقوم مدير المنصة بإسناد البرامج والكورسات التدريبية لك من لوحة الإدارة.'
                  : 'Platform administrator assigns training programs from the admin panel.'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedPrograms.map((prog) => {
                const title = isAr ? prog.titleAr || prog.titleEn : prog.titleEn || prog.titleAr;

                return (
                  <div
                    key={prog._id}
                    className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-4 hover:border-gold-500/30 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={prog.status} />
                        <span className="text-[11px] font-mono text-gray-400">
                          {prog.durationWeeks || 6} {isAr ? 'أسابيع' : 'Weeks'}
                        </span>
                      </div>

                      <h3 className="font-bold text-navy-900 dark:text-white font-cairo text-sm leading-snug">
                        {title}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-navy-800 flex items-center justify-between gap-2">
                      <Link
                        href={`/programs/${prog.slug || prog._id}`}
                        target="_blank"
                        className="p-2 rounded-xl bg-gray-50 dark:bg-navy-950 text-gray-500 hover:text-gold-500 border border-gray-200 dark:border-navy-800 transition-all"
                        title={isAr ? 'معاينة صفحة البرنامج العامة' : 'Preview Public Page'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href="/instructor/programs"
                        className="px-3.5 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500 hover:text-navy-950 text-gold-600 dark:text-gold-400 text-xs font-bold transition-all font-cairo flex items-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إدارة المنهج والدروس' : 'Manage Syllabus'}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Enrolled Students Roster */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-500" />
              <h2 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'أحدث الطلاب المنضمين' : 'Recent Students'}
              </h2>
            </div>

            <Link
              href="/instructor/students"
              className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 font-cairo"
            >
              <span>{isAr ? 'عرض الكل' : 'View All'}</span>
              <Arrow className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-3">
            {recentStudents.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs font-cairo space-y-1">
                <Users className="w-8 h-8 mx-auto text-gray-300 dark:text-navy-700" />
                <p className="font-bold">{isAr ? 'لا يوجد طلاب مسجلين حالياً' : 'No enrolled students yet'}</p>
              </div>
            ) : (
              recentStudents.map((enr) => {
                const sName = enr.studentId?.fullName || (isAr ? 'طالب مشترك' : 'Enrolled Student');
                const sEmail = enr.studentId?.email || '';
                const pTitle = isAr
                  ? enr.programId?.titleAr || enr.programId?.titleEn
                  : enr.programId?.titleEn || enr.programId?.titleAr;

                return (
                  <div
                    key={enr._id}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-100 dark:border-navy-800 flex items-center justify-between gap-3 hover:border-gold-500/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {sName.charAt(0)}
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-navy-900 dark:text-white text-xs block truncate font-cairo">
                          {sName}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate block font-cairo">
                          {pTitle || sEmail}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {enr.studentId?.phone && (
                        <a
                          href={`https://wa.me/${enr.studentId.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                          title={isAr ? 'واتساب' : 'WhatsApp'}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <Link
                        href="/instructor/students"
                        className="p-1.5 rounded-lg bg-gray-200 dark:bg-navy-800 text-gray-600 dark:text-gray-300 hover:bg-gold-500 hover:text-navy-950 transition-colors"
                        title={isAr ? 'عرض الملف' : 'Profile'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
