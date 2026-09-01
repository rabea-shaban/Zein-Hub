'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useLanguage } from '@/context/LanguageContext';
import {
  Award,
  ExternalLink,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Eye,
  Trash2,
  ShieldCheck,
  Calendar,
  X,
  User,
  GraduationCap,
} from 'lucide-react';

interface CertificateItem {
  _id: string;
  certificateNumber: string;
  studentId?: {
    _id: string;
    fullName: string;
    email: string;
  };
  programId?: {
    _id: string;
    titleAr: string;
    titleEn: string;
  };
  finalGrade: number;
  issuedAt: string;
  isRevoked: boolean;
}

export default function AdminCertificatesPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Issue Certificate Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [finalGrade, setFinalGrade] = useState(95);

  const fetchCertificates = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<any>('/certificates/admin/all', {
        params: { search: search || undefined },
      });
      const list = Array.isArray(res.data) ? res.data : [];
      setCertificates(list);

      // Fetch students and programs for the issue modal
      const [studentsRes, progsRes] = await Promise.allSettled([
        api.get<any>('/admin/enrollments'),
        api.get<any>('/programs'),
      ]);

      if (studentsRes.status === 'fulfilled' && studentsRes.value.data) {
        const raw = Array.isArray(studentsRes.value.data) ? studentsRes.value.data : studentsRes.value.data?.enrollments || [];
        setStudentsList(raw);
      }
      if (progsRes.status === 'fulfilled' && progsRes.value.data) {
        const raw = Array.isArray(progsRes.value.data) ? progsRes.value.data : progsRes.value.data?.programs || [];
        setProgramsList(raw);
      }
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل بيانات الشهادات' : 'Failed to load certificates'));
    } finally {
      setLoading(false);
    }
  }, [search, isAr]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedProgramId) {
      toast.error(isAr ? 'يرجى اختيار الطالب والبرنامج التدريبي' : 'Please select student and program');
      return;
    }

    setIssuing(true);
    try {
      await api.post('/certificates/admin/issue', {
        studentId: selectedStudentId,
        programId: selectedProgramId,
        finalGrade: Number(finalGrade) || 95,
      });
      toast.success(isAr ? 'تم إصدار الشهادة وتوثيقها رسمياً بنجاح!' : 'Certificate issued and verified successfully!');
      setIsIssueModalOpen(false);
      setSelectedStudentId('');
      setSelectedProgramId('');
      await fetchCertificates();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل إصدار الشهادة' : 'Failed to issue certificate'));
    } finally {
      setIssuing(false);
    }
  };

  const handleToggleRevoke = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من تغيير حالة اعتماد هذه الشهادة؟' : 'Are you sure you want to toggle revocation?')) return;

    try {
      await api.patch(`/certificates/admin/${id}/revoke`, { reason: 'إلغاء بقرار إداري' });
      toast.success(isAr ? 'تم تعديل حالة اعتماد الشهادة بنجاح' : 'Certificate status updated');
      await fetchCertificates();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل تعديل حالة الشهادة' : 'Failed to toggle revocation'));
    }
  };

  return (
    <div className="space-y-8 font-cairo text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'الشهادات المعتمدة والتحقق الرقمي' : 'Certified Credentials & Verification'}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-cairo">
            {isAr
              ? 'سجل الشهادات الصادرة للخريجين، إصدار شهادات جديدة، وأكواد التحقق الرقمية المؤمنة'
              : 'Issued certificates registry with tamper-proof digital verification codes'}
          </p>
        </div>

        <button
          onClick={() => setIsIssueModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all shadow-md shadow-gold-500/20 flex items-center justify-center gap-2 self-start sm:self-auto font-cairo"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAr ? 'إصدار شهادة تخرج جديدة' : 'Issue New Certificate'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verification Lookup Box */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2 text-emerald-500 font-bold text-sm">
          <CheckCircle className="w-5 h-5" />
          <span>{isAr ? 'أداة التحقق الفوري من صحة الشهادة' : 'Instant Certificate Verification Tool'}</span>
        </div>
        <p className="text-xs text-gray-400 mb-6 font-cairo">
          {isAr
            ? 'يمكن لأي جهة توظيف أو طالب التحقق من صحة ومصداقية الشهادة عبر الكود الرقمي:'
            : 'Employers and students can verify certificate validity via reference number:'}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl">
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'أدخل كود الشهادة، مثال: ZH-CERT-2026-8803' : 'Enter certificate number, e.g. ZH-CERT-2026-8803'}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:border-gold-500 font-mono text-navy-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => {
              if (!search.trim()) return;
              window.open(`/certificates/${search.trim()}`, '_blank');
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs transition-all shadow-md shadow-gold-500/20 whitespace-nowrap flex items-center justify-center gap-2 font-cairo"
          >
            <span>{isAr ? 'فحص الشهادة' : 'Verify Certificate'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Certificates Registry Table */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
              {isAr ? 'سجل الشهادات الصادرة' : 'Issued Certificates Registry'}
            </h3>
            <span className="text-xs text-gray-400 font-mono font-bold">
              {isAr ? `إجمالي الشهادات: ${certificates.length}` : `Total Certificates: ${certificates.length}`}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
            <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل الشهادات...' : 'Loading certificates...'}</span>
          </div>
        ) : certificates.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm font-cairo space-y-2">
            <Award className="w-10 h-10 mx-auto text-gray-300 dark:text-navy-700" />
            <p className="font-bold">{isAr ? 'لا توجد شهادات مسجلة حالياً' : 'No certificates found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm font-cairo">
              <thead className="bg-gray-50 dark:bg-navy-950/60 text-gray-500 dark:text-gray-400 text-xs font-bold border-y border-gray-100 dark:border-navy-800">
                <tr>
                  <th className="py-3 px-4">{isAr ? 'كود الشهادة' : 'Certificate Ref'}</th>
                  <th className="py-3 px-4">{isAr ? 'اسم الخريج(ة)' : 'Graduate Name'}</th>
                  <th className="py-3 px-4">{isAr ? 'البرنامج التدريبي' : 'Program'}</th>
                  <th className="py-3 px-4">{isAr ? 'الدرجة' : 'Grade'}</th>
                  <th className="py-3 px-4">{isAr ? 'تاريخ الإصدار' : 'Issue Date'}</th>
                  <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                {certificates.map((cert) => {
                  const sName = cert.studentId?.fullName || (isAr ? 'طالب خريج' : 'Graduate Student');
                  const sEmail = cert.studentId?.email || '';
                  const pTitle = isAr
                    ? cert.programId?.titleAr || cert.programId?.titleEn
                    : cert.programId?.titleEn || cert.programId?.titleAr;

                  return (
                    <tr key={cert._id} className="hover:bg-gray-50/50 dark:hover:bg-navy-850/40 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-gold-600 dark:text-gold-400 text-xs">
                        {cert.certificateNumber}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-navy-900 dark:text-white text-xs">{sName}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{sEmail}</div>
                      </td>

                      <td className="py-4 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {pTitle || (isAr ? 'البرنامج التدريبي' : 'Course')}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-emerald-500 text-xs">
                        {cert.finalGrade}%
                      </td>

                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">
                        {new Date(cert.issuedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            cert.isRevoked
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{cert.isRevoked ? (isAr ? 'ملغاة' : 'Revoked') : (isAr ? 'معتمدة' : 'Valid')}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/certificates/${cert.certificateNumber}`}
                            target="_blank"
                            className="p-2 rounded-xl bg-gray-50 dark:bg-navy-950 text-gray-600 dark:text-gray-300 hover:bg-gold-500 hover:text-navy-950 border border-gray-200 dark:border-navy-800 transition-all"
                            title={isAr ? 'عرض الشهادة الرقمية المطبوعة' : 'View & Print Certificate'}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleToggleRevoke(cert._id)}
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors border border-rose-500/20"
                            title={cert.isRevoked ? (isAr ? 'إعادة التفعيل' : 'Restore') : (isAr ? 'إلغاء الشهادة' : 'Revoke')}
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* 🌟 Issue New Certificate Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-start font-cairo">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gold-500 text-navy-950 font-black flex items-center justify-center shadow-md shadow-gold-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
                    {isAr ? 'إصدار شهادة تخرج رسمية جديدة' : 'Issue Official Certificate'}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {isAr ? 'توليد كود تحقق رقمي وتسجيلها بالسجل الأكاديمي' : 'Generates QR verification code and logs to registry'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              {/* Student Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-500" />
                  <span>{isAr ? 'اختر الطالب الخريج:' : 'Select Graduate Student:'}</span>
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs font-bold text-navy-900 dark:text-white focus:border-gold-500 cursor-pointer font-cairo"
                >
                  <option value="">{isAr ? '--- اختر الطالب من المسجلين ---' : '--- Select Student ---'}</option>
                  {studentsList.map((enr: any) => {
                    const s = enr.studentId;
                    if (!s?._id) return null;
                    return (
                      <option key={s._id} value={s._id}>
                        {s.fullName} ({s.email})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Program Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-gold-500" />
                  <span>{isAr ? 'البرنامج التدريبي المكتمل:' : 'Completed Program:'}</span>
                </label>
                <select
                  required
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs font-bold text-navy-900 dark:text-white focus:border-gold-500 cursor-pointer font-cairo"
                >
                  <option value="">{isAr ? '--- اختر البرنامج التدريبي ---' : '--- Select Program ---'}</option>
                  {programsList.map((prog: any) => (
                    <option key={prog._id} value={prog._id}>
                      {isAr ? prog.titleAr || prog.titleEn : prog.titleEn || prog.titleAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Final Grade */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {isAr ? 'الدرجة والنسبة التراكمية (من 100):' : 'Final Grade % (Out of 100):'}
                </label>
                <input
                  required
                  type="number"
                  min={60}
                  max={100}
                  value={finalGrade}
                  onChange={(e) => setFinalGrade(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs font-mono font-bold text-navy-900 dark:text-white focus:border-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800 font-cairo"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={issuing}
                  className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md flex items-center gap-2 font-cairo"
                >
                  {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                  <span>{isAr ? 'إصدار الشهادة وتوثيقها فوراً' : 'Issue & Verify Certificate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
