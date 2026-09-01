'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Calendar,
  Users,
  Save,
  Check,
} from 'lucide-react';

interface StudentAttendance {
  id: string;
  name: string;
  email: string;
  status: 'present' | 'absent' | 'late';
}

export default function InstructorAttendancePage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [selectedSession, setSelectedSession] = useState('ورشة فوكاليز وتلوين صوتي مباشر — 2 سبتمبر');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);

  const [students, setStudents] = useState<StudentAttendance[]>([
    { id: 'st-1', name: 'محمود عبد الرحيم الهواري', email: 'mahmoud.hawary@gmail.com', status: 'present' },
    { id: 'st-2', name: 'نورهان كمال القناوي', email: 'nourhan.qenawy@gmail.com', status: 'present' },
    { id: 'st-3', name: 'يوسف عبد الرحمن الأقصري', email: 'youssef.luxor@gmail.com', status: 'present' },
    { id: 'st-4', name: 'سارة محمد الأسيوطي', email: 'sara.assiuti@gmail.com', status: 'late' },
    { id: 'st-5', name: 'علي حسن السوهاجي', email: 'ali.sohag@gmail.com', status: 'absent' },
    { id: 'st-6', name: 'مريم أحمد المنياوي', email: 'mariam.minya@gmail.com', status: 'present' },
  ]);

  const handleStatusChange = (id: string, newStatus: 'present' | 'absent' | 'late') => {
    setStudents(
      students.map((st) => (st.id === id ? { ...st, status: newStatus } : st))
    );
    setSaved(false);
  };

  const handleSaveAttendance = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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

        <button
          onClick={handleSaveAttendance}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md transition-all"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? (isAr ? 'تم الحفظ بنجاح ✓' : 'Saved ✓') : (isAr ? 'حفظ سجل الحضور' : 'Save Attendance')}</span>
        </button>
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
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs font-bold text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
          >
            <option>ورشة فوكاليز وتلوين صوتي مباشر — 2 سبتمبر</option>
            <option>محاكاة الأوتوكيو ومواجهة كاميرات البث الإخباري — 5 سبتمبر</option>
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث باسم الطالب...' : 'Search student...'}
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
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
      </div>
    </div>
  );
}
