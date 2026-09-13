const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  NumberFormat
} = require('docx');
const fs = require('fs');
const path = require('path');

// Palette
const THEME = {
  primary: '0891B2',    // Cyan / Teal
  secondary: '6366F1',  // Indigo
  accent: 'D97706',     // Amber
  dark: '0F172A',       // Slate 900
  lightBg: 'F8FAFC',    // Slate 50
  tableHeader: '0F172A',
  tableRowAlt: 'F1F5F9',
  border: 'CBD5E1',
  text: '1E293B',
  textMuted: '475569'
};

const defaultFont = 'Arial';

function createTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 44, // 22pt
        color: THEME.primary,
        font: defaultFont
      })
    ]
  });
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.RIGHT,
    spacing: { before: 480, after: 180 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 32, // 16pt
        color: THEME.dark,
        font: defaultFont
      })
    ]
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.RIGHT,
    spacing: { before: 320, after: 140 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 26, // 13pt
        color: THEME.primary,
        font: defaultFont
      })
    ]
  });
}

function createHeading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    alignment: AlignmentType.RIGHT,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 22, // 11pt
        color: THEME.secondary,
        font: defaultFont
      })
    ]
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.RIGHT,
    spacing: { before: 80, after: 120, line: 320 },
    children: [
      new TextRun({
        text: text,
        size: options.size || 22, // 11pt
        color: options.color || THEME.text,
        bold: options.bold || false,
        font: defaultFont
      })
    ]
  });
}

function createBullet(text, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({
      text: boldPrefix + ' ',
      bold: true,
      size: 21,
      color: THEME.dark,
      font: defaultFont
    }));
  }
  children.push(new TextRun({
    text: text,
    size: 21,
    color: THEME.text,
    font: defaultFont
  }));

  return new Paragraph({
    bullet: { level: 0 },
    alignment: AlignmentType.RIGHT,
    spacing: { before: 60, after: 60, line: 300 },
    children: children
  });
}

function createCallout(title, text, borderColor = THEME.primary, bgColor = 'F0FDFA') {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.SINGLE, size: 24, color: borderColor }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: bgColor, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 40, after: 80 },
                children: [
                  new TextRun({
                    text: '📌 ' + title,
                    bold: true,
                    size: 22,
                    color: THEME.dark,
                    font: defaultFont
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 40, after: 40, line: 300 },
                children: [
                  new TextRun({
                    text: text,
                    size: 20,
                    color: THEME.textMuted,
                    font: defaultFont
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function createTable(headers, rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      shading: { fill: THEME.tableHeader, type: ShadingType.CLEAR },
      margins: { top: 140, bottom: 140, left: 160, right: 160 },
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: h,
              bold: true,
              size: 20,
              color: 'FFFFFF',
              font: defaultFont
            })
          ]
        })
      ]
    }))
  });

  const bodyRows = rows.map((row, rIdx) => new TableRow({
    children: row.map(cellText => new TableCell({
      shading: { fill: rIdx % 2 === 1 ? THEME.tableRowAlt : 'FFFFFF', type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 160, right: 160 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: THEME.border },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: THEME.border },
        left: { style: BorderStyle.SINGLE, size: 4, color: THEME.border },
        right: { style: BorderStyle.SINGLE, size: 4, color: THEME.border }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: cellText,
              size: 19,
              color: THEME.text,
              font: defaultFont
            })
          ]
        })
      ]
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows]
  });
}

