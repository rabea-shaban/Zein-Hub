import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.config.js';
import { User } from '../src/models/user.model.js';
import { Program } from '../src/models/program.model.js';
import { Application } from '../src/models/application.model.js';
import { Enrollment } from '../src/models/enrollment.model.js';
import { UserRole } from '../src/constants/roles.enum.js';
import { ApplicationStatus } from '../src/constants/applicationStatus.enum.js';
import { EnrollmentStatus } from '../src/constants/enrollmentStatus.enum.js';

const arabicStudentsData = [
  {
    fullName: 'أحمد محمود الصعيدي',
    email: 'ahmed.saidi@gmail.com',
    phone: '+201011112222',
    motivation: 'شغوف بمجال التعليق الصوتي والإنتاج الإذاعي، وأرغب في احتراف الفوكاليز وتقديم البرامج بصعيد مصر.',
    status: ApplicationStatus.ACCEPTED,
    reviewNotes: 'عينة صوتية متميزة واستعداد عملي عالي. تم القبول بالدفعة الأولى.',
  },
  {
    fullName: 'مريم عصام الأبنودي',
    email: 'mariam.abnoud@gmail.com',
    phone: '+201033334444',
    motivation: 'خريجة إعلام أسيوط، وأرغب في صقل مهارات قراءة النشرات الإخبارية وإدارة الحوارات التلفزيونية.',
    status: ApplicationStatus.ACCEPTED,
    reviewNotes: 'مخارج ألفاظ سليمة وثقة عالية أمام الكاميرا. تم القبول بنجاح.',
  },
  {
    fullName: 'يوسف عبد الرحمن القناوي',
    email: 'youssef.qena@gmail.com',
    phone: '+201055556666',
    motivation: 'صانع محتوى رقمي وأتطلع لاستخدام أدوات الذكاء الاصطناعي في هندسة الصوت والمونتاج الإخباري.',
    status: ApplicationStatus.PENDING,
    reviewNotes: '',
  },
  {
    fullName: 'نورهان كمال الأسواني',
    email: 'nourhan.aswan@gmail.com',
    phone: '+201077778888',
    motivation: 'طالبة في كلية الإعلام، وأرغب في بناء بورتفوليو احترافي في تقديم البودكاست الثقافي والإخباري.',
    status: ApplicationStatus.PENDING,
    reviewNotes: '',
  },
];

async function seedArabicApplications() {
  try {
    console.log('🔄 Connecting to Database...');
    await connectDB();

    console.log('🧹 Cleaning old test applications and student users...');
    await Application.deleteMany({});
    await Enrollment.deleteMany({});
    await User.deleteMany({ role: UserRole.STUDENT });

    const openPrograms = await Program.find({ status: 'open' });
    if (openPrograms.length === 0) {
      console.log('⚠️ No open programs found.');
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash('StudentPass2026!', 10);

    for (let i = 0; i < arabicStudentsData.length; i++) {
      const sData = arabicStudentsData[i];
      const program = openPrograms[i % openPrograms.length];

      // Create Student
      const student = await User.create({
        fullName: sData.fullName,
        email: sData.email,
        phone: sData.phone,
        password: hashedPassword,
        role: UserRole.STUDENT,
        isActive: true,
      });

      // Create Application
      const app = await Application.create({
        studentId: student._id,
        programId: program._id,
        status: sData.status,
        motivation: sData.motivation,
        reviewNotes: sData.reviewNotes || undefined,
        reviewedAt: sData.status !== ApplicationStatus.PENDING ? new Date() : undefined,
      });

      // If accepted, create active enrollment
      if (sData.status === ApplicationStatus.ACCEPTED) {
        await Enrollment.create({
          studentId: student._id,
          programId: program._id,
          status: EnrollmentStatus.ACTIVE,
          progressPercentage: i === 0 ? 65 : 40,
          enrolledAt: new Date(),
        });
      }

      console.log(`   ✅ Seeded Application: ${student.fullName} -> ${program.titleAr} (${sData.status})`);
    }

    console.log('🎉 Successfully seeded Arabic Student Applications & Enrollments!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Arabic applications:', error);
    process.exit(1);
  }
}

seedArabicApplications();
