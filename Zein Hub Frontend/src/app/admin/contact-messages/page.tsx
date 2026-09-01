'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Mail,
  Phone,
  Search,
  MessageCircle,
  Clock,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  MapPin,
  HelpCircle,
  Send,
} from 'lucide-react';

interface ContactMessageItem {
  _id: string;
  ticketId: string;
  fullName: string;
  email: string;
  phone: string;
  governorate: string;
  inquiryType: string;
  message: string;
  status: 'new' | 'in-progress' | 'replied' | 'archived';
  adminNotes?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function AdminContactMessagesPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedViewMsg, setSelectedViewMsg] = useState<ContactMessageItem | null>(null);
  const [selectedDeleteMsg, setSelectedDeleteMsg] = useState<ContactMessageItem | null>(null);
  const [modalAdminNotes, setModalAdminNotes] = useState('');
  const [modalStatus, setModalStatus] = useState<'new' | 'in-progress' | 'replied' | 'archived'>('new');
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<any>('/contact', {
        params: {
          limit: 50,
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
      });

      const list = Array.isArray(res.data) ? res.data : res.data?.messages || [];
      setMessages(list);
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل رسائل واستفسارات التواصل' : 'Failed to load contact messages'));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, isAr]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleOpenView = (msg: ContactMessageItem) => {
    setSelectedViewMsg(msg);
    setModalAdminNotes(msg.adminNotes || '');
    setModalStatus(msg.status);
  };

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/contact/${id}/status`, { status: newStatus });
      toast.success(isAr ? 'تم تحديث حالة الرسالة بنجاح' : 'Message status updated');
      fetchMessages();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل تحديث حالة الرسالة' : 'Failed to update message status'));
    }
  };

  const handleSaveModalUpdates = async () => {
    if (!selectedViewMsg) return;
    setSavingNotes(true);
    try {
      await api.patch(`/contact/${selectedViewMsg._id}/status`, {
        status: modalStatus,
        adminNotes: modalAdminNotes,
      });
      toast.success(isAr ? 'تم حفظ التعديلات والملاحظات بنجاح' : 'Notes saved successfully');
      setSelectedViewMsg(null);
      fetchMessages();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل حفظ الملاحظات' : 'Failed to save notes'));
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteMsg) return;
    setDeleting(true);
    try {
      await api.delete(`/contact/${selectedDeleteMsg._id}`);
      toast.success(isAr ? 'تم حذف الرسالة بنجاح' : 'Message deleted successfully');
      setSelectedDeleteMsg(null);
      fetchMessages();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل حذف الرسالة' : 'Failed to delete message'));
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isAr ? 'جديدة' : 'New'}
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            {isAr ? 'قيد المتابعة' : 'In Progress'}
          </span>
        );
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            {isAr ? 'تم الرد' : 'Replied'}
          </span>
        );
      case 'archived':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-navy-800 text-gray-500 border border-gray-200 dark:border-navy-700 text-[11px] font-bold">
            {isAr ? 'مؤرشفة' : 'Archived'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-cairo">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
          {isAr ? 'رسائل واستفسارات التواصل' : 'Contact Inquiries & Messages'}
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-cairo">
          {isAr
            ? 'متابعة استفسارات الزوار، طلبات التدريب المؤسسي، والتواصل المباشر مع المتقدمين'
            : 'Track incoming inquiries, partnership requests, and contact candidates directly'}
        </p>
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
            placeholder={isAr ? 'بحث برقم التذكرة، الاسم، أو المحافظة...' : 'Search ticket, name, governorate...'}
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:border-gold-500 text-navy-900 dark:text-white font-cairo"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { key: 'all', ar: 'كافة الرسائل', en: 'All' },
            { key: 'new', ar: 'الجديدة (غير مقروءة)', en: 'New' },
            { key: 'in-progress', ar: 'قيد المتابعة', en: 'In Progress' },
            { key: 'replied', ar: 'تم الرد', en: 'Replied' },
            { key: 'archived', ar: 'المؤرشفة', en: 'Archived' },
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

      {/* Messages Table */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
            <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل الرسائل...' : 'Loading messages...'}</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm font-cairo">
            {isAr ? 'لا توجد رسائل مطابقة لخيارات البحث' : 'No contact messages found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-gray-50 dark:bg-navy-950/60 text-gray-500 dark:text-gray-400 text-xs font-bold border-y border-gray-100 dark:border-navy-800 font-cairo">
                <tr>
                  <th className="py-3.5 px-4">{isAr ? 'رقم التذكرة والراسل' : 'Ticket & Sender'}</th>
                  <th className="py-3.5 px-4">{isAr ? 'المحافظة ونوع الاستفسار' : 'Governorate & Topic'}</th>
                  <th className="py-3.5 px-4">{isAr ? 'نص الاستفسار' : 'Message'}</th>
                  <th className="py-3.5 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-center">{isAr ? 'تغيير الحالة' : 'Change Status'}</th>
                  <th className="py-3.5 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                {messages.map((msg) => {
                  const whatsappUrl = `https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    isAr
                      ? `مرحباً أستاذ ${msg.fullName}، بخصوص تذكرتكم رقم (${msg.ticketId}) على منصة Zein Hub:`
                      : `Hello ${msg.fullName}, regarding your inquiry (${msg.ticketId}) on Zein Hub:`
                  )}`;

                  return (
                    <tr
                      key={msg._id}
                      className="hover:bg-gray-50/50 dark:hover:bg-navy-850/40 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs font-bold text-gold-600 dark:text-gold-400 block">
                          {msg.ticketId}
                        </span>
                        <div className="font-bold text-navy-900 dark:text-white font-cairo mt-0.5">
                          {msg.fullName}
                        </div>
                        <div className="text-xs text-gray-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>{msg.phone}</span>
                          <span>•</span>
                          <span>{msg.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs font-cairo">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 font-bold mb-1">
                          <MapPin className="w-3 h-3 text-gold-500" />
                          {msg.governorate}
                        </span>
                        <div className="font-semibold text-navy-800 dark:text-gray-300 line-clamp-1">
                          {msg.inquiryType}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs text-gray-600 dark:text-gray-400 max-w-xs font-cairo">
                        <p className="line-clamp-2 leading-relaxed">"{msg.message}"</p>
                      </td>

                      <td className="py-4 px-4">
                        {getStatusBadge(msg.status)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <select
                          value={msg.status}
                          onChange={(e) => handleQuickStatusChange(msg._id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs font-bold focus:outline-none focus:border-gold-500 text-navy-900 dark:text-white font-cairo cursor-pointer"
                        >
                          <option value="new">{isAr ? 'جديدة' : 'New'}</option>
                          <option value="in-progress">{isAr ? 'قيد المتابعة' : 'In Progress'}</option>
                          <option value="replied">{isAr ? 'تم الرد' : 'Replied'}</option>
                          <option value="archived">{isAr ? 'مؤرشفة' : 'Archived'}</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Full Message */}
                          <button
                            onClick={() => handleOpenView(msg)}
                            className="p-2 rounded-xl text-navy-700 dark:text-navy-300 bg-gray-100 dark:bg-navy-800 hover:bg-gold-500 hover:text-navy-950 transition-all"
                            title={isAr ? 'عرض نص الرسالة والملاحظات' : 'View Message Details'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick WhatsApp Reply */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-600 hover:text-white transition-all"
                            title={isAr ? 'مراسلة فورية عبر واتساب' : 'Quick WhatsApp Reply'}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete Trigger */}
                          <button
                            onClick={() => setSelectedDeleteMsg(msg)}
                            className="p-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all"
                            title={isAr ? 'حذف الرسالة' : 'Delete Message'}
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

      {/* 1️⃣ View Message & Record Notes Modal */}
      {selectedViewMsg && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl text-start max-h-[90vh] overflow-y-auto font-cairo space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-3 py-1 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-bold border border-gold-500/20 font-mono">
                  {selectedViewMsg.ticketId}
                </span>
                <h3 className="text-xl font-extrabold text-navy-900 dark:text-white font-cairo mt-2">
                  {selectedViewMsg.fullName}
                </h3>
                <div className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-2">
                  <span>{selectedViewMsg.phone}</span>
                  <span>•</span>
                  <span>{selectedViewMsg.email}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedViewMsg(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inq Info Strip */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-100 dark:border-navy-800 text-xs font-cairo">
              <div>
                <span className="text-gray-400 block text-[11px]">{isAr ? 'المحافظة' : 'Governorate'}</span>
                <span className="font-bold text-navy-900 dark:text-white">{selectedViewMsg.governorate}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">{isAr ? 'نوع الاستفسار' : 'Inquiry Type'}</span>
                <span className="font-bold text-navy-900 dark:text-white">{selectedViewMsg.inquiryType}</span>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {isAr ? 'نص الاستفسار الكامل:' : 'Full Message:'}
              </h4>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-navy-850 p-4 rounded-2xl border border-slate-100 dark:border-navy-800">
                "{selectedViewMsg.message}"
              </p>
            </div>

            {/* Admin Reply Notes & Status */}
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-navy-800">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  {isAr ? 'تحديث حالة المتابعة:' : 'Update Status:'}
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-cairo"
                >
                  <option value="new">{isAr ? 'جديدة' : 'New'}</option>
                  <option value="in-progress">{isAr ? 'قيد المتابعة' : 'In Progress'}</option>
                  <option value="replied">{isAr ? 'تم الرد' : 'Replied'}</option>
                  <option value="archived">{isAr ? 'مؤرشفة' : 'Archived'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  {isAr ? 'ملاحظات الإدارة الداخلية على الرسالة:' : 'Admin Notes:'}
                </label>
                <textarea
                  rows={3}
                  value={modalAdminNotes}
                  onChange={(e) => setModalAdminNotes(e.target.value)}
                  placeholder={isAr ? 'أدخل ملاحظات التواصل أو محضر الاتصال مع الراسل...' : 'Internal notes...'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-cairo"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setSelectedViewMsg(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleSaveModalUpdates}
                disabled={savingNotes}
                className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs transition-all shadow-md shadow-gold-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{isAr ? 'حفظ وتحديث الحالة' : 'Save & Update'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2️⃣ Delete Confirmation Modal */}
      {selectedDeleteMsg && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl text-start font-cairo space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'حذف استفسار التواصل نهائياً' : 'Delete Contact Message'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed font-cairo">
                {isAr
                  ? `هل أنت متأكد من حذف تذكرة "${selectedDeleteMsg.ticketId}" المرسلة من "${selectedDeleteMsg.fullName}"؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete ticket "${selectedDeleteMsg.ticketId}" from "${selectedDeleteMsg.fullName}"?`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setSelectedDeleteMsg(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{isAr ? 'تأكيد الحذف' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
