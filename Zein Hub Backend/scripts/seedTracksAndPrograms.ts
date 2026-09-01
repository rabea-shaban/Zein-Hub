import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { Track } from '../src/models/track.model.js';
import { Program } from '../src/models/program.model.js';
import { ProgramStatus } from '../src/constants/programStatus.enum.js';

interface ITrackSeedData {
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr: string;
  descriptionEn: string;
  iconUrl?: string;
  order: number;
}

interface IProgramSeedData {
  titleAr: string;
  titleEn: string;
  slug: string;
  trackSlug: string;
  descriptionAr: string;
  descriptionEn: string;
  objectives: string[];
  targetAudience: string[];
  status: ProgramStatus;
  isFeatured: boolean;
  durationWeeks: number;
  totalHours: number;
  price: number;
  order: number;
}

const tracksData: ITrackSeedData[] = [
  {
    nameAr: 'الصوت والإعلام',
    nameEn: 'Audio & Media',
    slug: 'audio-media',
    descriptionAr: 'برامج متخصصة في هندسة الصوت، التعليق الصوتي، الأداء الإخباري، وصناعة البودكاست الإعلامي الاحترافي.',
    descriptionEn: 'Specialized programs in audio engineering, voice-over, news presentation, and professional media podcasting.',
    order: 1,
  },
  {
    nameAr: 'التكنولوجيا والذكاء الاصطناعي',
    nameEn: 'Tech & AI Solutions',
    slug: 'tech-ai-solutions',
    descriptionAr: 'حلول وتطبيقات الذكاء الاصطناعي التوليدي، الواقع الافتراضي، وكشف التزييف العميق للإعلاميين وصناع المحتوى.',
    descriptionEn: 'Generative AI applications, VR in media, and deepfake verification for journalists and content creators.',
    order: 2,
  },
  {
    nameAr: 'النمو الاستراتيجي والعلاقات العامة',
    nameEn: 'Strategic Growth & PR',
    slug: 'strategic-growth-pr',
    descriptionAr: 'استراتيجيات التسويق الرقمي المؤتمت، العلاقات العامة الرقمية، وإدارة السمعة والهوية الإعلامية.',
    descriptionEn: 'Automated digital marketing strategies, digital public relations, and media reputation management.',
    order: 3,
  },
];

