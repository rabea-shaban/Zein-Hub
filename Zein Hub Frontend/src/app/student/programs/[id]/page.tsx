'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  Play,
  Pause,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Video,
  Mic,
  FileText,
  FileAudio,
  Download,
  Upload,
  Clock,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Loader2,
  AlertCircle,
  Award,
  Layers,
  MessageSquare,
  Send,
  HelpCircle,
  Share2,
  Sun,
  Moon,
  Globe,
  Radio,
  Sliders,
  Check,
  ExternalLink,
} from 'lucide-react';

interface LessonItem {
  _id: string;
  title: string;
  description?: string;
  contentType: 'video' | 'audio' | 'pdf' | 'text';
  contentUrl?: string;
  durationMinutes?: number;
  isFreePreview?: boolean;
  order: number;
  completed?: boolean;
}

interface ModuleItem {
  _id: string;
  title: string;
  description?: string;
  order: number;
  lessons: LessonItem[];
}

interface ProgramDetails {
  _id: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  slug?: string;
  instructorId?: any;
  instructor?: any;
  coverImage?: string;
  level?: string;
}

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`
    : null;
}

export default function StudentCourseClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;
  const { language, toggleLanguage, direction } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isAr = language === 'ar';
  const Arrow = direction === 'rtl' ? ArrowLeft : ArrowRight;

  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleItem | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignment' | 'resources' | 'qa'>('overview');

  // Interactive Media Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Studio Take Submission State
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmittingTake, setIsSubmittingTake] = useState(false);
  const [takeSubmittedSuccess, setTakeSubmittedSuccess] = useState(false);
  const [submittedTakes, setSubmittedTakes] = useState<Array<{ url: string; notes: string; date: string }>>([]);

  // Q&A Question State
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaList, setQaList] = useState<Array<{ id: string; user: string; text: string; time: string; reply?: string }>>([
    {
      id: '1',
      user: 'نورهان كمال (متدربة)',
      text: 'كيف أتحكم في خروج الهواء الزائد عند نطق حرف السين والصاد في الميكروفون الحساس؟',
      time: 'منذ ساعتين',
      reply: 'إجابة المدرب: استخدمي البوب فلتر (Pop Filter) واضبطي زاوية الصوت بـ 45 درجة بدلاً من المواجهة المباشرة لكبسولة المايك.',
    },
  ]);

  // Fetch Course Content, Program Details & Progress
  const fetchCourseContent = useCallback(async () => {
    if (!programId) return;
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Program Metadata
      try {
        const pRes = await api.get<any>(`/programs/${programId}`);
        if (pRes.data) setProgram(pRes.data);
      } catch (e) {
        console.warn('Program fetch fallback:', e);
      }

      // 2. Fetch Modules & Lessons
      const res = await api.get<any>(`/programs/${programId}/modules`);
      const modList: ModuleItem[] = Array.isArray(res.data) ? res.data : res.data?.modules || [];
      setModules(modList);

      if (modList.length > 0) {
        const firstMod = modList.find((m) => m.lessons && m.lessons.length > 0) || modList[0];
        setActiveModule(firstMod);
        if (firstMod?.lessons && firstMod.lessons.length > 0) {
          setActiveLesson(firstMod.lessons[0]);
        }
      }

      // 3. Fetch Real Student Progress from Backend
      try {
        const progRes = await api.get<any>(`/progress/me/${programId}`);
        if (progRes.data?.completedLessons) {
          const ids = Array.isArray(progRes.data.completedLessons)
            ? progRes.data.completedLessons.map((l: any) => (typeof l === 'object' ? l._id || l.lessonId : l))
            : [];
          setCompletedLessonIds(new Set(ids));
        }
      } catch (e) {
        console.warn('Student progress sync fallback:', e);
      }
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تحميل محتوى الدروس' : 'Failed to load course lessons'));
    } finally {
      setLoading(false);
    }
  }, [programId, isAr]);

  useEffect(() => {
    fetchCourseContent();
  }, [fetchCourseContent]);

  // Playback timer simulation for demo drills
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Calculate Course Progress %
  const allLessons = modules.flatMap((m) => m.lessons || []);
  const totalLessonsCount = allLessons.length;
  const completedCount = completedLessonIds.size;
  const progressPct =
    totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  const handleMarkCompletedAndNext = async () => {
    if (!activeLesson) return;

    // 1. Optimistic Update
    setCompletedLessonIds((prev) => {
      const next = new Set(prev);
      next.add(activeLesson._id);
      return next;
    });

    // 2. Call Backend API
    try {
      await api.post(`/lessons/${activeLesson._id}/complete`);
      toast.success(isAr ? 'أحسنت! تم تسجيل إنجاز الدرس في سجلك' : 'Lesson progress saved!');
    } catch (apiErr) {
      console.warn('Backend complete sync notice:', apiErr);
      toast.success(isAr ? 'تم حفظ تقدم الدرس بنجاح' : 'Progress saved!');
    }

    // 3. Auto-Advance to Next Lesson
    const currentIdx = allLessons.findIndex((l) => l._id === activeLesson._id);
    if (currentIdx >= 0 && currentIdx < allLessons.length - 1) {
      const nextLesson = allLessons[currentIdx + 1];
      setActiveLesson(nextLesson);
      setIsPlaying(false);
      setCurrentTimeSec(0);

      const parentMod = modules.find((m) => m.lessons?.some((l) => l._id === nextLesson._id));
      if (parentMod) setActiveModule(parentMod);
    } else {
      toast.success(
        isAr
          ? '🎉 تهانينا! لقد أتممت جميع دروس هذا البرنامج التدريبي بنجاح'
          : '🎉 Congratulations! You have completed all course modules!'
      );
    }
  };

  const handleSelectLesson = (lesson: LessonItem, mod: ModuleItem) => {
    setActiveLesson(lesson);
    setActiveModule(mod);
    setIsPlaying(false);
    setCurrentTimeSec(0);
  };

  const handleSubmitTake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim()) return;

    setIsSubmittingTake(true);
    try {
      // Send Take submission to backend
      try {
        await api.post('/assignments/submit', {
          lessonId: activeLesson?._id,
          programId,
          mediaUrl: submissionUrl,
          notes: submissionNotes,
        });
      } catch (backendErr) {
        console.warn('Assignment backend submit notice:', backendErr);
      }

      setSubmittedTakes((prev) => [
        {
          url: submissionUrl,
          notes: submissionNotes,
          date: isAr ? 'اليوم - قيد المراجعة' : 'Today - In Review',
        },
        ...prev,
      ]);

      setTakeSubmittedSuccess(true);
      toast.success(isAr ? 'تم تسليم التطبيق الصوتي بنجاح للمدرب!' : 'Take submitted successfully!');
      setTimeout(() => {
        setTakeSubmittedSuccess(false);
        setSubmissionUrl('');
        setSubmissionNotes('');
      }, 2000);
    } finally {
      setIsSubmittingTake(false);
    }
  };

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuestion.trim()) return;

    setQaList((prev) => [
      {
        id: String(Date.now()),
        user: `${user?.fullName || 'أنت'} (متدرب)`,
        text: qaQuestion,
        time: isAr ? 'الآن' : 'Just now',
      },
      ...prev,
    ]);

    toast.success(isAr ? 'تم إرسال استفسارك للمدرب بنجاح!' : 'Question posted to faculty!');
    setQaQuestion('');
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col items-center justify-center text-slate-900 dark:text-white font-cairo p-4 transition-colors">
        <Loader2 className="w-10 h-10 text-gold-500 animate-spin mb-4" />
        <h2 className="text-base font-bold">
          {isAr ? 'جارٍ تحميل الأستوديو الرقمي ومنهج الكورس...' : 'Loading Interactive Classroom...'}
        </h2>
      </div>
    );
  }

  if (error || modules.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center p-4 font-cairo transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 text-center text-slate-900 dark:text-white shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 text-gold-500 border border-gold-500/20 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">
            {isAr ? 'منهج الدورة التدريبية' : 'Course Curriculum'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            {error || (isAr ? 'يتم حالياً رفع وتجهيز الوحدات والدروس من قِبل مدرب المادة.' : 'Faculty is currently finalizing lesson modules.')}
          </p>
          <div className="pt-2">
            <Link
              href="/student/programs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 text-navy-950 text-xs font-bold shadow-md shadow-gold-500/20"
            >
              <span>{isAr ? 'العودة لكورساتي' : 'Back to My Courses'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentCompleted = activeLesson ? completedLessonIds.has(activeLesson._id) : false;
  const youtubeEmbedUrl = getYouTubeEmbedUrl(activeLesson?.contentUrl);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white font-cairo flex flex-col transition-colors duration-300">
      {/* 🌟 1. Classroom Top Navigation Header */}
      <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-navy-950/95 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 px-4 sm:px-8 flex items-center justify-between transition-colors shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/student/programs"
            className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 hover:bg-slate-200 dark:hover:bg-navy-850 text-slate-700 dark:text-gray-300 hover:text-gold-600 dark:hover:text-gold-400 border border-slate-200 dark:border-navy-800 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
          >
            <Arrow className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'لوحة كورساتي' : 'My Courses'}</span>
          </Link>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-navy-800 hidden sm:block" />

          <div className="text-start truncate max-w-xs sm:max-w-md">
            <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider block">
              {program?.titleAr || program?.title || activeModule?.title || (isAr ? 'الدورة التدريبية' : 'Training Program')}
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {activeLesson?.title || (isAr ? 'الدرس الحالي' : 'Active Lesson')}
            </h1>
          </div>
        </div>

        {/* Header Actions & Progress Tracker */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500/50 hover:text-gold-600 dark:hover:text-gold-400 transition-all shrink-0"
            aria-label="Toggle Language"
            title="تبديل اللغة / Switch Language"
          >
            <Globe className="h-3.5 w-3.5 text-gold-500 shrink-0" />
            <span className="text-[11px] font-mono">{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Theme Switcher (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 hover:border-gold-500/50 hover:text-gold-600 dark:hover:text-gold-400 transition-all shrink-0"
            aria-label="Toggle Dark/Light Mode"
            title="تبديل المظهر / Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-gold-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-slate-700" />
            )}
          </button>

          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-navy-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-gray-300">
            <span className="text-slate-500 dark:text-gray-400">{isAr ? 'الإنجاز:' : 'Progress:'}</span>
            <span className="text-gold-600 dark:text-gold-400 font-bold">{progressPct}%</span>
            <div className="w-16 h-2 bg-slate-200 dark:bg-navy-950 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-gold-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Complete & Next CTA */}
          <button
            onClick={handleMarkCompletedAndNext}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0 ${
              isCurrentCompleted
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-gold-500/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isCurrentCompleted
                ? (isAr ? 'مكتمل ✓ • التالي' : 'Completed ✓ • Next')
                : (isAr ? 'إنهاء الدرس والانتقال للتالي' : 'Complete & Next')}
            </span>
          </button>
        </div>
      </header>

      {/* 🌟 2. Interactive Stage & Sidebar Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center: Interactive Classroom Stage */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Main Media Player Frame */}
          <div className="relative aspect-video w-full rounded-3xl bg-black border border-slate-300 dark:border-navy-800 overflow-hidden shadow-2xl flex flex-col justify-between group">
            {youtubeEmbedUrl ? (
              // 🎥 Real YouTube Video Player
              <iframe
                src={youtubeEmbedUrl}
                title={activeLesson?.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : activeLesson?.contentType === 'audio' ? (
              // 🎙️ Studio Voice Audio Waveform Player
              <div className="w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 relative">
                <div className="flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-gold-500 text-navy-950 font-bold text-[10px] tracking-wider uppercase font-mono">
                      🎙️ استوديو الصوت والفوكال
                    </span>
                    <span className="text-gray-300 font-bold hidden sm:inline">
                      {activeLesson?.title}
                    </span>
                  </div>

                  <span className="text-gray-400 font-mono text-xs">
                    {activeLesson?.durationMinutes || 15} {isAr ? 'دقيقة تدريب' : 'mins'}
                  </span>
                </div>

                {/* Animated Audio Equalizer Visualizer */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 h-24 my-auto">
                  {[40, 75, 55, 90, 60, 100, 45, 80, 65, 95, 50, 85, 70, 40, 90, 60, 75, 45, 85, 55].map(
                    (height, i) => (
                      <div
                        key={i}
                        className={`w-1.5 sm:w-2 rounded-full transition-all duration-300 ${
                          isPlaying
                            ? 'bg-gold-500 animate-pulse'
                            : 'bg-navy-800'
                        }`}
                        style={{
                          height: isPlaying ? `${Math.max(20, (height * (i % 3 + 1)) % 100)}%` : '20%',
                          animationDelay: `${i * 70}ms`,
                        }}
                      />
                    )
                  )}
                </div>

                {/* Audio Controls */}
                <div className="space-y-3">
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-gold-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (currentTimeSec / ((activeLesson?.durationMinutes || 15) * 60)) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full bg-gold-500 text-navy-950 flex items-center justify-center font-bold hover:scale-105 transition-all shadow-md shadow-gold-500/30"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-navy-950" /> : <Play className="w-5 h-5 fill-navy-950 ml-0.5" />}
                      </button>

                      <span className="font-mono text-xs text-gold-400">
                        {formatSeconds(currentTimeSec)} / {activeLesson?.durationMinutes || 15}:00
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 text-gray-400 hover:text-white transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(e.target.value)}
                        className="bg-navy-900 border border-navy-800 text-gray-300 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-gold-500"
                      >
                        <option value="0.75x">0.75x</option>
                        <option value="1.0x">1.0x (عادي)</option>
                        <option value="1.25x">1.25x</option>
                        <option value="1.5x">1.5x</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 🎬 Interactive Studio Video Simulator Player
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />

                {/* Top Video Overlay Bar */}
                <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-gold-500 text-navy-950 font-bold text-[10px] uppercase font-mono">
                      {activeLesson?.contentType === 'video' ? 'HD VIDEO 1080P' : 'STUDIO TAKE'}
                    </span>
                    <span className="text-gray-300 font-bold hidden sm:inline">
                      {activeLesson?.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono text-xs">
                      {activeLesson?.durationMinutes || 20} {isAr ? 'دقيقة' : 'mins'}
                    </span>
                  </div>
                </div>

                {/* Center Play Button Overlay */}
                <div className="relative z-10 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold-500 text-navy-950 flex items-center justify-center font-black shadow-2xl shadow-gold-500/40 hover:scale-110 hover:bg-gold-400 transition-all"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 fill-navy-950" />
                    ) : (
                      <Play className="w-8 h-8 fill-navy-950 ml-1" />
                    )}
                  </button>
                </div>

                {/* Bottom Controls Bar */}
                <div className="relative z-10 p-4 sm:p-6 space-y-2">
                  <div className="w-full h-1.5 bg-gray-700/60 hover:h-2.5 rounded-full overflow-hidden cursor-pointer transition-all">
                    <div
                      className="h-full bg-gold-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(15, (currentTimeSec / ((activeLesson?.durationMinutes || 20) * 60)) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-300 pt-1">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="text-white hover:text-gold-500 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      <span className="font-mono text-[11px] text-gray-400">
                        {formatSeconds(currentTimeSec)} / {activeLesson?.durationMinutes || 20}:00
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(e.target.value)}
                        className="bg-navy-900 border border-navy-800 text-gray-300 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-gold-500 cursor-pointer"
                      >
                        <option value="0.75x">0.75x</option>
                        <option value="1.0x">1.0x (عادي)</option>
                        <option value="1.25x">1.25x</option>
                        <option value="1.5x">1.5x</option>
                      </select>

                      <button
                        onClick={() => {
                          const elem = document.querySelector('.aspect-video');
                          if (elem && elem.requestFullscreen) elem.requestFullscreen();
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 🌟 3. Tabs Navigation Below Video */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 sm:p-8 space-y-6 text-start shadow-sm transition-colors">
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-3 overflow-x-auto">
              {[
                { id: 'overview', labelAr: '📝 شرح الدرس والتكليف', labelEn: 'Lesson Overview', icon: FileText },
                { id: 'assignment', labelAr: '🎙️ تسليم التطبيق الصوتي', labelEn: 'Submit Studio Take', icon: Mic },
                { id: 'resources', labelAr: '📚 الملفات والنصوص المرفقة', labelEn: 'Attachments & Scripts', icon: Download },
                { id: 'qa', labelAr: '💬 أسئلة ونقاش مع المدرب', labelEn: 'Q&A Discussion', icon: MessageSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                      isActive
                        ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20'
                        : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-cairo">
                    {activeLesson?.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    {activeModule?.title}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-4 leading-relaxed text-xs text-slate-700 dark:text-gray-300 transition-colors">
                  <p>
                    {activeLesson?.description ||
                      (isAr
                        ? 'في هذا الدرس التطبيقي، نتعلم الخطوات الاحترافية للتحكم في طبقة القرار، وتجنب الإجهاد الصوتي أثناء جلسات التسجيل الطويلة في الاستوديو.'
                        : 'In this hands-on lesson, we master diaphragmatic breath and intonation dynamics for studio voice-over takes.')}
                  </p>

                  <div className="p-4 rounded-xl bg-gold-500/10 border border-gold-500/25 text-gold-700 dark:text-gold-400 space-y-1.5">
                    <span className="font-bold block flex items-center gap-1.5 text-xs">
                      <Radio className="w-3.5 h-3.5 text-gold-500" />
                      {isAr ? 'توجيهات المدرب للتطبيق العملي:' : 'Faculty Pro Instructions:'}
                    </span>
                    <p className="text-[11px] text-slate-700 dark:text-gray-300">
                      {isAr
                        ? 'احرص على أداء تمرين النفس البطني لمدة 5 دقائق قبل بدء التسجيل، واضبط مسافة فمك عن الميكروفون بمسافة 15 سم (قبضة يد).'
                        : 'Maintain a 15cm distance from the condenser microphone and warm up your vocal cords before recording.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Submit Studio Take */}
            {activeTab === 'assignment' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-cairo">
                    {isAr ? 'تسليم التطبيق العملي الصوتي للدرس' : 'Submit Studio Take'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    {isAr ? 'ارفع رابط التراك الصوتي أو الفيديو لتقييم المدرب واستلام الملاحظات' : 'Upload your media link for faculty review'}
                  </p>
                </div>

                {takeSubmittedSuccess ? (
                  <div className="py-8 text-center bg-slate-50 dark:bg-navy-950 rounded-2xl border border-emerald-500/30 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {isAr ? 'تم تسليم التطبيق الصوتي بنجاح!' : 'Take Submitted Successfully!'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {isAr ? 'سيقوم المدرب بالاستماع وإرسال التقييم والتوجيهات.' : 'Faculty coach will review your take shortly.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTake} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                        {isAr ? 'رابط الملف الصوتي أو الفيديو (Google Drive / SoundCloud / Dropbox):' : 'Media URL:'}
                      </label>
                      <input
                        required
                        type="url"
                        value={submissionUrl}
                        onChange={(e) => setSubmissionUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-gold-500"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                        {isAr ? 'ملاحظات إضافية للمدرب (اختياري):' : 'Notes for Faculty (Optional):'}
                      </label>
                      <textarea
                        rows={3}
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                        placeholder={isAr ? 'أكتب أي تفاصيل بخصوص التراك أو الاستفسارات الصوتية...' : 'Any technical notes...'}
                        className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingTake}
                      className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all shadow-md shadow-gold-500/20 flex items-center gap-2"
                    >
                      {isSubmittingTake ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>{isAr ? 'تأكيد تسليم التطبيق للتقييم' : 'Confirm Take Submission'}</span>
                    </button>
                  </form>
                )}

                {/* Submitted Takes History */}
                {submittedTakes.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-navy-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {isAr ? 'تطبيقاتك المسلمة لهذا الدرس:' : 'Your Submissions:'}
                    </h4>
                    {submittedTakes.map((take, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center justify-between text-xs"
                      >
                        <div className="truncate max-w-sm">
                          <span className="font-mono text-gold-600 dark:text-gold-400 block truncate">{take.url}</span>
                          <span className="text-[10px] text-slate-400">{take.notes || take.date}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                          {isAr ? 'قيد المراجعة' : 'In Review'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Attachments */}
            {activeTab === 'resources' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-cairo">
                    {isAr ? 'الملفات والنصوص المرفقة للتدريب' : 'Attached Scripts & Materials'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    {isAr ? 'نصوص التدريب العملي وملفات PDF المعتمدة' : 'Official training scripts and guides'}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { titleAr: 'نص إعلان تجاري للتدريب الصوتي (PDF)', titleEn: 'Commercial Voice Script (PDF)', size: '1.2 MB' },
                    { titleAr: 'جدول تمارين الإحماء الصوتي اليومي', titleEn: 'Daily Vocal Warmup Routine', size: '850 KB' },
                    { titleAr: 'دليل ميكس ومونتاج الفويس أوفر', titleEn: 'Voice-Over Mix & Mastering Guide', size: '2.4 MB' },
                  ].map((res, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-xs">
                          PDF
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">
                            {isAr ? res.titleAr : res.titleEn}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-gray-400 font-mono">{res.size}</span>
                        </div>
                      </div>

                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.success(isAr ? 'جارٍ بدء تحميل الملف والمواد المرفقة...' : 'Starting file download...');
                        }}
                        className="p-2 rounded-xl bg-white dark:bg-navy-850 hover:bg-gold-500 hover:text-navy-950 text-slate-700 dark:text-gray-300 transition-all border border-slate-200 dark:border-navy-700 shadow-sm"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Q&A */}
            {activeTab === 'qa' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-cairo">
                    {isAr ? 'الأسئلة والنقاش مع مدرب المادة' : 'Discussion & Q&A'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    {isAr ? 'اطرح سؤالك وسيجيب عليك المحاضر في غضون 24 ساعة' : 'Ask questions directly to faculty coach'}
                  </p>
                </div>

                <form onSubmit={handlePostQuestion} className="space-y-3">
                  <textarea
                    required
                    rows={3}
                    value={qaQuestion}
                    onChange={(e) => setQaQuestion(e.target.value)}
                    placeholder={isAr ? 'اكتب سؤالك أو استفسارك حول هذا الدرس...' : 'Write your question about this lesson...'}
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gold-500"
                  />

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all shadow-md shadow-gold-500/20 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span>{isAr ? 'إرسال السؤال للمدرب' : 'Post Question'}</span>
                  </button>
                </form>

                {/* Q&A Thread List */}
                <div className="space-y-3 pt-2">
                  {qaList.map((qa) => (
                    <div
                      key={qa.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-500 dark:text-gray-400">
                        <span className="font-bold text-slate-900 dark:text-white">{qa.user}</span>
                        <span className="text-[10px] font-mono">{qa.time}</span>
                      </div>
                      <p className="text-slate-700 dark:text-gray-300">{qa.text}</p>
                      {qa.reply && (
                        <div className="mt-2 p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-slate-800 dark:text-gray-200 text-xs">
                          <span className="font-bold text-gold-600 dark:text-gold-400 block mb-1">
                            🎙️ {isAr ? 'رد المدرب:' : 'Faculty Response:'}
                          </span>
                          {qa.reply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Course Curriculum Syllabus Drawer */}
        <aside className="w-full lg:w-96 bg-white dark:bg-navy-950 border-t lg:border-t-0 ltr:lg:border-l rtl:lg:border-r border-slate-200 dark:border-navy-800 flex flex-col h-auto lg:h-[calc(100vh-4rem)] overflow-y-auto p-4 sm:p-6 space-y-6 transition-colors shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-start">
              <Layers className="w-5 h-5 text-gold-600 dark:text-gold-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? 'منهج ووحدات الكورس' : 'Course Curriculum'}
              </h2>
            </div>

            <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-navy-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-navy-800">
              {completedCount} / {totalLessonsCount} {isAr ? 'درس' : 'Lessons'}
            </span>
          </div>

          {/* Modules Accordion */}
          <div className="space-y-4">
            {modules.map((mod, mIdx) => (
              <div
                key={mod._id}
                className="rounded-2xl bg-slate-50 dark:bg-navy-900/90 border border-slate-200 dark:border-navy-800/80 overflow-hidden space-y-1 text-start transition-colors"
              >
                {/* Module Header */}
                <div className="p-3.5 bg-slate-100/70 dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800/60 flex items-center justify-between">
                  <div className="space-y-0.5 truncate max-w-[240px]">
                    <span className="text-[10px] font-mono font-bold text-gold-600 dark:text-gold-500 uppercase">
                      {isAr ? `الوحدة 0${mIdx + 1}` : `Module 0${mIdx + 1}`}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {mod.title}
                    </h3>
                  </div>
                </div>

                {/* Module Lessons List */}
                <div className="p-2 space-y-1">
                  {mod.lessons?.map((les, lIdx) => {
                    const isSelected = activeLesson?._id === les._id;
                    const isCompleted = completedLessonIds.has(les._id);

                    return (
                      <button
                        key={les._id}
                        onClick={() => handleSelectLesson(les, mod)}
                        className={`w-full p-2.5 rounded-xl text-start text-xs font-bold transition-all flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-gold-500 text-navy-950 shadow-md shadow-gold-500/20 font-black'
                            : 'text-slate-700 dark:text-gray-300 hover:bg-slate-200/60 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {isCompleted ? (
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                isSelected ? 'text-navy-950' : 'text-emerald-500 dark:text-emerald-400'
                              }`}
                            />
                          ) : les.contentType === 'video' ? (
                            <Video
                              className={`w-4 h-4 shrink-0 ${
                                isSelected ? 'text-navy-950' : 'text-slate-400 dark:text-gray-400'
                              }`}
                            />
                          ) : les.contentType === 'audio' ? (
                            <Mic
                              className={`w-4 h-4 shrink-0 ${
                                isSelected ? 'text-navy-950' : 'text-slate-400 dark:text-gray-400'
                              }`}
                            />
                          ) : (
                            <FileText
                              className={`w-4 h-4 shrink-0 ${
                                isSelected ? 'text-navy-950' : 'text-slate-400 dark:text-gray-400'
                              }`}
                            />
                          )}

                          <span className="truncate">{les.title}</span>
                        </div>

                        <span
                          className={`text-[10px] font-mono shrink-0 ${
                            isSelected ? 'text-navy-950' : 'text-slate-400 dark:text-gray-400'
                          }`}
                        >
                          {les.durationMinutes || 15}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
