'use client';

import React from 'react';
import clsx from 'clsx';
import { useLanguage } from '@/context/LanguageContext';

export type StatusType =
  | 'open'
  | 'coming-soon'
  | 'closed'
  | 'pending'
  | 'accepted'
  | 'approved'
  | 'rejected'
  | 'active'
  | 'completed'
  | 'dropped'
  | 'scheduled'
  | 'live'
  | 'cancelled'
  | 'present'
  | 'late'
  | 'absent'
  | 'excused'
  | string;

const statusConfig: Record<
  string,
  { labelAr: string; labelEn: string; bg: string; text: string; border: string }
> = {
  // Programs
  open: { labelAr: 'مفتوح للتسجيل', labelEn: 'Open', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  'coming-soon': { labelAr: 'قريباً', labelEn: 'Coming Soon', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  closed: { labelAr: 'مغلق', labelEn: 'Closed', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },

  // Applications & Reviews
  pending: { labelAr: 'قيد المراجعة', labelEn: 'Pending', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  accepted: { labelAr: 'مقبول', labelEn: 'Accepted', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  approved: { labelAr: 'معتمد', labelEn: 'Approved', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  rejected: { labelAr: 'مرفوض', labelEn: 'Rejected', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },

  // Enrollments
  active: { labelAr: 'نشط', labelEn: 'Active', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  completed: { labelAr: 'مكتمل', labelEn: 'Completed', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  dropped: { labelAr: 'منسحب', labelEn: 'Dropped', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },

  // Live Sessions
  scheduled: { labelAr: 'مجدولة', labelEn: 'Scheduled', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  live: { labelAr: 'مباشر الآن 🔴', labelEn: 'Live Now 🔴', bg: 'bg-rose-500/20', text: 'text-rose-500', border: 'border-rose-500/30' },
  cancelled: { labelAr: 'ملغاة', labelEn: 'Cancelled', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },

  // Attendance
  present: { labelAr: 'حاضر', labelEn: 'Present', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  late: { labelAr: 'متأخر', labelEn: 'Late', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  absent: { labelAr: 'غائب', labelEn: 'Absent', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' },
  excused: { labelAr: 'معذور', labelEn: 'Excused', bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
};

export function StatusBadge({ status, customLabel }: { status: StatusType; customLabel?: string }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const config = statusConfig[status] || {
    labelAr: status,
    labelEn: status,
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    border: 'border-gray-500/20',
  };

  const label = customLabel || (isAr ? config.labelAr : config.labelEn);

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors whitespace-nowrap',
        config.bg,
        config.text,
        config.border
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      <span>{label}</span>
    </span>
  );
}