const programsData: IProgramSeedData[] = [
  // Track 1: Audio & Media
  {
    titleAr: 'التعليق الصوتي والفوكاليز الرقمي',
    titleEn: 'Voice-Over & Digital Vocalise',
    slug: 'voice-over-digital-vocalise',
    trackSlug: 'audio-media',
    descriptionAr: 'البرنامج الرائد في تدريب المعلقين الصوتيين على تقنيات الفوكاليز، مخارج الحروف، التلوين الصوتي، وهندسة التسجيل الرقمي.',
    descriptionEn: 'The flagship voice-over training program covering vocalise techniques, pronunciation, tone modulation, and digital studio recording.',
    objectives: [
      'إتقان التحكم في التنفس ودعم الصوت',
      'تطبيق قواعد التلوين الصوتي للإعلانات والوثائقيات',
      'إعداد استوديو منزلي احترافي وهندسة الصوت الرقمي',
    ],
    targetAudience: ['المعلقون الصوتيون المبتدئون والمحترفون', 'صناع المحتوى', 'الإعلاميون'],
    status: ProgramStatus.OPEN, // The only open program initially
    isFeatured: true,
    durationWeeks: 6,
    totalHours: 36,
    price: 3500,
    order: 1,
  },
  {
    titleAr: 'التقديم والإلقاء الإخباري',
    titleEn: 'News Anchoring & Media Presentation',
    slug: 'news-anchoring-media-presentation',
    trackSlug: 'audio-media',
    descriptionAr: 'مهارات المذيع التلفزيوني والإذاعي، قراءة النشرات الإخبارية، والتعامل مع الكاميرا والأوتوكيو.',
    descriptionEn: 'Television and radio broadcasting skills, news bulletin reading, on-camera presence, and autocue handling.',
    objectives: ['مهارات الإلقاء الإخباري الرصين', 'لغة الجسد والحضور الإعلامي أمام الكاميرا'],
    targetAudience: ['المذيعون الطامحون', 'طلاب كليات الإعلام'],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 6,
    totalHours: 30,
    price: 3200,
    order: 2,
  },
  {
    titleAr: 'السلامة اللغوية للإعلاميين',
    titleEn: 'Media Grammar & Language Precision',
    slug: 'media-grammar-language-precision',
    trackSlug: 'audio-media',
    descriptionAr: 'قواعد النحو والصرف وضبط الحركات ومخارج الحروف لتجنب الأخطاء اللغوية الشائعة في البث المباشر.',
    descriptionEn: 'Arabic grammar precision and vocal pronunciation to prevent common linguistic errors on live broadcast.',
    objectives: ['الضبط النحوي التلقائي أثناء القراءة', 'معالجة الأخطاء الشائعة في الخطاب الإعلامي'],
    targetAudience: ['الصحفيون', 'محررو الأخبار', 'المذيعون'],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 4,
    totalHours: 20,
    price: 2200,
    order: 3,
  },
  {
    titleAr: 'صناعة البودكاست الذكي',
    titleEn: 'Smart Podcasting & Audio Production',
    slug: 'smart-podcasting-audio-production',
    trackSlug: 'audio-media',
    descriptionAr: 'إعداد وإنتاج وتوزيع برامج البودكاست الصوتية والمرئية باستخدام الذكاء الاصطناعي وتقنيات التوزيع الحديثة.',
    descriptionEn: 'End-to-end production and distribution of audio/video podcasts using AI tools and modern streaming platforms.',
    objectives: ['كتابة اسكربت البودكاست الجذاب', 'تسجيل ومونتاج الحلقات ونشرها عبر المنصات العالمية'],
    targetAudience: ['صناع البودكاست', 'الصحفيون المستقلون'],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 5,
    totalHours: 25,
    price: 2800,
    order: 4,
  },

  // Track 2: Tech & AI Solutions
  {
    titleAr: 'تطبيقات الواقع الافتراضي في الإعلام',
    titleEn: 'VR Applications in Media',
    slug: 'vr-applications-media',
    trackSlug: 'tech-ai-solutions',
    descriptionAr: 'توظيف تقنيات الـ Virtual Reality والتصوير بزاوية 360 درجة في التغطيات الصحفية والإنتاج الوثائقي التفاعلي.',
    descriptionEn: 'Employing VR and 360-degree filming in interactive journalistic coverage and immersive documentaries.',
    objectives: ['إنتاج قصص صحفية بتقنية 360 درجة', 'تصميم بيئات إعلامية تفاعلية'],
    targetAudience: ['مصممو الوسائط المتعددة', 'المصورون والمخرجون'],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 6,
    totalHours: 30,
    price: 4000,
    order: 5,
  },
  {
    titleAr: 'كشف التزييف العميق والتحقق من المحتوى',
    titleEn: 'Deepfake Verification & Fact-Checking',
    slug: 'deepfake-verification-fact-checking',
    trackSlug: 'tech-ai-solutions',
    descriptionAr: 'أدوات وتقنيات كشف الفيديوهات والصور والأصوات المزيفة بالذكاء الاصطناعي وحماية المصداقية الصحفية.',
    descriptionEn: 'Tools and methodologies for detecting AI deepfakes, manipulated media, and rigorous fact-checking.',
    objectives: ['فحص وتدقيق الوسائط الرقمية المشبوهة', 'استخدام خوارزميات كشف التزييف الصوتي والمرئي'],
    targetAudience: ['مدققو الحقائق', 'المحققون الصحفيون', 'مسؤولو منصات الأخبار'],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 4,
    totalHours: 24,
    price: 3000,
    order: 6,
  },
  {
    titleAr: 'هندسة الأوامر لصناع المحتوى',
    titleEn: 'Prompt Engineering for Content Creators',
    slug: 'prompt-engineering-content-creators',
    trackSlug: 'tech-ai-solutions',
    descriptionAr: 'كتابة برومبتات احترافية لنماذج الذكاء الاصطناعي لتوليد المقالات، السيناريوهات، الأفكار الإبداعية، والصور.',
    descriptionEn: 'Advanced prompt crafting for LLMs to generate high-value media scripts, articles, ideas, and imagery.',
    objectives: ['بناء Prompt Pipelines لإنتاج المحتوى الإعلامي', 'أتمتة كتابة السيناريوهات والتقارير الصحفية'],
    targetAudience: ['كتاب المحتوى', 'مديرو السوشيال ميديا', 'صناع المحتوى المستقلون'],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 4,
    totalHours: 20,
    price: 2500,
    order: 7,
  },
  {
    titleAr: 'المونتاج وتحرير الفيديو الآلي',
    titleEn: 'Automated Video Editing & Post-Production',
    slug: 'automated-video-editing-post-production',
    trackSlug: 'tech-ai-solutions',
    descriptionAr: 'تسريع دورة المونتاج وإنتاج الريلز والفيديوهات القصيرة باستخدام أدوات التحرير التلقائي بالذكاء الاصطناعي.',
    descriptionEn: 'Accelerating post-production and short-form video generation using automated AI editing tools.',
    objectives: ['أتمتة قص الفيديو واستخراج المقاطع الأبرز', 'توليد الترجمة التلقائية والمؤثرات الذكية'],
    targetAudience: ['محررو الفيديو', 'صناع محتوى تيك توك وإنستجرام'],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 4,
    totalHours: 24,
    price: 2800,
    order: 8,
  },

  // Track 3: Strategic Growth & PR
  {
    titleAr: 'أتمتة التسويق الرقمي',
    titleEn: 'Marketing Automation',
    slug: 'marketing-automation',
    trackSlug: 'strategic-growth-pr',
    descriptionAr: 'بناء Funnels وأتمتة حملات البريد الإلكتروني والرسائل التسويقية لزيادة الوصول والمبيعات للمؤسسات الإعلامية.',
    descriptionEn: 'Building conversion funnels, email automation, and automated marketing flows for media agencies.',
    objectives: ['تصميم رحلة العميل المؤتمتة', 'ربط منصات الـ CRM بالرسائل البريدية الذكية'],
    targetAudience: ['مديرو التسويق', 'رواد الأعمال', 'أصحاب الوكالات الرقمية'],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 5,
    totalHours: 25,
    price: 3200,
    order: 9,
  },
  {
    titleAr: 'العلاقات العامة الرقمية',
    titleEn: 'Digital Public Relations',
    slug: 'digital-public-relations',
    trackSlug: 'strategic-growth-pr',
    descriptionAr: 'استراتيجيات بناء الصورة الذهنية، التواصل مع الصحفيين، وكتابة البيانات الصحفية المؤثرة في العصر الرقمي.',
    descriptionEn: 'Digital corporate branding, journalist outreach, and impactful digital press release creation.',
    objectives: ['صياغة البيانات الصحفية الحديثة', 'بناء شبكة علاقات مع وسائل الإعلام الرقمية'],
    targetAudience: ['مسؤولو العلاقات العامة', 'مديرو الاتصال المؤسسي'],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 4,
    totalHours: 20,
    price: 2600,
    order: 10,
  },
  {
    titleAr: 'إدارة السمعة والأنشطة الرقمية',
    titleEn: 'Reputation Management & Brand Protection',
    slug: 'reputation-management-brand-protection',
    trackSlug: 'strategic-growth-pr',
    descriptionAr: 'مراقبة المحادثات الرقمية، إدارة الأزمات الإعلامية على وسائل التواصل الاجتماعي، وحماية العلامة التجارية.',
    descriptionEn: 'Digital conversation monitoring, social media crisis management, and brand protection strategies.',
    objectives: ['إدارة الأزمات الرقمية باحترافية وسرعة', 'استخدام أدوات Social Listening لرصد السمعة'],
    targetAudience: ['مديرو الأزمات', 'أصحاب العلامات التجارية', 'مسؤولو العلاقات العامة'],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 4,
    totalHours: 20,
    price: 3000,
    order: 11,
  },
  {
    titleAr: 'استخدام الهندسة الصوتية وأخلاقيات الاستنساخ الصوتي',
    titleEn: 'Ethical Voice Cloning & Audio Engineering',
    slug: 'ethical-voice-cloning-audio-engineering',
    trackSlug: 'strategic-growth-pr',
    descriptionAr: 'تقنيات استنساخ الصوت بالذكاء الاصطناعي، المعايير القانونية والأخلاقية، وحقوق الملكية الفكرية للأداء الصوتي.',
    descriptionEn: 'AI voice cloning techniques, ethical frameworks, legal standards, and intellectual property rights in audio.',
    objectives: ['استخدام أدوات الاستنساخ الصوتي باحترافية', 'تطبيق الأطر القانونية لحماية الحقوق الصوتية'],
    targetAudience: ['المعلقون الصوتيون', 'المنتجون الموسيقيون', 'المحامون والمستشارون القانونيون في الإعلام'],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 4,
    totalHours: 20,
    price: 3200,
    order: 12,
  },
];

