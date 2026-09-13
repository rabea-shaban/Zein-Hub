const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pptx = new PptxGenJS();

// Presentation Properties
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'Zein Hub Team';
pptx.company = 'Zein Hub Media LMS';
pptx.title = 'Zein Hub Platform Presentation';
pptx.subject = 'Comprehensive Analysis & Platform Showcase';

// Design Theme Colors
const COLORS = {
  bgDark: '0A0F1D',      // Deep navy
  cardBg: '151E34',      // Card navy
  cardBorder: '233354',  // Border
  primary: '06B6D4',     // Cyan
  secondary: '8B5CF6',   // Purple
  accent: 'F59E0B',      // Amber/Gold
  success: '10B981',     // Green
  textLight: 'F8FAFC',   // White/Off-white
  textMuted: '94A3B8',   // Light gray
  textDim: '64748B'      // Darker gray
};

const defaultFont = 'Segoe UI';

function addBackgroundAndHeader(slide, title, category = 'ZEIN HUB MEDIA LMS') {
  slide.background = { color: COLORS.bgDark };

  // Top Category / Tag
  slide.addText(category, {
    x: 0.8,
    y: 0.4,
    w: 8.0,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: COLORS.primary,
    fontFace: defaultFont
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.7,
    w: 11.5,
    h: 0.6,
    fontSize: 22,
    bold: true,
    color: COLORS.textLight,
    fontFace: defaultFont,
    rtl: true
  });

  // Bottom Line Accent
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.35,
    w: 11.7,
    h: 0.02,
    fill: { color: COLORS.cardBorder }
  });

  // Footer
  slide.addText('Zein Hub Platform © 2026 | Media, Audio & Tech LMS', {
    x: 0.8,
    y: 7.0,
    w: 6.0,
    h: 0.3,
    fontSize: 9,
    color: COLORS.textDim,
    fontFace: defaultFont
  });
}

// -------------------------------------------------------------
// SLIDE 1: Title Slide (Hero)
// -------------------------------------------------------------
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgDark };

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.2,
    w: 3.2,
    h: 0.4,
    fill: { color: '0E2238' },
    line: { color: COLORS.primary, width: 1 },
    rectRadius: 0.1
  });

  slide.addText('🌟 منصة التدريب والتعليم الرقمي المتكاملة', {
    x: 0.8,
    y: 1.2,
    w: 3.2,
    h: 0.4,
    fontSize: 11,
    bold: true,
    color: COLORS.primary,
    fontFace: defaultFont,
    align: 'center',
    rtl: true
  });

  slide.addText('ZEIN HUB PLATFORM', {
    x: 0.8,
    y: 1.8,
    w: 11.5,
    h: 0.9,
    fontSize: 38,
    bold: true,
    color: COLORS.textLight,
    fontFace: defaultFont
  });

  slide.addText('منظومة إدارة التعلم LMS المتخصصة في الإعلام، الإنتاج الصوتي والتقنيات الرقمية', {
    x: 0.8,
    y: 2.7,
    w: 11.5,
    h: 0.6,
    fontSize: 18,
    color: COLORS.primary,
    fontFace: defaultFont,
    rtl: true
  });

  const highlights = [
    { title: 'Full Monorepo', desc: 'Express 5 Backend + Next.js 16 Frontend مع بنية معيارية قابلة للتوسع', color: COLORS.primary },
    { title: 'Enterprise Security', desc: 'مصادقة كاملة بـ httpOnly Cookies مع تحصين ضد XSS و NoSQL Injection', color: COLORS.secondary },
    { title: 'Complete LMS Engine', desc: '19 وحدة برمجية، اختبارات تفاعلية، جلسات بث مباشر، وشهادات معتمدة', color: COLORS.accent }
  ];

  highlights.forEach((item, idx) => {
    const xPos = 0.8 + idx * 4.0;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 3.8,
      w: 3.7,
      h: 2.5,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
      rectRadius: 0.15
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 3.8,
      w: 3.7,
      h: 0.08,
      fill: { color: item.color }
    });

    slide.addText(item.title, {
      x: xPos + 0.3,
      y: 4.1,
      w: 3.1,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: item.color,
      fontFace: defaultFont
    });

    slide.addText(item.desc, {
      x: xPos + 0.3,
      y: 4.6,
      w: 3.1,
      h: 1.4,
      fontSize: 11,
      color: COLORS.textMuted,
      fontFace: defaultFont,
      rtl: true
    });
  });
}

