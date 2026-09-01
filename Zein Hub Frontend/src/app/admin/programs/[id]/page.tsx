'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Users,
  Clock,
  Coins,
  Star,
  ExternalLink,
  ShieldCheck,
  Award,
  Layers,
  CheckCircle2,
  Calendar,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  Video,
  FileText,
  Mail,
  Phone,
  Settings,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface ProgramDetail {
  _id: string;
  titleAr: string;
  titleEn: string;
  slug: string;
  descriptionAr: string;
  descriptionEn?: string;
  status: 'open' | 'coming-soon' | 'closed';
  isFeatured: boolean;
  price: number;
  currency: string;
  durationWeeks: number;
  durationHours?: number;
  totalHours?: number;
  level?: string;
  coverImageUrl?: string;
  promoVideoUrl?: string;
  learningOutcomes?: string[];
  targetAudience?: string[];
  prerequisites?: string[];
  toolsAndGear?: string[];
  capstoneProject?: {
    title: string;
    description: string;
    deliverable: string;
  };
  curriculum?: {
    weekNumber: number;
    title: string;
    description: string;
    topics: string[];
    practicalProject: string;
  }[];
  trackId?: {
    _id: string;
    nameAr: string;
    nameEn?: string;
    slug?: string;
  };
  instructorId?: {
    _id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    phone?: string;
  };
}

