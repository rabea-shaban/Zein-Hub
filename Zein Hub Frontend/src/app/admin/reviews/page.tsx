'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useLanguage } from '@/context/LanguageContext';
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface ReviewItem {
  _id: string;
  studentId?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  };
  student?: {
    fullName?: string;
    email?: string;
  };
  programId?: {
    _id?: string;
    titleAr?: string;
    titleEn?: string;
    slug?: string;
  };
  program?: {
    titleAr?: string;
    titleEn?: string;
  };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<any>('/reviews/admin/all', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          limit: 50,
        },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.reviews || [];
      setReviews(list);
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل التقييمات' : 'Failed to load reviews'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, isAr]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleModerate = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      await api.patch(`/reviews/${reviewId}/moderate`, { status });
      toast.success(isAr ? 'تم تحديث حالة التقييم بنجاح' : 'Review status updated');
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل تغيير حالة التقييم' : 'Failed to update review status'));
    }
  };

  const handleToggleFeature = async (reviewId: string, currentFeatured: boolean) => {
    try {
      await api.patch(`/reviews/${reviewId}/moderate`, { isFeatured: !currentFeatured });
      toast.success(isAr ? 'تم تحديث حالة تمييز التقييم' : 'Featured status updated');
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل تغيير حالة التمييز' : 'Failed to toggle featured status'));
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من رغبتك في حذف هذا التقييم نهائياً؟' : 'Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success(isAr ? 'تم حذف التقييم بنجاح' : 'Review deleted successfully');
      fetchReviews();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل حذف التقييم' : 'Failed to delete review'));
    }
  };

const STUDENT_NAMES_EN: Record<string, string> = {
  'نورهان كمال الأسواني': 'Nourhan Kamal El Aswani',
  'يوسف عبد الرحمن القناوي': 'Youssef Abdelrahman El Qenawi',
  'مريم عصام الأبنودي': 'Mariam Essam El Abnoudi',
  'أحمد محمود الصعيدي': 'Ahmed Mahmoud El Saidi',
};