// -------------------------------------------------------------
// SLIDE 2: Vision & What is Zein Hub
// -------------------------------------------------------------
{
  const slide = pptx.addSlide();
  addBackgroundAndHeader(slide, 'الرؤية والهدف من المشروع (The Vision & Core Purpose)');

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.7,
    w: 5.6,
    h: 4.9,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.cardBorder, width: 1 },
    rectRadius: 0.15
  });

  slide.addText('🎯 التحدي والفجوة في السوق', {
    x: 1.1,
    y: 1.9,
    w: 5.0,
    h: 0.4,
    fontSize: 15,
    bold: true,
    color: COLORS.accent,
    fontFace: defaultFont,
    rtl: true
  });

  slide.addText([
    { text: '• ندرة المنصات المتخصصة في التدريب العملي لقطاع الميديا والإنتاج الصوتي والبودكاست.\n\n', options: { color: COLORS.textMuted } },
    { text: '• غياب آليات تصحيح وتسليم ملفات الوسائط الثقيلة ومتابعة التقدم الأكاديمي الحقيقي.\n\n', options: { color: COLORS.textMuted } },
    { text: '• الحاجة إلى ربط المحتوى المسجل بالجلسات التفاعلية المباشرة والاختبارات الآمنة.', options: { color: COLORS.textMuted } }
  ], {
    x: 1.1,
    y: 2.5,
    w: 5.0,
    h: 3.8,
    fontSize: 11,
    fontFace: defaultFont,
    rtl: true
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.8,
    y: 1.7,
    w: 5.7,
    h: 4.9,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.primary, width: 1 },
    rectRadius: 0.15
  });

  slide.addText('💡 حل منصة Zein Hub المتكامل', {
    x: 7.1,
    y: 1.9,
    w: 5.1,
    h: 0.4,
    fontSize: 15,
    bold: true,
    color: COLORS.primary,
    fontFace: defaultFont,
    rtl: true
  });

  slide.addText([
    { text: '• منظومة متكاملة تغطي 3 مسارات احترافية وأكثر من 12 برنامجاً تدريبياً معتمداً.\n\n', options: { color: COLORS.textLight } },
    { text: '• بيئة تفاعلية تجمع بين الفيديوهات، الملفات الصوتية، الكويزات، والتكليفات العملية.\n\n', options: { color: COLORS.textLight } },
    { text: '• تكامل مباشر مع أدوات البث المباشر (Zoom, Google Meet, Teams) وسجل حضور ذكي.\n\n', options: { color: COLORS.textLight } },
    { text: '• شهادات تخرج رقمية مشفرة بكود تحقق فريد ورابط فحص عام وفوري.', options: { color: COLORS.textLight } }
  ], {
    x: 7.1,
    y: 2.5,
    w: 5.1,
    h: 3.8,
    fontSize: 11,
    fontFace: defaultFont,
    rtl: true
  });
}

// -------------------------------------------------------------
// SLIDE 3: Architecture & Tech Stack
// -------------------------------------------------------------
{
  const slide = pptx.addSlide();
  addBackgroundAndHeader(slide, 'البنية المعمارية والتقنيات (Architecture & Technology Stack)');

  const stacks = [
    {
      title: '🖥️ Backend API',
      techs: '• Node.js v20+ & Express v5\n• TypeScript (Strict Mode)\n• MongoDB & Mongoose v9\n• Joi Validation Engine\n• Helmet, Rate-Limit & Compression\n• Swagger / OpenAPI 3.0',
      color: COLORS.primary
    },
    {
      title: '💻 Frontend Web App',
      techs: '• Next.js 16 (App Router)\n• React 19 & TypeScript\n• Tailwind CSS & Framer Motion\n• React Hook Form + Zod\n• i18next (Arabic RTL & EN LTR)\n• Lucide Icons & SweetAlert2',
      color: COLORS.secondary
    },
    {
      title: '☁️ Cloud & DevOps',
      techs: '• Supabase Storage (Cloud Files)\n• Monorepo Concurrently Scripts\n• Comprehensive Automated Tests\n• Postman Complete Collection\n• Production-ready Docker / Vercel',
      color: COLORS.accent
    }
  ];

  stacks.forEach((st, idx) => {
    const xPos = 0.8 + idx * 4.0;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.7,
      w: 3.7,
      h: 4.9,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
      rectRadius: 0.15
    });

    slide.addText(st.title, {
      x: xPos + 0.3,
      y: 2.0,
      w: 3.1,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: st.color,
      fontFace: defaultFont,
      rtl: true
    });

    slide.addText(st.techs, {
      x: xPos + 0.3,
      y: 2.6,
      w: 3.1,
      h: 3.7,
      fontSize: 11,
      color: COLORS.textMuted,
      fontFace: defaultFont
    });
  });
}

