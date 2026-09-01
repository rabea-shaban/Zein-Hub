'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import {
  Award,
  ShieldCheck,
  Printer,
  Share2,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface CertificateDetails {
  isValid: boolean;
  certificateNumber: string;
  studentName: string;
  programTitleAr: string;
  programTitleEn: string;
  trackNameAr?: string;
  trackNameEn?: string;
  finalGrade: number;
  issuedAt: string;
  certificateUrl: string;
}

export default function PublicCertificateViewPage() {
  const params = useParams();
  const rawCode = params.code as string;
  const { language, direction } = useLanguage();
  const isAr = language === 'ar';
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const [cert, setCert] = useState<CertificateDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!rawCode) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<any>(`/certificates/verify/${rawCode.trim()}`);
        if (res.data) {
          setCert(res.data);
        } else {
          setError(isAr ? 'لم يتم العثور على شهادة معتمدة بهذا الرقم' : 'Certificate not found');
        }
      } catch (err: any) {
        setError(err.message || (isAr ? 'تعذر التحقق من الشهادة أو الكود غير صحيح' : 'Verification failed'));
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [rawCode, isAr]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col items-center justify-center text-slate-800 dark:text-white font-cairo p-4 transition-colors">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
        <h2 className="text-base font-bold">{isAr ? 'جارٍ التحقق من الشهادة الرقمية في قاعدة بيانات Zein Hub...' : 'Verifying Digital Certificate...'}</h2>
        <span className="text-xs text-slate-500 dark:text-gray-400 font-mono mt-1">{rawCode}</span>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center p-4 font-cairo transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-navy-900 border border-rose-500/30 rounded-3xl p-8 text-center text-slate-900 dark:text-white shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-rose-500">
            {isAr ? 'فشل التحقق من الشهادة' : 'Verification Failed'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed font-mono">
            {rawCode}
          </p>
          <p className="text-xs text-slate-600 dark:text-gray-300">
            {isAr
              ? 'الشهادة المطلوبة غير مسجلة أو تم إلغاؤها من المنظومة الأكاديمية.'
              : 'The requested certificate is either invalid or has been revoked.'}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-800 dark:text-white text-xs font-bold font-cairo transition-colors"
            >
              <span>{isAr ? 'العودة للصفحة الرئيسية' : 'Return to Home'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const programTitle = isAr ? cert.programTitleAr || cert.programTitleEn : cert.programTitleEn || cert.programTitleAr;
  const trackName = isAr ? cert.trackNameAr || 'الصوت والإعلام' : cert.trackNameEn || 'Audio & Media';
  const issueDateFormatted = new Date(cert.issuedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4 font-cairo text-center transition-colors duration-300">
      {/* Top Verification Status Bar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="bg-white dark:bg-navy-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-900 dark:text-white shadow-md transition-colors">
          <div className="flex items-center gap-3 text-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{isAr ? 'شهادة معتمدة وموثقة رسمياً' : 'Officially Verified Credential'}</span>
                <span className="text-[11px] font-mono text-slate-400 dark:text-gray-400">({cert.certificateNumber})</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                {isAr
                  ? 'هذه الشهادة صادرة ومسجلة في السجل الأكاديمي الرقمي لمنصة Zein Hub'
                  : 'This credential is registered in the official Zein Hub Academic Registry'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>{isAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              title={isAr ? 'نسخ رابط التحقق' : 'Copy Verification Link'}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرابط' : 'Copy')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 Printable Digital Certificate Card (Supports Light parchment & Dark royal) */}
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-white via-[#FCFBF7] to-[#F8F5EE] dark:from-[#121624] dark:via-[#0B0E17] dark:to-[#121624] text-slate-900 dark:text-white rounded-3xl p-8 sm:p-14 shadow-2xl border-4 border-[#C5A059] relative overflow-hidden print:border-4 print:shadow-none print:m-0 print:p-8 transition-colors duration-300">
        {/* Ornamental Guilloche & Watermark */}
        <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] opacity-10 dark:opacity-15 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#C5A059]/10 dark:bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#C5A059]/10 dark:bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Inner Gold Frame Border */}
        <div className="border border-[#C5A059]/40 rounded-2xl p-6 sm:p-10 relative z-10 space-y-8">
          {/* Certificate Header / Academy Seal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#C5A059]/30 pb-6">
            <div className="flex items-center gap-3 text-start">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 border-2 border-[#C5A059] shadow-xl shadow-[#C5A059]/25 p-1.5 shrink-0 overflow-hidden">
                <Image
                  src="/images/logo/logo.png"
                  alt="Zein Hub Official Seal"
                  width={56}
                  height={56}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-wide text-navy-950 dark:text-white">Zein Hub Media Academy</h2>
                <span className="text-xs text-[#A67C2E] dark:text-[#C5A059] font-bold block">
                  {isAr ? 'أكاديمية التدريب والإنتاج الإعلامي واستوديوهات الصوت' : 'Media Training & Voice Studio Faculty'}
                </span>
              </div>
            </div>

            <div className="text-center sm:text-end font-mono text-xs">
              <span className="text-slate-500 dark:text-gray-400 block">{isAr ? 'كود التحقق الرقمي:' : 'Digital Credential Ref:'}</span>
              <span className="text-[#A67C2E] dark:text-[#C5A059] font-bold text-sm tracking-wider">{cert.certificateNumber}</span>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#A67C2E] dark:text-[#C5A059] text-xs font-bold uppercase tracking-widest font-mono">
              <span>{isAr ? 'شهادة إتمام وتفوق أكاديمي' : 'Official Certificate of Completion'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#A67C2E] dark:text-[#C5A059] font-cairo tracking-tight pt-2">
              {isAr ? 'شَهَادَة تَخَرُّج وَاعْتِمَاد مِهْنِي' : 'CERTIFICATE OF EXCELLENCE'}
            </h1>
          </div>

          {/* Certificate Recipient Text */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 font-cairo">
              {isAr
                ? 'تشهد إدارة أكاديمية واستوديوهات Zein Hub بأن المتدرب(ة):'
                : 'This is to officially certify that the graduate:'}
            </p>

            <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-950 dark:text-white font-cairo border-b-2 border-[#C5A059] pb-3 inline-block px-8">
              {cert.studentName}
            </div>

            <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 font-cairo leading-relaxed pt-2">
              {isAr
                ? 'قد أتم(ت) بنجاح واقتدار كافة متطلبات البرنامج التدريبي والتطبيقي المكثف:'
                : 'has successfully completed all coursework, masterclasses, and capstone takes for:'}
            </p>

            <div className="p-4 rounded-2xl bg-[#C5A059]/10 border border-[#C5A059]/30 inline-block">
              <h3 className="text-lg sm:text-xl font-bold text-[#A67C2E] dark:text-[#C5A059] font-cairo">
                {programTitle}
              </h3>
              <span className="text-xs text-slate-600 dark:text-gray-400 block mt-0.5">
                {isAr ? `المسار المهني: ${trackName}` : `Track: ${trackName}`}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 font-cairo flex items-center justify-center gap-4 pt-1">
              <span>{isAr ? 'التقدير العام:' : 'Graduation Standing:'} <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{cert.finalGrade >= 90 ? (isAr ? 'امتياز مع مرتبة الشرف' : 'Distinction (Honors)') : (isAr ? 'جيد جداً' : 'Very Good')} ({cert.finalGrade}%)</strong></span>
            </div>
          </div>

          {/* Signatures & Seal Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#C5A059]/30 text-start sm:text-center items-end">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 dark:text-gray-400 block font-cairo">{isAr ? 'تاريخ المنح والاعتماد:' : 'Issue Date:'}</span>
              <span className="font-mono text-xs text-navy-950 dark:text-white font-bold">{issueDateFormatted}</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#C5A059] bg-[#C5A059]/10 flex items-center justify-center text-[#A67C2E] dark:text-[#C5A059] shadow-inner mb-1">
                <Award className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 font-bold">{isAr ? 'الختم الأكاديمي الرقمي' : 'Official Academic Seal'}</span>
            </div>

            <div className="space-y-1 sm:text-end">
              <span className="text-xs text-slate-500 dark:text-gray-400 block font-cairo">{isAr ? 'الاعتماد والتوقيع:' : 'Authorized Signature:'}</span>
              <span className="font-bold text-xs text-[#A67C2E] dark:text-[#C5A059] font-cairo block">{isAr ? 'عميد الأكاديمية والمشرف العام' : 'Academic Dean & Board'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
