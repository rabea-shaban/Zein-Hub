'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  Plus,
  Play,
  Video,
  FileText,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Layers,
  Upload,
  Radio,
  FileAudio,
  Trash2,
  Loader2,
  Edit,
  Award,
  Film,
  Sparkles,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';

interface Lesson {
  _id?: string;
  id?: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  durationMinutes?: number;
  duration?: string;
  contentType?: 'video' | 'audio' | 'pdf' | 'text';
  type?: string;
  contentUrl?: string;
  url?: string;
  isPublished?: boolean;
}

interface Module {
  _id: string;
  id?: string;
  order: number;
  weekNumber?: number;
  title: string;
  titleAr?: string;
  titleEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  lessons: Lesson[];
}

export interface ICapstoneProject {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  deliverable: string;
  deliverableEn?: string;
}

interface InstructorProgram {
  _id: string;
  title: string;
  titleAr: string;
  titleEn: string;
  slug: string;
  trackName: string;
  studentsCount: number;
  durationWeeks: number;
  durationHours: number;
  status: 'open' | 'coming-soon' | 'closed';
  modules: Module[];
  capstoneProject?: ICapstoneProject;
}

export default function InstructorProgramsPage() {
  const { language, direction } = useLanguage();
  const isAr = language === 'ar';
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [programs, setPrograms] = useState<InstructorProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<InstructorProgram | null>(null);
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);

  // Add Lesson Modal
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'audio' | 'pdf' | 'text'>('video');
  const [newLessonDuration, setNewLessonDuration] = useState('30');
  const [newLessonUrl, setNewLessonUrl] = useState('');
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  // Add Week Module Modal
  const [isAddWeekOpen, setIsAddWeekOpen] = useState(false);
  const [newWeekTitle, setNewWeekTitle] = useState('');
  const [newWeekDesc, setNewWeekDesc] = useState('');
  const [isSubmittingWeek, setIsSubmittingWeek] = useState(false);

  // Capstone Project Modal & State
  const [isCapstoneModalOpen, setIsCapstoneModalOpen] = useState(false);
  const [capstoneTitle, setCapstoneTitle] = useState('');
  const [capstoneTitleEn, setCapstoneTitleEn] = useState('');
  const [capstoneDesc, setCapstoneDesc] = useState('');
  const [capstoneDescEn, setCapstoneDescEn] = useState('');
  const [capstoneDeliverable, setCapstoneDeliverable] = useState('');
  const [capstoneDeliverableEn, setCapstoneDeliverableEn] = useState('');
  const [isSubmittingCapstone, setIsSubmittingCapstone] = useState(false);
  const [capstoneErrors, setCapstoneErrors] = useState<Record<string, string>>({});

  // Fetch Live Modules for a specific program
  const fetchProgramModules = useCallback(async (progId: string) => {
    try {
      setLoadingModules(true);
      const res = await api.get<any>(`/programs/${progId}/modules`);
      const modList = Array.isArray(res.data) ? res.data : res.data?.modules || [];
      return modList;
    } catch (err) {
      console.warn('Failed to load program modules:', err);
      return [];
    } finally {
      setLoadingModules(false);
    }
  }, []);

  // Fetch ONLY Assigned Programs for this instructor
  const fetchLivePrograms = useCallback(async () => {
    try {
      setLoading(true);

      let listToUse: any[] = [];

      // 1. Try to fetch from /instructors/me/programs
      try {
        const myRes = await api.get<any>('/instructors/me/programs');
        const myList = Array.isArray(myRes.data) ? myRes.data : myRes.data?.programs || [];
        if (myList && myList.length > 0) {
          listToUse = myList;
        }
      } catch (err) {
        console.warn('Direct me/programs fetch failed, falling back:', err);
      }

      // 2. If empty or failed, fallback to /programs with strict filter for this instructor
      if (listToUse.length === 0) {
        const res = await api.get<any>('/programs', { params: { limit: 100 } });
        const rawList = Array.isArray(res.data) ? res.data : res.data?.programs || [];

        listToUse = rawList.filter((prog: any) => {
          const instId = typeof prog.instructorId === 'object' ? prog.instructorId?._id : prog.instructorId;
          const instEmail = typeof prog.instructorId === 'object' ? prog.instructorId?.email : '';
          return (
            instId === user?.id ||
            instEmail === user?.email ||
            user?.role === 'super_admin'
          );
        });
      }

      if (listToUse && listToUse.length > 0) {
        const mapped: InstructorProgram[] = listToUse.map((prog: any) => {
          const tr = prog.trackId || prog.track;
          const trackName = isAr
            ? tr?.nameAr || 'الصوت والإعلام'
            : tr?.nameEn || tr?.nameAr || 'Audio & Media';

          const titleAr = prog.titleAr || prog.title || 'برنامج تدريبي معتمد';
          const titleEn = prog.titleEn || prog.title || 'Certified Training Program';

          return {
            _id: prog._id,
            title: isAr ? titleAr : titleEn,
            titleAr,
            titleEn,
            slug: prog.slug || prog._id,
            trackName,
            studentsCount: typeof prog.studentsCount === 'number' ? prog.studentsCount : (prog.instructorStats?.totalStudents ?? 0),
            durationWeeks: prog.durationWeeks || 6,
            durationHours: prog.durationHours || 30,
            status: prog.status || 'open',
            modules: [],
            capstoneProject: prog.capstoneProject || undefined,
          };
        });

        setPrograms(mapped);
        if (mapped.length > 0) {
          const firstProg = mapped[0];
          setSelectedProgram(firstProg);
          const liveMods = await fetchProgramModules(firstProg._id);
          firstProg.modules = liveMods;
          setSelectedProgram({ ...firstProg });
          if (liveMods.length > 0) {
            setExpandedWeekId(liveMods[0]._id || liveMods[0].id);
          }
        }
      }
    } catch (err: any) {
      console.warn('Failed to load instructor programs:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isAr, fetchProgramModules]);

  useEffect(() => {
    fetchLivePrograms();
  }, [fetchLivePrograms]);

  // Handle Selecting a Program
  const handleSelectProgram = async (prog: InstructorProgram) => {
    setSelectedProgram({ ...prog });
    const liveMods = await fetchProgramModules(prog._id);
    prog.modules = liveMods;
    setSelectedProgram({ ...prog });
    if (liveMods.length > 0) {
      setExpandedWeekId(liveMods[0]._id || liveMods[0].id);
    } else {
      setExpandedWeekId(null);
    }
  };

  // Open Capstone Modal
  const handleOpenCapstoneModal = () => {
    if (!selectedProgram) return;
    setCapstoneErrors({});
    const existing = selectedProgram.capstoneProject;
    setCapstoneTitle(existing?.title || '');
    setCapstoneTitleEn(existing?.titleEn || '');
    setCapstoneDesc(existing?.description || '');
    setCapstoneDescEn(existing?.descriptionEn || '');
    setCapstoneDeliverable(existing?.deliverable || '');
    setCapstoneDeliverableEn(existing?.deliverableEn || '');
    setIsCapstoneModalOpen(true);
  };

  // Save Capstone Project
  const handleSaveCapstone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    const errs: Record<string, string> = {};
    if (!capstoneTitle.trim()) {
      errs.title = isAr ? 'عنوان مشروع التخرج مطلوب' : 'Capstone project title is required';
    }
    if (!capstoneDesc.trim() || capstoneDesc.trim().length < 10) {
      errs.description = isAr ? 'يرجى كتابة وصف وافي للمشروع (10 أحرف على الأقل)' : 'Description must be at least 10 chars';
    }
    if (!capstoneDeliverable.trim()) {
      errs.deliverable = isAr ? 'مخرجات وتسليمات المشروع مطلوبة' : 'Deliverable output is required';
    }

    setCapstoneErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error(isAr ? 'يرجى استكمال البيانات المطلوبة لمشروع التخرج' : 'Please fix the required fields');
      return;
    }

    setIsSubmittingCapstone(true);
    try {
      const payload = {
        title: capstoneTitle.trim(),
        titleEn: capstoneTitleEn.trim() || undefined,
        description: capstoneDesc.trim(),
        descriptionEn: capstoneDescEn.trim() || undefined,
        deliverable: capstoneDeliverable.trim(),
        deliverableEn: capstoneDeliverableEn.trim() || undefined,
      };

      const res: any = await api.patch(`/programs/${selectedProgram._id}/capstone`, payload);
      const updatedCapstone = res.data?.capstoneProject || payload;

      selectedProgram.capstoneProject = updatedCapstone;
      setSelectedProgram({ ...selectedProgram });

      setPrograms((prev) =>
        prev.map((p) => (p._id === selectedProgram._id ? { ...p, capstoneProject: updatedCapstone } : p))
      );

      toast.success(isAr ? 'تم حفظ وتحديث مشروع التخرج التطبيقي بنجاح 🎓' : 'Capstone project saved successfully 🎓');
      setIsCapstoneModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل حفظ مشروع التخرج' : 'Failed to save capstone project'));
    } finally {
      setIsSubmittingCapstone(false);
    }
  };

  // Add New Module (Week) Submit
  const handleAddWeekModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeekTitle.trim() || !selectedProgram) return;

    setIsSubmittingWeek(true);
    try {
      const nextOrder = (selectedProgram.modules?.length || 0) + 1;
      await api.post(`/programs/${selectedProgram._id}/modules`, {
        title: newWeekTitle,
        description: newWeekDesc || (isAr ? 'جلسات وتطبيقات عملية مكثفة داخل استوديوهات الأكاديمية.' : 'Hands-on practical studio training.'),
        order: nextOrder,
        isPublished: true,
      });

      toast.success(isAr ? 'تمت إضافة الوحدة التدريبية بنجاح' : 'Module added successfully');
      setIsAddWeekOpen(false);
      setNewWeekTitle('');
      setNewWeekDesc('');

      // Refresh modules
      const liveMods = await fetchProgramModules(selectedProgram._id);
      selectedProgram.modules = liveMods;
      setSelectedProgram({ ...selectedProgram });
      if (liveMods.length > 0) {
        setExpandedWeekId(liveMods[liveMods.length - 1]._id);
      }
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل إضافة الوحدة التدريبية' : 'Failed to add module'));
    } finally {
      setIsSubmittingWeek(false);
    }
  };

  // Add New Lesson to a Module Submit
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModuleId || !newLessonTitle.trim() || !selectedProgram) return;

    setIsSubmittingLesson(true);
    try {
      await api.post(`/modules/${targetModuleId}/lessons`, {
        programId: selectedProgram._id,
        title: newLessonTitle,
        contentType: newLessonType,
        durationMinutes: Number(newLessonDuration) || 30,
        contentUrl: newLessonUrl || undefined,
        isPublished: true,
      });

      toast.success(isAr ? 'تمت إضافة الدرس الجديد بنجاح' : 'Lesson added successfully');
      setIsAddLessonOpen(false);
      setNewLessonTitle('');
      setNewLessonUrl('');
      setNewLessonDuration('30');

      // Refresh modules
      const liveMods = await fetchProgramModules(selectedProgram._id);
      selectedProgram.modules = liveMods;
      setSelectedProgram({ ...selectedProgram });
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل إضافة الدرس' : 'Failed to add lesson'));
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedProgram) return;

    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const result = await Swal.fire({
      title: isAr ? 'حذف هذه الوحدة التدريبية؟' : 'Delete Module?',
      text: isAr ? 'سيتم حذف الوحدة وجميع الدروس والتسجيلات المندرجة تحتها نهائياً.' : 'This module and all its lessons will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E5A93C',
      cancelButtonColor: isDark ? '#1E293B' : '#94A3B8',
      confirmButtonText: isAr ? 'نعم، احذف الوحدة' : 'Yes, delete',
      cancelButtonText: isAr ? 'تراجع' : 'Cancel',
      background: isDark ? '#0B0F19' : '#FFFFFF',
      color: isDark ? '#FFFFFF' : '#0B0F19',
      customClass: {
        popup: 'rounded-3xl border border-slate-200 dark:border-navy-800 font-cairo shadow-2xl',
        confirmButton: 'rounded-xl font-bold px-5 py-2.5 text-navy-950 font-cairo',
        cancelButton: 'rounded-xl font-bold px-5 py-2.5 font-cairo',
      },
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/modules/${moduleId}`);
      toast.success(isAr ? 'تم حذف الوحدة التدريبية' : 'Module deleted');
      const liveMods = await fetchProgramModules(selectedProgram._id);
      selectedProgram.modules = liveMods;
      setSelectedProgram({ ...selectedProgram });
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل حذف الوحدة' : 'Failed to delete module'));
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedProgram) return;

    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const result = await Swal.fire({
      title: isAr ? 'حذف هذا الدرس؟' : 'Delete Lesson?',
      text: isAr ? 'هل أنت متأكد من حذف هذا الدرس من المنهج؟' : 'Are you sure you want to delete this lesson?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E5A93C',
      cancelButtonColor: isDark ? '#1E293B' : '#94A3B8',
      confirmButtonText: isAr ? 'نعم، احذف الدرس' : 'Yes, delete',
      cancelButtonText: isAr ? 'تراجع' : 'Cancel',
      background: isDark ? '#0B0F19' : '#FFFFFF',
      color: isDark ? '#FFFFFF' : '#0B0F19',
      customClass: {
        popup: 'rounded-3xl border border-slate-200 dark:border-navy-800 font-cairo shadow-2xl',
        confirmButton: 'rounded-xl font-bold px-5 py-2.5 text-navy-950 font-cairo',
        cancelButton: 'rounded-xl font-bold px-5 py-2.5 font-cairo',
      },
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/lessons/${lessonId}`);
      toast.success(isAr ? 'تم حذف الدرس' : 'Lesson deleted');
      const liveMods = await fetchProgramModules(selectedProgram._id);
      selectedProgram.modules = liveMods;
      setSelectedProgram({ ...selectedProgram });
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل حذف الدرس' : 'Failed to delete lesson'));
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const matchSearch =
      p.titleAr.toLowerCase().includes(search.toLowerCase()) ||
      p.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-8 text-start font-cairo">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'برامجي التدريبية وإدارة المناهج والدروس' : 'My Programs & Curriculum Modules'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 mt-1">
            {isAr
              ? 'رفع وإدارة محتوى الدروس، الفيديوهات التدريبية، والتسجيلات العملية لبرامجك المعتمدة'
              : 'Manage your assigned programs, upload studio lessons, and manage curriculum modules'}
          </p>
        </div>
      </div>

      {/* Search Strip */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث في دوراتي المعينة لي...' : 'Search assigned courses...'}
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gold-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="text-xs font-bold text-slate-600 dark:text-gray-400 font-mono">
          {filteredPrograms.length} {isAr ? 'برامج تدريبية معينة لك' : 'programs assigned to you'}
        </div>
      </div>

      {/* Main Programs Grid & Curriculum Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Course Cards List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-gray-300">
            {isAr ? 'اختر دورة لإدارة دروسها ومحتواها:' : 'Select Course to Manage:'}
          </h3>

          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredPrograms.map((prog) => {
              const isSelected = selectedProgram?._id === prog._id;
              const totalLessons = prog.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
              const titleToShow = isAr ? prog.titleAr : prog.titleEn;

              return (
                <div
                  key={prog._id}
                  onClick={() => handleSelectProgram(prog)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer text-start space-y-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 font-black shadow-lg shadow-gold-500/20 border-gold-400'
                      : 'bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-navy-800 hover:border-gold-500/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-lg ${
                        isSelected
                          ? 'bg-navy-950/15 text-navy-950 font-black'
                          : 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20'
                      }`}
                    >
                      {prog.trackName}
                    </span>

                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                        isSelected
                          ? 'bg-navy-950/20 text-navy-950 font-black'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {prog.studentsCount} {isAr ? 'طالب' : prog.studentsCount === 1 ? 'student' : 'students'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm sm:text-base leading-snug">
                    {titleToShow}
                  </h4>

                  <div
                    className={`flex items-center justify-between text-xs font-mono pt-2 border-t ${
                      isSelected
                        ? 'border-navy-950/15 text-navy-950/80 font-bold'
                        : 'border-slate-100 dark:border-navy-800 text-slate-500 dark:text-gray-400'
                    }`}
                  >
                    <span>{prog.durationWeeks} {isAr ? 'أسابيع' : 'weeks'}</span>
                    <span>{totalLessons} {isAr ? 'دروس مسجلة' : totalLessons === 1 ? 'lesson' : 'lessons'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Program Curriculum & Modules (8 cols) */}
        {selectedProgram && (
          <div className="lg:col-span-8 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
            {/* Header of selected program */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-navy-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-gold-600 dark:text-gold-400 font-mono">
                  {selectedProgram.trackName} • {selectedProgram.durationWeeks} {isAr ? 'أسابيع تدريبية' : 'weeks'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white">
                  {isAr ? selectedProgram.titleAr : selectedProgram.titleEn}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleOpenCapstoneModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-gold-500/15 hover:from-amber-500/25 hover:to-gold-500/25 text-gold-600 dark:text-gold-400 border border-gold-500/30 font-bold text-xs shadow-sm transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>{selectedProgram.capstoneProject?.title ? (isAr ? 'مشروع التخرج 🎓' : 'Capstone Project 🎓') : (isAr ? 'إضافة مشروع التخرج 🎓' : 'Add Capstone 🎓')}</span>
                </button>

                <button
                  onClick={() => setIsAddWeekOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md shadow-gold-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إضافة أسبوع جديد' : 'Add Week'}</span>
                </button>

                <Link
                  href={`/programs/${selectedProgram.slug}`}
                  target="_blank"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-xs font-bold text-slate-700 dark:text-gray-300 transition-all border border-slate-200 dark:border-navy-700"
                  title={isAr ? 'معاينة صفحة العرض العامة' : 'Public Preview'}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 🎓 Capstone Project Showcase Card */}
            <div className="rounded-2xl border-2 border-gold-500/30 bg-gradient-to-br from-gold-500/10 via-amber-500/5 to-navy-950/20 p-5 space-y-3 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gold-500/15 text-gold-600 dark:text-gold-400 border border-gold-500/30 shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gold-600 dark:text-gold-400 block uppercase tracking-wider">
                      {isAr ? 'مشروع التخرج التطبيقي المعتمد (Capstone Project)' : 'Certified Capstone Project'}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-navy-900 dark:text-white">
                      {selectedProgram.capstoneProject?.title || (isAr ? 'لم يتم تحديد عنوان مشروع التخرج بعد' : 'No Capstone Project Set')}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCapstoneModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-600 dark:text-gold-400 border border-gold-500/30 text-xs font-bold transition-all shadow-sm w-fit"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{selectedProgram.capstoneProject?.title ? (isAr ? 'تعديل مشروع التخرج' : 'Edit Capstone') : (isAr ? 'إضافة وتحديد المشروع' : 'Define Project')}</span>
                </button>
              </div>

              {selectedProgram.capstoneProject?.description ? (
                <div className="space-y-2.5 pt-1 text-xs">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedProgram.capstoneProject.description}
                  </p>
                  {selectedProgram.capstoneProject.deliverable && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gold-600 dark:text-gold-400 font-mono bg-gold-500/10 px-3 py-1.5 rounded-lg border border-gold-500/20 w-fit">
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span>{isAr ? 'مخرجات وتسليمات المشروع:' : 'Deliverable:'} {selectedProgram.capstoneProject.deliverable}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                  {isAr
                    ? 'مشروع التخرج هو العمل التطبيقي الشامل الذي يقدمه الطالب في نهاية الدورة لنيل الشهادة المعتمدة. اضغط على «إضافة وتحديد المشروع» لتعيين تفاصيله.'
                    : 'The capstone project is the comprehensive practical deliverable students submit to earn their certification.'}
                </p>
              )}
            </div>

            {/* Modules Accordion */}
            {loadingModules ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-gray-400 flex items-center justify-center gap-2 font-cairo">
                <Loader2 className="w-5 h-5 text-gold-500 animate-spin" />
                <span>{isAr ? 'جارٍ تحميل وحدات ودروس البرنامج...' : 'Loading modules...'}</span>
              </div>
            ) : selectedProgram.modules?.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 dark:bg-navy-950 rounded-2xl border border-dashed border-slate-300 dark:border-navy-800 space-y-3">
                <Layers className="w-10 h-10 text-gold-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isAr ? 'لا توجد وحدات تدريبية مضافة لهذا الكورس بعد' : 'No modules created yet'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  {isAr ? 'اضغط على زر «إضافة أسبوع جديد» للبدء في رفع وتجهيز منهج المادة' : 'Click "Add Week" to start building curriculum'}
                </p>
                <button
                  onClick={() => setIsAddWeekOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إضافة أسبوع جديد' : 'Add Week'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedProgram.modules.map((mod, mIdx) => {
                  const modId = mod._id || mod.id || `mod-${mIdx}`;
                  const isExpanded = expandedWeekId === modId;
                  const modTitle = isAr
                    ? mod.titleAr || mod.title || `الأسبوع 0${mod.weekNumber || mIdx + 1}`
                    : mod.titleEn || mod.title || `Week 0${mod.weekNumber || mIdx + 1}`;
                  const modDesc = isAr
                    ? mod.descriptionAr || mod.description || 'جلسات وتطبيقات عملية مكثفة.'
                    : mod.descriptionEn || mod.description || 'Hands-on practical studio training.';

                  return (
                    <div
                      key={modId}
                      className="rounded-2xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 overflow-hidden transition-all shadow-sm"
                    >
                      <div
                        onClick={() => setExpandedWeekId(isExpanded ? null : modId)}
                        className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-navy-850 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            W0{mod.weekNumber || mIdx + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-sm sm:text-base text-navy-900 dark:text-white">
                              {modTitle}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                              {modDesc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-slate-500 dark:text-gray-400 font-mono font-bold">
                            {mod.lessons?.length || 0} {isAr ? 'دروس' : (mod.lessons?.length || 0) === 1 ? 'lesson' : 'lessons'}
                          </span>

                          <button
                            onClick={(e) => handleDeleteModule(modId, e)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title={isAr ? 'حذف الوحدة' : 'Delete Module'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gold-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gold-500" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-5 pt-0 space-y-3">
                          <div className="pt-3 border-t border-slate-200 dark:border-navy-800 space-y-2">
                            {!mod.lessons || mod.lessons.length === 0 ? (
                              <div className="py-6 text-center text-xs text-slate-400 font-cairo">
                                {isAr ? 'لم تتم إضافة دروس لهذا الأسبوع بعد.' : 'No lessons added yet.'}
                              </div>
                            ) : (
                              mod.lessons.map((les, lIdx) => {
                                const lesId = les._id || les.id || `les-${lIdx}`;
                                const isVideo = les.contentType === 'video' || les.type === 'video';
                                const isAudio = les.contentType === 'audio' || les.type === 'studio';
                                const lesTitle = isAr
                                  ? les.titleAr || les.title || `الدرس 0${lIdx + 1}`
                                  : les.titleEn || les.title || `Lesson 0${lIdx + 1}`;

                                return (
                                  <div
                                    key={lesId}
                                    className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500/40 transition-all text-xs"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0">
                                        {isVideo ? (
                                          <Play className="w-3.5 h-3.5 fill-gold-500" />
                                        ) : isAudio ? (
                                          <Radio className="w-3.5 h-3.5 text-gold-500" />
                                        ) : (
                                          <FileText className="w-3.5 h-3.5 text-gold-500" />
                                        )}
                                      </div>
                                      <div>
                                        <span className="font-bold text-navy-900 dark:text-white block">
                                          {lesTitle}
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-gray-400 font-mono">
                                          ⏱️ {les.durationMinutes || 30} {isAr ? 'دقيقة' : 'mins'}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={(e) => handleDeleteLesson(lesId, e)}
                                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                                        title={isAr ? 'حذف الدرس' : 'Delete Lesson'}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}

                            {/* Add Lesson Button to this Module */}
                            <button
                              onClick={() => {
                                setTargetModuleId(modId);
                                setIsAddLessonOpen(true);
                              }}
                              className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-navy-800 hover:border-gold-500/50 bg-white dark:bg-navy-900/60 hover:bg-gold-500/5 text-slate-700 dark:text-gray-300 hover:text-gold-600 dark:hover:text-gold-400 font-bold text-xs transition-all flex items-center justify-center gap-2 mt-2"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{isAr ? 'إضافة درس أو تسجيل لهذا الأسبوع' : 'Add Lesson to Week'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🌟 Modal 1: Add Week Module */}
      {isAddWeekOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4 font-cairo">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-start animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-navy-900 dark:text-white">
              {isAr ? 'إضافة أسبوع / مرحلة تدريبية جديدة' : 'Add New Curriculum Week'}
            </h3>

            <form onSubmit={handleAddWeekModule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'عنوان الأسبوع أو المرحلة:' : 'Week Title:'}
                </label>
                <input
                  required
                  type="text"
                  value={newWeekTitle}
                  onChange={(e) => setNewWeekTitle(e.target.value)}
                  placeholder={isAr ? 'المرحلة 03: الإلقاء والتلوين الصوتي للإعلانات' : 'Week 03: Commercial Voice Modulation'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'وصف وتفاصيل المرحلة (اختياري):' : 'Description:'}
                </label>
                <textarea
                  rows={3}
                  value={newWeekDesc}
                  onChange={(e) => setNewWeekDesc(e.target.value)}
                  placeholder={isAr ? 'جلسات تدريبية مكثفة داخل استوديوهات Zein Hub...' : 'Module details...'}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddWeekOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWeek}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md shadow-gold-500/20 flex items-center gap-2"
                >
                  {isSubmittingWeek && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'حفظ ونشر المرحلة' : 'Save Module'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 Modal 2: Add Lesson to Module */}
      {isAddLessonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4 font-cairo">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-start animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-navy-900 dark:text-white">
              {isAr ? 'إضافة درس أو تسجيل تدريبي' : 'Add New Lesson'}
            </h3>

            <form onSubmit={handleAddLesson} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'عنوان الدرس:' : 'Lesson Title:'}
                </label>
                <input
                  required
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder={isAr ? 'الدرس 02: ضبط مخارج الحروف وتلوين الصوت' : 'Lesson 02: Voice Intonation'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                    {isAr ? 'نوع الدرس:' : 'Content Type:'}
                  </label>
                  <select
                    value={newLessonType}
                    onChange={(e) => setNewLessonType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="video">{isAr ? '🎥 فيديو 1080P' : 'Video'}</option>
                    <option value="audio">{isAr ? '🎙️ فويس وتراك صوتي' : 'Audio'}</option>
                    <option value="pdf">{isAr ? '📄 ملف PDF / سكريبت' : 'PDF Script'}</option>
                    <option value="text">{isAr ? '📝 مقال وشرح نصي' : 'Text Article'}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                    {isAr ? 'المدة التقديرية (بالدقائق):' : 'Duration (mins):'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'رابط الفيديو أو الملف (YouTube / Google Drive / MP4):' : 'Media URL (Optional):'}
                </label>
                <input
                  type="url"
                  value={newLessonUrl}
                  onChange={(e) => setNewLessonUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-mono text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLessonOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLesson}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md shadow-gold-500/20 flex items-center gap-2"
                >
                  {isSubmittingLesson && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'حفظ ونشر الدرس' : 'Save Lesson'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 Modal 3: Capstone Project Management Modal */}
      {isCapstoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4 font-cairo">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-start animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/30">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-navy-900 dark:text-white">
                    {isAr ? 'مشروع التخرج التطبيقي المعتمد' : 'Practical Capstone Project'}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {selectedProgram?.titleAr}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCapstoneModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCapstone} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'عنوان مشروع التخرج (بالعربية) *' : 'Capstone Title (Arabic) *'}
                </label>
                <input
                  required
                  type="text"
                  value={capstoneTitle}
                  onChange={(e) => {
                    setCapstoneTitle(e.target.value);
                    if (capstoneErrors.title) setCapstoneErrors({ ...capstoneErrors, title: '' });
                  }}
                  placeholder={isAr ? 'إنتاج حلقة بودكاست تفاعلية متكاملة بالذكاء الاصطناعي' : 'Full Podcast Production Project'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
                {capstoneErrors.title && (
                  <p className="text-rose-500 text-[11px] font-bold">{capstoneErrors.title}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'عنوان مشروع التخرج (بالإنجليزية - اختياري):' : 'Capstone Title (English - Optional):'}
                </label>
                <input
                  type="text"
                  value={capstoneTitleEn}
                  onChange={(e) => setCapstoneTitleEn(e.target.value)}
                  placeholder="AI-Powered Broadcast Podcast Production"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'وصف وتوجيهات المشروع للطلاب (بالعربية) *' : 'Project Description & Guidelines *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={capstoneDesc}
                  onChange={(e) => {
                    setCapstoneDesc(e.target.value);
                    if (capstoneErrors.description) setCapstoneErrors({ ...capstoneErrors, description: '' });
                  }}
                  placeholder={isAr ? 'يقوم كل متدرب بتسجيل وهندسة حلقة بودكاست كاملة مدتها 5 دقائق تشمل المؤثرات والفويس أوفر...' : 'Detailed project requirements and criteria...'}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                />
                {capstoneErrors.description && (
                  <p className="text-rose-500 text-[11px] font-bold">{capstoneErrors.description}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'مخرجات وتسليمات المشروع المطلوبة (بالعربية) *' : 'Project Deliverable / Output *'}
                </label>
                <input
                  required
                  type="text"
                  value={capstoneDeliverable}
                  onChange={(e) => {
                    setCapstoneDeliverable(e.target.value);
                    if (capstoneErrors.deliverable) setCapstoneErrors({ ...capstoneErrors, deliverable: '' });
                  }}
                  placeholder={isAr ? 'ملف صوتي MP3 320kbps + سكريبت PDF معتمد' : 'Master Audio File + PDF Script'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
                {capstoneErrors.deliverable && (
                  <p className="text-rose-500 text-[11px] font-bold">{capstoneErrors.deliverable}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsCapstoneModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white font-cairo"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCapstone}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md shadow-gold-500/20 flex items-center gap-2 font-cairo"
                >
                  {isSubmittingCapstone && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'حفظ مشروع التخرج' : 'Save Capstone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
