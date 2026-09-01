'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useLanguage } from '@/context/LanguageContext';
import {
  FileCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react';

interface ApplicationItem {
  _id: string;
  studentId?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
  student?: {
    _id?: string;
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
    _id?: string;
    titleAr?: string;
    titleEn?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  motivation?: string;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

const STUDENT_NAMES_EN: Record<string, string> = {
  'نورهان كمال الأسواني': 'Nourhan Kamal El Aswani',
  'يوسف عبد الرحمن القناوي': 'Youssef Abdelrahman El Qenawi',
  'مريم عصام الأبنودي': 'Mariam Essam El Abnoudi',
  'أحمد محمود الصعيدي': 'Ahmed Mahmoud El Saidi',
};

const MOTIVATION_TRANSLATIONS: Record<string, string> = {
  'بورتفوليو': 'Building a professional portfolio in cultural & news podcasting.',
  'الذكاء الاصطناعي': 'Specializing in AI audio engineering & newsroom post-production.',
  'النشرات الإخبارية': 'Developing news bulletin presentation & TV talk-show moderation skills.',
  'الفوكاليز': 'Mastering broadcast vocalise & professional on-air presentation.',
};

export default function AdminApplicationsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Review Modal
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [reviewAction, setReviewAction] = useState<'accepted' | 'rejected'>('accepted');
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<any>('/applications', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: search || undefined,
          limit: 50,
        },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.applications || [];
      setApplications(list);
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل طلبات الالتحاق' : 'Failed to load applications'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, isAr]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setActionLoading(true);
    try {
      await api.patch(`/applications/${selectedApp._id}/review`, {
        status: reviewAction,
        reviewNotes: reviewNotes || (reviewAction === 'accepted' ? 'تم قبول طلبك بنجاح' : 'نعتذر، لم يتم القبول في هذه الدفعة'),
      });
      toast.success(isAr ? 'تم تحديث حالة طلب الالتحاق بنجاح' : 'Application status updated successfully');
      setModalOpen(false);
      setSelectedApp(null);
      setReviewNotes('');
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل تحديث حالة الطلب' : 'Failed to update application status'));
    } finally {
      setActionLoading(false);
    }
  };

  const getStudentName = (app: ApplicationItem) => {
    const s = app.studentId || app.student;
    const raw = (typeof s === 'object' && s?.fullName) || '';
    if (isAr) return raw || 'طالب مسجل';
    return STUDENT_NAMES_EN[raw] || raw || 'Registered Student';
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

  const getMotivation = (app: ApplicationItem) => {
    if (!app.motivation) return isAr ? 'لا توجد ملاحظات إضافية' : 'No extra notes provided';
    if (isAr) return app.motivation;
    for (const [key, val] of Object.entries(MOTIVATION_TRANSLATIONS)) {
      if (app.motivation.includes(key)) return val;
    }
    return app.motivation;
  };

  return (
    <div className="space-y-8 font-cairo">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
          {isAr ? 'طلبات الالتحاق بالبرامج التدريبية' : 'Program Admission Applications'}
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-cairo">
          {isAr
            ? 'مراجعة طلبات التقديم، قبول الطلاب وتفعيل الاشتراكات تلقائياً مع تسجيل الملاحظات'
            : 'Review candidate applications, approve enrollments, and record admission notes'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Strip */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث بالطالب أو البرنامج...' : 'Search student or program...'}
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:border-gold-500 text-navy-900 dark:text-white"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { key: 'all', ar: 'كافة الطلبات', en: 'All Applications' },
            { key: 'pending', ar: 'قيد الانتظار والمراجعة', en: 'Pending Review' },
            { key: 'accepted', ar: 'المقبولة', en: 'Accepted' },
            { key: 'rejected', ar: 'المرفوضة', en: 'Rejected' },
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

      {/* Applications Table */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
            <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل الطلبات...' : 'Loading applications...'}</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm font-cairo">
            {isAr ? 'لا توجد طلبات مطابقة لخيارات الفلترة' : 'No applications found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-gray-50 dark:bg-navy-950/60 text-gray-500 dark:text-gray-400 text-xs font-bold border-y border-gray-100 dark:border-navy-800 font-cairo">
                <tr>
                  <th className="py-3 px-4">{isAr ? 'بيانات الطالب' : 'Student Info'}</th>
                  <th className="py-3 px-4">{isAr ? 'البرنامج المطلوب' : 'Requested Program'}</th>
                  <th className="py-3 px-4">{isAr ? 'هدف ودوافع الالتحاق' : 'Motivation'}</th>
                  <th className="py-3 px-4">{isAr ? 'تاريخ التقديم' : 'Applied Date'}</th>
                  <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'اتخاذ إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50/50 dark:hover:bg-navy-850/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-navy-900 dark:text-white font-cairo">
                        {getStudentName(app)}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">{getStudentEmail(app)}</div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-xs text-navy-800 dark:text-gray-200 font-cairo">
                      {getProgramTitle(app)}
                    </td>

                    <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate font-cairo">
                      {getMotivation(app)}
                    </td>

                    <td className="py-4 px-4 text-xs text-gray-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(app.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={app.status} />
                    </td>

                    <td className="py-4 px-4 text-center">
                      {app.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setReviewAction('accepted');
                              setModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold transition-colors font-cairo"
                          >
                            {isAr ? 'قبول' : 'Accept'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setReviewAction('rejected');
                              setModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-colors font-cairo"
                          >
                            {isAr ? 'رفض' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-cairo">
                          {isAr ? 'تم اتخاذ القرار' : 'Decided'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {modalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl text-start font-cairo">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
                {reviewAction === 'accepted'
                  ? (isAr ? 'اعتماد وقبول طلب الالتحاق' : 'Approve Application')
                  : (isAr ? 'رفض طلب الالتحاق' : 'Reject Application')}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-cairo">
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
                      : (isAr ? 'نعتذر عن عدم قبول الطلب في هذه الدفعة' : 'We regret to inform you that your application was not accepted.')
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