async function seedTracksAndPrograms() {
  console.log('=========================================');
  console.log('🌱 Seeding 3 Tracks & 12 Real Programs...');
  console.log('=========================================');

  await connectDB();

  const trackMap: Record<string, mongoose.Types.ObjectId> = {};

  // 1. Seed Tracks
  for (const trackItem of tracksData) {
    let track = await Track.findOne({ slug: trackItem.slug });
    if (!track) {
      track = await Track.create(trackItem);
      console.log(`✅ Created Track: [${track.nameEn}] -> slug: ${track.slug}`);
    } else {
      track.nameAr = trackItem.nameAr;
      track.nameEn = trackItem.nameEn;
      track.descriptionAr = trackItem.descriptionAr;
      track.descriptionEn = trackItem.descriptionEn;
      track.order = trackItem.order;
      await track.save();
      console.log(`ℹ️ Updated Track: [${track.nameEn}] -> slug: ${track.slug}`);
    }
    trackMap[track.slug] = track._id as mongoose.Types.ObjectId;
  }

  // 2. Seed Programs
  for (const programItem of programsData) {
    const trackId = trackMap[programItem.trackSlug];
    if (!trackId) {
      console.error(`❌ Track not found for slug: ${programItem.trackSlug}`);
      continue;
    }

    let program = await Program.findOne({ slug: programItem.slug });
    if (!program) {
      program = await Program.create({
        titleAr: programItem.titleAr,
        titleEn: programItem.titleEn,
        slug: programItem.slug,
        trackId,
        descriptionAr: programItem.descriptionAr,
        descriptionEn: programItem.descriptionEn,
        objectives: programItem.objectives,
        targetAudience: programItem.targetAudience,
        status: programItem.status,
        isFeatured: programItem.isFeatured,
        durationWeeks: programItem.durationWeeks,
        totalHours: programItem.totalHours,
        price: programItem.price,
        currency: 'EGP',
        order: programItem.order,
        isActive: true,
      });
      console.log(`✅ Created Program: [${program.titleEn}] (Status: ${program.status})`);
    } else {
      program.titleAr = programItem.titleAr;
      program.titleEn = programItem.titleEn;
      program.trackId = trackId;
      program.descriptionAr = programItem.descriptionAr;
      program.descriptionEn = programItem.descriptionEn;
      program.objectives = programItem.objectives;
      program.targetAudience = programItem.targetAudience;
      program.status = programItem.status;
      program.isFeatured = programItem.isFeatured;
      program.durationWeeks = programItem.durationWeeks;
      program.totalHours = programItem.totalHours;
      program.price = programItem.price;
      program.order = programItem.order;
      await program.save();
      console.log(`ℹ️ Updated Program: [${program.titleEn}] (Status: ${program.status})`);
    }
  }

  console.log('\n=========================================');
  console.log('🎉 3 Tracks & 12 Programs Seeded Successfully!');
  console.log('=========================================');

  await mongoose.connection.close();
  console.log('Database connection closed.');
  process.exit(0);
}

seedTracksAndPrograms().catch((err) => {
  console.error('[Seed Error] Failed to seed tracks and programs:', err);
  process.exit(1);
});