// -------------------------------------------------------------
// SLIDE 4: Roles & User Journeys (RBAC)
// -------------------------------------------------------------
{
  const slide = pptx.addSlide();
  addBackgroundAndHeader(slide, 'مصفوفة الأدوار وصلاحيات النظام (Roles & Access Control)');

  const roles = [
    { title: '👑 Super Admin / Admin', desc: 'إدارة المسارات، مراجعة طلبات الالتحاق، اعتماد التقييمات، تحليلات وتقارير الأداء الشاملة.', color: COLORS.accent },
    { title: '👨‍🏫 المحاضر (Instructor)', desc: 'إدارة المناهج والوحدات، وضع الاختبارات والتكليفات، تقييم الطلاب، وجدولة الجلسات الحية.', color: COLORS.primary },
    { title: '🎓 الطالب (Student)', desc: 'دراسة المحتوى، تسليم الواجبات، حل الكويزات مع تصحيح فوري، حضور اللقاءات، واستخراج الشهادات.', color: COLORS.secondary },
    { title: '🌐 الزائر (Visitor)', desc: 'تصفح البرامج والمدربين، التواصل مع الدعم، والتحقق العام من مصداقية وصحة أي شهادة.', color: COLORS.success }
  ];

  roles.forEach((r, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const xPos = 0.8 + col * 5.9;
    const yPos = 1.7 + row * 2.5;

    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 5.6,
      h: 2.2,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
      rectRadius: 0.15
    });

    slide.addText(r.title, {
      x: xPos + 0.3,
      y: yPos + 0.3,
      w: 5.0,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: r.color,
      fontFace: defaultFont,
      rtl: true
    });

    slide.addText(r.desc, {
      x: xPos + 0.3,
      y: yPos + 0.8,
      w: 5.0,
      h: 1.1,
      fontSize: 11,
      color: COLORS.textMuted,
      fontFace: defaultFont,
      rtl: true
    });
  });
}

// -------------------------------------------------------------
// SLIDE 5: 19 Core Modules
// -------------------------------------------------------------
{
  const slide = pptx.addSlide();
  addBackgroundAndHeader(slide, 'المنظومة الوظيفية — 19 موديول برمجي متكامل (Core Modules)');

  const modules = [
    '🔐 Auth & JWT Tokens', '📚 Tracks & Programs', '📖 Modules & Lessons',
    '📝 Quizzes & Exam Bank', '📁 Assignments & Tasks', '📈 Progress & Gradebook',
    '🎓 Digital Certificates', '📹 Live Sessions (Zoom/Meet)', '📋 Attendance Tracking',
    '⭐ Reviews & Testimonials', '📊 Analytics & Aggregations', '✉️ Contact Inquiries',
    '☁️ Supabase Uploads', '👨‍🏫 Instructors Profiles', '📝 Student Applications',
    '💳 Enrollments Engine', '🛡️ Security & Rate Limit', '📄 Swagger / OpenAPI Docs'
  ];

  modules.forEach((mod, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const xPos = 0.8 + col * 4.0;
    const yPos = 1.6 + row * 0.85;

    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: yPos,
      w: 3.7,
      h: 0.7,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
      rectRadius: 0.08
    });

    slide.addText(mod, {
      x: xPos + 0.2,
      y: yPos + 0.15,
      w: 3.3,
      h: 0.4,
      fontSize: 10,
      bold: true,
      color: COLORS.textLight,
      fontFace: defaultFont
    });
  });
}

// -------------------------------------------------------------
// SLIDE 6: Security & Cookie Engine
// -------------------------------------------------------------
{
  const slide = pptx.addSlide();
  addBackgroundAndHeader(slide, 'الأمان والتحصين السحابي (Security & Authentication Engine)');

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.7,
    w: 11.7,
    h: 4.9,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.primary, width: 1 },
    rectRadius: 0.15
  });

  const secPoints = [
    { title: '🔒 HttpOnly Secure Cookies', desc: 'تخزين توكنات الوصول والتجديد داخل كوكيز مشفرة معزولة تماماً عن أي وصول عبر الـ JavaScript لمنع هجمات XSS.' },
    { title: '🔄 Silent Token Refresh', desc: 'تجديد الجلسة تلقائياً في الخلفية عند انتهاء الـ Access Token دون تسجيل خروج المستخدم أو التأثير على تجربته.' },
    { title: '🛡️ NoSQL Injection & Sanitization', desc: 'فحص وتعقيم كافة المدخلات واستبعاد أي استعلامات خبيثة موجهة لـ MongoDB مع استخدام Joi Schemas.' },
    { title: '⚡ Helmet & Rate Limiting', desc: 'ترويسات أمان قياسية وتحديد معدل الطلبات لحماية الخادم من هجمات الحرمان من الخدمة (DDoS / Brute Force).' }
  ];

  secPoints.forEach((pt, idx) => {
    const yPos = 2.0 + idx * 1.1;
    slide.addText(pt.title, {
      x: 1.2,
      y: yPos,
      w: 10.9,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: COLORS.primary,
      fontFace: defaultFont
    });
    slide.addText(pt.desc, {
      x: 1.2,
      y: yPos + 0.35,
      w: 10.9,
      h: 0.6,
      fontSize: 11,
      color: COLORS.textMuted,
      fontFace: defaultFont,
      rtl: true
    });
  });
}

