import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { User } from '../src/models/user.model.js';
import { Program } from '../src/models/program.model.js';
import { Enrollment } from '../src/models/enrollment.model.js';
import { Review, ReviewStatus } from '../src/models/review.model.js';
import { UserRole } from '../src/constants/roles.enum.js';
import { EnrollmentStatus } from '../src/constants/enrollmentStatus.enum.js';

const arabicReviewsData = [
  {
    rating: 5,
    comment: 'تجربة استثنائية في استوديوهات الصوت بصعيد مصر. التدريب العملي مع د. طارق غير من قدراتي في التحكم بطبقات الصوت ومخارج الحروف تماماً.',
    status: ReviewStatus.APPROVED,
    isFeatured: true,
  },
  {
    rating: 5,
    comment: 'أقوى دبلوم في الإلقاء وتقديم النشرات الإخبارية. أسلوب التدريب يحاكي غرف الأخبار الحقيقية وشعرت بفرق هائل في ثقتي أمام الكاميرا.',
    status: ReviewStatus.APPROVED,
    isFeatured: true,
  },
  {
    rating: 4,
    comment: 'المحتوى ثري جداً والتركيز على تطبيقات الذكاء الاصطناعي في المونتاج الصوتي أضاف لي الكثير. أنصح كل مهتم بالإعلام بالانضمام للبرنامج.',
    status: ReviewStatus.PENDING,
    isFeatured: false,
  },
  {
    rating: 5,
    comment: 'بيئة تعليمية متميزة واحترافية من القائمين على المنصة. مشروعي التخرجي حاز على إشادة كبرى القنوات الإذاعية.',
    status: ReviewStatus.APPROVED,
    isFeatured: false,
  },
];

async function seedArabicReviews() {
  try {
    console.log('🔄 Connecting to Database...');
    await connectDB();

    console.log('🧹 Cleaning old reviews...');
    await Review.deleteMany({});

    const students = await User.find({ role: UserRole.STUDENT });
    const programs = await Program.find({ status: 'open' });

    if (students.length === 0 || programs.length === 0) {
      console.log('⚠️ No students or programs found to attach reviews.');
      process.exit(1);
    }

    for (let i = 0; i < arabicReviewsData.length; i++) {
      const revData = arabicReviewsData[i];
      const student = students[i % students.length];
      const program = programs[i % programs.length];

      // Ensure student has enrollment in this program
      let enrollment = await Enrollment.findOne({ studentId: student._id, programId: program._id });
      if (!enrollment) {
        enrollment = await Enrollment.create({
          studentId: student._id,
          programId: program._id,
          status: EnrollmentStatus.ACTIVE,
          progressPercentage: 80,
          enrolledAt: new Date(),
        });
      }

      await Review.create({
        studentId: student._id,
        programId: program._id,
        rating: revData.rating,
        comment: revData.comment,
        status: revData.status,
        isFeatured: revData.isFeatured,
      });

      console.log(`   ✅ Seeded Review by: ${student.fullName} for: ${program.titleAr} (${revData.rating} ⭐)`);
    }

    console.log('🎉 Successfully seeded Arabic Reviews & Testimonials!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Arabic reviews:', error);
    process.exit(1);
  }
}

seedArabicReviews();
