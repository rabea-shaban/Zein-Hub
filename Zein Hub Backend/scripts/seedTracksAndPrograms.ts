import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { Track } from '../src/models/track.model.js';
import { Program, ICurriculumWeek } from '../src/models/program.model.js';
import { ProgramStatus } from '../src/constants/programStatus.enum.js';

interface ITrackSeedData {
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr: string;
  descriptionEn: string;
  order: number;
}

interface IProgramSeedData {
  titleAr: string;
  titleEn: string;
  slug: string;
  trackSlug: string;
  taglineAr: string;
  taglineEn: string;
  descriptionAr: string;
  descriptionEn: string;
  objectives: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  curriculum: ICurriculumWeek[];
  strategicNote?: string;
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
  // ========================================================
  // المجال الأول: الصوت والإعلام (Audio & Media)
  // ========================================================
  {
    titleAr: 'التعليق الصوتي والفوكاليز الرقمي',
    titleEn: 'Voice-Over & Digital Vocalise',
    slug: 'voice-over-digital-vocalise',
    trackSlug: 'audio-media',
    taglineAr: 'من أول كلمة… صوتك يبقى علامة',
    taglineEn: 'From your first word... your voice leaves a mark',
    descriptionAr:
      'في عصر البودكاست والمحتوى الرقمي، أصبح الصوت أداة تسويقية وهوية شخصية قبل أن يكون مجرد أداء. يأخذك هذا البرنامج من نقطة الصفر وحتى إنتاج تعليق صوتي احترافي جاهز للاستخدام في الإعلانات والفويس أوفر والمحتوى الرقمي، عبر أحدث تقنيات الأداء الصوتي مدمجة مع أدوات الذكاء الاصطناعي في تحسين الصوت.',
    descriptionEn:
      'Hands-on voice-over masterclass from scratch to commercial reads, documentary narration, and AI-assisted audio enhancement.',
    objectives: [
      'التحكم في التنفس والإلقاء ونبرة الصوت',
      'تقنيات الأداء الصوتي لأنواع المحتوى المختلفة (إعلاني، وثائقي، تجاري)',
      'استخدام أدوات تحسين الصوت الرقمية الحديثة',
      'بناء بورتفوليو صوتي احترافي والتسويق الذاتي كمعلّق صوتي مستقل',
    ],
    learningOutcomes: [
      'إتقان تمارين الفوكاليز والتنفس البطني وتوسيع المدى الصوتي',
      'التلوين النغمي والأداء التعبيري لمختلف النصوص الإعلامية',
      'هندسة التسجيل الرقمي وإزالة الضوضاء بالذكاء الاصطناعي',
      'إنتاج ديمو صوتي احترافي متعدد الأنماط جاهز لسوق العمل',
    ],
    targetAudience: [
      'صناع المحتوى',
      'طلاب الإعلام',
      'أي شخص يطمح لبدء مسار مهني في التعليق الصوتي',
    ],
    curriculum: [
      {
        weekNumber: 1,
        title: 'أساسيات الصوت والإلقاء',
        titleEn: 'Voice Fundamentals & Articulation',
        description: 'التحكم في التنفس، مخارج الحروف، التلوين النغمي، والإحماء الصوتي اليومي.',
        topics: ['مخارج الحروف وصفات الأصوات', 'تمارين التنفس البطني', 'الإحماء الصوتي والفوكاليز'],
        practicalProject: 'تسجيل مقطع صوتي أولي لتقييم طبقات الصوت ومخارج الحروف.',
      },
      {
        weekNumber: 2,
        title: 'الأداء الصوتي لكل نوع محتوى',
        titleEn: 'Vocal Performance for Diverse Content',
        description: 'تقنيات الأداء الصوتي للإعلانات التجارية، الأفلام الوثائقية، والدوبلاج.',
        topics: ['الإلقاء الإعلاني والحماسي', 'السرد الوثائقي الهادئ', 'الدوبلاج والكتب الصوتية'],
        practicalProject: 'تسجيل نصين مختلفين: إعلان تجاري وسرد وثائقي.',
      },
      {
        weekNumber: 3,
        title: 'الاستوديو المنزلي والتسجيل الاحترافي',
        titleEn: 'Home Studio & Pro Recording',
        description: 'إعداد بيئة التسجيل المنزلية، اختيار الميكروفونات، وتفادي ارتداد الصوت.',
        topics: ['أنواع الميكروفونات وكروت الصوت', 'العزل الصوتي ومعالجة الغرفة', 'إعداد برامج التسجيل (DAW)'],
        practicalProject: 'جلسة تسجيل ومحاكاة بيئة الاستوديو المنزلي.',
      },
      {
        weekNumber: 4,
        title: 'تحرير الصوت بالذكاء الاصطناعي وبناء البورتفوليو',
        titleEn: 'AI Audio Editing & Portfolio Demo Reel',
        description: 'تنقية الصوت بأدوات الذكاء الاصطناعي، إنتاج الديمو ريل، والتسويق الذاتي.',
        topics: ['أدوات تنقية الصوت بالذكاء الاصطناعي', 'بناء بورتفوليو صوتي احترافي', 'التسويق الذاتي والمنصات الحرة'],
        practicalProject: 'إنتاج ديمو صوتي نهائي جاهز لتقديمه للعملاء وشركات الإنتاج.',
      },
    ],
    status: ProgramStatus.OPEN,
    isFeatured: true,
    durationWeeks: 4,
    totalHours: 24,
    price: 3500,
    order: 1,
  },
  {
    titleAr: 'التقديم والإلقاء الإخباري',
    titleEn: 'News Anchoring & Media Presentation',
    slug: 'news-anchoring-media-presentation',
    trackSlug: 'audio-media',
    taglineAr: 'قدّم النشرة… زي المحترفين',
    taglineEn: 'Deliver the news... like true professionals',
    descriptionAr:
      'برنامج متخصص لتأهيل مقدمي نشرات الأخبار والبرامج الحوارية، يغطي كل ما يلزم بدءًا من الحضور أمام الكاميرا وحتى التعامل مع المواقف الطارئة على الهواء مباشرة.',
    descriptionEn:
      'Professional broadcast program qualifying TV and digital news anchors, covering on-camera presence, teleprompter mastery, and breaking news handling.',
    objectives: [
      'تقنيات الإلقاء الإخباري المحترف',
      'لغة الجسد والحضور أمام الكاميرا',
      'التعامل الاحترافي مع البرومبتر (جهاز التلقين)',
      'إدارة الحوارات المباشرة والمقاطعات',
      'أساسيات الحياد والمهنية الإعلامية',
    ],
    learningOutcomes: [
      'إتقان نبرة القراءة الإخبارية الرصينة ومخارج الحروف السليمة',
      'ضبط لغة الجسد والاتصال البصري أمام العدسة التلفزيونية',
      'القدرة على إدارة المقابلات الصحفية المباشرة والمقاطعات الذكية',
      'تقديم نشرة إخبارية تلفزيونية كاملة بثقة واحترافية',
    ],
    targetAudience: [
      'خريجو وطلاب الإعلام',
      'المذيعون المبتدئون',
      'صناع المحتوى الإخباري على منصات التواصل',
    ],
    curriculum: [
      {
        weekNumber: 1,
        title: 'أساسيات التقديم الإخباري',
        titleEn: 'Broadcast News Fundamentals',
        description: 'مبادئ القراءة الإخبارية، الوقفات، والتنغيم الصوتي الرصين.',
        topics: ['الفرق بين الإلقاء الإخباري والإذاعي', 'التنغيم والوقفات الإخبارية', 'التحكم في سرعة الإلقاء'],
        practicalProject: 'قراءة تقرير إخباري سياسي واقتصادي مسجل.',
      },
      {
        weekNumber: 2,
        title: 'الأداء والحضور أمام الكاميرا',
        titleEn: 'On-Camera Presence & Body Language',
        description: 'لغة الجسد، الاتصال البصري، الجلوس السليم، وتعبيرات الوجه.',
        topics: ['قواعد لغة الجسد للمذيع', 'توجيه النظر نحو العدسة', 'تجاوز رهبة الظهور التلفزيوني'],
        practicalProject: 'تصوير فيديو تجريبي داخل استوديو الكاميرا وتقييم لغة الجسد.',
      },
      {
        weekNumber: 3,
        title: 'التعامل مع البرومبتر (جهاز التلقين)',
        titleEn: 'Teleprompter Mastery & Live Flow',
        description: 'سرعة القراءة المتزامنة مع التلقين والحفاظ على العفوية.',
        topics: ['تقنيات متابعة البرومبتر بسلاسة', 'التعامل مع عطل جهاز التلقين', 'القراءة التفاعلية الحية'],
        practicalProject: 'قراءة موجز أخبار عاجل باستخدام البرومبتر في الاستوديو.',
      },
      {
        weekNumber: 4,
        title: 'إدارة الحوار والمقابلات الصحفية',
        titleEn: 'Interview Moderation & Live Debates',
        description: 'طرح الأسئلة الذكية، إدارة المقاطعات، وتوجيه الضيوف بحيادية.',
        topics: ['صياغة الأسئلة المفتوحة والمحرجة', 'إدارة الوقت والمقاطعات الذكية', 'التعامل مع انفعالات الضيوف'],
        practicalProject: 'إجراء مقابلة حوارية مع ضيف داخل الاستوديو.',
      },
      {
        weekNumber: 5,
        title: 'محاكاة عملية لنشرة إخبارية كاملة',
        titleEn: 'Full Live News Bulletin Simulation',
        description: 'تنفيذ نشرة إخبارية واقعية على الهواء بكافة عناصرها ومداخلاتها.',
        topics: ['الربط بين التقارير والمراسلين', 'التعامل مع الأخبار العاجلة الطارئة', 'تقييم شامل وملاحظات الإخراج'],
        practicalProject: 'تقديم نشرة إخبارية كاملة مسجلة بجودة البث التلفزيوني.',
      },
    ],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 5,
    totalHours: 25,
    price: 3200,
    order: 2,
  },
  {
    titleAr: 'السلامة اللغوية للإعلاميين',
    titleEn: 'Media Grammar & Language Precision',
    slug: 'media-grammar-language-precision',
    trackSlug: 'audio-media',
    taglineAr: 'كلمة صح… تفرق كتير',
    taglineEn: 'The right word makes all the difference',
    descriptionAr:
      'أحد أكثر البرامج ندرةً في سوق التدريب الإعلامي المصري رغم أهميته الجوهرية. يركّز على تصحيح الأخطاء اللغوية الشائعة المتكررة في النشرات والمحتوى الإعلامي (النحوية والصرفية والنطقية)، وبناء حس لغوي سليم لدى المتدرب.',
    descriptionEn:
      'Crucial program dedicated to eliminating recurrent grammatical, morphological, and phonetic errors in media scripts and live broadcasts.',
    objectives: [
      'التعرف على أشهر الأخطاء الشائعة في اللغة الإعلامية وتصحيحها',
      'قواعد النطق السليم للأعداد والألفاظ الإعلامية',
      'أساسيات التدقيق اللغوي السريع تحت ضغط الوقت',
      'صياغة الجملة الإخبارية بشكل سليم نحويًا ودلاليًا',
    ],
    learningOutcomes: [
      'التصحيح التلقائي للنصوص الإخبارية قبل قراءتها على الهواء',
      'إتقان نطق الأرقام والتواريخ والنسب المئوية وفق قواعد العربية الفصحى',
      'تجنب الأخطاء الصرفية والدلالية المتداولة في غرف الأخبار',
      'اجتياز اختبارات السلامة اللغوية للقنوات والمؤسسات الإعلامية الكبرى',
    ],
    targetAudience: [
      'المذيعون',
      'المعِدّون',
      'كتّاب المحتوى',
      'المدققون اللغويون المبتدئون',
    ],
    curriculum: [
      {
        weekNumber: 1,
        title: 'الأخطاء الصوتية والنطقية وقواعد الأعداد',
        titleEn: 'Phonetic Accuracy & Numerical Rules',
        description: 'مخارج الحروف الملتبسة، تذكير وتأنيث الأعداد، وضبط التمييز.',
        topics: ['ضبط مخارج الحروف الشائعة الخطأ (الضاد والظاء)', 'أحكام الأعداد من 1 إلى المليون في الأخبار', 'قواعد نطق النسب المئوية والعملات'],
        practicalProject: 'قراءة نشرة أرقام وإحصائيات اقتصادية دون أي خطأ لغوي.',
      },
      {
        weekNumber: 2,
        title: 'الأخطاء النحوية والصرفية في لغة الإعلام',
        titleEn: 'Media Grammar & Syntax Essentials',
        description: 'تصحيح التراكيب الشائعة، التعدية واللزوم، وحروف الجر المستخدمة خطأ.',
        topics: ['أشهر 50 خطأ لغوي شائع في الإعلام المصري والعربي', 'بناء الفعل للمجهول والنائب عن الفاعل', 'صياغة العناوين والجمل الإخبارية الرشيقة'],
        practicalProject: 'إعادة صياغة وتصحيح 10 نصوص إخبارية تتضمن أخطاء شائعة.',
      },
      {
        weekNumber: 3,
        title: 'ورشة تدقيق لغوي وتطبيق حي',
        titleEn: 'Speed Editing & Individual Assessment',
        description: 'التدقيق السريع تحت ضغط غرف الأخبار، واختبار ختامي فردي.',
        topics: ['التدقيق اللغوي اللحظي للنصوص العاجلة', 'استخدام المعاجم الرقمية الموثوقة', 'تقييم فردي وخطة تطوير شخصية'],
        practicalProject: 'اختبار تدقيق عملي زمني لنص إخباري مباشر وتقييم لغوي معتمد.',
      },
    ],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 3,
    totalHours: 18,
    price: 2200,
    order: 3,
  },
  {
    titleAr: 'صناعة البودكاست الذكي',
    titleEn: 'Smart Podcasting & Audio Production',
    slug: 'smart-podcasting-audio-production',
    trackSlug: 'audio-media',
    taglineAr: 'من الفكرة… لحد أول مستمع',
    taglineEn: 'From initial concept... to your very first listener',
    descriptionAr:
      'أقوى قطاعات النمو في صناعة المحتوى الصوتي بالمنطقة حاليًا. يأخذك البرنامج خطوة بخطوة من تصميم فكرة البودكاست وحتى النشر والتسويق، مع دمج أدوات الذكاء الاصطناعي في التحرير والإنتاج لتوفير الوقت والجهد.',
    descriptionEn:
      'Comprehensive podcast production roadmap: from concept development, audio recording, AI-assisted post-production, to multi-platform distribution and monetization.',
    objectives: [
      'تصميم فكرة ومحتوى بودكاست قابل للنجاح',
      'التسجيل والتحرير الصوتي الاحترافي',
      'استخدام أدوات الذكاء الاصطناعي في تنظيف الصوت وتوليد النصوص',
      'استراتيجيات النشر والنمو وجذب الرعاة والتربّح',
    ],
    learningOutcomes: [
      'تحديد النيتش (Niche) والجمهور المستهدف وهوية البودكاست الصوتية',
      'إتقان هندسة الصوت وإزالة التشويش بمساعدة الذكاء الاصطناعي',
      'توزيع الحلقات على منصات Apple Podcasts و Spotify و YouTube',
      'إطلاق حلقة بودكاست تجريبية كاملة جاهزة للمنافسة في السوق',
    ],
    targetAudience: [
      'كل من يرغب في إطلاق بودكاست خاص',
      'صناع المحتوى',
      'المؤسسات الراغبة في بودكاست مؤسسي',
    ],
    curriculum: [
      {
        weekNumber: 1,
        title: 'بناء الفكرة والهوية الصوتية',
        titleEn: 'Show Ideation & Audio Branding',
        description: 'اختيار فكرة البودكاست، دراسة المنافسين، وتصميم الهوية والنبرة.',
        topics: ['تحديد الشريحة المستهدفة والنيتش', 'اختيار نمط البودكاست (فردي، حواري، سردي)', 'تصميم الشعار الصوتي والمقدمة الموسيقية'],
        practicalProject: 'إعداد وثيقة تصور البودكاست (Show Bible) وتصميم الحلقة الصفرية.',
      },
      {
        weekNumber: 2,
        title: 'كتابة السكريبت وإدارة المقابلات',
        titleEn: 'Scriptwriting & Guest Moderation',
        description: 'هندسة سكريبت الحلقات وطرح الأسئلة الحوارية الجذابة.',
        topics: ['هيكلة الحلقة السردية والتشويق', 'إعداد أسئلة المقابلات العميقة', 'توجيه الضيف والحفاظ على إيقاع الحديث'],
        practicalProject: 'كتابة سكريبت كامل للحلقة الأولى وتجهيز خطة مقابلة الضيف.',
      },
      {
        weekNumber: 3,
        title: 'أدوات التسجيل وهندسة الصوت',
        titleEn: 'Audio Gear & Recording Masterclass',
        description: 'اختيار العتاد الصوتي، التسجيل عن بُعد والمباشر بجودة استوديو.',
        topics: ['الميكروفونات الديناميكية والمكثفة', 'منصات التسجيل عن بُعد (Riverside, SquadCast)', 'مراقبة مستويات الصوت وتجنب Clipping'],
        practicalProject: 'تسجيل حلقة حوارية تجريبية مشتركة مع زميل داخل الاستوديو.',
      },
      {
        weekNumber: 4,
        title: 'الإنتاج بمساعدة الذكاء الاصطناعي',
        titleEn: 'AI-Powered Audio Post-Production',
        description: 'تنظيف الصوت تلقائيًا، إزالة الصمت، وتوليد الفصول والنصوص.',
        topics: ['أدوات Adobe Podcast و Descript', 'تفريغ النصوص وتوليد الـ Show Notes بالـ AI', 'توليد الفواصل الموسيقية والمؤثرات الذكية'],
        practicalProject: 'مونتاج وهندسة الحلقة بالكامل باستخدام أدوات الذكاء الاصطناعي.',
      },
      {
        weekNumber: 5,
        title: 'استراتيجيات النشر والتوزيع العالمي',
        titleEn: 'Global Distribution & Hosting',
        description: 'ربط خلاصات RSS بالمنصات العالمية وتصميم أغلفة الحلقات.',
        topics: ['اختيار منصة الاستضافة (Podbean, Buzzsprout, Spotify)', 'ضبط الـ Metadata ووصف الحلقات لمحركات البحث (SEO)', 'إعداد نسخة الفيديو لمنصة YouTube Podcasting'],
        practicalProject: 'نشر الحلقة على منصات البودكاست وضبط جدول النشر الدوري.',
      },
      {
        weekNumber: 6,
        title: 'التسويق وتحقيق الدخل وجذب الرعاة',
        titleEn: 'Monetization & Audience Growth',
        description: 'تحويل الحلقات لمقاطع قصيرة، بناء المجتمع، وجذب المعلنين.',
        topics: ['صناعة ريلز وتيك توك من الحلقات (Content Repurposing)', 'نماذج الربح: الإعلانات، الرعاية، والاشتراكات', 'بناء العرض الترويجي للرعاة (Media Kit)'],
        practicalProject: 'إعداد الـ Media Kit الخاص بالبودكاست وخطة تسويق لـ 3 أشهر.',
      },
    ],
    status: ProgramStatus.COMING_SOON,
    isFeatured: true,
    durationWeeks: 6,
    totalHours: 30,
    price: 2800,
    order: 4,
  },