// -------------------------------------------------------------
// SLIDE 7: Live Sessions & Digital Certificates
// -------------------------------------------------------------
{
  const slide = pptx.addSlide();
  addBackgroundAndHeader(slide, 'الجلسات الحية والشهادات الرقمية (Live Sessions & Certificates)');

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.7,
    w: 5.6,
    h: 4.9,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.secondary, width: 1 },
    rectRadius: 0.15
  });

  slide.addText('📹 الجلسات المباشرة والحضور', {
    x: 1.1,
    y: 2.0,
    w: 5.0,
    h: 0.4,
    fontSize: 15,
    bold: true,
    color: COLORS.secondary,
    fontFace: defaultFont,
    rtl: true
  });

  slide.addText([
    { text: '• دعم لقاءات Zoom و Google Meet و Microsoft Teams.\n\n', options: { color: COLORS.textLight } },
    { text: '• جدولة المواعيد التلقائية وإرسال روابط الانضمام للمشتركين.\n\n', options: { color: COLORS.textLight } },
    { text: '• سجل حضور وغياب متصل بملف الطالب ونسب التقييم.\n\n', options: { color: COLORS.textLight } },
    { text: '• إمكانية إرفاق تسجيلات الجلسات للرجوع إليها لاحقاً.', options: { color: COLORS.textLight } }
  ], {
    x: 1.1,
    y: 2.6,
    w: 5.0,
    h: 3.7,
    fontSize: 11,
    fontFace: defaultFont,
    rtl: true
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.8,
    y: 1.7,
    w: 5.7,
    h: 4.9,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.accent, width: 1 },
    rectRadius: 0.15
  });

  slide.addText('🎓 الشهادات والتحقق الرقمي', {
    x: 7.1,
    y: 2.0,
    w: 5.1,
    h: 0.4,
    fontSize: 15,
    bold: true,
    color: COLORS.accent,
    fontFace: defaultFont,
    rtl: true
  });

  slide.addText([
    { text: '• إصدار آلي فوري للشهادات بمجرد إتمام متطلبات النجاح.\n\n', options: { color: COLORS.textLight } },
    { text: '• رقم تسلسلي فريد وغير قابل للتكرار لكل طالب.\n\n', options: { color: COLORS.textLight } },
    { text: '• صفحة تحقق عامة (Public Verification) لفحص صلاحية الشهادة.\n\n', options: { color: COLORS.textLight } },
    { text: '• خيارات تحميل وتصدير بصيغة PDF وطباعة عالية الدقة.', options: { color: COLORS.textLight } }
  ], {
    x: 7.1,
    y: 2.6,
    w: 5.1,
    h: 3.7,
    fontSize: 11,
    fontFace: defaultFont,
    rtl: true
  });
}

