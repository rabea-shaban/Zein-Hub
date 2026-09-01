'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { createTrackSchema, CreateTrackFormData } from '@/lib/validations/admin.schemas';
import { FormField, inputClass } from '@/components/ui/FormField';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import { Layers, PlusCircle, Loader2, AlertCircle, X } from 'lucide-react';

interface TrackItem {
  _id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  programsCount?: number;
}

export default function AdminTracksPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTrackFormData>({
    resolver: zodResolver(createTrackSchema),
    defaultValues: {
      nameAr: '',
      nameEn: '',
      slug: '',
      descriptionAr: '',
      descriptionEn: '',
    },
  });

  const fetchTracks = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<TrackItem[]>('/tracks');
      setTracks(res.data || []);
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل المسارات التدريبية' : 'Failed to load tracks'));
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const onSubmit = async (data: CreateTrackFormData) => {
    try {
      await api.post('/tracks', data);
      toast.success(isAr ? 'تم إنشاء المسار التدريبي بنجاح' : 'Track created successfully');
      setIsModalOpen(false);
      reset();
      fetchTracks();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل إنشاء المسار التدريبي' : 'Failed to create track'));
    }
  };

  return (
    <div className="space-y-8 font-cairo">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'المسارات والتخصصات التدريبية' : 'Training Tracks & Disciplines'}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-cairo">
            {isAr
              ? 'تصنيفات البرامج وتخصصات التدريب الإعلامي المعتمدة في المنصة'
              : 'Classifications and domains of certified media training programs'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs font-cairo shadow-md shadow-gold-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAr ? 'إضافة مسار تدريبي جديد' : 'Add New Track'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
          <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل المسارات...' : 'Loading tracks...'}</span>
        </div>
      ) : tracks.length === 0 ? (
        <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-12 text-center text-gray-400 text-sm font-cairo">
          {isAr ? 'لا توجد مسارات تدريبية مسجلة حالياً' : 'No tracks registered yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <div
              key={track._id}
              className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 dark:text-white font-cairo text-base">
                      {isAr ? track.nameAr : track.nameEn}
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">{track.slug}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 font-cairo">
                  {isAr ? track.descriptionAr || 'تخصص تدريبي متقدم لتأهيل الكوادر الإعلامية وصناع المحتوى.' : track.descriptionEn || 'Advanced training track.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-navy-800 flex items-center justify-between text-xs font-bold text-gray-500 font-cairo">
                <span>{isAr ? 'تخصص إعلامي معتمد' : 'Core Media Domain'}</span>
                <span className="text-gold-500 font-bold">{isAr ? 'مسار نشط' : 'Active Track'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Track Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl text-start font-cairo">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'إنشاء مسار تدريبي جديد' : 'Create New Track'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField label={isAr ? 'اسم المسار بالعربية' : 'Arabic Name'} error={errors.nameAr?.message} required>
                <input
                  type="text"
                  {...register('nameAr')}
                  placeholder={isAr ? 'مسار الإنتاج الإذاعي والصوتي' : 'Arabic Track Name'}
                  className={inputClass(!!errors.nameAr)}
                />
              </FormField>

              <FormField label={isAr ? 'اسم المسار بالإنجليزية' : 'English Name'} error={errors.nameEn?.message} required>
                <input
                  type="text"
                  {...register('nameEn')}
                  placeholder="Audio & Radio Production Track"
                  className={inputClass(!!errors.nameEn)}
                />
              </FormField>

              <FormField label={isAr ? 'الرابط المخصص للمسار' : 'Custom Slug'} error={errors.slug?.message} required>
                <input
                  type="text"
                  {...register('slug')}
                  placeholder="audio-radio-track"
                  className={inputClass(!!errors.slug)}
                />
              </FormField>

              <FormField label={isAr ? 'الوصف والتفاصيل بالعربية' : 'Arabic Description'} error={errors.descriptionAr?.message}>
                <textarea
                  rows={2}
                  {...register('descriptionAr')}
                  placeholder={isAr ? 'تخصصات هندسة الصوت والمكساج والتعليق الصوتي...' : 'Track details...'}
                  className={inputClass(!!errors.descriptionAr)}
                />
              </FormField>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-500 font-cairo"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50 font-cairo"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{isAr ? 'حفظ المسار' : 'Save Track'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
