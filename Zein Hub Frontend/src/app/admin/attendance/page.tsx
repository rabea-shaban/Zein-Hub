'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import {
  ClipboardList,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Search,
  ShieldCheck,
  Video,
} from 'lucide-react';

interface ProgramItem {
  _id: string;
  titleAr: string;
  titleEn: string;
}

interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalEligibleSessions: number;
  attendedSessions: number;
  absentSessions: number;
  excusedSessions: number;
  attendancePercentage: number;
}

export default function AdminAttendancePage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [summaries, setSummaries] = useState<StudentAttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    try {
      setError(null);
      const progRes = await api.get<ProgramItem[]>('/programs');
      const progs = progRes.data || [];
      setPrograms(progs);
      if (progs.length > 0) {
        setSelectedProgramId(progs[0]._id);
      }
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل البرامج التدريبية' : 'Failed to load programs'));
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  const fetchSummary = useCallback(async (programId: string) => {
    if (!programId) return;
    setTableLoading(true);
    try {
      const res = await api.get<any>(`/attendance/program/${programId}/summary`);
      const list = Array.isArray(res.data) ? res.data : [];
      setSummaries(list);
    } catch (err: any) {
      console.warn('Attendance summary error:', err);
      setSummaries([]);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  useEffect(() => {
    if (selectedProgramId) {
      fetchSummary(selectedProgramId);
    }
  }, [selectedProgramId, fetchSummary]);

  // Overall calculations
  const totalStudents = summaries.length;
  const avgAttendance =
    totalStudents > 0
      ? Math.round(
          summaries.reduce((acc, s) => acc + s.attendancePercentage, 0) / totalStudents
        )
      : 100;
  const totalAbsents = summaries.reduce((acc, s) => acc + s.absentSessions, 0);

  const filteredSummaries = summaries.filter((s) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return s.studentName.toLowerCase().includes(term) || s.studentEmail.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8 font-cairo">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'سجل الحضور والغياب للطلاب' : 'Student Attendance & Absence Records'}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-cairo">
            {isAr
              ? 'متابعة نسب التزام الطلاب بحضور الجلسات التفاعلية والورش التدريبية'
              : 'Track student attendance rates across live workshops and interactive cohorts'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Program Tabs */}
      {programs.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {programs.map((p) => (
            <button
              key={p._id}
              onClick={() => setSelectedProgramId(p._id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 font-cairo ${
                selectedProgramId === p._id
                  ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20 font-bold'
                  : 'bg-white dark:bg-navy-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-850 border border-gray-100 dark:border-navy-800'
              }`}
            >
              {isAr ? p.titleAr : p.titleEn}
            </button>
          ))}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 font-cairo">
              {isAr ? 'متوسط نسبة الحضور' : 'Average Attendance'}
            </span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black font-mono text-navy-900 dark:text-white">
            {avgAttendance}%
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 font-cairo">
              {isAr ? 'إجمالي الطلاب المسجلين' : 'Total Enrolled'}
            </span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black font-mono text-navy-900 dark:text-white">
            {totalStudents}
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 font-cairo">
              {isAr ? 'حالات الغياب المسجلة' : 'Recorded Absences'}
            </span>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-black font-mono text-navy-900 dark:text-white">
            {totalAbsents}
          </div>
        </div>
      </div>

      {/* Interactive Attendance Table */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 md:p-8 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
              {isAr ? 'سجل حضور الورش والجلسات التدريبية' : 'Live Session Attendance Records'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-cairo">
              {isAr
                ? 'تفاصيل حضور وغياب الطلاب المسجلين في هذا البرنامج التدريبي'
                : 'Individual attendance breakdown for students in this training cohort'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث باسم الطالب...' : 'Search student...'}
              className="w-full px-3.5 py-2 pr-9 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-cairo"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {tableLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400 font-cairo">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
            <span className="text-xs font-bold">{isAr ? 'جارٍ احتساب سجلات الحضور...' : 'Calculating attendance records...'}</span>
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm font-cairo">
            {isAr
              ? 'لا يوجد طلاب مسجلون في هذا البرنامج حالياً'
              : 'No enrolled students found for this program'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-gray-50 dark:bg-navy-950/60 text-gray-500 dark:text-gray-400 text-xs font-bold border-y border-gray-100 dark:border-navy-800 font-cairo">
                <tr>
                  <th className="py-3 px-4">{isAr ? 'الطالب' : 'Student'}</th>
                  <th className="py-3 px-4">{isAr ? 'الجلسات المنعقدة' : 'Eligible Sessions'}</th>
                  <th className="py-3 px-4">{isAr ? 'حضر' : 'Attended'}</th>
                  <th className="py-3 px-4">{isAr ? 'غائب' : 'Absent'}</th>
                  <th className="py-3 px-4">{isAr ? 'نسبة الالتزام' : 'Attendance Rate'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'الحالة العامة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                {filteredSummaries.map((s) => (
                  <tr key={s.studentId} className="hover:bg-gray-50/50 dark:hover:bg-navy-850/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {s.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-navy-900 dark:text-white font-cairo">
                            {s.studentName}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">{s.studentEmail}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-xs font-bold text-navy-900 dark:text-white">
                      {s.totalEligibleSessions} {isAr ? 'جلسة' : 'sessions'}
                    </td>

                    <td className="py-4 px-4 font-mono text-xs font-bold text-emerald-500">
                      {s.attendedSessions}
                    </td>

                    <td className="py-4 px-4 font-mono text-xs font-bold text-rose-500">
                      {s.absentSessions}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 dark:bg-navy-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              s.attendancePercentage >= 80
                                ? 'bg-emerald-500'
                                : s.attendancePercentage >= 50
                                ? 'bg-gold-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${s.attendancePercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-500">
                          {s.attendancePercentage}%
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-cairo ${
                          s.attendancePercentage >= 80
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{s.attendancePercentage >= 80 ? (isAr ? 'ملتزم' : 'Regular') : (isAr ? 'يحتاج متابعة' : 'Needs Followup')}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