  // ========================================================
  // المجال الثاني: التكنولوجيا والذكاء الاصطناعي (Tech & AI)
  // ========================================================
  {
    titleAr: 'تطبيقات الواقع الافتراضي في الإعلام',
    titleEn: 'VR Applications in Media',
    slug: 'vr-applications-media',
    trackSlug: 'tech-ai-solutions',
    taglineAr: 'خطوة أولى نحو مستقبل الإعلام الغامر',
    taglineEn: 'Your first step towards the future of immersive media',
    descriptionAr:
      'مقدمة تعريفية عملية لتوظيف تقنيات الواقع الافتراضي والواقع المعزز في سرد القصص الإعلامية والتسويقية، تمهيدًا لدخول هذا المجال الناشئ عالميًا بخطى مدروسة.',
    descriptionEn:
      'Practical introduction to integrating Virtual Reality (VR) and Augmented Reality (AR) into storytelling, journalism, and marketing.',
    objectives: [
      'أساسيات الواقع الافتراضي والمعزز وتطبيقاتهما الإعلامية',
      'أمثلة عالمية للاستخدام في الصحافة والتسويق',
      'التجربة العملية على أدوات مبسطة لإنتاج محتوى غامر أولي',
    ],
    learningOutcomes: [
      'فهم المفاهيم الأساسية لتقنيات الـ XR و 360-Degree Media',
      'التعرف على دراسات حالة لأكبر المؤسسات الإعلامية العالمية',
      'إنتاج أول نموذج قصة تفاعلية مدعومة بالواقع المعزز أو الافتراضي',
    ],
    targetAudience: [
      'صناع المحتوى المهتمون بالتقنيات الناشئة',
      'المؤسسات الباحثة عن تمايز إعلامي',
    ],
    curriculum: [
      {
        weekNumber: 1,
        title: 'مدخل إلى الواقع الافتراضي والمعزز',
        titleEn: 'Intro to Immersive Tech in Media',
        description: 'أساسيات الواقع الافتراضي والمعزز وتطبيقاتهما في الصحافة والتسويق.',
        topics: ['الفرق بين VR و AR و MR', 'تطبيقات غرف الأخبار العالمية التفاعلية', 'سرد القصص بزاوية 360 درجة'],
        practicalProject: 'تحليل ونقد تجربة إعلامية تفاعلية عالمية واقعية.',
      },
      {
        weekNumber: 2,
        title: 'ورشة تجريبية على أدوات مبسطة',
        titleEn: 'Hands-on Immersive Prototyping',
        description: 'إنتاج تجربة إعلامية مبسطة باستخدام أدوات الـ AR/VR المتاحة للمبتدئين.',
        topics: ['أدوات الـ WebXR وتطبيقات الجوال', 'دمج العناصر ثلاثية الأبعاد في الفيديو', 'استشراف سوق العمل والمستقبل المهني'],
        practicalProject: 'بناء نموذج أولي لقصة إعلامية أو إعلانية معززة بالـ AR.',
      },
    ],
    strategicNote:
      'يُنصح بتقديم هذا البرنامج كوحدة تعريفية إضافية ضمن باقة أشمل، نظرًا لمحدودية نضج هذا القطاع في السوق المصري حاليًا مقارنة بأسواق إقليمية أخرى.',
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 2,
    totalHours: 12,
    price: 2000,
    order: 5,
  },
  {
    titleAr: 'كشف التزييف العميق والتحقق من المحتوى',
    titleEn: 'Deepfake Verification & Fact-Checking',
    slug: 'deepfake-verification-fact-checking',
    trackSlug: 'tech-ai-solutions',
    taglineAr: 'لا تُصدّق كل ما تراه',
    taglineEn: 'Do not believe everything you see',
    descriptionAr:
      'برنامج توعوي وتطبيقي يُكسب صناع المحتوى والصحفيين مهارة اكتشاف الفيديوهات والصور المزيفة بالذكاء الاصطناعي، والتحقق من مصداقية المحتوى قبل نشره أو تداوله.',
    descriptionEn:
      'Essential defense workshop equipping journalists, PR specialists, and content teams with the tools and methodology to spot AI-generated deepfakes and verify suspicious media.',
    objectives: [
      'التعرف على علامات التزييف العميق في الصورة والفيديو والصوت',
      'استخدام أدوات التحقق الرقمي المتاحة',
      'بناء أساسيات الثقافة الإعلامية ومقاومة التضليل',
    ],
    learningOutcomes: [
      'رصد مؤشرات التزييف في حركة الوجه، الإضاءة، وحركة الشفاه والصوت',
      'فحص البيانات الوصفية (Metadata) والبحث العكسي المتقدم عن الصور والفيديوهات',
      'تصميم بروتوكول مؤسسي للتحقق من الأخبار قبل النشر لتفادي الفضائح الإعلامية',
    ],
    targetAudience: [
      'الصحفيون',
      'معِدّو المحتوى',
      'فرق العلاقات العامة',
      'أي مؤسسة معرّضة لمخاطر التضليل الرقمي',
    ],
    curriculum: [
      {
        weekNumber: 1,
        title: 'مقدمة عن التزييف العميق وأدوات الكشف',
        titleEn: 'Deepfake Mechanisms & Detection Arsenal',
        description: 'كيف تعمل نماذج التزييف، وأنماط الخداع الصوتي والمرئي.',
        topics: ['آليات توليد الـ Deepfakes بالذكاء الاصطناعي', 'الأدوات المجانية والمدفوعة للكشف الرقمي', 'البحث العكسي المتقدم وتحليل الإطارات (Frames)'],
        practicalProject: 'اختبار كشف التزييف على مجموعة من 10 مقاطع مشبوهة.',
      },
      {
        weekNumber: 2,
        title: 'دراسة حالات وبناء بروتوكول التحقق',
        titleEn: 'Case Studies & Institutional Protocol',
        description: 'تحليل أزمات تضليل واقعية من السوق المصري والعربي وتأسيس نظام فحص داخلي.',
        topics: ['دراسة حالات حقيقية للتضليل الإعلامي في مصر والعالم العربي', 'تحليل الصوت المستنسخ ومطابقته', 'بناء دليل وسياسة تحقق مؤسسية (Verification SOP)'],
        practicalProject: 'صياغة بروتوكول تحقق رقمي متكامل لمؤسسة إعلامية أو شركة.',
      },
    ],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 2,
    totalHours: 12,
    price: 2500,
    order: 6,
  },
  {
    titleAr: 'هندسة الأوامر لصناع المحتوى',
    titleEn: 'Prompt Engineering for Content Creators',
    slug: 'prompt-engineering-content-creators',
    trackSlug: 'tech-ai-solutions',
    taglineAr: 'كلمة صح… لأداة صح',
    taglineEn: 'The right prompt... for the right AI tool',
    descriptionAr:
      'بعيدًا عن الكورسات العامة لكتابة الأوامر، هذا البرنامج مصمم خصيصًا لصناع المحتوى الإعلامي: كتابة السكريبتات، توليد الأفكار، تحويل النص إلى صوت، وتحسين سير العمل الإبداعي عبر أدوات الذكاء الاصطناعي.',
    descriptionEn:
      'Domain-specific prompt engineering tailored exclusively for media creators: scriptwriting, ideation, audiovisual generation, and end-to-end creative workflows.',
    objectives: [
      'أساسيات هندسة الأوامر وأطر الكتابة الاحترافية',
      'صياغة أوامر متخصصة لكتابة السكريبت والمحتوى الإعلامي',
      'دمج أدوات الذكاء الاصطناعي في سير العمل اليومي لصانع المحتوى',
    ],
    learningOutcomes: [
      'إتقان أطر كتابة البرومبت (مثل RTF و CREATE) للحصول على مخرجات دقيقة',
      'توليد سكريبتات وثائقية وإعلانية تفوق القوالب الجاهزة المبتذلة',
      'ربط وتكامل أدوات الذكاء الاصطناعي لتسريع إنتاج المحتوى بنسبة 70%',
    ],
    targetAudience: [
      'صناع المحتوى',
      'معِدّو البرامج',
      'فرق التسويق والمحتوى',
    ],
    curriculum: [
      {
        weekNumber: 1,
        title: 'أساسيات هندسة الأوامر وأطر الكتابة',
        titleEn: 'Prompt Engineering Architecture & Frameworks',
        description: 'كيف تفكر النماذج اللغوية الكبيرة (LLMs) وصياغة الأوامر المحكمة.',
        topics: ['أطر كتابة البرومبت الاحترافية للصحافة', 'تحديد السياق، النبرة، والشخصية (Persona)', 'تقنيات Few-Shot و Chain-of-Thought للمحتوى'],
        practicalProject: 'بناء مكتبة أوامر مخصصة لنوع محتوى المتدرب الخاص.',
      },
      {
        weekNumber: 2,
        title: 'أوامر متخصصة لكتابة السكريبت والمحتوى',
        titleEn: 'Domain-Specific Scripting & Creative Ideation',
        description: 'توليد أفكار المحتوى الفيروسي (Viral)، كتابة السكريبت، وإعداد المحاور.',
        topics: ['كتابة سكريبتات ريلز وتيك توك التفاعلية', 'صياغة العناوين الجذابة (Hooks) ومقدمات المقالات', 'تلخيص الأبحاث والتقارير الصحفية المعقدة'],
        practicalProject: 'إنتاج حلقة يوتيوب كاملة السكريبت والمحاور باستخدام الـ AI.',
      },
      {
        weekNumber: 3,
        title: 'سير العمل المتكامل وتوليد الصوت والصورة',
        titleEn: 'Multimodal AI & Full Creative Workflow',
        description: 'توليد الصور وتصاميم الأغلفة، دمج الصوت، وبناء سير عمل أوتوماتيكي.',
        topics: ['توليد الصور الإخبارية والتسويقية (Midjourney, DALL-E)', 'تحويل النص إلى صوت واقعي (ElevenLabs)', 'بناء سير عمل إنتاجي متكامل يوفر ساعات العمل اليومية'],
        practicalProject: 'تصميم حملة محتوى مرئية وصوتية متكاملة أنتجت بالكامل عبر الذكاء الاصطناعي.',
      },
    ],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 3,
    totalHours: 18,
    price: 2600,
    order: 7,
  },
  {
    titleAr: 'المونتاج وتحرير الفيديو الآلي',
    titleEn: 'Automated Video Editing & Post-Production',
    slug: 'automated-video-editing-post-production',
    trackSlug: 'tech-ai-solutions',
    taglineAr: 'مونتاج احترافي… في وقت أقل',
    taglineEn: 'Professional video editing... in a fraction of time',
    descriptionAr:
      'برنامج عملي على أحدث أدوات المونتاج المعتمدة على الذكاء الاصطناعي، يوفّر وقت الإنتاج ويرفع جودة المحتوى المرئي دون الحاجة لخبرة تقنية معقدة.',
    descriptionEn:
      'Hands-on masterclass in modern AI-powered editing pipelines: auto-cutting, silence removal, intelligent captions, audio optimization, and rapid short-form publishing.',
    objectives: [
      'أساسيات المونتاج الاحترافي ولغة الفيديو',
      'استخدام أدوات الذكاء الاصطناعي في القص التلقائي وإزالة الصمت',
      'تحسين جودة الصوت والصورة تلقائيًا وإضافة ترجمات ذكية',
    ],
    learningOutcomes: [
      'إتقان لغة السرد البصري وقواعد القطع المونتاجي السليم',
      'تحويل الفيديوهات الطويلة إلى مقاطع ريلز وشورتس جاهزة بضغطة زر',
      'إضافة الكابشنز والترجمات الحركية الاحترافية والرسوم التوضيحية الذكية',
      'إنجاز مشروع فيديو كامل من الفكرة والتصوير حتى المونتاج النهائي',
    ],
    targetAudience: [
      'صناع محتوى الفيديو',
      'المنتجون',
      'فرق التسويق بالفيديو',
    ],
    curriculum: [
      {
        weekNumber: 1,
        title: 'أساسيات المونتاج ولغة الفيديو',
        titleEn: 'Editing Grammar & Visual Pacing',
        description: 'قواعد السرد البصري، أحجام اللقطات، وإيقاع المونتاج الممتع.',
        topics: ['قواعد التكوين البصري وزوايا الكاميرا', 'الإيقاع والانتقالات المونتاجية الناجحة', 'تنظيم الملفات وWorkflow برامج المونتاج'],
        practicalProject: 'مونتاج مقطع قصير مدته 30 ثانية مع التركيز على إيقاع الانتقالات.',
      },
      {
        weekNumber: 2,
        title: 'أدوات المونتاج المعتمدة على الذكاء الاصطناعي',
        titleEn: 'AI Automated Cutting & Silence Removal',
        description: 'تسريع التقطيع الأولى، إزالة الأخطاء والصمت تلقائيًا.',
        topics: ['المونتاج بالنص المكتوب (Text-Based Video Editing)', 'أدوات القص الذاتي وإزالة فترات الصمت (Auto-Cut)', 'تتبع العناصر والوجوه تلقائيًا (Auto-Reframe)'],
        practicalProject: 'مونتاج حلقة حوارية مدتها 10 دقائق باستخدام أدوات المونتاج النصي في دقائق.',
      },
      {
        weekNumber: 3,
        title: 'الترجمات الذكية وتحسين الصوت والصورة',
        titleEn: 'Auto-Captions, Color Grading & Audio Fix',
        description: 'إضافة الكابشنز المتحركة، تصحيح الألوان التلقائي، وتنقية الصوت.',
        topics: ['توليد الترجمات التلقائية المتحركة وتنسيقها', 'تنقية الصوت وإزالة الصدى بالذكاء الاصطناعي', 'التدريج اللوني الذكي (AI Color Match)'],
        practicalProject: 'إعداد مقطع ريلز تسويقي متكامل بالترجمة الحركية والمؤثرات الصوتية.',
      },
      {
        weekNumber: 4,
        title: 'مشروع تطبيقي متكامل للنشر',
        titleEn: 'Capstone Production: Shoot to Publish',
        description: 'تنفيذ مشروع عملي متكامل بدءًا من التصوير حتى التصدير والنشر.',
        topics: ['إعدادات تصدير الفيديو المثلى لكل منصة', 'اختيار الصور المصغرة الذكية (Thumbnails)', 'تقييم فردي للمشروع النهائي'],
        practicalProject: 'إنتاج ونشر فيديو إعلامي أو إعلاني متكامل الجودة جاهز للمشاهدين.',
      },
    ],
    status: ProgramStatus.COMING_SOON,
    isFeatured: true,
    durationWeeks: 4,
    totalHours: 24,
    price: 2900,
    order: 8,
  },

