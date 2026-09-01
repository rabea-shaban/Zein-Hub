'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Search,
  Loader2,
  Calendar,
  AlertCircle,
  GraduationCap,
  Eye,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  X,
  MessageSquare,
  TrendingUp,
  Activity,
  Award,
  Filter,
} from 'lucide-react';

interface StudentEnrollment {
  _id: string;
  studentId?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    isActive?: boolean;
    createdAt?: string;
  };
  student?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  };
  programId?: {
    _id?: string;
    title?: string;
    titleAr?: string;
    titleEn?: string;
    slug?: string;
    price?: number;
    durationWeeks?: number;
    coverImageUrl?: string;
  };
  program?: {
    _id?: string;
    title?: string;
    titleAr?: string;
    titleEn?: string;
  };
  status: 'active' | 'completed' | 'cancelled' | 'dropped';
  progressPercentage: number;
  finalGrade?: number;
  enrolledAt: string;
}

export default function InstructorStudentsPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';

  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Selected Student Profile Modal State
  const [selectedStudent, setSelectedStudent] = useState<StudentEnrollment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudentsData = useCallback(async () => {
    try {
      setError(null);
      // 1. Fetch instructor's enrolled students
      const res = await api.get<any>('/instructors/me/students', {
        params: {
          programId: selectedProgram !== 'all' ? selectedProgram : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: search || undefined,
        },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.students || [];
      setStudents(list);

      // 2. Fetch instructor assigned programs for dropdown filter
      const progsRes = await api.get<any>('/instructors/me/programs');
      const progs = Array.isArray(progsRes.data)
        ? progsRes.data
        : progsRes.data?.programs || [];
      setProgramsList(progs);
    } catch (err: any) {
      console.warn('Falling back or error fetching instructor students:', err);
      setError(
        err.message || (isAr ? 'فشل تحميل بيانات الطلاب المسجلين' : 'Failed to load students')
      );
    } finally {
      setLoading(false);
    }
  }, [selectedProgram, statusFilter, search, isAr]);

  useEffect(() => {
    fetchStudentsData();
  }, [fetchStudentsData]);

  const getStudent = (enr: StudentEnrollment) => enr.studentId || enr.student;
  const getProgram = (enr: StudentEnrollment) => enr.programId || enr.program;

  const getStudentName = (enr: StudentEnrollment) => {
    const s = getStudent(enr);
    return (typeof s === 'object' && s?.fullName) || (isAr ? 'طالب مشترك' : 'Enrolled Student');
  };

  const getStudentEmail = (enr: StudentEnrollment) => {
    const s = getStudent(enr);
    return (typeof s === 'object' && s?.email) || '';
  };

  const getStudentPhone = (enr: StudentEnrollment) => {
    const s = getStudent(enr);
    return (typeof s === 'object' && s?.phone) || '';
  };

  const getProgramTitle = (enr: StudentEnrollment) => {
    const p = getProgram(enr);
    if (typeof p === 'object' && p) {
      return (p as any).title || (isAr ? p.titleAr || p.titleEn : p.titleEn || p.titleAr) || 'البرنامج التدريبي';
    }
    return isAr ? 'البرنامج التدريبي' : 'Training Program';
  };

  // KPIs
  const totalCount = students.length;
  const activeCount = students.filter((s) => s.status === 'active').length;
  const completedCount = students.filter((s) => s.status === 'completed').length;
  const avgProgress =
    totalCount > 0
      ? Math.round(
          students.reduce((acc, s) => acc + (s.progressPercentage || 0), 0) / totalCount
        )
      : 0;

  return (
    <div className="p-4 sm:p-8 space-y-8 font-cairo text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'الطلاب المشتركون في برامجي' : 'My Enrolled Students'}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 mt-1 font-cairo">
            {isAr
              ? 'متابعة الطلاب المسجلين في دوراتك التدريبية، نسب إنجاز المناهج، وبيانات التواصل المباشرة'
              : 'Monitor students enrolled in your courses, their progress rate, and contact profiles'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-gold-500/10 border border-gold-500/25 text-gold-700 dark:text-gold-400 text-xs font-bold font-mono">
            {isAr ? `إجمالي الطلاب: ${totalCount}` : `Total Students: ${totalCount}`}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 dark:text-gray-400 font-bold">{isAr ? 'إجمالي الطلاب' : 'Total Students'}</span>
            <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-navy-900 dark:text-white font-mono">{totalCount}</div>
          <span className="text-[11px] text-slate-400 dark:text-gray-400 mt-1 block font-cairo">{isAr ? 'في كافة برامجي' : 'Across all my courses'}</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{isAr ? 'الطلاب النشطون' : 'Active Students'}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{activeCount}</div>
          <span className="text-[11px] text-slate-400 dark:text-gray-400 mt-1 block font-cairo">{isAr ? 'يتدربون حالياً' : 'Currently in training'}</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{isAr ? 'الخريجون المكتملون' : 'Graduated'}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">{completedCount}</div>
          <span className="text-[11px] text-slate-400 dark:text-gray-400 mt-1 block font-cairo">{isAr ? 'أتموا مشروع التخرج' : 'Completed Capstone'}</span>
        </div>

        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gold-600 dark:text-gold-400 font-bold">{isAr ? 'متوسط نسبة التقدم' : 'Avg Progress'}</span>
            <div className="w-8 h-8 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gold-600 dark:text-gold-400 font-mono">{avgProgress}%</div>
          <span className="text-[11px] text-slate-400 dark:text-gray-400 mt-1 block font-cairo">{isAr ? 'معدل إنجاز الدروس' : 'Average completion'}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'بحث باسم الطالب أو البريد...' : 'Search student or email...'}
              className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs focus:outline-none focus:border-gold-500 text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 font-cairo"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Program / Course Filter */}
          <div className="relative w-full sm:w-64">
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold focus:outline-none focus:border-gold-500 text-navy-900 dark:text-white font-cairo cursor-pointer"
            >
              <option value="all">{isAr ? '🎓 كافة برامجي وكورساتي' : '🎓 All My Programs'}</option>
              {programsList.map((prog) => (
                <option key={prog._id} value={prog._id}>
                  {prog.title || (isAr ? prog.titleAr || prog.titleEn : prog.titleEn || prog.titleAr)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { key: 'all', ar: 'الكل', en: 'All' },
            { key: 'active', ar: 'نشط', en: 'Active' },
            { key: 'completed', ar: 'مكتمل', en: 'Completed' },
            { key: 'dropped', ar: 'منسحب', en: 'Dropped' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 font-cairo ${
                statusFilter === st.key
                  ? 'bg-navy-950 dark:bg-gold-500 text-white dark:text-navy-950 shadow-md'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-navy-750'
              }`}
            >
              {isAr ? st.ar : st.en}
            </button>
          ))}
        </div>
      </div>

      {/* Enrolled Students Table */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 shadow-sm overflow-hidden transition-colors">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400 dark:text-gray-400">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
            <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل بيانات الطلاب المشتركين...' : 'Loading students...'}</span>
          </div>
        ) : students.length === 0 ? (
          <div className="py-20 text-center text-slate-400 dark:text-gray-400 text-sm font-cairo space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-navy-700" />
            <p className="font-bold">{isAr ? 'لا يوجد طلاب مشتركون يطابقون خيارات البحث' : 'No enrolled students found'}</p>
            <span className="text-xs text-slate-400 dark:text-gray-400 block">
              {isAr ? 'عند تسجيل الطلاب في برامجك التدريبية ستظهر ملفاتهم هنا فوراً.' : 'Enrolled students in your courses will appear here.'}
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-slate-50 dark:bg-navy-950/60 text-slate-500 dark:text-gray-400 text-xs font-bold border-y border-slate-200 dark:border-navy-800 font-cairo">
                <tr>
                  <th className="py-3.5 px-4">{isAr ? 'الطالب المشترك' : 'Student'}</th>
                  <th className="py-3.5 px-4">{isAr ? 'البرنامج / الكورس' : 'Enrolled Course'}</th>
                  <th className="py-3.5 px-4">{isAr ? 'نسبة التقدم' : 'Progress'}</th>
                  <th className="py-3.5 px-4">{isAr ? 'تاريخ الالتحاق' : 'Enrolled Date'}</th>
                  <th className="py-3.5 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-center">{isAr ? 'الملف والتواصل' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {students.map((enr) => {
                  const sName = getStudentName(enr);
                  const sEmail = getStudentEmail(enr);
                  const sPhone = getStudentPhone(enr);
                  const pTitle = getProgramTitle(enr);

                  return (
                    <tr key={enr._id} className="hover:bg-slate-50/70 dark:hover:bg-navy-850/50 transition-colors">
                      {/* Student Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {sName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-navy-900 dark:text-white font-cairo">
                              {sName}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-gray-400 font-mono">{sEmail}</div>
                          </div>
                        </div>
                      </td>

                      {/* Course / Program Title */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-700 dark:text-gold-400 text-xs font-bold font-cairo">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{pTitle}</span>
                        </div>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 dark:bg-navy-950 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold-500 rounded-full"
                              style={{ width: `${enr.progressPercentage || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-600 dark:text-gray-400">
                            {enr.progressPercentage || 0}%
                          </span>
                        </div>
                      </td>

                      {/* Enrollment Date */}
                      <td className="py-4 px-4 text-xs text-slate-500 dark:text-gray-400 font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(enr.enrolledAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={enr.status} />
                      </td>

                      {/* Action: View Modal & Contact */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Modal Trigger */}
                          <button
                            onClick={() => {
                              setSelectedStudent(enr);
                              setIsModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-navy-950 hover:bg-gold-500 hover:text-navy-950 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-navy-800 transition-all shadow-sm"
                            title={isAr ? 'عرض ملف الطالب الكامل' : 'View Student Profile'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Email Contact Button */}
                          {sEmail && (
                            <a
                              href={`mailto:${sEmail}?subject=تدريب Zein Hub - ${pTitle}`}
                              className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                              title={isAr ? 'مراسلة الطالب بالبريد' : 'Email Student'}
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}

                          {/* WhatsApp / Phone Contact Button */}
                          {sPhone && (
                            <a
                              href={`https://wa.me/${sPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                              title={isAr ? 'مراسلة عبر واتساب' : 'Chat on WhatsApp'}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          )}
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

      {/* Instructor View: Student Details Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-start font-cairo max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gold-500 text-navy-950 font-extrabold text-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                  {getStudentName(selectedStudent).charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-900 dark:text-white font-cairo">
                    {getStudentName(selectedStudent)}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isAr ? 'طالب مقيد ومعتمد في كورس التدريب' : 'Verified Enrolled Student'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Course & Academic Info */}
            <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/20 mb-6 space-y-2">
              <div className="flex items-center gap-2 text-gold-700 dark:text-gold-400 font-bold text-sm">
                <GraduationCap className="w-4 h-4" />
                <span>{getProgramTitle(selectedStudent)}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-gray-300">
                {isAr
                  ? 'برنامج تدريبي تطبيقي تحت إشرافك المباشر في استوديوهات Zein Hub.'
                  : 'Practical hands-on training program under your direct supervision.'}
              </p>
            </div>

            {/* Contact Details Box */}
            <div className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl p-4 space-y-2.5 mb-6 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-gray-400 flex items-center gap-1.5 font-cairo">
                  <Mail className="w-3.5 h-3.5" />
                  {isAr ? 'البريد الإلكتروني:' : 'Email:'}
                </span>
                <span className="font-bold text-navy-900 dark:text-white">
                  {getStudentEmail(selectedStudent) || (isAr ? 'غير مسجل' : 'N/A')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-gray-400 flex items-center gap-1.5 font-cairo">
                  <Phone className="w-3.5 h-3.5" />
                  {isAr ? 'رقم الهاتف / واتساب:' : 'Phone / WhatsApp:'}
                </span>
                <span className="font-bold text-navy-900 dark:text-white">
                  {getStudentPhone(selectedStudent) || (isAr ? 'غير مسجل' : 'N/A')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-gray-400 flex items-center gap-1.5 font-cairo">
                  <Calendar className="w-3.5 h-3.5" />
                  {isAr ? 'تاريخ الالتحاق:' : 'Enrolled Date:'}
                </span>
                <span className="font-bold text-navy-900 dark:text-white">
                  {new Date(selectedStudent.enrolledAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                </span>
              </div>
            </div>

            {/* Progress Rate */}
            <div className="border border-slate-200 dark:border-navy-800 rounded-2xl p-4 space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs font-bold font-cairo">
                <span className="text-slate-500 dark:text-gray-400">{isAr ? 'نسبة إنجاز الدروس والتطبيقات:' : 'Curriculum Progress:'}</span>
                <span className="text-gold-600 dark:text-gold-400 font-mono text-sm">{selectedStudent.progressPercentage || 0}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-navy-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 rounded-full transition-all"
                  style={{ width: `${selectedStudent.progressPercentage || 0}%` }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-navy-800">
              <div className="flex items-center gap-2">
                {getStudentEmail(selectedStudent) && (
                  <a
                    href={`mailto:${getStudentEmail(selectedStudent)}`}
                    className="px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all flex items-center gap-1.5 font-cairo border border-blue-500/20"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إرسال بريد' : 'Email'}</span>
                  </a>
                )}

                {getStudentPhone(selectedStudent) && (
                  <a
                    href={`https://wa.me/${getStudentPhone(selectedStudent).replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5 font-cairo border border-emerald-500/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{isAr ? 'محادثة واتساب' : 'WhatsApp'}</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 text-slate-800 dark:text-white text-xs font-bold font-cairo"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
