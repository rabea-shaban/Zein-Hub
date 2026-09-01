'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import {
  FileCheck2,
  Upload,
  Mic,
  FileAudio,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Link as LinkIcon,
  Loader2,
  Play,
  X,
  ExternalLink,
  Award,
  BookOpen,
} from 'lucide-react';

interface StudentAssignmentItem {
  _id: string;
  id?: string;
  title: string;
  description: string;
  instructions?: string;
  submissionType: string;
  maxScore: number;
  deadline?: string;
  programId?: {
    _id: string;
    title?: string;
    titleAr?: string;
    titleEn?: string;
    slug?: string;
  };
  moduleId?: {
    _id: string;
    title?: string;
    order?: number;
    weekNumber?: number;
  };
  submission?: {
    _id: string;
    fileUrl?: string;
    textContent?: string;
    status: 'submitted' | 'graded' | 'needs_revision';
    grade?: number;
    feedback?: string;
    submittedAt: string;
    gradedBy?: {
      fullName: string;
      email: string;
    };
  };
}

export default function StudentAssignmentsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedAsg, setSelectedAsg] = useState<StudentAssignmentItem | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch live assignments for student's enrolled courses
  const fetchMyAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/assignments/me');
      const list = Array.isArray(res.data) ? res.data : res.data?.assignments || [];
      setAssignments(list);
    } catch (err: any) {
      console.warn('Assignments fetch warning:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyAssignments();
  }, [fetchMyAssignments]);

  const handleSubmitTake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsg) return;

    if (!audioUrl.trim() && !submissionNotes.trim()) {
      toast.error(isAr ? 'يرجى إدخال رابط الملف أو الملاحظات النصية' : 'Please provide file URL or notes');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/assignments/${selectedAsg._id}/submit`, {
        fileUrl: audioUrl.trim() || undefined,
        textContent: submissionNotes.trim() || undefined,
      });

      toast.success(isAr ? 'تم تسليم التكليف بنجاح وإرساله للمدرب للتقييم' : 'Take submitted successfully for review');
      setSelectedAsg(null);
      setAudioUrl('');
      setSubmissionNotes('');
      fetchMyAssignments();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل تسليم التكليف' : 'Failed to submit assignment'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgramTitle = (asg: StudentAssignmentItem) => {
    if (asg.programId) {
      return isAr
        ? asg.programId.titleAr || asg.programId.title || asg.programId.titleEn || 'البرنامج التدريبي'
        : asg.programId.titleEn || asg.programId.title || asg.programId.titleAr || 'Training Course';
    }
    return isAr ? 'دبلوم التعليق الصوتي والفوكاليز' : 'Voice-Over Diploma';
  };

  const getWeekNumber = (asg: StudentAssignmentItem, index: number) => {
    return asg.moduleId?.weekNumber || asg.moduleId?.order || index + 1;
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 font-cairo text-start">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-cairo">
          {isAr ? 'التكليفات والتطبيقات العملية' : 'Assignments & Studio Takes'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1 font-cairo">
          {isAr
            ? 'رفع التكليفات الصوتية والمصورة لتقييمها من قِبل مدربي وخبراء استوديوهات Zein Hub'
            : 'Submit voice and video studio takes for faculty evaluation and grading'}
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400 dark:text-gray-400">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
          <span className="text-xs font-bold">{isAr ? 'جارٍ جلب التكليفات المعتمدة لكورساتك...' : 'Loading assignments...'}</span>
        </div>
      ) : assignments.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 space-y-3 shadow-sm">
          <FileCheck2 className="w-12 h-12 mx-auto text-gold-500" />
          <h3 className="text-base font-bold text-navy-900 dark:text-white">
            {isAr ? 'لا توجد تكليفات جديدة مطلوبة حالياً' : 'No Assignments Due'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto">
            {isAr
              ? 'تظهر هنا التطبيقات والتكليفات العملية والـ Studio Takes الخاصة بالكورسات المشترك بها فور نشرها من المدربين.'
              : 'Practical assignments and studio takes for your enrolled courses will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((asg, idx) => {
            const sub = asg.submission;
            const isGraded = sub?.status === 'graded';
            const isRevision = sub?.status === 'needs_revision';
            const isSubmitted = sub?.status === 'submitted';
            const isPending = !sub;
            const weekNum = getWeekNumber(asg, idx);
            const progTitle = getProgramTitle(asg);

            return (
              <div
                key={asg._id}
                className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm space-y-4 hover:border-gold-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-gold-500/10 text-gold-700 dark:text-gold-400 text-xs font-bold font-mono">
                        {isAr ? `الأسبوع 0${weekNum}` : `Week 0${weekNum}`}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-gray-400 font-bold">
                        {progTitle}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-navy-900 dark:text-white font-cairo">
                      {asg.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{isAr ? 'مطلوب التسليم' : 'Pending Submission'}</span>
                      </span>
                    )}

                    {isSubmitted && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isAr ? 'تم التسليم — بانتظار التقييم' : 'Submitted for Review'}</span>
                      </span>
                    )}

                    {isGraded && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isAr ? `تم التقييم: ${sub.grade || 95}/100` : `Graded: ${sub.grade || 95}/100`}</span>
                      </span>
                    )}

                    {isRevision && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono">
                        <AlertCircle className="w-3 h-3" />
                        <span>{isAr ? `إعادة تسجيل (${sub.grade || 65}%)` : `Revision Needed (${sub.grade || 65}%)`}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-cairo">
                  {asg.instructions || asg.description}
                </div>

                {/* Grader Feedback if Graded or Revision */}
                {(isGraded || isRevision) && sub.feedback && (
                  <div className={`p-4 rounded-2xl border text-xs font-cairo space-y-1 ${
                    isGraded
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
                  }`}>
                    <span className="font-bold block">
                      {isAr ? 'ملاحظات وتوجيهات المدرب الأكاديمي:' : 'Faculty Feedback:'}
                    </span>
                    <p className="leading-relaxed">{sub.feedback}</p>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-2 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span>
                      {asg.deadline
                        ? new Date(asg.deadline).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })
                        : isAr ? 'الخميس القادم — 11:59 م' : 'Next Thursday — 11:59 PM'}
                    </span>
                  </div>

                  {(isPending || isRevision) && (
                    <button
                      onClick={() => setSelectedAsg(asg)}
                      className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md shadow-gold-500/20 transition-all flex items-center justify-center gap-2 font-cairo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isRevision ? (isAr ? 'إعادة رفع التكليف الصوتي' : 'Re-submit Audio Take') : (isAr ? 'رفع وتسليم التكليف الصوتي' : 'Submit Studio Take')}</span>
                    </button>
                  )}

                  {isSubmitted && (
                    <button
                      onClick={() => setSelectedAsg(asg)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-700 dark:text-gray-300 font-bold text-xs transition-all border border-slate-200 dark:border-navy-700"
                    >
                      {isAr ? 'تحديث أو استبدال الملف المسلّم' : 'Update Submitted File'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🌟 Submit Assignment Take Modal */}
      {selectedAsg && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 font-cairo">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-start space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gold-600 dark:text-gold-400 font-bold font-mono block">
                  {getProgramTitle(selectedAsg)}
                </span>
                <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                  {selectedAsg.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAsg(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTake} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'رابط التسجيل الصوتي أو الفيديو (Google Drive / SoundCloud / MP3 URL):' : 'Audio / Video URL:'}
                </label>
                <input
                  required
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-mono text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {isAr ? 'ملاحظات أو تعليق للطالب مع التسليم (اختياري):' : 'Submission Notes (Optional):'}
                </label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder={isAr ? 'تم تسجيل التكليف مع استخدام مايك مكثف وتطبيق الوقفات...' : 'Recorded using condenser mic...'}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setSelectedAsg(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md shadow-gold-500/20 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'تأكيد رفع وتسليم التكليف' : 'Confirm Submission'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
