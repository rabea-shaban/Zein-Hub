'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  FileCheck2,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Search,
  MessageSquare,
  X,
  Volume2,
  Loader2,
  ExternalLink,
  FileAudio,
  PlusCircle,
  Plus,
  BookOpen,
} from 'lucide-react';

interface SubmissionItem {
  _id: string;
  id?: string;
  studentId?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  studentName?: string;
  studentEmail?: string;
  programId?: {
    _id: string;
    title?: string;
    titleAr?: string;
    titleEn?: string;
    slug?: string;
  };
  program?: string;
  assignmentId?: {
    _id: string;
    title: string;
    description?: string;
    maxScore?: number;
    submissionType?: string;
  };
  assignmentTitle?: string;
  fileUrl?: string;
  textContent?: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'needs_revision' | 'pending';
  grade?: number;
  score?: number;
  feedback?: string;
  gradedBy?: {
    fullName: string;
    email: string;
  };
}

export default function InstructorSubmissionsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { user } = useAuth();

  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'submitted' | 'graded' | 'needs_revision'>('all');

  // Grading Modal
  const [selectedSub, setSelectedSub] = useState<SubmissionItem | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [gradeStatus, setGradeStatus] = useState<'graded' | 'needs_revision'>('graded');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Add Assignment Modal
  const [isAddAsgModalOpen, setIsAddAsgModalOpen] = useState(false);
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgProgramId, setNewAsgProgramId] = useState('');
  const [newAsgInstructions, setNewAsgInstructions] = useState('');
  const [newAsgType, setNewAsgType] = useState<'audio' | 'video' | 'text'>('audio');
  const [newAsgMaxScore, setNewAsgMaxScore] = useState('100');
  const [newAsgDeadline, setNewAsgDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [isCreatingAsg, setIsCreatingAsg] = useState(false);

  // 1. Fetch live submissions and assigned programs from backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch programs for dropdown
      let progs: any[] = [];
      try {
        const myRes = await api.get<any>('/instructors/me/programs');
        progs = Array.isArray(myRes.data) ? myRes.data : myRes.data?.programs || [];
      } catch (err) {
        console.warn('Fallback loading all programs for dropdown:', err);
      }

      if (progs.length === 0) {
        const allRes = await api.get<any>('/programs', { params: { limit: 100 } });
        progs = Array.isArray(allRes.data) ? allRes.data : allRes.data?.programs || [];
      }

      setProgramsList(progs);
      if (progs.length > 0 && !newAsgProgramId) {
        setNewAsgProgramId(progs[0]._id);
      }

      // Fetch submissions
      const res = await api.get<any>('/submissions');
      const list = Array.isArray(res.data) ? res.data : res.data?.submissions || [];
      setSubmissions(list);
    } catch (err: any) {
      console.warn('Submissions load warning:', err);
    } finally {
      setLoading(false);
    }
  }, [newAsgProgramId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Grading Modal
  const handleOpenGrade = (sub: SubmissionItem) => {
    setSelectedSub(sub);
    setGradeScore(sub.grade ?? sub.score ?? 90);
    setGradeFeedback(sub.feedback || (isAr ? 'أداء ممتاز مع التزام واضح بالمعايير المهنية والتحكم في طبقات الصوت.' : 'Excellent performance and great vocal control.'));
    setGradeStatus(sub.status === 'needs_revision' ? 'needs_revision' : 'graded');
    setIsPlaying(false);
  };

  // Save Grade
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setIsSubmittingGrade(true);
    try {
      const maxScore = selectedSub.assignmentId?.maxScore || 100;
      if (gradeScore > maxScore) {
        toast.error(isAr ? `الدرجة لا يمكن أن تتجاوز ${maxScore}` : `Grade cannot exceed ${maxScore}`);
        setIsSubmittingGrade(false);
        return;
      }

      await api.patch(`/submissions/${selectedSub._id}/grade`, {
        grade: Number(gradeScore),
        feedback: gradeFeedback.trim(),
        status: gradeStatus,
      });

      toast.success(isAr ? 'تم حفظ التقييم وإرسال النتيجة للطالب بنجاح' : 'Submission graded and feedback sent successfully');
      setSelectedSub(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل حفظ التقييم' : 'Failed to grade submission'));
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  // Create Assignment Submit
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim() || !newAsgProgramId) {
      toast.error(isAr ? 'يرجى إدخال عنوان التكليف واختيار الدورة' : 'Please provide assignment title and course');
      return;
    }

    setIsCreatingAsg(true);
    try {
      const deadlineDate = newAsgDeadline
        ? new Date(`${newAsgDeadline}T23:59:59Z`).toISOString()
        : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

      await api.post(`/programs/${newAsgProgramId}/assignments`, {
        title: newAsgTitle.trim(),
        description: newAsgInstructions.trim() || (isAr ? 'تطبيق صوتي وتكليف عملي معتمد.' : 'Practical studio take.'),
        instructions: newAsgInstructions.trim() || (isAr ? 'تطبيق صوتي وتكليف عملي معتمد.' : 'Practical studio take.'),
        submissionType: newAsgType,
        maxScore: Number(newAsgMaxScore) || 100,
        deadline: deadlineDate,
        isPublished: true,
      });

      toast.success(isAr ? 'تمت إضافة التكليف التدريبي بنجاح ونشره لطلاب الدورة' : 'Assignment created and published to students successfully');
      setIsAddAsgModalOpen(false);
      setNewAsgTitle('');
      setNewAsgInstructions('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل إنشاء التكليف' : 'Failed to create assignment'));
    } finally {
      setIsCreatingAsg(false);
    }
  };

  const getStudentName = (sub: SubmissionItem) => {
    return sub.studentId?.fullName || sub.studentName || (isAr ? 'طالب الأكاديمية' : 'Academy Student');
  };

  const getStudentEmail = (sub: SubmissionItem) => {
    return sub.studentId?.email || sub.studentEmail || 'student@zeinhub.com';
  };

  const getProgramTitle = (sub: SubmissionItem) => {
    if (sub.programId) {
      return isAr
        ? sub.programId.titleAr || sub.programId.title || sub.programId.titleEn
        : sub.programId.titleEn || sub.programId.title || sub.programId.titleAr;
    }
    return sub.program || (isAr ? 'دبلوم التعليق الصوتي والفوكاليز' : 'Voice-Over Diploma');
  };

  const getAssignmentTitle = (sub: SubmissionItem) => {
    return sub.assignmentId?.title || sub.assignmentTitle || (isAr ? 'تسجيل إعلان تجاري حماسي (30 ثانية)' : 'Commercial Voiceover (30s)');
  };

  const filteredList = submissions.filter((s) => {
    const sName = getStudentName(s).toLowerCase();
    const aTitle = getAssignmentTitle(s).toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = sName.includes(q) || aTitle.includes(q);

    let normStatus: string = s.status;
    if (normStatus === 'pending') normStatus = 'submitted';

    const matchFilter =
      filter === 'all'
        ? true
        : filter === 'submitted'
        ? normStatus === 'submitted'
        : normStatus === filter;

    return matchSearch && matchFilter;
  });

  const pendingCount = submissions.filter((s) => s.status === 'submitted' || s.status === 'pending').length;

  return (
    <div className="space-y-8 text-start font-cairo">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'تسليمات وتكليفات الطلاب' : 'Student Submissions & Audio Grading'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 mt-1">
            {isAr
              ? 'الاستماع للتسجيلات الصوتية ومراجعة مشاريع الطلاب ومنح الدرجات والملاحظات الفنية'
              : 'Listen to student voice tracks, review capstones, and provide faculty critique and grades'}
          </p>
        </div>

        <button
          onClick={() => setIsAddAsgModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs font-cairo shadow-md shadow-gold-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAr ? 'إضافة تكليف تدريبي جديد' : 'Add Practical Assignment'}</span>
        </button>
      </div>

      {/* Filter Tabs & Search Strip */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter === 'all'
                ? 'bg-navy-950 text-white dark:bg-gold-500 dark:text-navy-950 font-black'
                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              filter === 'submitted'
                ? 'bg-amber-500 text-white font-black shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            <span>{isAr ? 'بانتظار التقييم' : 'Pending'}</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setFilter('graded')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter === 'graded'
                ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-500/20'
                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            {isAr ? 'تم التقييم' : 'Graded'}
          </button>
          <button
            onClick={() => setFilter('needs_revision')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter === 'needs_revision'
                ? 'bg-rose-600 text-white font-black shadow-md shadow-rose-500/20'
                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            {isAr ? 'بحاجة لإعادة تسجيل' : 'Needs Revision'}
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث باسم الطالب أو التكليف...' : 'Search student or assignment...'}
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gold-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Submissions Table / Cards */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400 dark:text-gray-400">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
          <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل تسليمات وتكليفات الطلاب...' : 'Loading submissions...'}</span>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 space-y-3 shadow-sm">
          <FileCheck2 className="w-12 h-12 mx-auto text-gold-500" />
          <h3 className="text-base font-bold text-navy-900 dark:text-white">
            {isAr ? 'لا توجد تسليمات مسجلة في هذا التبويب' : 'No Submissions Found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto">
            {isAr
              ? 'تظهر هنا ملفات الصوت والتسجيلات والتكليفات المرفوعة من الطلاب في دوراتك المعتمدة.'
              : 'Student audio takes and capstone files will appear here.'}
          </p>
          <button
            onClick={() => setIsAddAsgModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة تكليف تدريبي جديد' : 'Add Practical Assignment'}</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 dark:bg-navy-950/70 border-b border-slate-200 dark:border-navy-800 text-slate-500 dark:text-gray-400 font-bold font-cairo">
                <tr>
                  <th className="px-6 py-4 text-start">{isAr ? 'الطالب' : 'Student'}</th>
                  <th className="px-6 py-4 text-start">{isAr ? 'البرنامج والتكليف' : 'Program & Assignment'}</th>
                  <th className="px-6 py-4 text-start">{isAr ? 'المدة وتاريخ التسليم' : 'Submitted Time'}</th>
                  <th className="px-6 py-4 text-start">{isAr ? 'الحالة والدرجة' : 'Status & Grade'}</th>
                  <th className="px-6 py-4 text-start">{isAr ? 'الإجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800 font-cairo">
                {filteredList.map((sub) => {
                  const sName = getStudentName(sub);
                  const sEmail = getStudentEmail(sub);
                  const pTitle = getProgramTitle(sub);
                  const aTitle = getAssignmentTitle(sub);
                  const isGraded = sub.status === 'graded';
                  const isRevision = sub.status === 'needs_revision';
                  const isPending = sub.status === 'submitted' || sub.status === 'pending';
                  const scoreVal = sub.grade ?? sub.score;

                  const dateStr = sub.submittedAt
                    ? new Date(sub.submittedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : isAr ? 'اليوم' : 'Today';

                  return (
                    <tr
                      key={sub._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-navy-850/60 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400 font-bold text-xs flex items-center justify-center shrink-0">
                            {sName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-navy-900 dark:text-white block">
                              {sName}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-gray-500 font-mono">
                              {sEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Program & Assignment */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-[10px] text-gold-600 dark:text-gold-400 font-bold font-mono block">
                            {pTitle}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-gray-200 block text-xs">
                            {aTitle}
                          </span>
                        </div>
                      </td>

                      {/* Submission Date / Duration */}
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-gold-500" />
                          <span>00:45</span>
                        </div>
                        <span className="text-[10px] block text-slate-400 dark:text-gray-500">
                          {dateStr}
                        </span>
                      </td>

                      {/* Status & Grade */}
                      <td className="px-6 py-4">
                        {isPending && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-block">
                            {isAr ? 'بانتظار التقييم' : 'Pending Review'}
                          </span>
                        )}

                        {isGraded && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-block">
                            {scoreVal}/100 ✓
                          </span>
                        )}

                        {isRevision && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 inline-block">
                            {isAr ? `إعادة تسجيل (${scoreVal || 65}%)` : `Revision (${scoreVal || 65}%)`}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenGrade(sub)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                            isPending
                              ? 'bg-gold-500 hover:bg-gold-400 text-navy-950 font-black shadow-gold-500/20'
                              : 'bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-navy-700'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>
                            {isPending
                              ? isAr ? 'استماع وتقييم' : 'Listen & Grade'
                              : isAr ? 'تعديل التقييم' : 'Edit Grade'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🌟 Modal 1: Add Practical Assignment (Instructor to Students) */}
      {isAddAsgModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 font-cairo">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-start space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-navy-900 dark:text-white">
                {isAr ? 'إضافة تكليف تدريبي جديد للطلاب' : 'Add Practical Assignment'}
              </h3>
              <button
                onClick={() => setIsAddAsgModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'عنوان التكليف أو الـ Studio Take:' : 'Assignment Title:'}
                </label>
                <input
                  required
                  type="text"
                  value={newAsgTitle}
                  onChange={(e) => setNewAsgTitle(e.target.value)}
                  placeholder={isAr ? 'تسجيل إعلان تجاري حماسي (30 ثانية)' : '30-Sec Commercial VO Take'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'البرنامج التدريبي المستهدف:' : 'Select Program:'}
                </label>
                <select
                  required
                  value={newAsgProgramId}
                  onChange={(e) => setNewAsgProgramId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  {programsList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {isAr ? p.titleAr || p.title || p.titleEn : p.titleEn || p.title || p.titleAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                    {isAr ? 'نوع التسليم:' : 'Type:'}
                  </label>
                  <select
                    value={newAsgType}
                    onChange={(e) => setNewAsgType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                  >
                    <option value="audio">{isAr ? '🎙️ تراك صوتي' : 'Audio Take'}</option>
                    <option value="video">{isAr ? '🎥 فيديو مصور' : 'Video'}</option>
                    <option value="text">{isAr ? '📝 نص / سكريبت' : 'Text/Script'}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                    {isAr ? 'الدرجة القصوى:' : 'Max Score:'}
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={newAsgMaxScore}
                    onChange={(e) => setNewAsgMaxScore(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-mono text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                    {isAr ? 'الموعد النهائي:' : 'Deadline:'}
                  </label>
                  <input
                    type="date"
                    value={newAsgDeadline}
                    onChange={(e) => setNewAsgDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-mono text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'السكريبت والتعليمات الفنية المطلوب تنفيذها:' : 'Script & Instructions:'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={newAsgInstructions}
                  onChange={(e) => setNewAsgInstructions(e.target.value)}
                  placeholder={isAr ? 'قم بتسجيل الإعلان المرفق مع مراعاة مخارج الحروف، طبقة القرار، والوقفات الدرامية...' : 'Record the attached script...'}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsAddAsgModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAsg}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md shadow-gold-500/20 flex items-center gap-2"
                >
                  {isCreatingAsg && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'نشر التكليف للطلاب' : 'Publish Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 Modal 2: Grading & Audio Player Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 font-cairo">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-start space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gold-600 dark:text-gold-400 font-bold font-mono block">
                  {getProgramTitle(selectedSub)}
                </span>
                <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                  {getAssignmentTitle(selectedSub)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Info Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-gray-400 block">{isAr ? 'الطالب المسلّم:' : 'Student:'}</span>
                <span className="text-sm font-bold text-navy-900 dark:text-white">
                  {getStudentName(selectedSub)}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400 dark:text-gray-500">
                {getStudentEmail(selectedSub)}
              </span>
            </div>

            {/* Audio Waveform Player */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-navy-950 to-navy-900 text-white space-y-3 border border-gold-500/20 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gold-400 font-bold flex items-center gap-1.5">
                  <FileAudio className="w-4 h-4" />
                  <span>{isAr ? 'تراك الطالب الصوتي (WAV / MP3)' : 'Student Audio Take (WAV/MP3)'}</span>
                </span>
                <span className="text-gray-400">00:45</span>
              </div>

              {/* Simulated / Real Audio Player */}
              <div className="flex items-center gap-4 pt-1">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-2xl bg-gold-500 text-navy-950 flex items-center justify-center font-black shadow-lg shadow-gold-500/30 hover:bg-gold-400 transition-all shrink-0"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-navy-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-navy-950 ml-0.5" />
                  )}
                </button>

                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-full bg-navy-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold-500 to-amber-400 rounded-full transition-all duration-300"
                      style={{ width: isPlaying ? '65%' : '20%' }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                    <span>{isPlaying ? '00:29' : '00:09'}</span>
                    <span>00:45</span>
                  </div>
                </div>
              </div>

              {selectedSub.fileUrl && (
                <div className="pt-2 border-t border-navy-800/80 text-end">
                  <a
                    href={selectedSub.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-gold-400 hover:text-gold-300 font-mono font-bold"
                  >
                    <span>{isAr ? 'فتح الملف الأصلي المرفوع' : 'Open Raw Submission File'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Grading Form */}
            <form onSubmit={handleSaveGrade} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                    {isAr ? 'الدرجة المستحقة (من 100):' : 'Score (Out of 100):'}
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-mono font-bold text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                    {isAr ? 'حالة التقييم:' : 'Status:'}
                  </label>
                  <select
                    value={gradeStatus}
                    onChange={(e) => setGradeStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                  >
                    <option value="graded">{isAr ? '✅ اعتماد واجتياز (Graded)' : 'Passed (Graded)'}</option>
                    <option value="needs_revision">{isAr ? '⚠️ طلب إعادة تسجيل (Needs Revision)' : 'Needs Revision'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'الملاحظات الفنية والتوجيه الأكاديمي للطالب:' : 'Faculty Critique & Feedback:'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder={isAr ? 'أداء ممتاز، ركز أكثر على مخارج الحروف والتنفس الحجابي...' : 'Critique notes...'}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGrade}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md shadow-gold-500/20 flex items-center gap-2"
                >
                  {isSubmittingGrade && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'حفظ وإرسال التقييم' : 'Save & Submit Grade'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
