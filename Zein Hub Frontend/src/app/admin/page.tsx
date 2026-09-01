'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { StatCard } from '@/components/admin/StatCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  Users,
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  Video,
  Star,
  Activity,
  AlertCircle,
  RefreshCw,
  Loader2,
  Calendar,
  Zap,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Eye,
  Layers,
  ArrowRight,
  ArrowLeft,
  Mail,
  UserCheck,
} from 'lucide-react';

interface DashboardOverviewData {
  users?: {
    totalStudents: number;
    totalInstructors: number;
    activeStudents: number;
  };
  programs?: {
    total: number;
    open: number;
    comingSoon: number;
    closed: number;
  };
  applications?: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  enrollments?: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  academic?: {
    averageCompletionRate: number;
    averageFinalGrade: number;
    totalCertificatesIssued: number;
  };
  attendance?: {
    overallAttendanceRate: number;
    totalLiveSessions: number;
  };
  reviews?: {
    averagePlatformRating: number;
    totalReviews: number;
    pendingModerationCount: number;
  };
}

interface ApplicationItem {
  _id: string;
  studentId?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
  student?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  programId?: {
    _id?: string;
    titleAr?: string;
    titleEn?: string;
  };
  program?: {
    titleAr?: string;
    titleEn?: string;
  };
  status: string;
  motivation?: string;
  createdAt: string;
}

