'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  ShieldCheck,
  Award,
  Mail,
  Phone,
  Video,
  Save,
  Check,
} from 'lucide-react';

export default function InstructorProfilePage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';

  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'د. طارق السوهاجي',
    email: user?.email || 'tarek.sohagi@zeinhub.com',
    phone: '+201098765432',
    specializations: 'الفوكاليز الرقمي، التعليق الصوتي، صناعة البودكاست، هندسة الصوت',
    experienceYears: 15,
    bio: 'خبير تدريب صوتي معتمد ومدرب فوكاليز بخبرة تفوق 15 عاماً في المحطات الإذاعية والمنصات الرقمية. أشرف على تدريب وتخريج مئات الأصوات الإعلانية والوثائقية في صعيد مصر والوطن العربي.',
    reelUrl: 'https://youtube.com/watch?v=sample-voice-reel',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 text-start font-cairo max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
          {isAr ? 'الملف الشخصي والمهني للمحاضر' : 'Instructor Profile & Credentials'}
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          {isAr
            ? 'تحديث بياناتك المهنية، النبذة الذاتية، التخصصات، ورابط الفيديو الاستعراضي (Demo Reel)'
            : 'Update your public faculty credentials, bio, specializations, and demo reel'}
        </p>
      </div>

      <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        {/* Profile Avatar Card */}
        <div className="flex items-center gap-5 pb-6 border-b border-gray-100 dark:border-navy-800">
          <div className="w-20 h-20 rounded-3xl bg-gold-500/10 border border-gold-500/30 text-gold-600 dark:text-gold-400 font-bold text-2xl flex items-center justify-center shadow-md">
            {formData.fullName.charAt(0) || 'Z'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-navy-900 dark:text-white">
                {formData.fullName}
              </h2>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-gold-600 dark:text-gold-400 block font-cairo">
              {isAr ? 'محاضر واستشاري معتمد في منصة Zein Hub' : 'Senior Certified Media Instructor'}
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {isAr ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-gray-500 font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {isAr ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {isAr ? 'سنوات الخبرة المهنية' : 'Years of Experience'}
              </label>
              <input
                type="number"
                min={1}
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {isAr ? 'التخصصات ومجالات التدريب (مفصولة بفواصل)' : 'Specializations (comma separated)'}
            </label>
            <input
              type="text"
              required
              value={formData.specializations}
              onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {isAr ? 'النبذة المهنية والذاتية (تظهر في الموقع العام)' : 'Professional Bio (Visible on Public Website)'}
            </label>
            <textarea
              rows={4}
              required
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {isAr ? 'رابط الديمو ريل والفيديو الاستعراضي (Demo Reel URL)' : 'Demo Reel Video URL'}
            </label>
            <input
              type="url"
              value={formData.reelUrl}
              onChange={(e) => setFormData({ ...formData, reelUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-navy-800">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-md transition-all"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saved ? (isAr ? 'تم حفظ التعديلات بنجاح ✓' : 'Profile Updated ✓') : (isAr ? 'حفظ وتحديث الملف الشخصي' : 'Save Profile Changes')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
