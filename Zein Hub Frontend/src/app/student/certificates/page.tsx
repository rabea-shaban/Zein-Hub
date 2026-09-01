'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import {
  Award,
  ShieldCheck,
  Download,
  ExternalLink,
  Calendar,
  Loader2,
  CheckCircle2,
  Printer,
} from 'lucide-react';

interface StudentCertificate {
  _id: string;
  certificateNumber: string;
  programId?: {
    _id: string;
    titleAr?: string;
    titleEn?: string;
    slug?: string;
  };
  finalGrade: number;
  issuedAt: string;
  isRevoked: boolean;
}

export default function StudentCertificatesPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCertificates() {
      try {
        setLoading(true);
        const res = await api.get<any>('/certificates/me');
        const list = Array.isArray(res.data) ? res.data : res.data?.certificates || [];
        setCertificates(list);
      } catch (err) {
        console.warn('Student certificates fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCertificates();
  }, []);

  return (
    <div className="p-4 sm:p-8 space-y-8 font-cairo text-start">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-cairo">
          {isAr ? 'شهاداتي وإنجازاتي الأكاديمية' : 'My Earned Certificates'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-cairo">
          {isAr
            ? 'الشهادات المعتمدة الصادرة باسمك والموثقة برقم تحقق رسمي مع إمكانية التحميل والطباعة'
            : 'Verified credentials of completion with official verification codes'}
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
          <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل شهاداتك المعتمدة...' : 'Loading certificates...'}</span>
        </div>
      ) : certificates.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-8 space-y-4">
          <Award className="w-12 h-12 mx-auto text-gray-300 dark:text-navy-700" />
          <h3 className="text-base font-bold text-navy-900 dark:text-white font-cairo">
            {isAr ? 'لم تصدر لك شهادات بعد' : 'No Certificates Issued Yet'}
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            {isAr
              ? 'عند إتمامك لنسبة 100% من الدروس وتسليم مشروع التخرج سيتم إصدار شهادتك المعتمدة فوراً.'
              : 'Complete 100% of curriculum and capstone take to receive your verified certificate.'}
          </p>
          <Link
            href="/student/programs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs"
          >
            <span>{isAr ? 'متابعة دروس الكورس' : 'Resume Modules'}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const pTitle = isAr
              ? cert.programId?.titleAr || cert.programId?.titleEn
              : cert.programId?.titleEn || cert.programId?.titleAr;

            return (
              <div
                key={cert._id}
                className="bg-white dark:bg-navy-900 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gold-500 text-navy-950 flex items-center justify-center font-black text-xl shadow-lg shadow-gold-500/25 shrink-0">
                      <Award className="w-7 h-7" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-mono font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isAr ? 'شهادة معتمدة وموثقة' : 'Verified Credential'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
                      {pTitle || (isAr ? 'برنامج تدريبي معتمد' : 'Certified Course')}
                    </h3>
                    <div className="text-xs font-mono text-gray-400">
                      <span>{isAr ? 'كود التحقق الرقمي: ' : 'Credential ID: '}</span>
                      <span className="font-bold text-gold-500">{cert.certificateNumber}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-100 dark:border-navy-800 grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-gray-400 block font-cairo">{isAr ? 'تاريخ المنح:' : 'Issue Date:'}</span>
                      <span className="font-bold text-navy-900 dark:text-white">
                        {new Date(cert.issuedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block font-cairo">{isAr ? 'الدرجة والتقدير:' : 'Final Grade:'}</span>
                      <span className="font-bold text-emerald-500">
                        {cert.finalGrade}% ({cert.finalGrade >= 90 ? (isAr ? 'امتياز' : 'Distinction') : (isAr ? 'جيد جداً' : 'Very Good')})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-navy-800 flex flex-col sm:flex-row gap-2.5">
                  <Link
                    href={`/certificates/${cert.certificateNumber}`}
                    target="_blank"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 font-cairo"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isAr ? 'عرض وطباعة الشهادة (PDF)' : 'View & Print PDF'}</span>
                  </Link>

                  <Link
                    href={`/certificates/${cert.certificateNumber}`}
                    target="_blank"
                    className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-navy-800 hover:bg-gray-200 dark:hover:bg-navy-750 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 font-cairo"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{isAr ? 'رابط التحقق' : 'Verify Link'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
