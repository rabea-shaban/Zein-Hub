'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  Video,
  PlusCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  CheckCircle2,
  X,
  Play,
  Share2,
  Trash2,
  Loader2,
  Radio,
} from 'lucide-react';

interface LiveSessionItem {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  programId?: {
    _id: string;
    title?: string;
    titleAr?: string;
    titleEn?: string;
    slug?: string;
  };
  program?: string;
  startTime: string;
  endTime: string;
  location?: string;
  provider?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  meetingUrl?: string;
  attendeesCount?: number;
}

export default function InstructorLiveSessionsPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';

  const [sessions, setSessions] = useState<LiveSessionItem[]>([]);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProgramId, setNewProgramId] = useState('');
  const [newStartDate, setNewStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newStartTime, setNewStartTime] = useState('18:00');
  const [newEndTime, setNewEndTime] = useState('20:00');
  const [newProvider, setNewProvider] = useState<'google_meet' | 'zoom' | 'teams'>('google_meet');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // 1. Fetch Sessions and Programs from backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch Assigned Programs for Dropdown
      let progs: any[] = [];
      try {
        const myRes = await api.get<any>('/instructors/me/programs');
        progs = Array.isArray(myRes.data) ? myRes.data : myRes.data?.programs || [];
      } catch (err) {
        console.warn('Direct me/programs fetch failed:', err);
      }

      if (progs.length === 0 && user?.role === 'super_admin') {
        const allRes = await api.get<any>('/programs', { params: { limit: 100 } });
        progs = Array.isArray(allRes.data) ? allRes.data : allRes.data?.programs || [];
      }

      setProgramsList(progs);
      if (progs.length > 0 && !newProgramId) {
        setNewProgramId(progs[0]._id);
      }

      // Fetch Live Sessions from backend
      const sessRes = await api.get<any>('/sessions');
      const rawSessions = Array.isArray(sessRes.data) ? sessRes.data : sessRes.data?.sessions || [];

      const myProgramIds = new Set(progs.map((p: any) => p._id?.toString()));
      const mySessions = rawSessions.filter((sess: any) => {
        const sessInstId = typeof sess.instructorId === 'object' ? sess.instructorId?._id : sess.instructorId;
        const sessInstEmail = typeof sess.instructorId === 'object' ? sess.instructorId?.email : '';
        const sessProgId = typeof sess.programId === 'object' ? sess.programId?._id?.toString() : sess.programId?.toString();

        return (
          sessInstId === user?.id ||
          sessInstEmail === user?.email ||
          (sessProgId && myProgramIds.has(sessProgId)) ||
          user?.role === 'super_admin'
        );
      });

      setSessions(mySessions);
    } catch (err: any) {
      console.warn('Error fetching live sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [newProgramId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Create Session Submit
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProgramId) {
      toast.error(isAr ? 'يرجى إدخال عنوان الجلسة واختيار الدورة' : 'Please provide session title and program');
      return;
    }

    setIsSubmitting(true);
    try {
      let startDateObj: Date;
      let endDateObj: Date;

      if (newStartDate) {
        startDateObj = new Date(`${newStartDate}T${newStartTime || '18:00'}:00`);
        if (isNaN(startDateObj.getTime())) {
          startDateObj = new Date(Date.now() + 24 * 3600 * 1000);
        }
      } else {
        startDateObj = new Date(Date.now() + 24 * 3600 * 1000);
      }

      if (newStartDate && newEndTime) {
        endDateObj = new Date(`${newStartDate}T${newEndTime}:00`);
        if (isNaN(endDateObj.getTime()) || endDateObj.getTime() <= startDateObj.getTime()) {
          // If end time is before or equal to start time, add 2 hours automatically
          endDateObj = new Date(startDateObj.getTime() + 2 * 3600 * 1000);
        }
      } else {
        endDateObj = new Date(startDateObj.getTime() + 2 * 3600 * 1000);
      }

      const payload = {
        title: newTitle.trim(),
        description: newDesc.trim() || (isAr ? 'جلسة تدريبية عملية واستوديو تطبيقي مباشر.' : 'Practical hands-on studio coaching.'),
        provider: newProvider,
        meetingUrl: newUrl.trim() || 'https://meet.google.com/zein-hub-live',
        startTime: startDateObj.toISOString(),
        endTime: endDateObj.toISOString(),
      };

      await api.post(`/programs/${newProgramId}/sessions`, payload);

      toast.success(isAr ? 'تمت جدولة الجلسة الحية بنجاح' : 'Live session scheduled successfully');
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewUrl('');
      setNewDesc('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل جدولة الجلسة' : 'Failed to schedule session'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Session
  const handleDeleteSession = async (sessionId: string) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    const result = await Swal.fire({
      title: isAr ? 'إلغاء وحذف الجلسة؟' : 'Cancel & Delete Session?',
      text: isAr ? 'هل أنت متأكد من إلغاء وحذف هذه الجلسة الحية نهائياً؟' : 'Are you sure you want to permanently cancel and delete this live session?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E5A93C',
      cancelButtonColor: isDark ? '#1E293B' : '#94A3B8',
      confirmButtonText: isAr ? 'نعم، احذف الجلسة' : 'Yes, delete it',
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
      await api.delete(`/sessions/${sessionId}`);
      toast.success(isAr ? 'تم حذف الجلسة بنجاح' : 'Session deleted successfully');
      setSessions(sessions.filter((s) => s._id !== sessionId));
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل حذف الجلسة' : 'Failed to delete session'));
    }
  };

  // Update Status
  const handleUpdateStatus = async (sessionId: string, newStatus: string) => {
    try {
      await api.patch(`/sessions/${sessionId}/status`, { status: newStatus });
      toast.success(isAr ? 'تم تحديث حالة الجلسة' : 'Status updated');
      setSessions(
        sessions.map((s) => (s._id === sessionId ? { ...s, status: newStatus as any } : s))
      );
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل تحديث الحالة' : 'Failed to update status'));
    }
  };

  const getProgramName = (sess: LiveSessionItem) => {
    if (sess.programId) {
      return isAr
        ? sess.programId.titleAr || sess.programId.title || sess.programId.titleEn
        : sess.programId.titleEn || sess.programId.title || sess.programId.titleAr;
    }
    return sess.program || (isAr ? 'دبلوم التعليق الصوتي والفوكاليز' : 'Voice-Over Diploma');
  };

  return (
    <div className="space-y-8 text-start font-cairo">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'الجلسات الحية وورش الاستوديو' : 'Live Studio Sessions & Workshops'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 mt-1">
            {isAr
              ? 'جدولة وإطلاق جلسات التدريب المباشرة في استوديوهات صعيد مصر والغرف الرقمية'
              : 'Schedule and launch hands-on studio drills and digital broadcasting rooms'}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs font-cairo shadow-md shadow-gold-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAr ? 'جدولة جلسة حية جديدة' : 'Schedule Live Session'}</span>
        </button>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400 dark:text-gray-400">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
          <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل الجلسات الحية...' : 'Loading sessions...'}</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 space-y-3 shadow-sm">
          <Radio className="w-12 h-12 mx-auto text-gold-500" />
          <h3 className="text-base font-bold text-navy-900 dark:text-white">
            {isAr ? 'لا توجد جلسات حية مجدولة حالياً' : 'No Live Sessions Scheduled'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto">
            {isAr
              ? 'يمكنك جدولة ورشة عمل حية أو جلسة تدريب استوديو للطلاب في أي وقت.'
              : 'You can schedule live workshops and studio training sessions anytime.'}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isAr ? 'جدولة جلسة الآن' : 'Schedule Session'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((sess) => {
            const isLive = sess.status === 'live';
            const isCompleted = sess.status === 'completed';
            const programName = getProgramName(sess);
            const dateStr = sess.startTime
              ? new Date(sess.startTime).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })
              : isAr ? 'قريباً' : 'Upcoming';
            const timeStr = sess.startTime
              ? new Date(sess.startTime).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '06:00 PM';

            return (
              <div
                key={sess._id}
                className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm hover:border-gold-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono ${
                        isLive
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isCompleted
                          ? 'bg-slate-100 dark:bg-navy-850 text-slate-500 dark:text-gray-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isLive
                        ? isAr ? 'مباشر الآن 🔴' : 'LIVE NOW 🔴'
                        : isCompleted
                        ? isAr ? 'منتهية' : 'Completed'
                        : isAr ? 'مجدولة قريباً' : 'Upcoming'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteSession(sess._id)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title={isAr ? 'حذف الجلسة' : 'Delete Session'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gold-700 dark:text-gold-400 font-mono block">
                      {programName}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-navy-900 dark:text-white mt-1 leading-snug">
                      {sess.title}
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-gray-400 font-cairo pt-2 border-t border-slate-100 dark:border-navy-850">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                      <span className="font-mono">{timeStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                      <span>{sess.location || (sess.provider === 'zoom' ? 'Zoom Live Room' : isAr ? 'استوديو قنا المركزي + بث مباشر' : 'Qena Studio + Google Meet')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-2">
                  {sess.meetingUrl ? (
                    <a
                      href={sess.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md transition-all"
                    >
                      <Video className="w-4 h-4" />
                      <span>{isAr ? 'بدء البث / دخول القاعة' : 'Launch Session'}</span>
                    </a>
                  ) : (
                    <button
                      disabled={isCompleted}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-gray-300 font-bold text-xs hover:bg-gold-500 hover:text-navy-950 transition-all disabled:opacity-50"
                    >
                      <Video className="w-4 h-4" />
                      <span>{isAr ? 'استوديو تطبيقي ميداني' : 'Studio In-Person'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🌟 Schedule Live Session Modal (Fully Connected to Backend) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4 font-cairo">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-start space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                {isAr ? 'جدولة جلسة استوديو أو ورشة حية' : 'Schedule Live Studio Workshop'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  {isAr ? 'عنوان الجلسة:' : 'Session Title:'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isAr ? 'ورشة تطبيقات الأداء الإعلاني والوثائقي' : 'Commercial VO Workshop'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  {isAr ? 'البرنامج التدريبي التابع له:' : 'Select Program:'}
                </label>
                <select
                  required
                  value={newProgramId}
                  onChange={(e) => setNewProgramId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  {programsList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {isAr ? p.titleAr || p.title || p.titleEn : p.titleEn || p.title || p.titleAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    {isAr ? 'تاريخ الانعقاد:' : 'Date:'}
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    {isAr ? 'وقت البدء:' : 'Start Time:'}
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    {isAr ? 'منصة البث:' : 'Platform Provider:'}
                  </label>
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 cursor-pointer"
                  >
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    {isAr ? 'رابط القاعة / البث:' : 'Meeting Link:'}
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  {isAr ? 'وصف ومحاور الورشة (اختياري):' : 'Session Objectives (Optional):'}
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder={isAr ? 'تطبيقات عملية ومحاكاة استوديو تفاعلية...' : 'Studio drills...'}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md shadow-gold-500/20 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'حفظ وجدولة الجلسة' : 'Schedule Session'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