// Build the Document
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: defaultFont,
          size: 22,
          color: THEME.text
        },
        paragraph: {
          spacing: { line: 320 }
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: 'Zein Hub Platform — التوثيق الفني الشامل',
                  size: 16,
                  color: THEME.textMuted,
                  font: defaultFont
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'صفحة ',
                  size: 16,
                  color: THEME.textMuted
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 16,
                  color: THEME.textMuted
                }),
                new TextRun({
                  text: ' من ',
                  size: 16,
                  color: THEME.textMuted
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 16,
                  color: THEME.textMuted
                })
              ]
            })
          ]
        })
      },
      children: [
        // ==========================================
        // COVER / TITLE SECTION
        // ==========================================
        new Paragraph({ spacing: { before: 800 } }),
        createTitle('منصة ZEIN HUB للتدريب والتعليم الرقمي'),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 400 },
          children: [
            new TextRun({
              text: 'وثيقة التوثيق والتحليل الفني والهندسي الشامل (Full Technical Documentation)',
              bold: true,
              size: 24,
              color: THEME.secondary,
              font: defaultFont
            })
          ]
        }),

        createCallout(
          'معلومات الوثيقة والمشروع',
          '• اسم المشروع: Zein Hub Platform (Zein Hub Media LMS)\n• الإصدار: 1.0.0 (Production Ready)\n• النمط المعماري: Full Monorepo (Next.js 16 + Express 5 + TypeScript + MongoDB)\n• تاريخ الإصدار والتوثيق: سبتمبر 2026\n• إعداد: فريق الهندسة والتطوير البرمجي لـ Zein Hub'
        ),

        new Paragraph({ spacing: { before: 400 } }),

        // ==========================================
        // SECTION 1: الملخص التنفيذي والرؤية
        // ==========================================
        createHeading1('1. الملخص التنفيذي ورؤية المشروع (Executive Summary & Vision)'),
        createParagraph('منصة Zein Hub هي نظام متكامل لإدارة وتطوير التعليم والتدريب الرقمي (Learning Management System - LMS) صُمم خصيصاً لتلبية احتياجات قطاعات الإعلام، صناعة البودكاست والإنتاج الصوتي، والهندسة الصوتية، والتقنيات الرقمية المرافقة لصناعة المحتوى.'),
        createParagraph('تم بناء المنصة لسد فجوة حقيقية في سوق التدريب العربي من خلال الجمع بين المحتوى الأكاديمي المسجل، التكليفات العملية المعتمدة على رفع وسائط حقيقية (ملفات صوتية وفيديوهات عالية الدقة)، الجلسات التفاعلية المباشرة، ونظام ذكي لإصدار وتوثيق الشهادات المعتمدة برمز تحقق فريد.'),

        createHeading2('أبرز الأهداف الاستراتيجية للمنصة:'),
        createBullet('تقديم بيئة تعليمية مرنة وتفاعلية تتيح للمتدربين الوصول للمسارات المعتمدة في أي وقت ومن أي جهاز.', '• المرونة وسهولة الوصول:'),
        createBullet('حماية الحقوق الفكرية للمحتوى التدريبي عبر عزل الدروس المدفوعة وحمايتها مع توفير ميزة المعاينة المجانية.', '• حماية الملكية الفكرية:'),
        createBullet('ربط الطلاب بمدربين محترفين عبر تكليفات عملية واقعية وملاحظات تقييمية مستمرة وجلسات حية تفاعلية.', '• التفاعل العملي الحي:'),
        createBullet('إصدار شهادات إتمام رقمية مشفرة بـ Unique QR Code يتيح لأرباب العمل والجهات المعنية فحص صحة الشهادة فورياً.', '• المصداقية والاعتماد:'),

        new Paragraph({ spacing: { before: 300 } }),

        // ==========================================
        // SECTION 2: البنية المعمارية ومنظومة التقنيات
        // ==========================================
        createHeading1('2. البنية المعمارية ومنظومة التقنيات (Architecture & Tech Stack)'),
        createParagraph('يعتمد المشروع على نمط الـ Monorepo الحديث، حيث يجمع كلاً من خادم الـ API والواجهة الأمامية في مستودع موحد مع سكريبتات تشغيل متزامنة.'),

        createHeading2('جدول التقنيات والأدوات المستخدمة:'),
        createTable(
          ['الطبقة / المكون', 'التقنية المستخدمة', 'الإصدار', 'الغرض والدور الوظيفي'],
          [
            ['الواجهة الخلفية (Backend)', 'Node.js & Express.js', 'Express v5.2 / Node 20+', 'بناء الـ RESTful API ومعالجة الطلبات وإدارة العمليات'],
            ['لغة البرمجة (Language)', 'TypeScript', 'v5.7 / v7.0 (Strict)', 'ضمان الأمان البرمجي وتفادي أخطاء الـ Runtime عبر Type Safety'],
            ['قاعدة البيانات (Database)', 'MongoDB & Mongoose', 'Mongoose v9.9', 'تخزين البيانات غير العلائقية مع فهارس مركبة وتسريع الاستعلامات'],
            ['المصادقة والأمان (Auth)', 'JWT + httpOnly Cookies', 'jsonwebtoken + cookie-parser', 'حماية جلسات المستخدمين ومنع هجمات XSS وتجديد التوكنات صامتاً'],
            ['التحقق من البيانات', 'Joi & Zod', 'Joi 18.2 / Zod 4.5', 'فحص صارم للمدخلات والـ Payloads قبل معالجتها في الـ Backend والـ Frontend'],
            ['الواجهة الأمامية (Frontend)', 'Next.js & React', 'Next.js 16.3 / React 19.2', 'تطبيق ويب فائق السرعة يعتمد App Router و SSR و Client Components'],
            ['التنسيق والمؤثرات (UI/UX)', 'Tailwind CSS & Framer Motion', 'Tailwind v3.4 / Motion v12', 'تصميم عصري متجاوب مع حركات وانتقالات بصرية جذابة'],
            ['التخزين السحابي (Storage)', 'Supabase Storage & Multer', 'Supabase JS v2.113', 'رفع ومعالجة الملفات الصوتية، الفيديوهات، ومستندات الطلاب'],
            ['التوثيق التفاعلي (Docs)', 'Swagger / OpenAPI 3.0', 'swagger-ui-express v5', 'توليد واجهة توثيق تفاعلية لجميع المسارات البرمجية عبر /api/docs'],
            ['التدويل واللغات (i18n)', 'i18next & react-i18next', 'i18next v26.4', 'دعم كامل ومتبادل بين العربية (RTL) والإنجليزية (LTR)']
          ]
        ),

        new Paragraph({ spacing: { before: 300 } }),

        // ==========================================
        // SECTION 3: مصفوفة الأدوار والصلاحيات
        // ==========================================
        createHeading1('3. مصفوفة الأدوار والصلاحيات (RBAC System)'),
        createParagraph('تم تزويد المنصة بنظام صارم لإدارة الوصول مبني على الأدوار (Role-Based Access Control) لضمان خصوصية العمليات وتنظيم سير العملية التعليمية:'),

        createTable(
          ['الدور (Role)', 'المسار البرمجي / الواجهة', 'أبرز الصلاحيات والمسؤوليات المتاحة'],
          [
            ['المدير العام (Super Admin)', '/admin', '• تحكم كامل في المسارات والبرامج التدريبية.\n• مراجعة واعتماد طلبات الالتحاق وتفعيل الاشتراكات.\n• اعتماد وتدقيق تقييمات الطلاب قبل النشر.\n• لوحة تحليلات وإحصاءات الأداء والـ KPIs الشاملة.\n• متابعة رسائل التواصل واستفسارات الزوار.'],
            ['المحاضر / المدرب (Instructor)', '/instructor', '• إدارة المناهج والوحدات والدروس الخاصة ببرامجه.\n• إنشاء الاختبارات (Quizzes) والتكليفات العملية.\n• تصحيح واجبات الطلاب ورصد الدرجات والملاحظات.\n• جدولة الجلسات المباشرة (Live Sessions) ورصد الحضور والغياب.'],
            ['الطالب / المتدرب (Student)', '/student', '• استعراض المنهج الدراسي ومتابعة الدروس المكتملة.\n• حل الاختبارات الذاتية مع تصحيح فوري وحساب الدرجات.\n• رفع ملفات التكليفات العملية ومتابعة تقييم المحاضر.\n• حضور الجلسات التفاعلية واستخراج الشهادات المعتمدة.'],
            ['الزائر العام (Guest / Visitor)', '/ (Public Routes)', '• تصفح كتالوج المسارات والبرامج والمدربين.\n• التقديم على البرامج التدريبية المفتوحة.\n• التحقق العام من صحة ومصداقية الشهادات بدون تسجيل دخول.']
          ]
        ),

        new Paragraph({ spacing: { before: 300 } }),

        // ==========================================
        // SECTION 4: الوحدات الوظيفية الـ 19 بالتفصيل
        // ==========================================
        createHeading1('4. المنظومة الوظيفية — الـ 19 موديول البرمجي (Core Functional Modules)'),
        createParagraph('تم تقسيم الشيفرة البرمجية إلى 19 موديولاً وظيفياً معمارياً يتميز كل منها بفصل المسؤوليات (Separation of Concerns):'),

        createHeading2('1. منظومة المصادقة والأمان (Auth Module):'),
        createBullet('تسجيل الدخول، إنشاء الحسابات، إعادة تعيين كلمة المرور، واستعادة الحسابات.', '• المهام:'),
        createBullet('استخدام توكنات JWT مشفرة ومخزنة في `httpOnly Cookies` لمنع سرقتها مع آلية تجديد صامتة (Silent Token Refresh).', '• الأمان:'),

        createHeading2('2. المسارات والبرامج التدريبية (Tracks & Programs Module):'),
        createBullet('إدارة 3 مسارات احترافية رئيسية وأكثر من 12 برنامجاً تخصصياً مع أنظمة ترقيم وفلترة وبحث متقدم.', '• الهيكل:'),

        createHeading2('3. الوحدات والمناهج والدروس (Modules & Lessons):'),
        createBullet('تنظيم محتوى الدورات بشكل شجري (Program -> Modules -> Lessons) مع دعم الفيديو، الصوت، والنصوص، وخاصية المعاينة المجانية.', '• المحتوى:'),

        createHeading2('4. الاختبارات وبنك الأسئلة (Quizzes & Questions Bank):'),
        createBullet('إنشاء اختبارات تفاعلية، بنك أسئلة بأنماط متعددة، تصحيح ذاتي فوري، وإخفاء الإجابات الصحيحة أثناء المحاولة لمنع الغش.', '• التقييم:'),

        createHeading2('5. التكليفات والمشاريع العملية (Assignments & Submissions):'),
        createBullet('نظام تسليم المشاريع العملية ورفع ملفات الوسائط المتعددة مع رصد التقييمات وملاحظات المدرب التوجيهية.', '• التطبيق العملي:'),

        createHeading2('6. تتبع التقدم وسجل الدرجات (Progress & Gradebook):'),
        createBullet('احتساب نسب الإنجاز التراكمية لحظة بلحظة وربطها تلقائياً بشروط استحقاق الشهادة الرقمية.', '• الأداء:'),

        createHeading2('7. الشهادات الرقمية المعتمدة (Digital Certificates & Public Verification):'),
        createBullet('توليد شهادات تخرج رقمية برمز تسلسلي فريد (Unique Certificate Code) مع صفحة فحص عامة ومتاحة للجميع.', '• التوثيق:'),

        createHeading2('8. الجلسات المباشرة وسجل الحضور (Live Sessions & Attendance):'),
        createBullet('جدولة اللقاءات الحية المتكاملة مع Zoom و Google Meet و Microsoft Teams وتسجيل حضور وغياب الطلاب تلقائياً.', '• اللقاءات الحية:'),

        createHeading2('9. المراجعات والآراء (Reviews & Testimonials):'),
        createBullet('إتاحة تقييم البرامج بنظام النجوم والتعليقات مع طابور اعتماد إداري (Moderation Queue) قبل النشر للعامة.', '• المصداقية:'),

        createHeading2('10. لوحة التحليلات ومؤشرات الأداء (Analytics Engine):'),
        createBullet('استخدام MongoDB Aggregation Pipelines لحساب مؤشرات الأداء (KPIs)، معدلات الإنجاز، وأكثر البرامج طلباً.', '• ذكاء الأعمال:'),

        createHeading2('11. رسائل التواصل واستفسارات الزوار (Contact Messages):'),
        createBullet('استقبال رسائل واستفسارات الجمهور وتصنيفها وتتبع حالة الرد والتواصل من قبل فريق الدعم.', '• التواصل:'),

        createHeading2('12. الرفع والتخزين السحابي (Cloud Uploads):'),
        createBullet('معالجة وتخزين الملفات عبر Multer والرفع المباشر إلى Supabase Storage لضمان سرعة التحميل وتوافر الوسائط.', '• التخزين:'),

        new Paragraph({ spacing: { before: 300 } }),

        // ==========================================
        // SECTION 5: الأمان والتحصين السحابي
        // ==========================================
        createHeading1('5. استراتيجية الأمان والتحصين السحابي (Fortified Cybersecurity)'),
        createParagraph('تم تحصين منصة Zein Hub ضد أشهر الثغرات والهجمات الأمنية المذكورة في تصنيفات OWASP Top 10:'),

        createTable(
          ['التهديد الأمني (Threat)', 'آلية الحماية المطبقة في المنصة (Defense Mechanism)'],
          [
            ['هجمات البرمجة عبر المواقع (XSS)', '• توظيف `httpOnly Secure SameSite Cookies` لحفظ توكنات المصادقة.\n• منع وصول أي كود جافاسكريبت خارجي للجلسات الحساسة.'],
            ['حقن قواعد البيانات (NoSQL Injection)', '• تعقيم كافة المدخلات واستبعاد المشغلات غير المصرح بها ($gt, $where).\n• فحص دقيق لكافة الـ Payloads بواسطة Joi Schemas.'],
            ['هجمات الحرمان من الخدمة والتخمين (Brute Force / DDoS)', '• تفعيل `express-rate-limit` وتحديد سقف أعلى للطلبات لكل عنوان IP.\n• تخصيص حماية مضاعفة لمسارات تسجيل الدخول والمصادقة.'],
            ['الثغرات في ترويسات الـ HTTP', '• دمج حزمة `Helmet` لحظر إطارات Clickjacking وفرض سياسات أمان صارمة للمحتوى (CSP).'],
            ['سرقة وتخمين كلمات المرور', '• تشفير كلمات المرور باستخدام خوارزمية `Bcrypt.js` مع Salt Rounds مرتفعة.']
          ]
        ),

        new Paragraph({ spacing: { before: 300 } }),

        // ==========================================
        // SECTION 6: دليل التشغيل السريع
        // ==========================================
        createHeading1('6. دليل التثبيت والتشغيل السريع (Installation & Quick Start)'),
        createParagraph('تم توفير سكريبت تشغيل ذكي يتيح إطلاق كامل المنصة بأمر واحد:'),

        createCallout(
          'أمر التشغيل الموحد (All-In-One Launcher)',
          'node scripts/start.js\n\nيقوم هذا الأمر بفحص وتثبيت كافة مكتبات الـ Root والـ Backend والـ Frontend، ثم تشغيل خادمي التطوير بالتوازي.'
        ),

        createHeading2('روابط الوصول للخدمات في بيئة التطوير المحلية:'),
        createBullet('http://localhost:3000', '• تطبيق الويب (Frontend):'),
        createBullet('http://localhost:5000', '• خادم الـ API (Backend):'),
        createBullet('http://localhost:5000/api/docs', '• توثيق الـ API التفاعلي (Swagger UI):'),
        createBullet('http://localhost:5000/api/docs.json', '• مخطط OpenAPI JSON:'),

        new Paragraph({ spacing: { before: 300 } }),

        // ==========================================
        // SECTION 7: الخاتمة
        // ==========================================
        createHeading1('7. الخاتمة والتوصيات (Conclusion)'),
        createParagraph('تمثل منصة Zein Hub نموذجاً متقدماً لمنصات إدارة التعلم الحديثة المتوافقة مع متطلبات السوق التنافسي في مجالات الإعلام والصوتيات والتقنيات الرقمية. تمتاز المنصة بمرونتها المعمارية وقابليتها للتوسع والربط مع بوابات الدفع الإلكتروني وتطبيقات الهواتف الذكية في المراحل القادمة بكل سلاسة.'),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 300 },
          children: [
            new TextRun({
              text: '✨ تم بحمد الله وتوفيقه — فريق تطوير Zein Hub Platform ✨',
              bold: true,
              size: 24,
              color: THEME.primary,
              font: defaultFont
            })
          ]
        })
      ]
    }
  ]
});

// Save Document
const outputPath = path.join(rootDir = path.resolve(__dirname, '..'), 'Zein_Hub_Documentation.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ تم إنشاء ملف الوورد بنجاح: ${outputPath}`);
}).catch(err => {
  console.error('❌ خطأ أثناء إنشاء ملف الوورد:', err);
});
