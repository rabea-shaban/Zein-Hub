'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  ClipboardList,
  Search,
  Save,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import Swal from 'sweetalert2';

interface StudentAttendance {
  id: string;
  name: string;
  email: string;
  status: 'present' | 'absent' | 'late';
}

interface LiveSessionOption {
  _id: string;
  title: string;
  startTime: string;
  programId: {
    _id: string;
    titleAr?: string;
    titleEn?: string;
  } | string;
}

export default function InstructorAttendancePage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [sessions, setSessions] = useState<LiveSessionOption[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [search, setSearch] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Fetch instructor's live sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoadingSessions(true);
        const res = await api.get('/live-sessions');
        if (res && res.data) {
          const rawSessions = Array.isArray(res.data) ? res.data : (res.data.sessions || []);
          setSessions(rawSessions);
          if (rawSessions.length > 0) {
            setSelectedSessionId(rawSessions[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load live sessions:', err);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, []);

  // 2. Fetch enrolled students and attendance records when selectedSessionId changes
  useEffect(() => {
    if (!selectedSessionId) {
      setStudents([]);
      return;
    }

    const fetchSessionStudentsAndAttendance = async () => {
      try {
        setLoadingStudents(true);
        const currentSession = sessions.find((s) => s._id === selectedSessionId);
        const progId = typeof currentSession?.programId === 'object'
          ? currentSession?.programId?._id
          : currentSession?.programId;

        // Fetch enrolled students for this program
        const studentsEndpoint = progId
          ? `/instructors/me/students?programId=${progId}`
          : '/instructors/me/students';

        const [studentsRes, attendanceRes] = await Promise.all([
          api.get(studentsEndpoint).catch(() => ({ data: [] })),
          api.get(`/attendance/session/${selectedSessionId}`).catch(() => ({ data: [] })),
        ]);

        const rawEnrollments = (studentsRes && studentsRes.data) || [];
        const existingAttendance = (attendanceRes && attendanceRes.data) || [];

        const attendanceMap = new Map<string, 'present' | 'absent' | 'late'>();
        if (Array.isArray(existingAttendance)) {
          existingAttendance.forEach((att: any) => {
            const sId = typeof att.studentId === 'object' ? att.studentId?._id : att.studentId;
            if (sId) {
              attendanceMap.set(sId.toString(), att.status || 'present');
            }
          });
        }

        const mappedList: StudentAttendance[] = Array.isArray(rawEnrollments)
          ? rawEnrollments.map((enr: any) => {
              const user = enr.studentId || enr.user || enr;
              const sId = user._id || enr._id;
              const currentStatus = attendanceMap.get(sId?.toString()) || 'present';

              return {
                id: sId,
                name: user.fullName || user.name || 'طالب مسجل',
                email: user.email || 'student@zeinhub.com',
                status: currentStatus,
              };
            })
          : [];

        setStudents(mappedList);
      } catch (err) {
        console.error('Failed to load session attendance records:', err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchSessionStudentsAndAttendance();
  }, [selectedSessionId, sessions]);

  const handleStatusChange = (id: string, newStatus: 'present' | 'absent' | 'late') => {
    setStudents((prev) =>
      prev.map((st) => (st.id === id ? { ...st, status: newStatus } : st))
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedSessionId) {
      Swal.fire({
        icon: 'warning',
        title: isAr ? 'تنبيه' : 'Warning',
        text: isAr ? 'يرجى اختيار جلسة تدريبية أولاً' : 'Please select a session first',
        confirmButtonColor: '#D4AF37',
      });
      return;
    }

    if (students.length === 0) {
      Swal.fire({
        icon: 'info',
        title: isAr ? 'لا يوجد طلاب' : 'No Students',
        text: isAr ? 'لا يوجد طلاب مسجلين في هذا البرنامج لرصد حضورهم.' : 'No enrolled students to mark attendance for.',
        confirmButtonColor: '#D4AF37',
      });
      return;
    }

    try {
      setSaving(true);
      const records = students.map((s) => ({
        studentId: s.id,
        status: s.status,
      }));

      await api.post(`/attendance/session/${selectedSessionId}`, { attendanceRecords: records });

      Swal.fire({
        icon: 'success',
        title: isAr ? 'تم حفظ الحضور بنجاح' : 'Attendance Saved',
        text: isAr
          ? `تم رصد وتحديث سجل الحضور لعدد ${students.length} طالب.`
          : `Successfully recorded attendance for ${students.length} students.`,
        confirmButtonColor: '#D4AF37',
        timer: 2500,
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: isAr ? 'خطأ في الحفظ' : 'Error',
        text: err.message || (isAr ? 'تعذر حفظ سجل الحضور' : 'Failed to save attendance'),
        confirmButtonColor: '#D4AF37',
      });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'present').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-start font-cairo">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'سجل الحضور والغياب للاستوديو' : 'Studio Attendance Tracking'}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isAr
              ? 'تسجيل حضور وغياب الطلاب في الورش العملية وجلسات الاستوديو المباشرة'
              : 'Record student attendance and punctuality for studio workshops and live broadcasts'}
          </p>
        </div>

        {sessions.length > 0 && students.length > 0 && (
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>
              {saving
                ? (isAr ? 'جاري الحفظ...' : 'Saving...')
                : (isAr ? 'حفظ سجل الحضور' : 'Save Attendance')}
            </span>
          </button>
        )}
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-center">
          <span className="text-xs font-bold block">{isAr ? 'حاضر' : 'Present'}</span>
          <span className="text-2xl font-black font-mono mt-0.5 block">{presentCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-center">
          <span className="text-xs font-bold block">{isAr ? 'متأخر' : 'Late'}</span>
          <span className="text-2xl font-black font-mono mt-0.5 block">{lateCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-center">
          <span className="text-xs font-bold block">{isAr ? 'غائب' : 'Absent'}</span>
          <span className="text-2xl font-black font-mono mt-0.5 block">{absentCount}</span>
        </div>
      </div>

      {/* Filter and Session Selector */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="w-full md:w-96">
          <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
            {isAr ? 'الجلسة التدريبية:' : 'Training Session:'}
          </label>
          {loadingSessions ? (
            <div className="text-xs text-gray-400 flex items-center gap-2 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-gold-500" />
              <span>{isAr ? 'جاري تحميل الجلسات...' : 'Loading sessions...'}</span>
            </div>
          ) : sessions.length > 0 ? (
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs font-bold text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
            >
              {sessions.map((s) => {
                const dateStr = s.startTime ? new Date(s.startTime).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }) : '';
                return (
                  <option key={s._id} value={s._id}>
                    {s.title} {dateStr ? `— ${dateStr}` : ''}
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="text-xs text-gray-400 p-2 bg-gray-50 dark:bg-navy-950 rounded-xl border border-gray-200 dark:border-navy-800">
              {isAr ? 'لا توجد جلسات بث مباشر مجدولة بعد' : 'No scheduled live sessions yet'}
            </div>
          )}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث باسم الطالب...' : 'Search student...'}
            disabled={students.length === 0}
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 disabled:opacity-50"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Attendance Table or Clean Empty State */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
        {loadingStudents ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isAr ? 'جاري تحميل قائمة الطلاب وسجلات الحضور...' : 'Loading students and attendance records...'}
            </p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <table className="w-full text-start text-sm">
            <thead className="bg-gray-50 dark:bg-navy-950/60 text-gray-500 dark:text-gray-400 text-xs font-bold border-y border-gray-100 dark:border-navy-800">
              <tr>
                <th className="py-3.5 px-4">{isAr ? 'الطالب المقيد' : 'Student'}</th>
                <th className="py-3.5 px-4 text-center">{isAr ? 'حالة الحضور' : 'Attendance Status'}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-gray-50/50 dark:hover:bg-navy-850/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-navy-900 dark:text-white">
                      {st.name}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">{st.email}</div>
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-navy-950 border border-gray-200 dark:border-navy-800">
                      <button
                        onClick={() => handleStatusChange(st.id, 'present')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          st.status === 'present'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-gray-500 hover:text-navy-900 dark:hover:text-white'
                        }`}
                      >
                        {isAr ? 'حاضر ✓' : 'Present'}
                      </button>

                      <button
                        onClick={() => handleStatusChange(st.id, 'late')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          st.status === 'late'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-gray-500 hover:text-navy-900 dark:hover:text-white'
                        }`}
                      >
                        {isAr ? 'متأخر ⏱️' : 'Late'}
                      </button>

                      <button
                        onClick={() => handleStatusChange(st.id, 'absent')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          st.status === 'absent'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-gray-500 hover:text-navy-900 dark:hover:text-white'
                        }`}
                      >
                        {isAr ? 'غائب ✗' : 'Absent'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center mx-auto">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-navy-900 dark:text-white">
              {isAr ? 'لا توجد جلسات أو طلاب مسجلين حالياً' : 'No Active Sessions or Enrolled Students'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'بمجرد جدولة جلسة استوديو مباشرة واشتراك الطلاب في برامجك التدريبية، ستظهر قائمة الطلاب هنا لتتمكن من رصد الحضور والغياب وحفظ السجلات.'
                : 'Once you schedule a live studio session and students enroll in your programs, they will appear here for live attendance tracking.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