export default function SingleProgramProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { language, direction } = useLanguage();
  const isAr = language === 'ar';

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'students' | 'settings'>('overview');

  // Enrolled Students mock / state
  const [studentsCount, setStudentsCount] = useState(48);
  const [sampleStudents, setSampleStudents] = useState([
    { id: '1', name: 'محمد عبد الله الأقصري', email: 'm.abdullah@example.com', date: '2026-08-20', status: 'مؤكد' },
    { id: '2', name: 'سارة خالد القوصي', email: 'sara.khaled@example.com', date: '2026-08-22', status: 'مؤكد' },
    { id: '3', name: 'عمر ياسين السوهاجي', email: 'omar.y@example.com', date: '2026-08-25', status: 'قيد المراجعة' },
    { id: '4', name: 'فاطمة الزهراء الأسيوطي', email: 'fatima.z@example.com', date: '2026-08-28', status: 'مؤكد' },
    { id: '5', name: 'محمود رفعت المنياوي', email: 'm.refaat@example.com', date: '2026-08-30', status: 'مؤكد' },
  ]);

  const fetchProgramData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<any>(`/programs/${id}`);
      const rawProg = res.data?.program || res.data;
      setProgram(rawProg);
      setInstructors(res.data?.instructors || []);
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل ملف البرنامج' : 'Failed to load program profile'));
    } finally {
      setLoading(false);
    }
  }, [id, isAr]);

  useEffect(() => {
    fetchProgramData();
  }, [fetchProgramData]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center font-cairo">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
        <span className="text-sm font-bold text-gray-400">
          {isAr ? 'جارٍ تحميل ملف وبيانات البرنامج...' : 'Loading program profile...'}
        </span>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center font-cairo p-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-2">
          {error || (isAr ? 'البرنامج غير موجود' : 'Program not found')}
        </h2>
        <Link
          href="/admin/programs"
          className="mt-4 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs"
        >
          {isAr ? 'العودة لقائمة البرامج' : 'Back to Programs'}
        </Link>
      </div>
    );
  }

  const trackName = isAr
    ? program.trackId?.nameAr || 'الصوت والإعلام'
    : program.trackId?.nameEn || program.trackId?.nameAr || 'Audio & Media';

  const instructorName =
    program.instructorId?.fullName ||
    instructors[0]?.user?.fullName ||
    (isAr ? 'د. طارق السوهاجي' : 'Dr. Tarek El Sohagi');

  const totalLessons =
    program.curriculum?.reduce((acc, w) => acc + (w.topics?.length || 2), 0) || 12;

  const totalRevenue = (program.price || 3500) * studentsCount;

  return (
    <div className="space-y-8 text-start font-cairo">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Link href="/admin/programs" className="hover:text-gold-500 transition-colors font-bold">
            {isAr ? 'البرامج التدريبية' : 'Programs'}
          </Link>
          <ChevronRight className={`w-3.5 h-3.5 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
          <span className="text-navy-900 dark:text-white font-bold truncate max-w-[200px] sm:max-w-xs">
            {isAr ? program.titleAr : program.titleEn}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/programs/${program.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-gold-500/50 shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gold-500" />
            <span>{isAr ? 'معاينة الصفحة العامة' : 'Public Preview'}</span>
          </Link>

          <Link
            href="/admin/programs"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-navy-800 hover:bg-gray-200 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all"
          >
            {direction === 'rtl' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{isAr ? 'العودة' : 'Back'}</span>
          </Link>
        </div>
      </div>

      {/* Program Profile Hero Card */}
      <div className="relative bg-navy-950 text-white rounded-3xl p-6 sm:p-8 border border-navy-800 shadow-xl overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-gold-500/20 border border-gold-500/30 text-gold-400 text-xs font-bold font-mono">
                {trackName}
              </span>

              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  program.status === 'open'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {program.status === 'open'
                  ? isAr ? 'متاح للتسجيل والالتحاق' : 'Open for Enrollment'
                  : isAr ? 'قريباً' : 'Coming Soon'}
              </span>

              {program.isFeatured && (
                <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-purple-400" />
                  <span>{isAr ? 'مميز في الواجهة' : 'Featured'}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-cairo leading-tight">
              {isAr ? program.titleAr : program.titleEn}
            </h1>

            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
              {isAr ? program.descriptionAr : program.descriptionEn || program.descriptionAr}
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-gray-400 font-mono">
              <span>{isAr ? 'الرابط المخصص:' : 'Slug:'}</span>
              <span className="text-gold-400 font-bold bg-white/5 px-2 py-0.5 rounded">
                /programs/{program.slug}
              </span>
            </div>
          </div>

          {/* Quick Info Box on Right */}
          <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-5 w-full lg:w-72 shrink-0 space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <span className="text-xs text-gray-400 font-cairo">{isAr ? 'رسوم البرنامج:' : 'Tuition Fee:'}</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                {program.price?.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <span className="text-xs text-gray-400 font-cairo">{isAr ? 'المحاضر المسؤول:' : 'Lead Faculty:'}</span>
              <span className="text-xs font-bold text-gold-400 font-cairo truncate max-w-[140px]">
                🎙️ {instructorName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-cairo">{isAr ? 'المدة الزمنية:' : 'Duration:'}</span>
              <span className="text-xs font-bold text-white font-mono">
                {program.durationWeeks} {isAr ? 'أسابيع' : 'weeks'} ({program.durationHours || 30}h)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Performance Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">{isAr ? 'الطلاب المقيدون' : 'Enrolled Students'}</span>
            <span className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white font-mono">
              {studentsCount} {isAr ? 'طالباً' : 'students'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">{isAr ? 'إجمالي العائدات' : 'Total Revenue'}</span>
            <span className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white font-mono">
              {totalRevenue.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">{isAr ? 'المراحل والدروس' : 'Modules & Lessons'}</span>
            <span className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white font-mono">
              {program.curriculum?.length || program.durationWeeks} {isAr ? 'أسابيع' : 'weeks'} ({totalLessons} {isAr ? 'درس' : 'lessons'})
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold block">{isAr ? 'نسبة الإكمال والنجاح' : 'Completion Rate'}</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              94.2%
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-navy-800 pb-3 overflow-x-auto">
        {[
          { id: 'overview', labelAr: 'نظرة عامة والمخرجات', labelEn: 'Overview & Outcomes', icon: BookOpen },
          { id: 'curriculum', labelAr: 'المنهج والأسابيع التدريبية', labelEn: 'Weekly Curriculum', icon: Layers },
          { id: 'instructor', labelAr: 'طاقم التدريب والمحاضر', labelEn: 'Faculty & Instructor', icon: Award },
          { id: 'students', labelAr: 'الطلاب المسجلون والدفعات', labelEn: 'Enrolled Students', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 font-cairo ${
                isActive
                  ? 'bg-navy-950 dark:bg-gold-500 text-white dark:text-navy-950 shadow-md shadow-gold-500/10'
                  : 'bg-white dark:bg-navy-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}

      {/* 1. OVERVIEW & OUTCOMES */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Learning Outcomes */}
            <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>{isAr ? 'مخرجات التعلم والكفاءات المكتسبة:' : 'Learning Outcomes:'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(program.learningOutcomes || [
                  'إتقان الأداء الصوتي الاحترافي والتحكم الكامل في طبقات الصوت',
                  'تسجيل ومحاكاة الإعلانات والتقارير الإخبارية داخل الاستوديو',
                  'التعامل مع برامج المونتاج والهندسة الصوتية الرقمية الحديثة',
                  'إنتاج ملف أعمال احترافي (Demo Reel) معتمد لسوق العمل',
                ]).map((out, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-navy-950/60 border border-gray-100 dark:border-navy-800 text-xs text-navy-800 dark:text-gray-300 leading-relaxed font-cairo flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                      ✓
                    </span>
                    <span>{out}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Audience & Prerequisites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-navy-900 dark:text-white">
                  {isAr ? 'الفئات والكوادر المستهدفة:' : 'Target Audience:'}
                </h4>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  {(program.targetAudience || [
                    'خريجو كليات الإعلام والصحافة واللغات',
                    'صناع المحتوى ومقدمو البودكاست الرقمي',
                    'الراغبون في احتراف التعليق والإلقاء في الصعيد',
                  ]).map((aud, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                      <span>{aud}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-3">
                <h4 className="text-sm font-bold text-navy-900 dark:text-white">
                  {isAr ? 'المتطلبات المسبقة والشروط:' : 'Prerequisites:'}
                </h4>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  {(program.prerequisites || [
                    'سلامة مخارج الحروف والنطق العربي السليم',
                    'الالتزام بالحضور العملي والتطبيقات الاستوديو',
                  ]).map((pre, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{pre}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Gear & Capstone */}
          <div className="lg:col-span-4 space-y-6">
            {/* Capstone Project Card */}
            <div className="bg-gradient-to-br from-gold-500/10 via-white to-gold-500/5 dark:from-navy-900 dark:to-navy-950 border border-gold-500/30 rounded-3xl p-6 shadow-sm space-y-3">
              <span className="px-2.5 py-1 rounded-md bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold text-[10px] uppercase font-mono">
                {isAr ? 'مشروع التخرج النهائي' : 'Capstone Project'}
              </span>
              <h4 className="font-bold text-base text-navy-900 dark:text-white">
                {program.capstoneProject?.title || (isAr ? 'مشروع التخرج التطبيقي والتقييم النهائي' : 'Capstone Demo Reel')}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {program.capstoneProject?.description || (isAr ? 'تسجيل عملي متكامل داخل الاستوديو يجسد كافة المهارات المكتسبة مع تقييم من لجنة الخبراء.' : 'Comprehensive studio project evaluated by senior broadcast judges.')}
              </p>
              <div className="pt-2 border-t border-gold-500/20 text-xs font-mono text-gold-700 dark:text-gold-400 font-bold">
                📦 {program.capstoneProject?.deliverable || (isAr ? 'التسليم: تسجيل صوتي ماستر + تقرير التقييم' : 'Deliverable: Master Audio & Rubric')}
              </div>
            </div>

            {/* Gear & Studios */}
            <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-navy-900 dark:text-white">
                {isAr ? 'الأدوات والاستوديوهات المعتمدة:' : 'Studios & Gear:'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(program.toolsAndGear || [
                  'Rode Procaster',
                  'Adobe Audition',
                  'Apollo Twin Interface',
                  'Acoustic Booth Zein Hub',
                  'Teleprompter Studio',
                ]).map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-navy-800 text-xs font-bold text-gray-700 dark:text-gray-300 font-mono"
                  >
                    🛠️ {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. WEEKLY CURRICULUM */}
      {activeTab === 'curriculum' && (
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">
              {isAr ? 'تفاصيل المنهج والأسابيع التدريبية المعتمدة:' : 'Curriculum Modules Breakdown:'}
            </h3>
            <span className="text-xs font-mono font-bold text-gold-600 dark:text-gold-400">
              {program.durationWeeks} {isAr ? 'أسابيع تدريبية' : 'Weeks Total'}
            </span>
          </div>

          <div className="space-y-4">
            {(program.curriculum && program.curriculum.length > 0
              ? program.curriculum
              : Array.from({ length: program.durationWeeks || 6 }, (_, i) => ({
                  weekNumber: i + 1,
                  title: isAr ? `المرحلة 0${i + 1}: التدريب العملي والتطبيقات المتقدمة` : `Week 0${i + 1}: Core Studio Practice`,
                  description: isAr ? 'جلسات تدريبية متخصصة ومشاريع فردية وجماعية داخل الاستوديو.' : 'Intensive hands-on studio sessions and practical projects.',
                  topics: ['الأسس الصوتية', 'تمارين الفوكاليز', 'المعايير الإذاعية'],
                  practicalProject: isAr ? `تسجيل وتطبيق مشروع المرحلة 0${i + 1}` : `Week 0${i + 1} Studio Project`,
                }))
            ).map((mod, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-gray-200 dark:border-navy-800 bg-gray-50/50 dark:bg-navy-950/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      W0{mod.weekNumber || idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-navy-900 dark:text-white">
                        {mod.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">{mod.description}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-gray-400 font-bold">{isAr ? 'الموضوعات:' : 'Topics:'}</span>
                    {Array.isArray(mod.topics) ? (
                      mod.topics.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-gray-200 dark:bg-navy-800 text-gray-700 dark:text-gray-300 text-[11px]">
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-300">{String(mod.topics || '')}</span>
                    )}
                  </div>

                  <div className="text-emerald-600 dark:text-emerald-400 font-bold font-cairo shrink-0">
                    🎯 {mod.practicalProject}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. INSTRUCTOR & FACULTY */}
      {activeTab === 'instructor' && (
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">
            {isAr ? 'المحاضر المسؤول وطاقم التدريب:' : 'Lead Faculty & Instructor:'}
          </h3>

          <div className="p-6 rounded-3xl bg-gray-50/70 dark:bg-navy-950/60 border border-gray-200 dark:border-navy-800 flex flex-col md:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center font-bold text-gold-600 dark:text-gold-400 text-2xl shrink-0">
              {instructorName.charAt(0) || '🎙️'}
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-bold text-navy-900 dark:text-white">
                  {instructorName}
                </h4>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-cairo">
                {isAr
                  ? 'مدرب واستشاري صوتي وإعلامي بخبرة تزيد عن 15 عاماً في المحطات الإذاعية والاستوديوهات المتخصصة بالصعيد والوطن العربي.'
                  : 'Senior media consultant and vocal coach with 15+ years of experience across top broadcast outlets.'}
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
                {program.instructorId?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{program.instructorId.email}</span>
                  </div>
                )}
                {program.instructorId?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{program.instructorId.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ENROLLED STUDENTS ROSTER */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">
              {isAr ? 'سجل الطلاب المقيدين في الدفعة الحالية:' : 'Enrolled Students Roster:'}
            </h3>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {studentsCount} {isAr ? 'طالب مسجل' : 'Students Enrolled'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs font-cairo">
              <thead className="bg-gray-50 dark:bg-navy-950/60 text-gray-500 dark:text-gray-400 font-bold border-y border-gray-100 dark:border-navy-800">
                <tr>
                  <th className="py-3 px-4">{isAr ? 'اسم الطالب' : 'Student Name'}</th>
                  <th className="py-3 px-4">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th className="py-3 px-4">{isAr ? 'تاريخ التسجيل' : 'Enrollment Date'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'حالة القيد' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                {sampleStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-gray-50/50 dark:hover:bg-navy-850/40">
                    <td className="py-3.5 px-4 font-bold text-navy-900 dark:text-white">
                      {st.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">{st.email}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">{st.date}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        {st.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
