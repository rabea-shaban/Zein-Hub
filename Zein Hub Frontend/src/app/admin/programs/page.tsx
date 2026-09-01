'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { createProgramSchema, CreateProgramFormData } from '@/lib/validations/admin.schemas';
import { FormField, inputClass } from '@/components/ui/FormField';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  PlusCircle,
  Search,
  Star,
  Loader2,
  Clock,
  Coins,
  AlertCircle,
  X,
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
  Layers,
  BookOpen,
  CheckCircle2,
  Award,
  Wrench,
  GraduationCap,
  Plus,
} from 'lucide-react';

interface ProgramItem {
  _id: string;
  titleAr: string;
  titleEn: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  status: 'open' | 'coming-soon' | 'closed';
  isFeatured: boolean;
  price: number;
  level: string;
  durationHours: number;
  durationWeeks: number;
  learningOutcomes?: string[];
  learningOutcomesEn?: string[];
  curriculum?: {
    weekNumber: number;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    topics: string[];
    topicsEn?: string[];
    practicalProject: string;
    practicalProjectEn?: string;
  }[];
  toolsAndGear?: string[];
  toolsAndGearEn?: string[];
  capstoneProject?: {
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    deliverable: string;
    deliverableEn?: string;
  };
  prerequisites?: string[];
  prerequisitesEn?: string[];
  targetAudience?: string[];
  targetAudienceEn?: string[];
  coverImageUrl?: string;
  track?: {
    _id: string;
    nameAr: string;
    nameEn?: string;
    slug?: string;
  };
  trackId?: {
    _id: string;
    nameAr: string;
    nameEn?: string;
    slug?: string;
  };
  instructorId?: {
    _id?: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
  } | string;
}

interface TrackItem {
  _id: string;
  nameAr: string;
  nameEn?: string;
  slug?: string;
}

interface InstructorOption {
  _id: string;
  fullName?: string;
  email?: string;
  userId?: {
    _id: string;
    fullName: string;
    email: string;
  };
}

