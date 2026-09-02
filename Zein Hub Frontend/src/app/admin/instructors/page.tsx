'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { createInstructorSchema, CreateInstructorFormData } from '@/lib/validations/admin.schemas';
import { FormField, inputClass } from '@/components/ui/FormField';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/lib/api';
import {
  PlusCircle,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  X,
  ShieldCheck,
  Pencil,
  Trash2,
  Award,
  BookOpen,
  Image as LucideImage,
  Upload,
  ImagePlus,
} from 'lucide-react';

interface InstructorItem {
  _id: string;
  fullName?: string;
  fullNameEn?: string;
  email?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  avatarUrl?: string;
  photoUrl?: string;
  bio?: string;
  bioEn?: string;
  specializations?: string[];
  specializationsEn?: string[];
  experienceYears?: number;
  userId?: {
    _id?: string;
    fullName?: string;
    fullNameEn?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    isActive?: boolean;
  };
  user?: {
    fullName?: string;
    fullNameEn?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  };
  instructorProfile?: {
    bio?: string;
    bioEn?: string;
    specializations?: string[];
    specializationsEn?: string[];
    experienceYears?: number;
    assignedPrograms?: any[];
  };
}

interface TrackItem {
  _id: string;
  nameAr: string;
  nameEn?: string;
}

const INSTRUCTOR_TRANSLATIONS: Record<string, { nameEn: string; bioEn: string; specsEn: string[] }> = {
  'د. طارق السوهاجي': {
    nameEn: 'Dr. Tarek El Sohagi',
    bioEn: 'Senior broadcast voice coach with 15+ years of practical experience across leading Arab media platforms.',
    specsEn: ['Digital Vocalise', 'Voice-Over', 'Podcast Production', 'Audio Engineering'],
  },
  'م. حسام الأقصري': {
    nameEn: 'Eng. Hossam El Oqsori',
    bioEn: 'Digital media tech consultant and master trainer in Generative AI, OSINT, and automated newsroom pipelines.',
    specsEn: ['Digital Production', 'AI Journalism', 'Content Automation', 'Deepfake Verification'],
  },
  'أ. سارة المنياوي': {
    nameEn: 'Ms. Sara El Minyawi',
    bioEn: 'Principal TV anchor and broadcast performance coach preparing emerging talents for newsroom cameras.',
    specsEn: ['TV Anchoring', 'News Bulletin Reading', 'Studio Moderation', 'Broadcast Diction'],
  },
  'د. ريهام الأسيوطي': {
    nameEn: 'Dr. Reham El Assiuti',
    bioEn: 'Strategic public relations consultant and corporate brand identity advisor for top digital media entities.',
    specsEn: ['Digital PR', 'Reputation Management', 'Brand Identity', 'Growth Strategy'],
  },
};

const SPEC_TRANSLATIONS: Record<string, string> = {
  'الفوكاليز الرقمي': 'Digital Vocalise',
  'التعليق الصوتي': 'Voice-Over',
  'صناعة البودكاست': 'Podcast Production',
  'هندسة الصوت': 'Audio Engineering',
  'الإنتاج الرقمي': 'Digital Production',
  'صحافة الذكاء الاصطناعي': 'AI Journalism',
  'أتمتة المحتوى': 'Content Automation',
  'التحقق من التزييف العميق': 'Deepfake Verification',
  'التقديم التلفزيوني': 'TV Anchoring',
  'قراءة النشرات الإخبارية': 'News Bulletin Reading',
  'إدارة الحوارات': 'Studio Moderation',
  'الأداء المسرحي': 'Broadcast Diction',
  'العلاقات العامة الرقمية': 'Digital PR',
  'إدارة السمعة الإعلامية': 'Reputation Management',
  'بناء الهوية': 'Brand Identity',
  'التسويق الرقمي المؤتمت': 'Growth Strategy',
};