// -------------------------------------------------------------
// SLIDE 8: Analytics & Dashboards
// -------------------------------------------------------------
{
  const slide = pptx.addSlide();
  addBackgroundAndHeader(slide, 'لوحة التحليلات ومؤشرات الأداء (Analytics & Business Intelligence)');

  const kpis = [
    { title: 'إجمالي المشتركين', val: '1,250+', desc: 'نمو مستمر في طلبات الالتحاق', color: COLORS.primary },
    { title: 'معدل إتمام البرامج', val: '88.4%', desc: 'نسبة تفاعل وإنجاز مرتفعة', color: COLORS.success },
    { title: 'البرامج التدريبية', val: '12+ مسار', desc: 'برامج احترافية تغطي كافة التخصصات', color: COLORS.secondary },
    { title: 'الشهادات الممنوحة', val: '950+', desc: 'شهادات معتمدة مع كود التحقق', color: COLORS.accent }
  ];

  kpis.forEach((kpi, idx) => {
    const xPos = 0.8 + idx * 3.0;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.7,
      w: 2.7,
      h: 2.0,
      fill: { color: COLORS.cardBg },
      line: { color: COLORS.cardBorder, width: 1 },
      rectRadius: 0.12
    });

    slide.addText(kpi.val, {
      x: xPos + 0.2,
      y: 1.9,
      w: 2.3,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: kpi.color,
      fontFace: defaultFont,
      align: 'center'
    });

    slide.addText(kpi.title, {
      x: xPos + 0.2,
      y: 2.5,
      w: 2.3,
      h: 0.4,
      fontSize: 11,
      bold: true,
      color: COLORS.textLight,
      fontFace: defaultFont,
      align: 'center',
      rtl: true
    });

    slide.addText(kpi.desc, {
      x: xPos + 0.2,
      y: 2.9,
      w: 2.3,
      h: 0.6,
      fontSize: 9,
      color: COLORS.textDim,
      fontFace: defaultFont,
      align: 'center',
      rtl: true
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 4.0,
    w: 11.7,
    h: 2.6,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.primary, width: 1 },
    rectRadius: 0.15
  });

  slide.addText('📊 محرك تجميع البيانات (MongoDB Aggregation Pipelines)', {
    x: 1.1,
    y: 4.2,
    w: 11.0,
    h: 0.4,
    fontSize: 13,
    bold: true,
    color: COLORS.primary,
    fontFace: defaultFont,
    rtl: true
  });

  slide.addText([
    { text: '• معالجة إحصائية لحظية لحساب معدلات الإنجاز بدون استهلاك زائد للذاكرة.\n', options: { color: COLORS.textLight } },
    { text: '• تصنيف شرائح الطلاب (متميز، متوسط، يحتاج متابعة) لتقديم الدعم الأكاديمي المبكر.\n', options: { color: COLORS.textLight } },
    { text: '• تقارير شهرية وفصلية عن كفاءة البرامج والمحاضرين مع تصدير البيانات للتحليل.', options: { color: COLORS.textLight } }
  ], {
    x: 1.1,
    y: 4.7,
    w: 11.0,
    h: 1.7,
    fontSize: 11,
    fontFace: defaultFont,
    rtl: true
  });
}

// -------------------------------------------------------------
// SLIDE 9: Conclusion & Quick Start
// -------------------------------------------------------------
{
  const slide = pptx.addSlide();
  addBackgroundAndHeader(slide, 'الخاتمة والانطلاق (Conclusion & Launch Guide)');

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.7,
    w: 11.7,
    h: 4.9,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.primary, width: 1 },
    rectRadius: 0.15
  });

  slide.addText('🚀 تشغيل المنصة في خطوة واحدة', {
    x: 1.2,
    y: 2.0,
    w: 10.9,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: COLORS.primary,
    fontFace: defaultFont,
    rtl: true
  });

  slide.addText('الأمر الموحد لتثبيت الاعتماديات وتشغيل الـ Backend والـ Frontend بالتوازي:', {
    x: 1.2,
    y: 2.5,
    w: 10.9,
    h: 0.4,
    fontSize: 12,
    color: COLORS.textMuted,
    fontFace: defaultFont,
    rtl: true
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 1.2,
    y: 3.0,
    w: 10.9,
    h: 0.7,
    fill: { color: '070C18' },
    line: { color: COLORS.cardBorder, width: 1 }
  });

  slide.addText('node scripts/start.js', {
    x: 1.5,
    y: 3.15,
    w: 10.3,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: COLORS.accent,
    fontFace: 'Consolas'
  });

  slide.addText('✨ Zein Hub — نحو جيل ريادي في صناعة المحتوى الإعلامي والإنتاج الصوتي والتقنيات الرقمية', {
    x: 1.2,
    y: 4.3,
    w: 10.9,
    h: 0.8,
    fontSize: 15,
    bold: true,
    color: COLORS.textLight,
    fontFace: defaultFont,
    align: 'center',
    rtl: true
  });

  slide.addText('شكراً لكم! (Thank You)', {
    x: 1.2,
    y: 5.2,
    w: 10.9,
    h: 0.5,
    fontSize: 14,
    bold: true,
    color: COLORS.primary,
    fontFace: defaultFont,
    align: 'center'
  });
}

// Generate Presentation
const outputPath = path.join(rootDir = path.resolve(__dirname, '..'), 'Zein_Hub_Presentation.pptx');
pptx.writeFile({ fileName: outputPath })
  .then(fileName => {
    console.log(`✅ تم إنشاء ملف البوربوينت بنجاح: ${fileName}`);
  })
  .catch(err => {
    console.error('❌ خطأ أثناء إنشاء البوربوينت:', err);
  });
