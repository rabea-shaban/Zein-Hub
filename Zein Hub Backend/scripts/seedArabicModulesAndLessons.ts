import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { Program } from '../src/models/program.model.js';
import { Module } from '../src/models/module.model.js';
import { Lesson } from '../src/models/lesson.model.js';
import { LessonContentType } from '../src/constants/content.enum.js';

async function seedModulesAndLessons() {
  console.log('🔄 Connecting to MongoDB to seed rich Course Modules and Lessons...');
  await connectDB();

  const allPrograms = await Program.find({});
  console.log(`Found ${allPrograms.length} programs.`);

  const weeks = [
    {
      title: 'الأسبوع 01: التأسيس الصوتي والتحكم في التنفس ومخارج الحروف',
      description: 'التدريب العملي على تمارين التنفس الحجابي، طبقات الصوت (قرار وجواب)، وتليين عضلات النطق.',
      lessons: [
        {
          title: 'الدرس 01: تشريح الصوت والتنفس الحجابي السليم',
          description: 'فهم ميكانيزم إنتاج الصوت وكيفية التنفس دون إجهاد الأحبال الصوتية.',
          contentType: LessonContentType.VIDEO,
          contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          durationMinutes: 24,
          isFreePreview: true,
        },
        {
          title: 'الدرس 02: تمرين تلوين النبرة وإيقاع الإلقاء',
          description: 'تطبيق عملي على تلوين الصوت بحسب السياق الدرامي والإخباري.',
          contentType: LessonContentType.AUDIO,
          contentUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_rain.ogg',
          durationMinutes: 18,
          isFreePreview: false,
        },
        {
          title: 'الدرس 03: نصوص وتدريبات الإعلانات التجارية (PDF)',
          description: 'نصوص إعلانية حقيقية للتدريب والتسجيل في الاستوديو.',
          contentType: LessonContentType.PDF,
          contentUrl: 'https://zeinhub.com/files/scripts-week-1.pdf',
          durationMinutes: 10,
          isFreePreview: false,
        },
      ],
    },
    {
      title: 'الأسبوع 02: محاكاة الاستوديو والتعامل مع الميكروفون الاحترافي',
      description: 'التعامل مع مايكات الكوندنسر والديناميك، ضبط مسافة الـ Pop Filter، وتقنيات التسجيل النظيف.',
      lessons: [
        {
          title: 'الدرس 01: أسرار هندسة الصوت وعزل الاستوديو',
          description: 'كيف تحصل على صوت إذاعي عميق ونقي بدون ضوضاء الغرفة.',
          contentType: LessonContentType.VIDEO,
          contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          durationMinutes: 28,
          isFreePreview: false,
        },
        {
          title: 'الدرس 02: تطبيق عملي: تسجيل أول Take في الاستوديو',
          description: 'خطوات ضبط مدخلات كارت الصوت ومستويات Gain.',
          contentType: LessonContentType.AUDIO,
          contentUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_rain.ogg',
          durationMinutes: 20,
          isFreePreview: false,
        },
        {
          title: 'الدرس 03: تكليف صوتي: إعلان وثائقي (60 ثانية)',
          description: 'سجل المقطع الوثائقي المرفق وارفعه لتقييم المدرب.',
          contentType: LessonContentType.TEXT,
          contentUrl: 'https://zeinhub.com/files/documentary-script.pdf',
          durationMinutes: 15,
          isFreePreview: false,
        },
      ],
    },
    {
      title: 'الأسبوع 03: التقديم الإخباري ومحاكاة الأوتوكيو والبث الحي',
      description: 'لغة الجسد أمام الكاميرا، مواجهة الجمهور، وسرعة البديهة في غرف الأخبار.',
      lessons: [
        {
          title: 'الدرس 01: لغة الجسد والنظرة للكاميرا في الأستوديو',
          description: 'كيف تظهر بثقة ووقار على الشاشة دون توتر.',
          contentType: LessonContentType.VIDEO,
          contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          durationMinutes: 30,
          isFreePreview: false,
        },
        {
          title: 'الدرس 02: قراءة موجز الأخبار العاجلة مع الأوتوكيو',
          description: 'محاكاة كاملة لقراءة شريط الأخبار مع التفاعل الصوتي.',
          contentType: LessonContentType.VIDEO,
          contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          durationMinutes: 22,
          isFreePreview: false,
        },
      ],
    },
    {
      title: 'الأسبوع 04: مشروع التخرج وبناء البورتفوليو الصوتي والإعلامي',
      description: 'إنتاج الـ Demo Reel النهائي واعتماده لاستخراج الشهادة الرسمية.',
      lessons: [
        {
          title: 'الدرس 01: صناعة الـ Showreel والـ Voice Demo الاحترافي',
          description: 'تجميع أفضل أعمالك في ملف صوتي مدته 90 ثانية لتقديمه لشركات الإنتاج.',
          contentType: LessonContentType.VIDEO,
          contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          durationMinutes: 25,
          isFreePreview: false,
        },
        {
          title: 'الدرس 02: تسليم مشروع التخرج النهائي (Capstone Take)',
          description: 'ارفع مشروع التخرج المكتمل لاعتماده من اللجنة واستخراج شهادتك.',
          contentType: LessonContentType.TEXT,
          contentUrl: 'https://zeinhub.com/files/capstone-brief.pdf',
          durationMinutes: 30,
          isFreePreview: false,
        },
      ],
    },
  ];

  for (const prog of allPrograms) {
    const existingCount = await Module.countDocuments({ programId: prog._id });
    if (existingCount > 0) {
      console.log(`ℹ️ Program (${prog.titleAr}) already has ${existingCount} modules.`);
      continue;
    }

    for (let mIdx = 0; mIdx < weeks.length; mIdx++) {
      const week = weeks[mIdx];
      const newMod = await Module.create({
        programId: prog._id,
        title: week.title,
        description: week.description,
        order: mIdx + 1,
        isPublished: true,
      });

      for (let lIdx = 0; lIdx < week.lessons.length; lIdx++) {
        const l = week.lessons[lIdx];
        await Lesson.create({
          moduleId: newMod._id,
          programId: prog._id,
          title: l.title,
          description: l.description,
          contentType: l.contentType,
          contentUrl: l.contentUrl,
          durationMinutes: l.durationMinutes,
          isFreePreview: l.isFreePreview,
          isPublished: true,
          order: lIdx + 1,
          resources: [],
        });
      }
    }

    console.log(`✅ Seeded 4 modules and 10 lessons for (${prog.titleAr})`);
  }

  console.log('🎉 Course modules & lessons seeded successfully!');
  await mongoose.connection.close();
  process.exit(0);
}

seedModulesAndLessons().catch((err) => {
  console.error('❌ Error seeding modules:', err);
  process.exit(1);
});