const COMMENT_TRANSLATIONS: Record<string, string> = {
  'تجربة استثنائية': 'An exceptional hands-on experience in Upper Egypt audio studios. Voice coaching transformed my vocal control completely.',
  'أقوى دبلوم في الإلقاء': 'The most rigorous news presentation & anchoring diploma. Studio simulation boosted my confidence on-camera.',
  'المحتوى ثري جداً': 'Very rich curriculum. The focus on AI tools and audio editing added tremendous value to my media skills.',
  'بيئة تعليمية متميزة': 'Outstanding learning environment with high industry standards. My graduation capstone received acclaim from top broadcasters.',
};

  const getStudentName = (rev: ReviewItem) => {
    const s = rev.studentId || rev.student;
    const raw = (typeof s === 'object' && s?.fullName) || '';
    if (isAr) return raw || 'طالب معتمد';
    return STUDENT_NAMES_EN[raw] || raw || 'Verified Student';
  };

  const getComment = (comment: string) => {
    if (isAr) return comment;
    for (const [key, val] of Object.entries(COMMENT_TRANSLATIONS)) {
      if (comment.includes(key)) return val;
    }
    return comment;
  };

  const getProgramTitle = (rev: ReviewItem): string => {
    const p = rev.programId || rev.program;
    if (typeof p === 'object' && p) {
      return (isAr ? p.titleAr || p.titleEn : p.titleEn || p.titleAr) || (isAr ? 'البرنامج التدريبي' : 'Training Program');
    }
    return isAr ? 'البرنامج التدريبي' : 'Training Program';
  };

  const filteredReviews = reviews.filter((rev) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const sName = getStudentName(rev).toLowerCase();
    const pTitle = getProgramTitle(rev).toLowerCase();
    const comment = (rev.comment || '').toLowerCase();
    return sName.includes(term) || pTitle.includes(term) || comment.includes(term);
  });

  return (
    <div className="space-y-8 font-cairo">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
          {isAr ? 'تدقيق واعتماد التقييمات والآراء' : 'Student Reviews Moderation'}
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-cairo">
          {isAr
            ? 'مراجعة تقييمات الطلاب للبرامج التدريبية واعتمادها للنشر أو تمييزها في الصفحة الرئيسية'
            : 'Moderate student testimonials, approve for publishing, or feature on homepage'}
        </p>
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
            placeholder={isAr ? 'بحث بالطالب أو البرنامج أو الرأي...' : 'Search student or review...'}
            className="w-full px-4 py-2.5 pr-10 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs focus:outline-none focus:border-gold-500 text-navy-900 dark:text-white font-cairo"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { key: 'all', ar: 'كافة التقييمات', en: 'All' },
            { key: 'pending', ar: 'قيد التدقيق والمراجعة', en: 'Pending' },
            { key: 'approved', ar: 'التقييمات المعتمدة', en: 'Approved' },
            { key: 'rejected', ar: 'التقييمات المرفوضة', en: 'Rejected' },
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

      {/* Reviews Table */}
      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
            <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل التقييمات...' : 'Loading reviews...'}</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm font-cairo">
            {isAr ? 'لا توجد مراجعات أو تقييمات مطابقة للفترة الحالية' : 'No reviews found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-gray-50 dark:bg-navy-950/60 text-gray-500 dark:text-gray-400 text-xs font-bold border-y border-gray-100 dark:border-navy-800 font-cairo">
                <tr>
                  <th className="py-3 px-4">{isAr ? 'الطالب' : 'Student'}</th>
                  <th className="py-3 px-4">{isAr ? 'البرنامج التدريبي' : 'Program'}</th>
                  <th className="py-3 px-4">{isAr ? 'التقييم' : 'Rating'}</th>
                  <th className="py-3 px-4">{isAr ? 'التعليق والرأي' : 'Review Comment'}</th>
                  <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'مميز' : 'Featured'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'إجراءات الاعتماد' : 'Moderation Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                {filteredReviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-gray-50/50 dark:hover:bg-navy-850/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-navy-900 dark:text-white font-cairo">
                      {getStudentName(rev)}
                    </td>

                    <td className="py-4 px-4 font-semibold text-xs text-navy-800 dark:text-gray-200 font-cairo">
                      {getProgramTitle(rev)}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-gold-500 font-bold text-xs font-mono">
                        <span>{rev.rating}</span>
                        <Star className="w-3.5 h-3.5 fill-gold-500" />
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs text-gray-600 dark:text-gray-300 max-w-sm">
                      <p className="line-clamp-2 leading-relaxed font-cairo">"{getComment(rev.comment)}"</p>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={rev.status} />
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeature(rev._id, rev.isFeatured)}
                        className={`p-2 rounded-xl border transition-all ${
                          rev.isFeatured
                            ? 'bg-gold-500/20 text-gold-500 border-gold-500/30'
                            : 'text-gray-400 border-gray-200 dark:border-navy-800 hover:text-gold-500'
                        }`}
                        title={rev.isFeatured ? (isAr ? 'إلغاء التمييز' : 'Unfeature') : (isAr ? 'تمييز في الواجهة' : 'Feature')}
                      >
                        <Star className={`w-4 h-4 ${rev.isFeatured ? 'fill-gold-500' : ''}`} />
                      </button>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {rev.status !== 'approved' && (
                          <button
                            onClick={() => handleModerate(rev._id, 'approved')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors"
                            title={isAr ? 'اعتماد التقييم' : 'Approve'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {rev.status !== 'rejected' && (
                          <button
                            onClick={() => handleModerate(rev._id, 'rejected')}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-colors"
                            title={isAr ? 'رفض التقييم' : 'Reject'}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
                          title={isAr ? 'حذف نهائي' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