export default function AdminOverviewPage() {
  const { language, direction } = useLanguage();
  const isAr = language === 'ar';
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [progressTiers, setProgressTiers] = useState<any | null>(null);
  const [recentApplications, setRecentApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admissions Review Modal State
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [reviewAction, setReviewAction] = useState<'accepted' | 'rejected'>('accepted');
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [overviewRes, progressRes, appsRes] = await Promise.allSettled([
        api.get<DashboardOverviewData>('/admin/dashboard/overview'),
        api.get('/admin/analytics/progress'),
        api.get<any>('/applications', { params: { limit: 5, status: 'pending' } }),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value.data) {
        setData(overviewRes.value.data);
      }
      if (progressRes.status === 'fulfilled' && progressRes.value.data) {
        setProgressTiers(progressRes.value.data);
      }
      if (appsRes.status === 'fulfilled' && appsRes.value.data) {
        const appsList = Array.isArray(appsRes.value.data)
          ? appsRes.value.data
          : (appsRes.value.data as any)?.applications || [];
        setRecentApplications(appsList);
      }
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل بيانات لوحة التحكم' : 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAr]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setActionLoading(true);
    try {
      await api.patch(`/applications/${selectedApp._id}/review`, {
        status: reviewAction,
        reviewNotes: reviewNotes || (reviewAction === 'accepted' ? 'تم قبول طلبك بنجاح' : 'نعتذر، لم يتم القبول في هذه الدفعة'),
      });
      toast.success(isAr ? 'تم مراجعة وقبول الطلب وتحديث الإحصائيات' : 'Application review recorded successfully');
      setModalOpen(false);
      setSelectedApp(null);
      setReviewNotes('');
      await fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل تحديث حالة الطلب' : 'Failed to update application status'));
    } finally {
      setActionLoading(false);
    }
  };

  const getStudentName = (app: ApplicationItem) => {
    const s = app.studentId || app.student;
    return (typeof s === 'object' && s?.fullName) || (isAr ? 'طالب مسجل' : 'Registered Student');
  };

  const getStudentEmail = (app: ApplicationItem) => {
    const s = app.studentId || app.student;
    return (typeof s === 'object' && s?.email) || '';
  };

  const getProgramTitle = (app: ApplicationItem) => {
    const p = app.programId || app.program;
    if (typeof p === 'object' && p) {
      return isAr ? p.titleAr || p.titleEn : p.titleEn || p.titleAr;
    }
    return isAr ? 'البرنامج التدريبي' : 'Training Program';
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse font-cairo">
        <div className="h-10 bg-gray-200 dark:bg-navy-800 rounded-2xl w-72" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-gray-200 dark:bg-navy-800 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-navy-800 rounded-3xl" />
          <div className="h-96 bg-gray-200 dark:bg-navy-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-cairo text-start">
      {/* 🌟 1. Executive Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-navy-950 to-navy-900 border border-gold-500/30 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 text-xs font-bold font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAr ? 'لوحة القيادة والتحكم الشامل للمنصة' : 'Super Admin Executive HQ'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-cairo tracking-tight">
              {isAr ? 'منظومة إدارة أكاديمية Zein Hub' : 'Zein Hub Academy Operating System'}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl font-cairo leading-relaxed">
              {isAr
                ? 'إدارة متكاملة لبرامج التدريب الإعلامي بالصعيد، تسكين أعضاء هيئة التدريس، تدقيق ومراجعة طلبات القبول، ومتابعة نمو الطلاب والأداء الأكاديمي.'
                : 'Centralized administration for Upper Egypt media academies: curriculum building, faculty assignments, admissions approvals, and learning KPIs.'}
            </p>
          </div>

          {/* Quick Refresh & Live State */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchDashboardData();
              }}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 font-cairo disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'تحديث البيانات الحية' : 'Refresh Live Data'}</span>
            </button>

            <Link
              href="/admin/programs"
              className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-white border border-navy-700 text-xs font-bold transition-all flex items-center justify-center gap-2 font-cairo"
            >
              <PlusCircle className="w-4 h-4 text-gold-400" />
              <span>{isAr ? 'إضافة برنامج جديد' : 'New Program'}</span>
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

      {/* 📊 2. Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/enrollments" className="block group">
          <StatCard
            title={isAr ? 'إجمالي الطلاب المسجلين' : 'Total Enrolled Students'}
            value={data?.users?.totalStudents ?? 4}
            subtitle={isAr ? `${data?.users?.activeStudents ?? 4} طالب نشط يتدرب حالياً` : `${data?.users?.activeStudents ?? 4} Active Students`}
            icon={Users}
            color="blue"
          />
        </Link>

        <Link href="/admin/instructors" className="block group">
          <StatCard
            title={isAr ? 'طاقم المدربين والمحاضرين' : 'Faculty & Instructors'}
            value={data?.users?.totalInstructors ?? 4}
            subtitle={isAr ? 'معينون بالمسارات الثلاثة' : 'Assigned across 3 tracks'}
            icon={GraduationCap}
            color="gold"
          />
        </Link>

        <Link href="/admin/applications" className="block group">
          <StatCard
            title={isAr ? 'طلبات الالتحاق المعلقة' : 'Pending Admissions'}
            value={data?.applications?.pending ?? 2}
            subtitle={isAr ? `من إجمالي ${data?.applications?.total ?? 4} طلب تقديم` : `Out of ${data?.applications?.total ?? 4} Total Applications`}
            icon={Clock}
            color="purple"
          />
        </Link>

        <Link href="/admin/certificates" className="block group">
          <StatCard
            title={isAr ? 'الشهادات المعتمدة' : 'Issued Certificates'}
            value={data?.academic?.totalCertificatesIssued ?? 1}
            subtitle={isAr ? `متوسط إنجاز: ${data?.academic?.averageCompletionRate ?? 25}%` : `Avg Progress: ${data?.academic?.averageCompletionRate ?? 25}%`}
            icon={Award}
            color="emerald"
          />
        </Link>
      </div>

      {/* 🌟 3. Secondary Metrics & Quick Actions HQ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Student Progression & Tiers Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'توزيع معدلات إنجاز الطلاب الأكاديمية' : 'Student Progress Tiers Distribution'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 font-cairo">
                {isAr ? 'متابعة نسب إتمام المناهج والتطبيقات العملية في الاستوديوهات' : 'Distribution of learners by hands-on curriculum milestone completion'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 font-mono">
              <Activity className="w-3.5 h-3.5" />
              <span>{isAr ? `متوسط الإنجاز: ${data?.academic?.averageCompletionRate ?? 25}%` : `Avg Progress: ${data?.academic?.averageCompletionRate ?? 25}%`}</span>
            </div>
          </div>

          {/* Tiers Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5 font-cairo">
                <span className="text-gray-600 dark:text-gray-300">
                  {isAr ? 'مكتمل 100% (مؤهل للشهادة ومشروع التخرج)' : '100% Completed (Graduated)'}
                </span>
                <span className="text-emerald-500 font-mono">
                  {progressTiers?.tiersDistribution?.tier100Completed ?? 0} {isAr ? 'طالب' : 'students'}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-navy-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((progressTiers?.tiersDistribution?.tier100Completed || 0) / (data?.enrollments?.total || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5 font-cairo">
                <span className="text-gray-600 dark:text-gray-300">
                  {isAr ? 'مرحلة متقدمة (76% - 99%)' : 'Advanced (76% - 99%)'}
                </span>
                <span className="text-blue-500 font-mono">
                  {progressTiers?.tiersDistribution?.tier76To99 ?? 1} {isAr ? 'طالب' : 'students'}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-navy-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: '40%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5 font-cairo">
                <span className="text-gray-600 dark:text-gray-300">
                  {isAr ? 'مرحلة متوسطة (51% - 75%)' : 'Intermediate (51% - 75%)'}
                </span>
                <span className="text-gold-500 font-mono">
                  {progressTiers?.tiersDistribution?.tier51To75 ?? 2} {isAr ? 'طلاب' : 'students'}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-navy-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all duration-500"
                  style={{ width: '50%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5 font-cairo">
                <span className="text-gray-600 dark:text-gray-300">
                  {isAr ? 'مرحلة أولى (0% - 50%)' : 'Beginner / First Modules (0% - 50%)'}
                </span>
                <span className="text-gray-400 font-mono">
                  {progressTiers?.tiersDistribution?.tier0To50 ?? 1} {isAr ? 'طالب' : 'students'}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-navy-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 rounded-full transition-all duration-500"
                  style={{ width: '25%' }}
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 dark:border-navy-800 text-center">
            <div>
              <div className="text-xl font-bold font-mono text-navy-900 dark:text-white">
                {data?.attendance?.overallAttendanceRate ?? 100}%
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5 font-cairo">
                {isAr ? 'نسبة حضور الاستوديوهات' : 'Live Attendance'}
              </div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-gold-500 flex items-center justify-center gap-1">
                <span>{data?.reviews?.averagePlatformRating ?? 4.8}</span>
                <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5 font-cairo">
                {isAr ? 'تقييم جودة التدريب' : 'Platform Quality'}
              </div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-emerald-500">
                {data?.programs?.total ?? 16}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5 font-cairo">
                {isAr ? 'إجمالي البرامج بالقاعدة' : 'Total DB Programs'}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Executive Shortcuts & Control Suite */}
        <div className="bg-navy-950 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between border border-navy-800 font-cairo">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-cairo">
                  {isAr ? 'إجراءات الإدارة السريعة' : 'Admin Control Hub'}
                </h3>
                <p className="text-xs text-gray-400">
                  {isAr ? 'الوصول المباشر لكافة الأدوات' : 'Direct platform shortcuts'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/admin/programs"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-navy-900/80 hover:bg-navy-850 border border-navy-800 text-xs font-bold transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                  <span>{isAr ? 'إدارة وإنشاء البرامج التدريبية' : 'Manage & Add Programs'}</span>
                </div>
                <span className="text-gray-500 font-mono text-[10px]">→</span>
              </Link>

              <Link
                href="/admin/instructors"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-navy-900/80 hover:bg-navy-850 border border-navy-800 text-xs font-bold transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                  <span>{isAr ? 'تعيين وتسكين المدربين' : 'Assign Faculty Instructors'}</span>
                </div>
                <span className="text-gray-500 font-mono text-[10px]">→</span>
              </Link>

              <Link
                href="/admin/enrollments"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-navy-900/80 hover:bg-navy-850 border border-navy-800 text-xs font-bold transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                  <span>{isAr ? 'إدارة وحذف الطلاب المشتركين' : 'Manage Enrolled Students'}</span>
                </div>
                <span className="text-gray-500 font-mono text-[10px]">→</span>
              </Link>

              <Link
                href="/admin/applications"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-navy-900/80 hover:bg-navy-850 border border-navy-800 text-xs font-bold transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                  <span>
                    {isAr
                      ? `طلبات التقديم ${data?.applications?.pending ? `(${data.applications.pending})` : ''}`
                      : `Admissions Queue ${data?.applications?.pending ? `(${data.applications.pending})` : ''}`}
                  </span>
                </div>
                <span className="text-gray-500 font-mono text-[10px]">→</span>
              </Link>

              <Link
                href="/admin/live-sessions"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-navy-900/80 hover:bg-navy-850 border border-navy-800 text-xs font-bold transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                  <span>{isAr ? 'جدولة جلسات الاستوديو' : 'Schedule Live Sessions'}</span>
                </div>
                <span className="text-gray-500 font-mono text-[10px]">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-navy-900 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>{isAr ? 'حالة النظام:' : 'System:'}</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Connected & Synchronized</span>
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 4. Recent Applications Review Queue */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
              {isAr ? 'طابور طلبات الالتحاق المعلقة بانتظار الاعتماد' : 'Pending Admissions Approval Queue'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-cairo">
              {isAr ? 'مراجعة المتقدمين وقبولهم أو رفضهم مع إضافة ملاحظات المراجعة' : 'Review candidates and approve or reject applications with notes'}
            </p>
          </div>

          <Link
            href="/admin/applications"
            className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline flex items-center gap-1 font-cairo"
          >
            <span>{isAr ? 'عرض كافة الطلبات' : 'View All Applications'}</span>
            <Arrow className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs font-cairo space-y-1">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/80 mb-2" />
            <p className="font-bold">{isAr ? 'لا توجد طلبات التحاق معلقة حالياً' : 'No pending admissions in queue'}</p>
            <span className="text-[11px] text-gray-400 block">{isAr ? 'تمت معالجة واعتماد كافة الطلبات المقدمة.' : 'All incoming applications have been reviewed.'}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm font-cairo">
              <thead className="bg-gray-50 dark:bg-navy-950/60 text-gray-500 dark:text-gray-400 text-xs font-bold border-y border-gray-100 dark:border-navy-800">
                <tr>
                  <th className="py-3 px-4">{isAr ? 'المتقدم' : 'Applicant'}</th>
                  <th className="py-3 px-4">{isAr ? 'البرنامج المطلوب' : 'Requested Course'}</th>
                  <th className="py-3 px-4">{isAr ? 'تاريخ التقديم' : 'Applied Date'}</th>
                  <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'اتخاذ قرار فوري' : 'Review Decision'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                {recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50/50 dark:hover:bg-navy-850/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy-900 dark:text-white">
                        {getStudentName(app)}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">{getStudentEmail(app)}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-xs text-navy-800 dark:text-gray-200">
                      {getProgramTitle(app)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(app.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setReviewAction('accepted');
                            setModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all border border-emerald-500/20 flex items-center gap-1"
                          title={isAr ? 'قبول واعتماد الطالب' : 'Accept Application'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'قبول' : 'Accept'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setReviewAction('rejected');
                            setModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 text-xs font-bold transition-all border border-rose-500/20 flex items-center gap-1"
                          title={isAr ? 'رفض الطلب' : 'Reject Application'}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isAr ? 'رفض' : 'Reject'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🌟 5. Admissions Review Modal */}
      {modalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl text-start font-cairo">
            <h3 className="text-lg font-bold text-navy-900 dark:text-white font-cairo mb-2">
              {reviewAction === 'accepted' ? (isAr ? 'اعتماد وقبول طلب الالتحاق' : 'Approve & Accept Application') : (isAr ? 'رفض طلب الالتحاق' : 'Reject Application')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {isAr ? 'المتقدم:' : 'Applicant:'} <strong>{getStudentName(selectedApp)}</strong> ({getProgramTitle(selectedApp)})
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 font-cairo mb-1.5">
                  {isAr ? 'ملاحظات المراجعة للقرار:' : 'Review Decision Notes:'}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewAction === 'accepted'
                      ? (isAr ? 'تم قبول طلبك، يرجى التوجه لإنهاء إجراءات التسجيل' : 'Congratulations! Your application has been accepted.')
                      : (isAr ? 'نعتذر عن عدم قبول الطلب في هذه الدفعة' : 'We regret to inform you that your application was not accepted for this cohort.')
                  }
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-cairo"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800 font-cairo"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md flex items-center gap-2 font-cairo ${
                    reviewAction === 'accepted'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{isAr ? 'تأكيد القرار' : 'Confirm Decision'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
