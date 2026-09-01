'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useLanguage } from '@/context/LanguageContext';
import {
  UserCheck,
  Search,
  Loader2,
  Calendar,
  AlertCircle,
  Clock,
  Coins,
  Eye,
  Trash2,
  X,
  Mail,
  Phone,
  ShieldCheck,
  GraduationCap,
  Activity,
  Award,
  UserX,
  CheckCircle2,
} from 'lucide-react';

interface EnrollmentItem {
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
    titleAr?: string;
    titleEn?: string;
    price?: number;
    durationWeeks?: number;
    coverImageUrl?: string;
  };
  program?: {
    _id?: string;
    titleAr?: string;
    titleEn?: string;
  };
  status: 'active' | 'completed' | 'cancelled' | 'dropped';
  progressPercentage: number;
  finalGrade?: number;
  enrolledAt: string;
}

export default function AdminStudentsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Profile Modal State
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'enrollment' | 'student';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEnrollments = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<any>('/enrollments/admin/all', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: search || undefined,
          limit: 50,
        },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.enrollments || [];
      setEnrollments(list);
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل بيانات الطلاب' : 'Failed to load students'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, isAr]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/enrollments/${id}/status`, { status: newStatus });
      toast.success(isAr ? 'تم تعديل حالة اشتراك الطالب بنجاح' : 'Enrollment status updated');
      fetchEnrollments();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل تعديل حالة الاشتراك' : 'Failed to update status'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === 'enrollment') {
        await api.delete(`/enrollments/${deleteTarget.id}`);
      } else {
        await api.delete(`/enrollments/admin/students/${deleteTarget.id}`);
      }

      toast.success(isAr ? 'تم الحذف بنجاح' : 'Deleted successfully');
      if (selectedEnrollment?._id === deleteTarget.id) {
        setIsModalOpen(false);
      }
      setDeleteTarget(null);
      await fetchEnrollments();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل إتمام عملية الحذف' : 'Failed to delete'));
    } finally {
      setIsDeleting(false);
    }
  };

  const STUDENT_NAMES_EN: Record<string, string> = {
    'نورهان كمال الأسواني': 'Nourhan Kamal El Aswani',
    'يوسف عبد الرحمن القناوي': 'Youssef Abdelrahman El Qenawi',
    'مريم عصام الأبنودي': 'Mariam Essam El Abnoudi',
    'أحمد محمود الصعيدي': 'Ahmed Mahmoud El Saidi',
  };

  const getStudent = (enr: EnrollmentItem) => enr.studentId || enr.student;
  const getProgram = (enr: EnrollmentItem) => enr.programId || enr.program;

  const getStudentId = (enr: EnrollmentItem): string => {
    const s = getStudent(enr);
    return (typeof s === 'object' && s?._id) ? s._id : '';
  };

  const getStudentName = (enr: EnrollmentItem) => {
    const s = getStudent(enr);
    const raw = (typeof s === 'object' && s?.fullName) || '';
    if (isAr) return raw || 'طالب مسجل';
    return STUDENT_NAMES_EN[raw] || raw || 'Registered Student';
  };

  const getStudentEmail = (enr: EnrollmentItem) => {
    const s = getStudent(enr);
    return (typeof s === 'object' && s?.email) || '';
  };

  const getStudentPhone = (enr: EnrollmentItem) => {
    const s = getStudent(enr);
    return (typeof s === 'object' && s?.phone) || '';
  };

  const getProgramTitle = (enr: EnrollmentItem) => {
    const p = getProgram(enr);
    if (typeof p === 'object' && p) {
      return isAr ? p.titleAr || p.titleEn : p.titleEn || p.titleAr;
    }
    return isAr ? 'البرنامج التدريبي' : 'Training Program';
  };

  return (
    <div className="space-y-8 font-cairo">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'إدارة وسجل الطلاب المشتركين' : 'Students & Enrollments Management'}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-cairo">
            {isAr
              ? 'استعراض بيانات وملفات الطلاب، متابعة نسب الإنجاز، وتعديل حالة الاشتراكات أو حذف الطالب'
              : 'View student profiles, monitor completion progress, manage enrollments, or delete students'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400 text-xs font-bold font-mono">
            {isAr ? `إجمالي الطلاب: ${enrollments.length}` : `Total Students: ${enrollments.length}`}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Strip */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث باسم الطالب أو البريد أو البرنامج...' : 'Search student or program...'}
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:border-gold-500 text-navy-900 dark:text-white font-cairo"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { key: 'all', ar: 'كافة الطلاب', en: 'All' },
            { key: 'active', ar: 'الطلاب النشطون', en: 'Active' },
            { key: 'completed', ar: 'المكتملون', en: 'Completed' },
            { key: 'dropped', ar: 'المنسحبون والملغاة', en: 'Dropped' },
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

      {/* Enrollments Table */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
            <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل بيانات الطلاب...' : 'Loading students...'}</span>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm font-cairo">
            {isAr ? 'لا توجد بيانات طلاب مطابقة لخيارات الفلترة' : 'No students found matching criteria'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-gray-50 dark:bg-navy-950/60 text-gray-500 dark:text-gray-400 text-xs font-bold border-y border-gray-100 dark:border-navy-800 font-cairo">
                <tr>
                  <th className="py-3 px-4">{isAr ? 'الطالب' : 'Student'}</th>
                  <th className="py-3 px-4">{isAr ? 'البرنامج التدريبي' : 'Training Program'}</th>
                  <th className="py-3 px-4">{isAr ? 'نسبة التقدم' : 'Progress'}</th>
                  <th className="py-3 px-4">{isAr ? 'تاريخ التسجيل' : 'Enrolled Date'}</th>
                  <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'إجراءات الطالب' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                {enrollments.map((enr) => {
                  const sName = getStudentName(enr);
                  const sEmail = getStudentEmail(enr);
                  const pTitle = getProgramTitle(enr);

                  return (
                    <tr key={enr._id} className="hover:bg-gray-50/50 dark:hover:bg-navy-850/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {sName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-navy-900 dark:text-white font-cairo">
                              {sName}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">{sEmail}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-xs text-navy-800 dark:text-gray-200 font-cairo">
                        {pTitle}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 dark:bg-navy-950 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold-500 rounded-full"
                              style={{ width: `${enr.progressPercentage || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-gray-500">
                            {enr.progressPercentage || 0}%
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs text-gray-400 font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(enr.enrolledAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={enr.status} />
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Profile Modal Button */}
                          <button
                            onClick={() => {
                              setSelectedEnrollment(enr);
                              setIsModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-gray-50 dark:bg-navy-950 hover:bg-gold-500 hover:text-navy-950 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-navy-800 transition-all shadow-sm"
                            title={isAr ? 'عرض الملف الكامل للطالب' : 'View Student Profile'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Status Select */}
                          <select
                            value={enr.status}
                            onChange={(e) => handleStatusChange(enr._id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs font-bold focus:outline-none focus:border-gold-500 text-navy-900 dark:text-white font-cairo cursor-pointer"
                          >
                            <option value="active">{isAr ? 'نشط' : 'Active'}</option>
                            <option value="completed">{isAr ? 'مكتمل' : 'Completed'}</option>
                            <option value="dropped">{isAr ? 'منسحب' : 'Dropped'}</option>
                            <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                          </select>

                          {/* Delete Button */}
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: 'enrollment',
                                id: enr._id,
                                name: sName,
                              })
                            }
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all border border-rose-500/20 shadow-sm"
                            title={isAr ? 'حذف اشتراك الطالب' : 'Delete Enrollment'}
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

      {/* Student Profile / Details Modal */}
      {isModalOpen && selectedEnrollment && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-start font-cairo max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gold-500 text-navy-950 font-extrabold text-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                  {getStudentName(selectedEnrollment).charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-navy-900 dark:text-white font-cairo">
                    {getStudentName(selectedEnrollment)}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isAr ? 'طالب مسجل معتمد' : 'Verified Registered Student'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Info Box */}
            <div className="bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 rounded-2xl p-4 space-y-2 mb-6 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5 font-cairo">
                  <Mail className="w-3.5 h-3.5" />
                  {isAr ? 'البريد الإلكتروني:' : 'Email:'}
                </span>
                <span className="font-bold text-navy-900 dark:text-white">
                  {getStudentEmail(selectedEnrollment) || (isAr ? 'غير مسجل' : 'N/A')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5 font-cairo">
                  <Phone className="w-3.5 h-3.5" />
                  {isAr ? 'رقم الهاتف:' : 'Phone:'}
                </span>
                <span className="font-bold text-navy-900 dark:text-white">
                  {getStudentPhone(selectedEnrollment) || (isAr ? 'غير مسجل' : 'N/A')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5 font-cairo">
                  <Calendar className="w-3.5 h-3.5" />
                  {isAr ? 'تاريخ الالتحاق:' : 'Enrolled Date:'}
                </span>
                <span className="font-bold text-navy-900 dark:text-white">
                  {new Date(selectedEnrollment.enrolledAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                </span>
              </div>
            </div>

            {/* Academic Progress */}
            <div className="border border-gray-100 dark:border-navy-800 rounded-2xl p-4 space-y-4 mb-6">
              <div className="flex items-center gap-2 text-sm font-bold text-navy-900 dark:text-white font-cairo">
                <GraduationCap className="w-4 h-4 text-gold-500" />
                <span>{getProgramTitle(selectedEnrollment)}</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5 font-cairo">
                  <span className="text-gray-400">{isAr ? 'معدل إتمام المناهج والدروس' : 'Curriculum Completion Rate'}</span>
                  <span className="text-gold-500 font-mono">{selectedEnrollment.progressPercentage || 0}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-navy-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-500 rounded-full"
                    style={{ width: `${selectedEnrollment.progressPercentage || 0}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs font-cairo">
                <span className="text-gray-400">{isAr ? 'حالة الاشتراك الحالية:' : 'Current Status:'}</span>
                <StatusBadge status={selectedEnrollment.status} />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
              {getStudentId(selectedEnrollment) && (
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({
                      type: 'student',
                      id: getStudentId(selectedEnrollment),
                      name: getStudentName(selectedEnrollment),
                    })
                  }
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 font-cairo"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>{isAr ? 'حذف حساب الطالب نهائياً' : 'Delete Student Account'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-navy-950 dark:bg-gold-500 text-white dark:text-navy-950 text-xs font-bold font-cairo"
              >
                {isAr ? 'إغلاق النافذة' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete In-App Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] bg-navy-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl text-start font-cairo">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg md:text-xl font-bold text-navy-900 dark:text-white font-cairo mb-2">
              {deleteTarget.type === 'enrollment'
                ? isAr
                  ? `تأكيد حذف اشتراك الطالب (${deleteTarget.name})`
                  : `Confirm Delete Enrollment for (${deleteTarget.name})`
                : isAr
                ? `تأكيد حذف حساب الطالب (${deleteTarget.name})`
                : `Confirm Delete Student Account (${deleteTarget.name})`}
            </h3>

            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-cairo leading-relaxed mb-6">
              {deleteTarget.type === 'enrollment'
                ? isAr
                  ? 'سيتم إلغاء وحذف تسجيل الطالب في هذا البرنامج التدريبي نهائياً من قاعدة البيانات.'
                  : 'This student program enrollment will be permanently deleted from the database.'
                : isAr
                ? 'تحذير: سيتم حذف حساب الطالب بالكامل وسجلاته واشتراكاته في كافة البرامج نهائياً وبلا رجعة.'
                : 'Warning: This will permanently remove the student user account and all associated enrollments.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-navy-800 text-gray-700 dark:text-gray-300 text-xs font-bold font-cairo hover:bg-gray-200 transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-cairo transition-all flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isAr ? 'جارٍ الحذف...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تأكيد الحذف' : 'Confirm Delete'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