export default function AdminProgramsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [instructorsList, setInstructorsList] = useState<InstructorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedViewProgram, setSelectedViewProgram] = useState<ProgramItem | null>(null);
  const [selectedEditProgram, setSelectedEditProgram] = useState<ProgramItem | null>(null);
  const [selectedDeleteProgram, setSelectedDeleteProgram] = useState<ProgramItem | null>(null);

  // Selected Instructor for Create Form
  const [createInstructorId, setCreateInstructorId] = useState<string>('');

  // Active Tab in Edit Modal
  const [editTab, setEditTab] = useState<'basic' | 'outcomes' | 'curriculum' | 'capstone'>('basic');

  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Create Form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    setValue: setValueCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
  } = useForm<CreateProgramFormData>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: {
      titleAr: '',
      titleEn: '',
      slug: '',
      trackId: '',
      descriptionAr: '',
      descriptionEn: '',
      durationHours: 30,
      durationWeeks: 6,
      level: 'intermediate',
      status: 'open',
      price: 3500,
    },
  });

  // Comprehensive Edit Form State
  const [editFormData, setEditFormData] = useState<{
    titleAr: string;
    titleEn: string;
    slug: string;
    trackId: string;
    descriptionAr: string;
    descriptionEn: string;
    durationHours: number;
    durationWeeks: number;
    level: string;
    status: 'open' | 'coming-soon' | 'closed';
    price: number;
    instructorId: string;
    learningOutcomesText: string;
    targetAudienceText: string;
    prerequisitesText: string;
    toolsAndGearText: string;
    capstoneTitle: string;
    capstoneDesc: string;
    capstoneDeliverable: string;
    curriculumWeeks: {
      weekNumber: number;
      title: string;
      description: string;
      topics: string;
      practicalProject: string;
    }[];
  }>({
    titleAr: '',
    titleEn: '',
    slug: '',
    trackId: '',
    descriptionAr: '',
    descriptionEn: '',
    durationHours: 30,
    durationWeeks: 6,
    level: 'intermediate',
    status: 'open',
    price: 3500,
    instructorId: '',
    learningOutcomesText: '',
    targetAudienceText: '',
    prerequisitesText: '',
    toolsAndGearText: '',
    capstoneTitle: '',
    capstoneDesc: '',
    capstoneDeliverable: '',
    curriculumWeeks: [],
  });

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [progRes, trackRes, instRes] = await Promise.all([
        api.get<ProgramItem[]>('/programs', {
          params: {
            limit: 50,
            search: search || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
          },
        }),
        api.get<TrackItem[]>('/tracks'),
        api.get<any[]>('/instructors/admin/all', { params: { limit: 50 } }),
      ]);

      const list = progRes.data || [];
      // Sort open programs first
      const sorted = [...list].sort((a, b) => {
        if (a.status === 'open' && b.status !== 'open') return -1;
        if (a.status !== 'open' && b.status === 'open') return 1;
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });

      setPrograms(sorted);
      const tracksList = trackRes.data || [];
      setTracks(tracksList);
      setInstructorsList(instRes.data || []);
      if (tracksList.length > 0) {
        setValueCreate('trackId', tracksList[0]._id);
      }
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل البرامج التدريبية' : 'Failed to load programs'));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, setValueCreate, isAr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (programId: string, newStatus: string) => {
    try {
      await api.patch(`/programs/${programId}/status`, { status: newStatus });
      toast.success(isAr ? 'تم تغيير حالة البرنامج بنجاح' : 'Program status updated');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل تغيير حالة البرنامج' : 'Failed to update program status'));
    }
  };

  const handleToggleFeatured = async (programId: string) => {
    try {
      await api.patch(`/programs/${programId}/featured`);
      toast.success(isAr ? 'تم تحديث حالة تمييز البرنامج' : 'Featured status updated');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل تغيير حالة التمييز' : 'Failed to toggle featured status'));
    }
  };

  // Create Submit
  const onSubmitCreate = async (data: CreateProgramFormData) => {
    try {
      await api.post('/programs', {
        ...data,
        instructorId: createInstructorId || undefined,
      });
      toast.success(isAr ? 'تم إنشاء ونشر البرنامج التدريبي بنجاح' : 'Program created successfully');
      setIsCreateModalOpen(false);
      resetCreate();
      setCreateInstructorId('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل إنشاء البرنامج التدريبي' : 'Failed to create program'));
    }
  };

  // Open Edit Modal with full tabs populated
  const handleOpenEdit = (prog: ProgramItem) => {
    const tr = prog.trackId || prog.track;
    const instId =
      typeof prog.instructorId === 'object'
        ? prog.instructorId?._id || ''
        : prog.instructorId || '';

    setSelectedEditProgram(prog);
    setEditTab('basic');

    const defaultWeeks = Array.from({ length: prog.durationWeeks || 4 }, (_, i) => ({
      weekNumber: i + 1,
      title: `المرحلة 0${i + 1}: التدريب العملي والتطبيقات`,
      description: `تطبيقات مكثفة ومحاكاة عملية داخل الاستوديو.`,
      topics: 'التمارين المباشرة، المعايير المهنية، التقييم',
      practicalProject: `تسجيل وتطبيق مشروع المرحلة 0${i + 1}`,
    }));

    const existingWeeks =
      prog.curriculum && prog.curriculum.length > 0
        ? prog.curriculum.map((w) => ({
            weekNumber: w.weekNumber,
            title: w.title,
            description: w.description,
            topics: Array.isArray(w.topics) ? w.topics.join('، ') : String(w.topics || ''),
            practicalProject: w.practicalProject,
          }))
        : defaultWeeks;

    setEditFormData({
      titleAr: prog.titleAr || '',
      titleEn: prog.titleEn || '',
      slug: prog.slug || '',
      trackId: typeof tr === 'object' ? tr?._id || tracks[0]?._id : String(tr || tracks[0]?._id || ''),
      instructorId: instId,
      descriptionAr: prog.descriptionAr || '',
      descriptionEn: prog.descriptionEn || '',
      durationHours: prog.durationHours || 30,
      durationWeeks: prog.durationWeeks || 6,
      level: prog.level || 'intermediate',
      status: prog.status || 'open',
      price: prog.price || 3500,
      learningOutcomesText: (prog.learningOutcomes || [
        'إتقان المهارات العملية والتطبيقية المتخصصة',
        'إنتاج مشروع تخرج احترافي معتمد لسوق العمل',
      ]).join('\n'),
      targetAudienceText: (prog.targetAudience || [
        'خريجو الإعلام والصحافة وصناع المحتوى',
        'الراغبون في احتراف المجال العملي بالصعيد',
      ]).join('\n'),
      prerequisitesText: (prog.prerequisites || [
        'الشغف بالتعلم والالتزام بحضور التدريبات العملية',
      ]).join('\n'),
      toolsAndGearText: (prog.toolsAndGear || [
        'استوديوهات Zein Hub الصوتية والمرئية',
        'البرمجيات والأجهزة الاحترافية',
      ]).join('\n'),
      capstoneTitle: prog.capstoneProject?.title || 'مشروع التخرج التطبيقي المعتمد',
      capstoneDesc:
        prog.capstoneProject?.description ||
        'مشروع عملي متكامل يجسد كافة المهارات المكتسبة خلال البرنامج التدريبي.',
      capstoneDeliverable:
        prog.capstoneProject?.deliverable ||
        'ملف المشروع النهائي + بطاقة تقييم الكفاءة المهنية المعتمدة',
      curriculumWeeks: existingWeeks,
    });
  };

  // Add a new week in curriculum editor
  const handleAddWeek = () => {
    const nextNum = editFormData.curriculumWeeks.length + 1;
    setEditFormData({
      ...editFormData,
      curriculumWeeks: [
        ...editFormData.curriculumWeeks,
        {
          weekNumber: nextNum,
          title: `المرحلة 0${nextNum}: التدريب العملي المتقدم`,
          description: `جلسات تدريبية متخصصة ومشاريع فردية وجماعية.`,
          topics: 'التطبيقات العملية، معايير الإنتاج، تقييم الأداء',
          practicalProject: `مشروع وتكليف المرحلة 0${nextNum}`,
        },
      ],
    });
  };

  // Remove a week from curriculum editor
  const handleRemoveWeek = (index: number) => {
    const updated = editFormData.curriculumWeeks.filter((_, i) => i !== index);
    setEditFormData({
      ...editFormData,
      curriculumWeeks: updated.map((w, idx) => ({ ...w, weekNumber: idx + 1 })),
    });
  };

  // Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditProgram) return;

    setEditSubmitting(true);
    try {
      const payload = {
        titleAr: editFormData.titleAr,
        titleEn: editFormData.titleEn,
        slug: editFormData.slug,
        trackId: editFormData.trackId,
        instructorId: editFormData.instructorId || undefined,
        descriptionAr: editFormData.descriptionAr,
        descriptionEn: editFormData.descriptionEn,
        durationHours: Number(editFormData.durationHours),
        durationWeeks: Number(editFormData.durationWeeks),
        level: editFormData.level,
        status: editFormData.status,
        price: Number(editFormData.price),
        learningOutcomes: editFormData.learningOutcomesText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        targetAudience: editFormData.targetAudienceText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        prerequisites: editFormData.prerequisitesText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        toolsAndGear: editFormData.toolsAndGearText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        capstoneProject: {
          title: editFormData.capstoneTitle,
          description: editFormData.capstoneDesc,
          deliverable: editFormData.capstoneDeliverable,
        },
        curriculum: editFormData.curriculumWeeks.map((w) => ({
          weekNumber: w.weekNumber,
          title: w.title,
          description: w.description,
          topics: w.topics
            .split(/[,،]+/)
            .map((t) => t.trim())
            .filter(Boolean),
          practicalProject: w.practicalProject,
        })),
      };

      await api.patch(`/programs/${selectedEditProgram._id}`, payload);
      toast.success(isAr ? 'تم حفظ كافة تعديلات البرنامج بنجاح' : 'Program changes saved successfully');
      setSelectedEditProgram(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل حفظ تعديلات البرنامج' : 'Failed to save program changes'));
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete Submit
  const handleDeleteConfirm = async () => {
    if (!selectedDeleteProgram) return;

    setDeleteSubmitting(true);
    try {
      await api.delete(`/programs/${selectedDeleteProgram._id}`);
      toast.success(isAr ? 'تم حذف البرنامج التدريبي بنجاح' : 'Program deleted successfully');
      setSelectedDeleteProgram(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل حذف البرنامج التدريبي' : 'Failed to delete program'));
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-cairo">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'إدارة البرامج التدريبية' : 'Training Programs Management'}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-cairo">
            {isAr
              ? 'استعراض وإنشاء وتعديل المناهج والمخرجات التعليمية والأسابيع التدريبية وحذف البرامج'
              : 'View, create, edit curriculum, learning outcomes, capstone, and manage live programs'}
          </p>
        </div>

        <button
          onClick={() => {
            if (tracks.length > 0) {
              setValueCreate('trackId', tracks[0]._id);
            }
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs font-cairo shadow-md shadow-gold-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAr ? 'إضافة برنامج تدريبي جديد' : 'Add New Program'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Strip */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث باسم البرنامج...' : 'Search program title...'}
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:border-gold-500 text-navy-900 dark:text-white font-cairo"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { key: 'all', ar: 'كافة البرامج', en: 'All' },
            { key: 'open', ar: 'متاح للتسجيل', en: 'Open' },
            { key: 'coming-soon', ar: 'قريباً', en: 'Coming Soon' },
            { key: 'closed', ar: 'مغلق', en: 'Closed' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 font-cairo ${
                statusFilter === st.key
                  ? 'bg-navy-950 dark:bg-gold-500 text-white dark:text-navy-950'
                  : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {isAr ? st.ar : st.en}
            </button>
          ))}
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
            <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل البرامج...' : 'Loading programs...'}</span>
          </div>
        ) : programs.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm font-cairo">
            {isAr ? 'لا توجد برامج تدريبية مطابقة لخيارات البحث' : 'No programs found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-gray-50 dark:bg-navy-950/60 text-gray-500 dark:text-gray-400 text-xs font-bold border-y border-gray-100 dark:border-navy-800 font-cairo">
                <tr>
                  <th className="py-3.5 px-4">{isAr ? 'البرنامج التدريبي' : 'Program'}</th>
                  <th className="py-3.5 px-4">{isAr ? 'المسار والتخصص' : 'Track'}</th>
                  <th className="py-3.5 px-4">{isAr ? 'المدة والرسوم' : 'Duration & Price'}</th>
                  <th className="py-3.5 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-center">{isAr ? 'تمييز في الواجهة' : 'Featured'}</th>
                  <th className="py-3.5 px-4 text-center">{isAr ? 'تغيير الحالة' : 'Change Status'}</th>
                  <th className="py-3.5 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                {programs.map((prog) => {
                  const tr = prog.trackId || prog.track;
                  const trackName = isAr
                    ? tr?.nameAr || 'تخصص عام'
                    : tr?.nameEn || tr?.nameAr || 'General Track';

                  return (
                    <tr
                      key={prog._id}
                      className="hover:bg-gray-50/50 dark:hover:bg-navy-850/40 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-bold text-navy-900 dark:text-white font-cairo">
                          {isAr ? prog.titleAr : prog.titleEn || prog.titleAr}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{prog.slug}</div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-xs text-gold-600 dark:text-gold-400 font-cairo">
                        <div>{trackName}</div>
                        {prog.instructorId ? (
                          <div className="text-[11px] font-bold text-navy-900 dark:text-gray-200 flex items-center gap-1 mt-1 font-cairo bg-gold-500/10 px-2 py-0.5 rounded-lg border border-gold-500/20 w-fit">
                            <span>🎙️ {typeof prog.instructorId === 'object' ? (prog.instructorId.fullName || prog.instructorId.email) : 'محاضر معتمد'}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-cairo block mt-0.5">
                            {isAr ? 'لم يعين مدرب بعد' : 'No instructor'}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-gray-600 dark:text-gray-300 font-cairo">
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {prog.durationWeeks} {isAr ? 'أسابيع' : 'weeks'} ({prog.durationHours || 30}{' '}
                            {isAr ? 'ساعة' : 'hrs'})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          <Coins className="w-3.5 h-3.5" />
                          <span>
                            {prog.price} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={prog.status} />
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(prog._id)}
                          className={`p-2 rounded-xl border transition-all ${
                            prog.isFeatured
                              ? 'bg-gold-500/20 text-gold-500 border-gold-500/30 shadow-sm'
                              : 'text-gray-400 border-gray-200 dark:border-navy-800 hover:text-gold-500'
                          }`}
                          title={
                            prog.isFeatured
                              ? isAr
                                ? 'إلغاء التمييز'
                                : 'Unfeature'
                              : isAr
                              ? 'تمييز في الواجهة'
                              : 'Feature'
                          }
                        >
                          <Star className={`w-4 h-4 ${prog.isFeatured ? 'fill-gold-500' : ''}`} />
                        </button>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <select
                          value={prog.status}
                          onChange={(e) => handleStatusChange(prog._id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs font-bold focus:outline-none focus:border-gold-500 text-navy-900 dark:text-white font-cairo cursor-pointer"
                        >
                          <option value="open">{isAr ? 'مفتوح' : 'Open'}</option>
                          <option value="coming-soon">{isAr ? 'قريباً' : 'Coming Soon'}</option>
                          <option value="closed">{isAr ? 'مغلق' : 'Closed'}</option>
                        </select>
                      </td>

                      {/* Actions: View, Edit, Delete */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Dedicated Program Profile Link */}
                          <Link
                            href={`/admin/programs/${prog._id}`}
                            className="p-2 rounded-xl text-gold-600 dark:text-gold-400 bg-gold-500/10 hover:bg-gold-500 hover:text-navy-950 transition-all"
                            title={isAr ? 'فتح بروفيل وملف البرنامج الشامل' : 'Open Program Profile'}
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                          </Link>

                          {/* View Modal Trigger */}
                          <button
                            onClick={() => setSelectedViewProgram(prog)}
                            className="p-2 rounded-xl text-navy-700 dark:text-navy-300 bg-gray-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 transition-all"
                            title={isAr ? 'عرض تفاصيل ومحتوى البرنامج' : 'View Program Details'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Modal Trigger (With Curriculum Builder) */}
                          <button
                            onClick={() => handleOpenEdit(prog)}
                            className="p-2 rounded-xl text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-500 hover:text-white transition-all"
                            title={isAr ? 'تعديل البيانات والمنهج والمخرجات' : 'Edit Program & Curriculum'}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Modal Trigger */}
                          <button
                            onClick={() => setSelectedDeleteProgram(prog)}
                            className="p-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all"
                            title={isAr ? 'حذف البرنامج التدريبي' : 'Delete Program'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1️⃣ Create Program Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl text-start max-h-[90vh] overflow-y-auto font-cairo">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'إنشاء برنامج تدريبي جديد' : 'Create New Program'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate(onSubmitCreate)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label={isAr ? 'عنوان البرنامج بالعربية' : 'Arabic Title'}
                  error={errorsCreate.titleAr?.message}
                  required
                >
                  <input
                    type="text"
                    {...registerCreate('titleAr')}
                    placeholder={isAr ? 'دبلوم التعليق الصوتي والفوكاليز' : 'Arabic title'}
                    className={inputClass(!!errorsCreate.titleAr)}
                  />
                </FormField>

                <FormField
                  label={isAr ? 'عنوان البرنامج بالإنجليزية' : 'English Title'}
                  error={errorsCreate.titleEn?.message}
                  required
                >
                  <input
                    type="text"
                    {...registerCreate('titleEn')}
                    placeholder="Voice-Over & Digital Vocalise"
                    className={inputClass(!!errorsCreate.titleEn)}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label={isAr ? 'الرابط المخصص للبرنامج' : 'Custom Slug'}
                  error={errorsCreate.slug?.message}
                  required
                >
                  <input
                    type="text"
                    {...registerCreate('slug')}
                    placeholder="voice-over-masterclass"
                    className={inputClass(!!errorsCreate.slug)}
                  />
                </FormField>

                <FormField
                  label={isAr ? 'المسار التدريبي' : 'Track'}
                  error={errorsCreate.trackId?.message}
                  required
                >
                  <select {...registerCreate('trackId')} className={inputClass(!!errorsCreate.trackId)}>
                    {tracks.map((t) => (
                      <option key={t._id} value={t._id}>
                        {isAr ? t.nameAr : t.nameEn || t.nameAr}
                      </option>
                    ))}
                  </select>
                </FormField>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 font-cairo">
                    {isAr ? 'المحاضر / المدرب المسؤول' : 'Assigned Instructor'}
                  </label>
                  <select
                    value={createInstructorId}
                    onChange={(e) => setCreateInstructorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-cairo"
                  >
                    <option value="">{isAr ? '— اختر المحاضر المسؤول —' : '— Select Instructor —'}</option>
                    {instructorsList.map((inst) => {
                      const name = inst.fullName || inst.userId?.fullName || inst.email || 'مدرب';
                      return (
                        <option key={inst._id} value={inst.userId?._id || inst._id}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <FormField
                label={isAr ? 'الوصف والتفاصيل بالعربية' : 'Arabic Description'}
                error={errorsCreate.descriptionAr?.message}
                required
              >
                <textarea
                  rows={2}
                  {...registerCreate('descriptionAr')}
                  placeholder={isAr ? 'تدريب احترافي مكثف في استوديوهات الصوت...' : 'Program description...'}
                  className={inputClass(!!errorsCreate.descriptionAr)}
                />
              </FormField>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  label={isAr ? 'المدة (أسابيع)' : 'Duration (Weeks)'}
                  error={errorsCreate.durationWeeks?.message}
                  required
                >
                  <input
                    type="number"
                    min={1}
                    {...registerCreate('durationWeeks', { valueAsNumber: true })}
                    className={inputClass(!!errorsCreate.durationWeeks)}
                  />
                </FormField>

                <FormField
                  label={isAr ? 'إجمالي الساعات' : 'Total Hours'}
                  error={errorsCreate.durationHours?.message}
                  required
                >
                  <input
                    type="number"
                    min={1}
                    {...registerCreate('durationHours', { valueAsNumber: true })}
                    className={inputClass(!!errorsCreate.durationHours)}
                  />
                </FormField>

                <FormField
                  label={isAr ? 'الرسوم (ج.م)' : 'Price (EGP)'}
                  error={errorsCreate.price?.message}
                  required
                >
                  <input
                    type="number"
                    min={0}
                    {...registerCreate('price', { valueAsNumber: true })}
                    className={inputClass(!!errorsCreate.price)}
                  />
                </FormField>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800 font-cairo"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs transition-all shadow-md shadow-gold-500/20 flex items-center gap-2 disabled:opacity-50 font-cairo"
                >
                  {isSubmittingCreate ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{isAr ? 'إنشاء البرنامج التدريبي' : 'Create Program'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2️⃣ View Program Details Modal */}
      {selectedViewProgram && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl text-start max-h-[90vh] overflow-y-auto font-cairo space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold border border-gold-500/20 font-mono">
                  {selectedViewProgram.slug}
                </span>
                <h3 className="text-xl font-extrabold text-navy-900 dark:text-white font-cairo mt-2">
                  {isAr ? selectedViewProgram.titleAr : selectedViewProgram.titleEn || selectedViewProgram.titleAr}
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {selectedViewProgram.titleEn}
                </p>
              </div>

              <button
                onClick={() => setSelectedViewProgram(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-100 dark:border-navy-800 text-center font-cairo">
              <div>
                <span className="text-[10px] text-gray-400 block">{isAr ? 'المدة' : 'Duration'}</span>
                <span className="text-xs font-bold text-navy-900 dark:text-white font-mono">
                  {selectedViewProgram.durationWeeks} {isAr ? 'أسابيع' : 'weeks'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">{isAr ? 'إجمالي الساعات' : 'Total Hours'}</span>
                <span className="text-xs font-bold text-navy-900 dark:text-white font-mono">
                  {selectedViewProgram.durationHours || 30} {isAr ? 'ساعة' : 'hrs'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">{isAr ? 'رسوم التسجيل' : 'Tuition'}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {selectedViewProgram.price} {isAr ? 'ج.م' : 'EGP'}
                </span>
              </div>
            </div>

            {/* Program Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {isAr ? 'نبذة ووصف البرنامج:' : 'Program Description:'}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-slate-50 dark:bg-navy-850 p-4 rounded-2xl border border-slate-100 dark:border-navy-800">
                {isAr
                  ? selectedViewProgram.descriptionAr || 'لا يوجد وصف مدخل لهذا البرنامج.'
                  : selectedViewProgram.descriptionEn || selectedViewProgram.descriptionAr || 'No description available.'}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-navy-800">
              <Link
                href={`/programs/${selectedViewProgram.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
              >
                <span>{isAr ? 'فتح صفحة العرض العامة' : 'Open Public Details Page'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setSelectedViewProgram(null)}
                className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-navy-800 hover:bg-gray-200 dark:hover:bg-navy-700 text-xs font-bold text-navy-900 dark:text-white"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3️⃣ Comprehensive Edit Program Modal (Tabs: Basic, Outcomes, Curriculum, Capstone) */}
      {selectedEditProgram && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl text-start max-h-[90vh] overflow-y-auto font-cairo">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-navy-900 dark:text-white font-cairo">
                  {isAr ? 'تعديل محتوى وتفاصيل البرنامج التدريبي' : 'Edit Program Content & Curriculum'}
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {editFormData.slug}
                </p>
              </div>
              <button
                onClick={() => setSelectedEditProgram(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 pb-4 mb-6 border-b border-gray-100 dark:border-navy-800 overflow-x-auto">
              {[
                { id: 'basic', labelAr: '1. البيانات الأساسية', labelEn: '1. Basic Info', icon: BookOpen },
                { id: 'outcomes', labelAr: '2. المخرجات والفئات', labelEn: '2. Outcomes & Audience', icon: Award },
                { id: 'curriculum', labelAr: '3. المنهج والأسابيع', labelEn: '3. Weekly Curriculum', icon: Layers },
                { id: 'capstone', labelAr: '4. مشروع التخرج والأدوات', labelEn: '4. Capstone & Gear', icon: GraduationCap },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = editTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEditTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      active
                        ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20'
                        : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* TAB 1: BASIC INFO */}
              {editTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'عنوان البرنامج بالعربية' : 'Arabic Title'}
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.titleAr}
                        onChange={(e) => setEditFormData({ ...editFormData, titleAr: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'عنوان البرنامج بالإنجليزية' : 'English Title'}
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.titleEn}
                        onChange={(e) => setEditFormData({ ...editFormData, titleEn: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'الرابط المخصص (Slug)' : 'Custom Slug'}
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.slug}
                        onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'المسار التدريبي' : 'Track'}
                      </label>
                      <select
                        value={editFormData.trackId}
                        onChange={(e) => setEditFormData({ ...editFormData, trackId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      >
                        {tracks.map((t) => (
                          <option key={t._id} value={t._id}>
                            {isAr ? t.nameAr : t.nameEn || t.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'المحاضر والمدرب المسؤول' : 'Assigned Instructor'}
                      </label>
                      <select
                        value={editFormData.instructorId}
                        onChange={(e) => setEditFormData({ ...editFormData, instructorId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                      >
                        <option value="">{isAr ? '— اختر المحاضر المسؤول —' : '— Select Instructor —'}</option>
                        {instructorsList.map((inst) => {
                          const name = inst.fullName || inst.userId?.fullName || inst.email || 'مدرب';
                          return (
                            <option key={inst._id} value={inst.userId?._id || inst._id}>
                              {name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      {isAr ? 'الوصف والتفاصيل بالعربية' : 'Arabic Description'}
                    </label>
                    <textarea
                      rows={3}
                      value={editFormData.descriptionAr}
                      onChange={(e) => setEditFormData({ ...editFormData, descriptionAr: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'المدة (أسابيع)' : 'Duration (Weeks)'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={editFormData.durationWeeks}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, durationWeeks: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'إجمالي الساعات' : 'Total Hours'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={editFormData.durationHours}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, durationHours: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'الرسوم (ج.م)' : 'Price (EGP)'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editFormData.price}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, price: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LEARNING OUTCOMES & TARGET AUDIENCE */}
              {editTab === 'outcomes' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {isAr ? 'ماذا ستتعلم في هذا المسار؟ (المخرجات التعليمية - سطر لكل مخرج):' : 'Learning Outcomes (One per line):'}
                      </label>
                      <span className="text-[10px] text-gold-500 font-mono">
                        {isAr ? 'يظهر في المربعات العلوية' : 'Displayed in Top Grid'}
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={editFormData.learningOutcomesText}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, learningOutcomesText: e.target.value })
                      }
                      placeholder={
                        isAr
                          ? 'إتقان تدريبات الفوكاليز والتنفس البطني\nالتحكم في النبرة والسرعة والتلوين الصوتي\nهندسة الصوت وإزالة الضوضاء'
                          : 'Enter each learning outcome on a new line...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 leading-relaxed font-cairo"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      {isAr ? 'الفئات المستهدفة (سطر لكل فئة):' : 'Target Audience (One per line):'}
                    </label>
                    <textarea
                      rows={4}
                      value={editFormData.targetAudienceText}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, targetAudienceText: e.target.value })
                      }
                      placeholder={
                        isAr
                          ? 'المعلقون الصوتيون وصناع المحتوى\nطلاب وخريجو كليات الإعلام\nأصحاب المواهب الصوتية'
                          : 'Target audience items...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 leading-relaxed font-cairo"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: CURRICULUM & WEEKS */}
              {editTab === 'curriculum' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {isAr ? 'المنهج الدراسي والجدول الزمني (الأسابيع والمحاور والمشاريع):' : 'Weekly Modules & Practical Projects:'}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {isAr ? 'تعديل كل أسبوع بما يحتويه من موضوعات ومشروع عملي تطبيقي' : 'Configure weekly modules and hands-on deliverables'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddWeek}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30 text-xs font-bold hover:bg-gold-500 hover:text-navy-950 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إضافة أسبوع جديد' : 'Add Week'}</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {editFormData.curriculumWeeks.map((week, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 space-y-3 text-xs font-cairo"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
                            الأسبوع 0{week.weekNumber}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveWeek(idx)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10"
                            title={isAr ? 'حذف هذا الأسبوع' : 'Remove Week'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                            {isAr ? 'عنوان الأسبوع:' : 'Week Title:'}
                          </label>
                          <input
                            type="text"
                            required
                            value={week.title}
                            onChange={(e) => {
                              const updated = [...editFormData.curriculumWeeks];
                              updated[idx].title = e.target.value;
                              setEditFormData({ ...editFormData, curriculumWeeks: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                            {isAr ? 'الوصف ومحاور هذا الأسبوع (مفصولة بفواصل):' : 'Topics (comma separated):'}
                          </label>
                          <input
                            type="text"
                            value={week.topics}
                            onChange={(e) => {
                              const updated = [...editFormData.curriculumWeeks];
                              updated[idx].topics = e.target.value;
                              setEditFormData({ ...editFormData, curriculumWeeks: updated });
                            }}
                            placeholder={isAr ? 'مخارج الحروف، تمارين الفوكاليز، التلوين الصوتي' : 'Topics...'}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                            {isAr ? 'المشروع والتكليف العملي للأسبوع:' : 'Weekly Practical Project:'}
                          </label>
                          <input
                            type="text"
                            required
                            value={week.practicalProject}
                            onChange={(e) => {
                              const updated = [...editFormData.curriculumWeeks];
                              updated[idx].practicalProject = e.target.value;
                              setEditFormData({ ...editFormData, curriculumWeeks: updated });
                            }}
                            placeholder={isAr ? 'تسجيل مقطع إعلاني مدته 30 ثانية في الاستوديو' : 'Practical deliverable...'}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CAPSTONE PROJECT & TOOLS */}
              {editTab === 'capstone' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 space-y-3">
                    <h4 className="text-xs font-bold text-gold-600 dark:text-gold-400 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>{isAr ? 'مشروع التخرج التطبيقي (Capstone Project):' : 'Capstone Project Details:'}</span>
                    </h4>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {isAr ? 'عنوان مشروع التخرج:' : 'Capstone Title:'}
                      </label>
                      <input
                        type="text"
                        value={editFormData.capstoneTitle}
                        onChange={(e) => setEditFormData({ ...editFormData, capstoneTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {isAr ? 'تفاصيل ووصف مشروع التخرج:' : 'Capstone Description:'}
                      </label>
                      <textarea
                        rows={2}
                        value={editFormData.capstoneDesc}
                        onChange={(e) => setEditFormData({ ...editFormData, capstoneDesc: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {isAr ? 'مخرجات التسليم (Deliverables):' : 'Deliverables:'}
                      </label>
                      <input
                        type="text"
                        value={editFormData.capstoneDeliverable}
                        onChange={(e) => setEditFormData({ ...editFormData, capstoneDeliverable: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'الأدوات والبرمجيات المستخدمة (سطر لكل أداة):' : 'Tools & Gear (One per line):'}
                      </label>
                      <textarea
                        rows={3}
                        value={editFormData.toolsAndGearText}
                        onChange={(e) => setEditFormData({ ...editFormData, toolsAndGearText: e.target.value })}
                        placeholder="Rode NT1 Microphones&#10;Adobe Audition&#10;Focusrite Interface"
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'المتطلبات المسبقة والشروط (سطر لكل شرط):' : 'Prerequisites (One per line):'}
                      </label>
                      <textarea
                        rows={3}
                        value={editFormData.prerequisitesText}
                        onChange={(e) => setEditFormData({ ...editFormData, prerequisitesText: e.target.value })}
                        placeholder={isAr ? 'الشغف بالأداء الصوتي&#10;لا يشترط وجود خبرة سابقة' : 'Prerequisites...'}
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setSelectedEditProgram(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {editSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{isAr ? 'حفظ وتحديث كامل محتوى البرنامج' : 'Save Full Program Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4️⃣ Delete Confirmation Modal */}
      {selectedDeleteProgram && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl text-start font-cairo space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'حذف البرنامج التدريبي نهائياً' : 'Delete Training Program'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed font-cairo">
                {isAr
                  ? `هل أنت متأكد من رغبتك في حذف برنامج "${selectedDeleteProgram.titleAr}"؟ لا يمكن التراجع عن هذا الإجراء وسيتم إلغاء ارتباطه بالمسار التدريبي.`
                  : `Are you sure you want to permanently delete "${selectedDeleteProgram.titleEn || selectedDeleteProgram.titleAr}"? This action cannot be undone.`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setSelectedDeleteProgram(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {deleteSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{isAr ? 'تأكيد الحذف' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
