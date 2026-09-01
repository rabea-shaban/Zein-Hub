'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useLanguage } from '@/context/LanguageContext';
import { Video, PlusCircle, Calendar, Clock, Loader2, AlertCircle, X, ExternalLink } from 'lucide-react';

interface LiveSessionItem {
  _id: string;
  title: string;
  provider: 'zoom' | 'google-meet' | 'microsoft-teams' | 'custom';
  meetingUrl: string;
  meetingPassword?: string;
  startTime: string;
  durationMinutes: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  program?: {
    _id: string;
    titleAr: string;
  };
}

interface ProgramItem {
  _id: string;
  titleAr: string;
  titleEn?: string;
}

export default function AdminLiveSessionsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [sessions, setSessions] = useState<LiveSessionItem[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    programId: '',
    title: '',
    provider: 'zoom',
    meetingUrl: '',
    meetingPassword: '',
    startTime: '2026-09-15T18:00',
    durationMinutes: 90,
  });

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const progRes = await api.get<ProgramItem[]>('/programs');
      const progs = progRes.data || [];
      setPrograms(progs);

      if (progs.length > 0) {
        const sessRes = await api.get<LiveSessionItem[]>(`/programs/${progs[0]._id}/sessions`);
        setSessions(sessRes.data || []);
        setFormData((prev) => ({ ...prev, programId: progs[0]._id }));
      }
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل الجلسات المباشرة' : 'Failed to load live sessions'));
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProgramSelect = async (pId: string) => {
    setFormData((prev) => ({ ...prev, programId: pId }));
    try {
      const sessRes = await api.get<LiveSessionItem[]>(`/programs/${pId}/sessions`);
      setSessions(sessRes.data || []);
    } catch (err: any) {
      console.warn('Failed to load program sessions:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.programId || !formData.title || !formData.meetingUrl) {
      toast.error(isAr ? 'يرجى تعبئة كافة الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setCreating(true);
    try {
      await api.post(`/programs/${formData.programId}/sessions`, {
        title: formData.title,
        provider: formData.provider,
        meetingUrl: formData.meetingUrl,
        meetingPassword: formData.meetingPassword || undefined,
        startTime: new Date(formData.startTime).toISOString(),
        durationMinutes: Number(formData.durationMinutes),
      });

      toast.success(isAr ? 'تمت جدولة ورشة البث المباشر بنجاح' : 'Live session scheduled successfully');
      setIsModalOpen(false);
      setFormData((prev) => ({
        ...prev,
        title: '',
        meetingUrl: '',
        meetingPassword: '',
      }));
      handleProgramSelect(formData.programId);
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل جدولة الجلسة التفاعلية' : 'Failed to schedule session'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 font-cairo">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'الجلسات والورش التفاعلية المباشرة' : 'Live Interactive Workshops & Sessions'}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-cairo">
            {isAr
              ? 'إدارة وروابط لقاءات التدريب العملي المباشر عبر المنصات الرقمية'
              : 'Schedule and manage live video workshops and webinar links'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs font-cairo shadow-md shadow-gold-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAr ? 'جدولة جلسة تفاعلية جديدة' : 'Schedule Live Session'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Program Selector */}
      {programs.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {programs.map((p) => (
            <button
              key={p._id}
              onClick={() => handleProgramSelect(p._id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 font-cairo ${
                formData.programId === p._id
                  ? 'bg-navy-950 dark:bg-gold-500 text-white dark:text-navy-950 shadow-md'
                  : 'bg-white dark:bg-navy-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-navy-800'
              }`}
            >
              {isAr ? p.titleAr : p.titleEn || p.titleAr}
            </button>
          ))}
        </div>
      )}

      {/* Sessions Grid / Table */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 font-cairo">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
            <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل الجلسات...' : 'Loading sessions...'}</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm font-cairo">
            {isAr ? 'لا توجد جلسات مباشرة مجدولة لهذا البرنامج حالياً' : 'No live sessions scheduled for this program'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-gray-50 dark:bg-navy-950/60 text-gray-500 dark:text-gray-400 text-xs font-bold border-y border-gray-100 dark:border-navy-800 font-cairo">
                <tr>
                  <th className="py-3 px-4">{isAr ? 'عنوان الجلسة' : 'Session Title'}</th>
                  <th className="py-3 px-4">{isAr ? 'منصة البث' : 'Platform'}</th>
                  <th className="py-3 px-4">{isAr ? 'موعد البدء' : 'Start Time'}</th>
                  <th className="py-3 px-4">{isAr ? 'المدة' : 'Duration'}</th>
                  <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'رابط الدخول' : 'Join Link'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                {sessions.map((sess) => (
                  <tr key={sess._id} className="hover:bg-gray-50/50 dark:hover:bg-navy-850/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-navy-900 dark:text-white font-cairo">
                      {sess.title}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-gold-600 dark:text-gold-400 uppercase font-bold">
                      {sess.provider}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(sess.startTime).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500 font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{sess.durationMinutes} {isAr ? 'دقيقة' : 'min'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={sess.status} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <a
                        href={sess.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-gold-500 text-navy-950 font-bold hover:bg-gold-400 transition-all inline-flex items-center gap-1 text-xs font-cairo"
                      >
                        <span>{isAr ? 'انضمام' : 'Join'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl text-start font-cairo">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'جدولة جلسة تفاعلية جديدة' : 'Schedule Live Workshop'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 font-cairo mb-1.5">
                  {isAr ? 'البرنامج التدريبي' : 'Program'}
                </label>
                <select
                  value={formData.programId}
                  onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-cairo"
                >
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.titleAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 font-cairo mb-1.5">
                  {isAr ? 'عنوان الجلسة والمحور' : 'Session Title'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={isAr ? 'الورشة التطبيقية لمخارج الحروف والفوكاليز' : 'Interactive vocal workshop'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-cairo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 font-cairo mb-1.5">
                    {isAr ? 'المنصة' : 'Platform'}
                  </label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                  >
                    <option value="zoom">Zoom</option>
                    <option value="google-meet">Google Meet</option>
                    <option value="microsoft-teams">Microsoft Teams</option>
                    <option value="custom">Custom URL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 font-cairo mb-1.5">
                    {isAr ? 'المدة (بالدقائق)' : 'Duration (mins)'}
                  </label>
                  <input
                    type="number"
                    min={15}
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 font-cairo mb-1.5">
                  {isAr ? 'رابط غرفة الاجتماع' : 'Meeting URL'}
                </label>
                <input
                  type="url"
                  required
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                  placeholder="https://zoom.us/j/123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 font-cairo mb-1.5">
                  {isAr ? 'تاريخ ووقت الانعقاد' : 'Start Date & Time'}
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-500 font-cairo"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50 font-cairo"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{isAr ? 'تأكيد الجدولة' : 'Schedule Session'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