export default function AdminInstructorsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [instructors, setInstructors] = useState<InstructorItem[]>([]);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [allPrograms, setAllPrograms] = useState<{ _id: string; titleAr: string; titleEn: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEditInstructor, setSelectedEditInstructor] = useState<InstructorItem | null>(null);
  const [selectedDeleteInstructor, setSelectedDeleteInstructor] = useState<InstructorItem | null>(null);

  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Assigned Programs for Create Form
  const [createAssignedPrograms, setCreateAssignedPrograms] = useState<string[]>([]);
  const [createAvatarUrl, setCreateAvatarUrl] = useState<string>('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Helper to upload instructor avatar directly to Supabase Storage
  const handleAvatarFileChange = async (file: File | null, callback: (url: string) => void) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(isAr ? 'يرجى اختيار ملف صورة صالح (PNG, JPG, WebP)' : 'Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isAr ? 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)' : 'Image size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    const toastId = toast.loading(isAr ? 'جارٍ رفع الصورة إلى Supabase...' : 'Uploading avatar to Supabase...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res: any = await api.post('/upload/image?folder=instructors', formData);
      const publicUrl = res.data?.url || res.data?.image;

      if (publicUrl) {
        callback(publicUrl);
        toast.success(isAr ? 'تم رفع وحفظ صورة المحاضر سحابياً بنجاح ☁️' : 'Avatar uploaded to Supabase successfully', { id: toastId });
      } else {
        throw new Error('No public URL returned');
      }
    } catch (err: any) {
      console.error('Avatar Upload Error:', err);
      toast.error(err.message || (isAr ? 'فشل الرفع السحابي' : 'Cloud upload failed'), { id: toastId });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Create Form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    setValue: setValueCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
  } = useForm<CreateInstructorFormData>({
    resolver: zodResolver(createInstructorSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      trackId: '',
      specializations: isAr ? 'التعليق الصوتي، هندسة الصوت' : 'Voice-Over, Audio Engineering',
      bio: '',
    },
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState<{
    fullName: string;
    phone: string;
    avatarUrl: string;
    specializations: string;
    bio: string;
    experienceYears: number;
    isActive: boolean;
    assignedPrograms: string[];
  }>({
    fullName: '',
    phone: '',
    avatarUrl: '',
    specializations: '',
    bio: '',
    experienceYears: 10,
    isActive: true,
    assignedPrograms: [],
  });

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [instRes, tracksRes, progsRes] = await Promise.all([
        api.get<InstructorItem[]>('/instructors/admin/all', { params: { limit: 50 } }),
        api.get<TrackItem[]>('/tracks'),
        api.get<any>('/programs', { params: { limit: 100 } }),
      ]);

      setInstructors(instRes.data || []);
      const trackList = tracksRes.data || [];
      setTracks(trackList);
      const rawProgs = Array.isArray(progsRes.data) ? progsRes.data : progsRes.data?.programs || [];
      setAllPrograms(rawProgs);

      if (trackList.length > 0) {
        setValueCreate('trackId', trackList[0]._id);
      }
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل بيانات المحاضرين' : 'Failed to load instructors'));
    } finally {
      setLoading(false);
    }
  }, [setValueCreate, isAr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create Submit
  const onSubmitCreate = async (data: CreateInstructorFormData) => {
    try {
      const specs = data.specializations
        .split(/[,،]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post('/instructors', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        trackId: data.trackId,
        specializations: specs,
        bio: data.bio,
        avatarUrl: createAvatarUrl || undefined,
        assignedPrograms: createAssignedPrograms,
      });

      toast.success(isAr ? 'تم إضافة وتعيين المحاضر بنجاح' : 'Instructor created successfully');
      setIsCreateModalOpen(false);
      resetCreate();
      setCreateAssignedPrograms([]);
      setCreateAvatarUrl('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل إضافة المحاضر' : 'Failed to create instructor'));
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (inst: InstructorItem) => {
    const rawName = inst.fullName || inst.userId?.fullName || inst.user?.fullName || '';
    const phone = inst.phone || inst.userId?.phone || inst.user?.phone || '';
    const bio = inst.bio || inst.instructorProfile?.bio || '';
    const avatar = inst.avatarUrl || inst.userId?.avatarUrl || inst.user?.avatarUrl || '';
    const rawSpecs = inst.specializations || inst.instructorProfile?.specializations || [];
    const specsStr = Array.isArray(rawSpecs) ? rawSpecs.join('، ') : String(rawSpecs);
    const exp = inst.experienceYears || inst.instructorProfile?.experienceYears || 10;
    const active = inst.isActive ?? inst.userId?.isActive ?? true;

    const rawAssigned =
      inst.instructorProfile?.assignedPrograms || (inst as any).assignedPrograms || [];
    const assignedIds = Array.isArray(rawAssigned)
      ? rawAssigned.map((p) => (typeof p === 'object' ? p._id : p)).filter(Boolean)
      : [];

    setSelectedEditInstructor(inst);
    setEditFormData({
      fullName: rawName,
      phone,
      avatarUrl: avatar,
      specializations: specsStr,
      bio,
      experienceYears: exp,
      isActive: active,
      assignedPrograms: assignedIds,
    });
  };

  // Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditInstructor) return;

    setEditSubmitting(true);
    try {
      const specs = editFormData.specializations
        .split(/[,،]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      await api.patch(`/instructors/${selectedEditInstructor._id}`, {
        fullName: editFormData.fullName,
        phone: editFormData.phone || undefined,
        avatarUrl: editFormData.avatarUrl || undefined,
        specializations: specs,
        bio: editFormData.bio,
        experienceYears: Number(editFormData.experienceYears),
        isActive: editFormData.isActive,
        assignedPrograms: editFormData.assignedPrograms,
      });

      toast.success(isAr ? 'تم حفظ تعديلات المحاضر بنجاح' : 'Instructor updated successfully');
      setSelectedEditInstructor(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل حفظ تعديلات المحاضر' : 'Failed to update instructor'));
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete Submit
  const handleDeleteConfirm = async () => {
    if (!selectedDeleteInstructor) return;

    setDeleteSubmitting(true);
    try {
      await api.delete(`/instructors/${selectedDeleteInstructor._id}`);
      toast.success(isAr ? 'تم حذف حساب المحاضر بنجاح' : 'Instructor deleted successfully');
      setSelectedDeleteInstructor(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل حذف حساب المحاضر' : 'Failed to delete instructor'));
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-cairo">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-navy-900 dark:text-white font-cairo">
            {isAr ? 'المدربون والخبراء الإعلاميون' : 'Instructors & Media Experts'}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 font-cairo">
            {isAr
              ? 'إدارة وتعديل وحذف حسابات المحاضرين، التخصصات، وسنوات الخبرة والاعتماد المهني'
              : 'Manage, edit, delete instructor profiles, domains, and credentials'}
          </p>
        </div>

        <button
          onClick={() => {
            if (tracks.length > 0) {
              setValueCreate('trackId', tracks[0]._id);
            }
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs font-cairo shadow-md shadow-gold-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAr ? 'تعيين مدرب / محاضر جديد' : 'Assign New Instructor'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Instructors Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
          <span className="text-xs font-bold">{isAr ? 'جارٍ تحميل المحاضرين...' : 'Loading instructors...'}</span>
        </div>
      ) : instructors.length === 0 ? (
        <div className="py-20 text-center text-gray-400 text-sm font-cairo bg-white dark:bg-navy-900 rounded-3xl border border-gray-100 dark:border-navy-800">
          {isAr ? 'لا يوجد مدربون مسجلون حالياً' : 'No instructors found'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((inst) => {
            const rawName = inst.fullName || inst.userId?.fullName || inst.user?.fullName || '';
            const email = inst.email || inst.userId?.email || inst.user?.email || '';
            const phone = inst.phone || inst.userId?.phone || inst.user?.phone || '';
            const bio = inst.bio || inst.instructorProfile?.bio || '';
            const rawSpecs = inst.specializations || inst.instructorProfile?.specializations || [];
            const expYears = inst.experienceYears || inst.instructorProfile?.experienceYears || 10;
            const isActive = inst.isActive ?? inst.userId?.isActive ?? true;

            const tInfo = INSTRUCTOR_TRANSLATIONS[rawName];
            const name = isAr ? rawName : tInfo?.nameEn || rawName;
            const finalBio = isAr ? bio : tInfo?.bioEn || bio;
            const specs = isAr
              ? rawSpecs
              : tInfo?.specsEn || rawSpecs.map((s) => SPEC_TRANSLATIONS[s] || s);

            return (
              <div
                key={inst._id}
                className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 shadow-sm hover:border-gold-500/40 transition-all flex flex-col justify-between text-start font-cairo relative group"
              >
                {/* Actions (Edit / Delete) */}
                <div className="absolute top-5 left-5 rtl:left-5 rtl:right-auto ltr:right-5 ltr:left-auto flex items-center gap-1.5 z-10">
                  <button
                    onClick={() => handleOpenEdit(inst)}
                    className="p-2 rounded-xl text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                    title={isAr ? 'تعديل بيانات المحاضر' : 'Edit Instructor'}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setSelectedDeleteInstructor(inst)}
                    className="p-2 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    title={isAr ? 'حذف المحاضر' : 'Delete Instructor'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 overflow-hidden flex items-center justify-center font-bold text-gold-600 dark:text-gold-400 text-lg shrink-0 shadow-sm">
                      {inst.avatarUrl || inst.userId?.avatarUrl || inst.user?.avatarUrl ? (
                        <img
                          src={inst.avatarUrl || inst.userId?.avatarUrl || inst.user?.avatarUrl}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        name.charAt(0) || 'Z'
                      )}
                    </div>

                    <div className="pr-12 rtl:pr-0 rtl:pl-12">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-navy-900 dark:text-white font-cairo">
                          {name}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      </div>
                      <span className="text-[11px] font-bold text-gold-600 dark:text-gold-400 block font-cairo mt-0.5">
                        {isAr ? 'محاضر واستشاري معتمد' : 'Certified Media Coach'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3 font-cairo">
                    {finalBio || (isAr ? 'لا توجد نبذة مدخلة للمحاضر.' : 'No biography available.')}
                  </p>

                  {/* Assigned Programs Strip */}
                  <div className="pt-3 border-t border-gray-100 dark:border-navy-800">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1.5 font-cairo">
                      {isAr ? 'البرامج التدريبية المسندة للتدريس:' : 'Assigned Programs:'}
                    </span>
                    {(() => {
                      const rawAssigned =
                        inst.instructorProfile?.assignedPrograms || (inst as any).assignedPrograms || [];
                      if (!Array.isArray(rawAssigned) || rawAssigned.length === 0) {
                        return (
                          <span className="text-[10px] text-gray-400 font-cairo italic block">
                            {isAr ? 'لم يتم إسناد برامج تدريبية بعد' : 'No programs assigned yet'}
                          </span>
                        );
                      }
                      return (
                        <div className="flex flex-wrap gap-1.5">
                          {rawAssigned.map((p: any, idx: number) => {
                            const pTitle = typeof p === 'object' ? (isAr ? p.titleAr : p.titleEn || p.titleAr) : p;
                            return (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-lg bg-gold-500/10 border border-gold-500/25 text-gold-600 dark:text-gold-400 text-[10px] font-bold font-cairo flex items-center gap-1"
                              >
                                <span>🎓</span>
                                <span className="truncate max-w-[150px]">{pTitle}</span>
                              </span>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Contact Info & Experience Strip */}
                <div className="pt-4 border-t border-gray-100 dark:border-navy-800 text-xs text-gray-500 dark:text-gray-400 space-y-2 font-mono">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-navy-800 dark:text-gray-300 font-bold font-cairo">
                      <Award className="w-3.5 h-3.5 text-gold-500" />
                      <span>{expYears} {isAr ? 'سنوات خبرة' : 'yrs experience'}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-cairo ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isActive ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
                    </span>
                  </div>

                  {email && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{phone}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1️⃣ Create Instructor Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-start max-h-[90vh] overflow-y-auto font-cairo">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'تعيين محاضر ومدرب جديد' : 'Assign New Instructor'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate(onSubmitCreate)} className="space-y-4" noValidate>
              <FormField label={isAr ? 'الاسم الكامل' : 'Full Name'} error={errorsCreate.fullName?.message} required>
                <input
                  type="text"
                  {...registerCreate('fullName')}
                  placeholder={isAr ? 'د. أحمد محمود' : 'Dr. Ahmed Mahmoud'}
                  className={inputClass(!!errorsCreate.fullName)}
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} error={errorsCreate.email?.message} required>
                  <input
                    type="email"
                    {...registerCreate('email')}
                    placeholder="instructor@zeinhub.com"
                    className={inputClass(!!errorsCreate.email)}
                  />
                </FormField>

                <FormField label={isAr ? 'كلمة المرور' : 'Password'} error={errorsCreate.password?.message} required>
                  <input
                    type="password"
                    {...registerCreate('password')}
                    placeholder="••••••••"
                    className={inputClass(!!errorsCreate.password)}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label={isAr ? 'رقم الهاتف' : 'Phone'} error={errorsCreate.phone?.message}>
                  <input
                    type="text"
                    {...registerCreate('phone')}
                    placeholder="+201012345678"
                    className={inputClass(!!errorsCreate.phone)}
                  />
                </FormField>

                <FormField label={isAr ? 'المسار التدريبي' : 'Track'} error={errorsCreate.trackId?.message} required>
                  <select
                    {...registerCreate('trackId')}
                    className={inputClass(!!errorsCreate.trackId)}
                  >
                    {tracks.map((t) => (
                      <option key={t._id} value={t._id}>
                        {isAr ? t.nameAr : t.nameEn || t.nameAr}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <FormField label={isAr ? 'التخصصات (مفصولة بفواصل)' : 'Specializations (comma separated)'} error={errorsCreate.specializations?.message} required>
                <input
                  type="text"
                  {...registerCreate('specializations')}
                  placeholder={isAr ? 'التعليق الصوتي, هندسة الصوت' : 'Voice-Over, Audio Engineering'}
                  className={inputClass(!!errorsCreate.specializations)}
                />
              </FormField>

              <FormField label={isAr ? 'نبذة عن المحاضر' : 'Instructor Bio'} error={errorsCreate.bio?.message} required>
                <textarea
                  rows={3}
                  {...registerCreate('bio')}
                  placeholder={isAr ? 'خبرة تزيد عن 10 سنوات في مجال التدريب الإذاعي والصوتي...' : '10+ years of broadcast training experience...'}
                  className={inputClass(!!errorsCreate.bio)}
                />
              </FormField>

              {/* Avatar Image Upload to Supabase */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 space-y-2.5 font-cairo">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <LucideImage className="w-4 h-4 text-gold-500" />
                    <span>{isAr ? 'الصورة الشخصية للمحاضر (تُرفع سحابياً على Supabase)' : 'Instructor Photo (Uploaded to Supabase)'}</span>
                  </label>
                  {createAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setCreateAvatarUrl('')}
                      className="text-[11px] text-red-500 hover:underline font-bold"
                    >
                      {isAr ? 'إزالة الصورة' : 'Remove Photo'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-navy-900 border border-gray-200 dark:border-navy-800 flex items-center justify-center shrink-0 shadow-inner">
                    {createAvatarUrl ? (
                      <img src={createAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30 text-xs font-bold transition-all flex items-center gap-1.5 w-fit">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isAr ? 'رفع صورة من جهازك' : 'Upload from Device'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleAvatarFileChange(e.target.files?.[0] || null, setCreateAvatarUrl)}
                      />
                    </label>
                    <span className="text-[10px] text-gray-400 block font-mono">PNG, JPG, WebP (Max 5MB)</span>
                  </div>
                </div>
              </div>

              {/* Assigned Programs Selector in Create Modal */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 font-cairo">
                  {isAr ? 'تحديد البرامج التي سيدرسها المحاضر:' : 'Assign Programs to Teach:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800">
                  {allPrograms.map((prog) => {
                    const checked = createAssignedPrograms.includes(prog._id);
                    return (
                      <label
                        key={prog._id}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          checked
                            ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-850'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCreateAssignedPrograms([...createAssignedPrograms, prog._id]);
                            } else {
                              setCreateAssignedPrograms(createAssignedPrograms.filter((id) => id !== prog._id));
                            }
                          }}
                          className="rounded text-gold-500 focus:ring-gold-500"
                        />
                        <span className="truncate">{isAr ? prog.titleAr : prog.titleEn || prog.titleAr}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800 font-cairo"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs transition-all shadow-md shadow-gold-500/20 flex items-center gap-2 disabled:opacity-50 font-cairo"
                >
                  {isSubmittingCreate ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{isAr ? 'حفظ وتعيين المحاضر' : 'Save & Assign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2️⃣ Edit Instructor Modal */}
      {selectedEditInstructor && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-start max-h-[90vh] overflow-y-auto font-cairo">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'تعديل بيانات المدرب والمحاضر' : 'Edit Instructor Profile'}
              </h3>
              <button
                onClick={() => setSelectedEditInstructor(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    {isAr ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    {isAr ? 'سنوات الخبرة' : 'Experience (Years)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editFormData.experienceYears}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, experienceYears: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  {isAr ? 'التخصصات (مفصولة بفواصل)' : 'Specializations (comma separated)'}
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.specializations}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, specializations: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  {isAr ? 'النبذة المهنية' : 'Professional Biography'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 text-xs text-navy-900 dark:text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                />
              </div>

              {/* Edit Avatar Image Upload to Supabase */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800 space-y-2.5 font-cairo">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <LucideImage className="w-4 h-4 text-gold-500" />
                    <span>{isAr ? 'الصورة الشخصية للمحاضر (Supabase Storage)' : 'Instructor Photo (Supabase Storage)'}</span>
                  </label>
                  {editFormData.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, avatarUrl: '' })}
                      className="text-[11px] text-red-500 hover:underline font-bold"
                    >
                      {isAr ? 'إزالة الصورة' : 'Remove Photo'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-navy-900 border border-gray-200 dark:border-navy-800 flex items-center justify-center shrink-0 shadow-inner">
                    {editFormData.avatarUrl ? (
                      <img src={editFormData.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30 text-xs font-bold transition-all flex items-center gap-1.5 w-fit">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isAr ? 'رفع صورة جديدة من جهازك' : 'Upload from Device'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleAvatarFileChange(e.target.files?.[0] || null, (url) =>
                            setEditFormData({ ...editFormData, avatarUrl: url })
                          )
                        }
                      />
                    </label>
                    <span className="text-[10px] text-gray-400 block font-mono">PNG, JPG, WebP (Max 5MB)</span>
                  </div>
                </div>
              </div>

              {/* Assigned Programs Selector in Edit Modal */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 font-cairo">
                  {isAr ? 'تعديل البرامج التدريبية المسندة للمحاضر:' : 'Assign Programs to Teach:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2.5 rounded-xl bg-gray-50 dark:bg-navy-950 border border-gray-200 dark:border-navy-800">
                  {allPrograms.map((prog) => {
                    const checked = editFormData.assignedPrograms.includes(prog._id);
                    return (
                      <label
                        key={prog._id}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          checked
                            ? 'bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-850'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditFormData({
                                ...editFormData,
                                assignedPrograms: [...editFormData.assignedPrograms, prog._id],
                              });
                            } else {
                              setEditFormData({
                                ...editFormData,
                                assignedPrograms: editFormData.assignedPrograms.filter((id) => id !== prog._id),
                              });
                            }
                          }}
                          className="rounded text-gold-500 focus:ring-gold-500"
                        />
                        <span className="truncate">{isAr ? prog.titleAr : prog.titleEn || prog.titleAr}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
                <button
                  type="button"
                  onClick={() => setSelectedEditInstructor(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {editSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3️⃣ Delete Confirmation Modal */}
      {selectedDeleteInstructor && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl text-start font-cairo space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-navy-900 dark:text-white font-cairo">
                {isAr ? 'حذف حساب المحاضر نهائياً' : 'Delete Instructor Account'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed font-cairo">
                {isAr
                  ? `هل أنت متأكد من رغبتك في حذف المدرب "${
                      selectedDeleteInstructor.fullName ||
                      selectedDeleteInstructor.userId?.fullName ||
                      selectedDeleteInstructor.user?.fullName
                    }"؟ سيتم إلغاء حسابه وسجل التدريب التابع له.`
                  : `Are you sure you want to permanently delete this instructor? This action cannot be undone.`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setSelectedDeleteInstructor(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-800 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-800"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {deleteSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{isAr ? 'تأكيد الحذف' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