  // ========================================================
  // المجال الثالث: النمو الاستراتيجي والعلاقات العامة (Strategic Growth & PR)
  // ========================================================
  {
    titleAr: 'أتمتة التسويق الرقمي',
    titleEn: 'Marketing Automation',
    slug: 'marketing-automation',
    trackSlug: 'strategic-growth-pr',
    taglineAr: 'خلّي حملاتك تشتغل وانت نايم',
    taglineEn: 'Let your campaigns run while you sleep',
    descriptionAr:
      'برنامج عملي لتعلم أدوات وأنظمة أتمتة التسويق الرقمي، يمكّنك من إدارة حملاتك على منصات التواصل والبريد الإلكتروني والواتساب بكفاءة أعلى وتكلفة أقل.',
    descriptionEn:
      'Hands-on automation bootcamp: connecting CRM tools, email sequences, WhatsApp API flows, and customer journey analytics to maximize marketing ROI.',
    objectives: [
      'أساسيات أتمتة التسويق وربط الأدوات ببعضها البعض',
      'بناء رحلة عميل آلية متكاملة (Customer Journey)',
      'تحليل البيانات لاتخاذ قرارات تسويقية أذكى',
    ],
    learningOutcomes: [
      'ربط المنصات التسويقية بدون كود برمجي باستخدام أدوات الربط (Make, Zapier)',
      'تصميم مسارات مبيعات آلية (Sales Funnels) تلتقط العملاء وتحولهم إلى مشترين',
      'بناء روبوتات دردشة وحملات واتساب رسمية متجاوبة 24/7',
      'قراءة لوحات تحليل البيانات ومؤشرات التحويل (Conversion Rates)',
    ],
    targetAudience: [
      'أصحاب المشاريع',
      'المسوقون الرقميون',
      'فرق التسويق الصغيرة والمتوسطة',
    ],
    curriculum: [
      {
        weekNumber: 1,
        title: 'مقدمة عن أتمتة التسويق وأدوات الربط',
        titleEn: 'Automation Fundamentals & No-Code Integrations',
        description: 'مفاهيم الأتمتة، الـ Webhooks، وربط منصات التواصل بقواعد البيانات.',
        topics: ['مقدمة لمنصات Zapier و Make و n8n', 'آلية نقل البيانات التلقائية بين التطبيقات', 'إدارة وتصنيف العملاء المحتملين (Leads) لحظيًا'],
        practicalProject: 'بناء سيناريو ربط آلي ينقل بيانات العملاء من إعلانات فيسبوك إلى Google Sheets وتطبيق CRM.',
      },
      {
        weekNumber: 2,
        title: 'بناء رحلة العميل الآلية (Customer Journey)',
        titleEn: 'Automated Customer Journeys & Sequences',
        description: 'تصميم مراحل الرحلة من الاهتمام الأولي حتى إتمام عملية الشراء.',
        topics: ['رسم مسار رحلة العميل خطوة بخطوة', 'حملات البريد الإلكتروني المتسلسلة (Drip Campaigns)', 'تخصيص الرسائل بناءً على سلوك وتفاعل العميل'],
        practicalProject: 'تصميم سلسلة رسائل بريدية آلية ترحيبية وتثقيفية لعملاء جدد.',
      },
      {
        weekNumber: 3,
        title: 'حملات الواتساب الآلية والتواصل متعدد القنوات',
        titleEn: 'WhatsApp Business API & Omnichannel Outreach',
        description: 'استخدام الواتساب والرسائل القصيرة في إغلاق المبيعات وخدمة العملاء.',
        topics: ['تفعيل WhatsApp Cloud API ومراسلة العملاء بأمان', 'بناء بوت دردشة ذكي للرد على استفسارات الأسعار', 'إشعارات الشراء والتأكيد التلقائية'],
        practicalProject: 'بناء تدفق رد آلي تفاعلي عبر تطبيق الواتساب.',
      },
      {
        weekNumber: 4,
        title: 'التحليل والتحسين المستمر للحملات',
        titleEn: 'Analytics, Testing & Continuous Optimization',
        description: 'قياس الأداء، اختبارات A/B، وحساب العائد على الاستثمار الإعلاني.',
        topics: ['مؤشرات الأداء الرئيسية (CAC, LTV, Conversion Rate)', 'إجراء اختبارات A/B على الرسائل والمسارات', 'لوحات المتابعة التلقائية (Dashboards)'],
        practicalProject: 'تقديم خطة أتمتة تسويقية متكاملة لمشروع حقيقي مع لوحة أداء تفاعلية.',
      },
    ],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 4,
    totalHours: 24,
    price: 3200,
    order: 9,
  },
  {
    titleAr: 'العلاقات العامة الرقمية',
    titleEn: 'Digital Public Relations',
    slug: 'digital-public-relations',
    trackSlug: 'strategic-growth-pr',
    taglineAr: 'سمعتك الرقمية… مش صدفة',
    taglineEn: 'Your digital reputation... is never a coincidence',
    descriptionAr:
      'برنامج متخصص في إدارة العلاقات العامة عبر القنوات الرقمية، وبناء استراتيجية تواصل متكاملة مع الجمهور والمؤثرين ووسائل الإعلام أونلاين.',
    descriptionEn:
      'Modern online corporate communication: influencer relationship management, digital press releases, brand storytelling, and strategic media outreach.',
    objectives: [
      'أساسيات العلاقات العامة الرقمية ودورها الاستراتيجي',
      'بناء استراتيجية تواصل رقمي متكاملة',
      'التعامل الاحترافي مع المؤثرين والإعلام الرقمي',
      'أساسيات إدارة الأزمات الرقمية',
    ],
    learningOutcomes: [
      'صياغة البيانات الصحفية الحديثة التي تجذب اهتمام المواقع والصحف الإلكترونية',
      'تحديد واختيار المؤثرين المناسبين للعلامة التجارية والتفاوض معهم باحترافية',
      'إعداد خطة تواصل استراتيجي تعزز مصداقية المؤسسة وتبني حضوراً رقمياً مؤثراً',
    ],
    targetAudience: [
      'فرق التسويق والاتصال المؤسسي',
      'أصحاب المشاريع',
      'مسؤولو العلاقات العامة',
    ],
    curriculum: [
      {
        weekNumber: 1,
        title: 'مدخل إلى العلاقات العامة الرقمية ودورها الاستراتيجي',
        titleEn: 'Introduction to Strategic Digital PR',
        description: 'التحول من العلاقات العامة التقليدية إلى المنظومة الرقمية الحديثة.',
        topics: ['الفرق بين العلاقات العامة الكلاسيكية والرقمية', 'بناء الرسالة المؤسسية والهوية التحريرية', 'أدوات الوصول للصحفيين والمنصات الرقمية'],
        practicalProject: 'كتابة بيان صحفي رسمي وإعداده للنشر على المنصات الإخبارية الرقمية.',
      },
      {
        weekNumber: 2,
        title: 'بناء الاستراتيجية والمحتوى المؤسسي',
        titleEn: 'PR Strategy & Corporate Storytelling',
        description: 'كيف تحكي قصة مؤسستك، وصناعة الشراكات الإعلامية ذات القيمة.',
        topics: ['سرد القصص المؤسسية المؤثرة (Corporate Storytelling)', 'إدارة الفعاليات الافتراضية والمؤتمرات الصحفية الرقمية', 'التنسيق مع فرق السوشيال ميديا والتسويق'],
        practicalProject: 'تصميم خطة إطلاق إعلامية لمنتج أو مبادرة مجتمعية جديدة.',
      },
      {
        weekNumber: 3,
        title: 'إدارة العلاقة مع المؤثرين ودراسة حالة السوق المصري',
        titleEn: 'Influencer Relations & Real-World Egyptian Case Study',
        description: 'شراكات المؤثرين الناجحة، قياس الأثر، وتفادي الأخطاء الشائعة.',
        topics: ['معايير اختيار المؤثرين المناسبين وتفادي الحسابات المزيفة', 'العقود ومؤشرات قياس الحملات مع المؤثرين', 'دراسة حالة واقعية لأزمة علاقات عامة من السوق المصري وكيف تمت معالجتها'],
        practicalProject: 'تحليل حالة واقعية وصياغة حملة علاقات عامة مع المؤثرين متكاملة الأركان.',
      },
    ],
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 3,
    totalHours: 18,
    price: 2600,
    order: 10,
  },
  {
    titleAr: 'إدارة السمعة والأنشطة الرقمية',
    titleEn: 'Reputation Management & Brand Protection',
    slug: 'reputation-management-brand-protection',
    trackSlug: 'strategic-growth-pr',
    taglineAr: 'احمِ اسمك… قبل ما تحتاج تدافع عنه',
    taglineEn: 'Protect your brand name... before you are forced to defend it',
    descriptionAr:
      'برنامج مكمّل للعلاقات العامة الرقمية، يركّز تحديدًا على قياس ومراقبة وحماية سمعة العلامة التجارية أو الشخصية عبر الإنترنت، والتعامل الاستباقي مع الأزمات الرقمية.',
    descriptionEn:
      'Proactive reputation monitoring, sentiment analysis, digital crisis response protocols, and brand protection in high-stakes online environments.',
    objectives: [
      'استخدام أدوات مراقبة السمعة الرقمية',
      'بناء خطة استجابة سريعة للأزمات',
      'تحليل مؤشرات الرأي العام أونلاين',
    ],
    learningOutcomes: [
      'استخدام تقنيات الاستماع الرقمي (Social Listening) لرصد آراء الجمهور وانطباعاتهم',
      'تصميم مصفوفة إدارة الأزمات لتحديد مستوى الخطر وسرعة الاستجابة المطلوبة',
      'إدارة أزمات السوشيال ميديا وحملات الهجوم الإلكتروني بدبلوماسية وثقة',
    ],
    targetAudience: [
      'أصحاب العلامات التجارية الشخصية',
      'المؤسسات',
      'فرق الاتصال المؤسسي',
    ],
    curriculum: [
      {
        weekNumber: 1,
        title: 'أساسيات إدارة السمعة وأدوات المراقبة والتحليل',
        titleEn: 'Reputation Fundamentals & Social Listening Tools',
        description: 'كيف تُقاس السمعة الرقمية، واستخدام أدوات رصد المشاعر والمنشورات.',
        topics: ['أدوات الـ Social Listening ومراقبة الـ Mentions', 'تحليل المشاعر (Sentiment Analysis) إيجابي/سلبي', 'مؤشرات تقييم سمعة العلامات التجارية والشخصيات العامة'],
        practicalProject: 'إعداد تقرير رصد سمعة رقمية شامل لعلامة تجارية على منصات التواصل.',
      },
      {
        weekNumber: 2,
        title: 'خطة إدارة الأزمات وورشة محاكاة أزمة حقيقية',
        titleEn: 'Crisis Response Plan & Live Crisis Simulation',
        description: 'بروتوكولات الاستجابة الفورية، صياغة بيانات الاعتذار أو التوضيح، ومحاكاة عملية.',
        topics: ['تصميم مصفوفة تصعيد الأزمات (Crisis Matrix)', 'كيفية صياغة ردود الأزمات دون مفاقمة الموقف', 'محاكاة أزمة رقمية مفاجئة والتعامل معها تحت ضغط التوقيت'],
        practicalProject: 'محاكاة أزمة حقيقية لفيديو هجومي على السوشيال ميديا وقيادة الاستجابة السريعة.',
      },
    ],
    strategicNote:
      'يُفضَّل طرح هذا البرنامج كامتداد أو باقة مدمجة مع برنامج العلاقات العامة الرقمية، لتكامل المحتوى بينهما في السوق.',
    status: ProgramStatus.COMING_SOON,
    isFeatured: false,
    durationWeeks: 2,
    totalHours: 12,
    price: 2800,
    order: 11,
  },
  {
    titleAr: 'استخدام الهندسة الصوتية وأخلاقيات الاستنساخ الصوتي',
    titleEn: 'Ethical Voice Cloning & Audio Engineering',
    slug: 'ethical-voice-cloning-audio-engineering',
    trackSlug: 'strategic-growth-pr',
    taglineAr: 'صوتك ملكك… احميه بذكاء',
    taglineEn: 'Your voice is your asset... protect it intelligently',
    descriptionAr:
      'برنامج ريادي وفريد في السوق المصري، يتناول تقنية استنساخ الصوت بالذكاء الاصطناعي من ناحيتيها التقنية والأخلاقية/القانونية، في ظل غياب تشريعي واضح يهدد حقوق الأفراد والفنانين في مصر حاليًا.',
    descriptionEn:
      'Pioneering signature program addressing AI voice cloning from both technological and legal/ethical perspectives, securing vocal rights and preventing audio fraud.',
    objectives: [
      'فهم أساسيات تقنية استنساخ الصوت واستخداماتها المشروعة',
      'الإلمام بالأبعاد القانونية والأخلاقية لاستخدام الصوت المُستنسَخ',
      'طرق حماية البصمة الصوتية من الاستغلال والاحتيال',
    ],
    learningOutcomes: [
      'فهم تقنية استنساخ الصوت وتدريب النماذج الصوتية على خامات نقية',
      'معرفة الأطر القانونية وحقوق الملكية الفكرية للبصمة الصوتية في مصر والعالم',
      'تطبيق تقنيات العلامات المائية الصوتية (Audio Watermarking) لحماية الإنتاج',
      'صياغة العقود وتراخيص الاستخدام الصوتي بالذكاء الاصطناعي لحفظ الحقوق المالية',
    ],
    targetAudience: [
      'المعلّقون الصوتيون',
      'الفنانون',
      'المؤسسات الإعلامية',
      'كل صاحب حضور صوتي عام',
    ],
    curriculum: [
      {
        weekNumber: 1,
        title: 'مقدمة تقنية عن استنساخ الصوت والأطر الأخلاقية والقانونية',
        titleEn: 'Voice Cloning Tech, Ethics & Legal Frameworks',
        description: 'الجانب التقني لكيفية تدريب نماذج الذكاء الاصطناعي على الصوت، والقوانين المنظمة.',
        topics: ['كيف تعمل نماذج استنساخ الصوت وما المتطلبات التقنية؟', 'التشريعات الدولية والمحلية لحماية الصوت كبصمة بيومترية', 'نماذج الاستخدام الأخلاقي المشروع (دبلجة، إمكانية وصول، إعلانات)'],
        practicalProject: 'استنساخ نموذج صوتي تجريبي مشروع بتصريح رسمي وتجربة جودته.',
      },
      {
        weekNumber: 2,
        title: 'حماية الهوية الصوتية والتصدي للاحتيال الصوتي ودراسة قضايا واقعية',
        titleEn: 'Vocal Identity Protection, Anti-Fraud & Legal Case Studies',
        description: 'وسائل الحماية، العلامة المائية الرقمية، وصياغة عقود حماية الصوت.',
        topics: ['العلامات المائية الخفية في الملفات الصوتية (Audio Watermarking)', 'طرق اكتشاف التزوير والاحتيال الصوتي البنكي والإعلامي', 'صياغة بنود عقود التنازل والاستخدام الصوتي بالذكاء الاصطناعي'],
        practicalProject: 'صياغة مسودة عقد ترخيص صوتي يحمي حقوق المعلق الصوتي عند استخدام تقنيات الـ AI.',
      },
    ],
    strategicNote:
      'برنامج تمايزي (Signature Program) — لا يوجد له منافس متخصص مباشر في السوق المصري حاليًا، ويُنصح بإبرازه كعلامة مميزة لهوية زين هب.',
    status: ProgramStatus.COMING_SOON,
    isFeatured: true,
    durationWeeks: 2,
    totalHours: 12,
    price: 3000,
    order: 12,
  },
];

async function seedTracksAndPrograms() {
  console.log('=========================================');
  console.log('🌱 Seeding 3 Tracks & 12 Specialized Programs...');
  console.log('=========================================');

  await connectDB();

  const trackMap: Record<string, mongoose.Types.ObjectId> = {};

  // 1. Seed Tracks
  for (const trackItem of tracksData) {
    let track = await Track.findOne({ slug: trackItem.slug });
    if (!track) {
      track = await Track.create(trackItem);
      console.log(`✅ Created Track: [${track.nameAr} / ${track.nameEn}] -> slug: ${track.slug}`);
    } else {
      track.nameAr = trackItem.nameAr;
      track.nameEn = trackItem.nameEn;
      track.descriptionAr = trackItem.descriptionAr;
      track.descriptionEn = trackItem.descriptionEn;
      track.order = trackItem.order;
      await track.save();
      console.log(`ℹ️ Updated Track: [${track.nameAr} / ${track.nameEn}] -> slug: ${track.slug}`);
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
        taglineAr: programItem.taglineAr,
        taglineEn: programItem.taglineEn,
        descriptionAr: programItem.descriptionAr,
        descriptionEn: programItem.descriptionEn,
        objectives: programItem.objectives,
        learningOutcomes: programItem.learningOutcomes,
        targetAudience: programItem.targetAudience,
        curriculum: programItem.curriculum,
        strategicNote: programItem.strategicNote,
        status: programItem.status,
        isFeatured: programItem.isFeatured,
        durationWeeks: programItem.durationWeeks,
        totalHours: programItem.totalHours,
        price: programItem.price,
        currency: 'EGP',
        order: programItem.order,
        isActive: true,
      });
      console.log(`✅ Created Program: [${program.titleAr} / ${program.titleEn}] (Status: ${program.status})`);
    } else {
      program.titleAr = programItem.titleAr;
      program.titleEn = programItem.titleEn;
      program.trackId = trackId;
      program.taglineAr = programItem.taglineAr;
      program.taglineEn = programItem.taglineEn;
      program.descriptionAr = programItem.descriptionAr;
      program.descriptionEn = programItem.descriptionEn;
      program.objectives = programItem.objectives;
      program.learningOutcomes = programItem.learningOutcomes;
      program.targetAudience = programItem.targetAudience;
      program.curriculum = programItem.curriculum;
      program.strategicNote = programItem.strategicNote;
      program.status = programItem.status;
      program.isFeatured = programItem.isFeatured;
      program.durationWeeks = programItem.durationWeeks;
      program.totalHours = programItem.totalHours;
      program.price = programItem.price;
      program.order = programItem.order;
      await program.save();
      console.log(`ℹ️ Updated Program: [${program.titleAr} / ${program.titleEn}] (Status: ${program.status})`);
    }
  }

  console.log('\n=========================================');
  console.log('🎉 3 Tracks & 12 Programs Seeded Successfully into MongoDB Atlas!');
  console.log('=========================================');

  await mongoose.connection.close();
  console.log('Database connection closed.');
  process.exit(0);
}

seedTracksAndPrograms().catch((err) => {
  console.error('[Seed Error] Failed to seed tracks and programs:', err);
  process.exit(1);
});
