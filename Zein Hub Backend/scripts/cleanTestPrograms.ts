import { connectDB } from '../src/config/db.config.js';
import { Program } from '../src/models/program.model.js';
import { Application } from '../src/models/application.model.js';
import { Enrollment } from '../src/models/enrollment.model.js';
import { LiveSession } from '../src/models/liveSession.model.js';
import { Attendance } from '../src/models/attendance.model.js';
import { User } from '../src/models/user.model.js';
import { AttendanceStatus } from '../src/constants/content.enum.js';
import { UserRole } from '../src/constants/roles.enum.js';

async function run() {
  console.log('🔄 Connecting to Database...');
  await connectDB();

  // 1. Delete test programs like 'ربيع' or dummy slugs
  const deleted = await Program.deleteMany({
    $or: [{ titleAr: 'ربيع' }, { slug: 'rby' }, { slug: 'test-program' }],
  });
  console.log(`🧹 Deleted ${deleted.deletedCount} dummy test programs.`);

  // 2. Seed Live Sessions and Attendance for the genuine programs
  const voiceProgram = await Program.findOne({ slug: 'voice-over-digital-vocalise' });
  const newsProgram = await Program.findOne({ slug: 'news-anchoring' });
  const students = await User.find({ role: UserRole.STUDENT });
  const admin = await User.findOne({ role: UserRole.SUPER_ADMIN });

  if (voiceProgram && students.length > 0) {
    // Check or create live session
    let session1 = await LiveSession.findOne({ programId: voiceProgram._id });
    if (!session1) {
      session1 = await LiveSession.create({
        programId: voiceProgram._id,
        title: 'الورشة التطبيقية لمخارج الحروف والفوكاليز الصوتي',
        provider: 'zoom',
        meetingUrl: 'https://zoom.us/j/987654321',
        startTime: new Date(Date.now() - 86400000), // yesterday
        durationMinutes: 90,
        status: 'completed',
        createdBy: admin?._id,
      });
    }

    // Mark attendance
    for (const student of students) {
      await Attendance.findOneAndUpdate(
        { liveSessionId: session1._id, studentId: student._id },
        {
          programId: voiceProgram._id,
          status: AttendanceStatus.PRESENT,
          isPresent: true,
          attendanceMinutes: 85,
          joinedAt: new Date(session1.startTime),
          notes: 'مشاركة فعالة وأداء صوتي ممتاز',
          markedBy: admin?._id,
          markedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }
    console.log(`   ✅ Seeded Attendance records for: ${voiceProgram.titleAr}`);
  }

  if (newsProgram && students.length > 0) {
    let session2 = await LiveSession.findOne({ programId: newsProgram._id });
    if (!session2) {
      session2 = await LiveSession.create({
        programId: newsProgram._id,
        title: 'محاكاة استوديو الأخبار وقراءة النشرات المباشرة',
        provider: 'google-meet',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        startTime: new Date(Date.now() - 172800000),
        durationMinutes: 60,
        status: 'completed',
        createdBy: admin?._id,
      });
    }

    for (const student of students) {
      await Attendance.findOneAndUpdate(
        { liveSessionId: session2._id, studentId: student._id },
        {
          programId: newsProgram._id,
          status: AttendanceStatus.PRESENT,
          isPresent: true,
          attendanceMinutes: 60,
          joinedAt: new Date(session2.startTime),
          notes: 'حضور كامل وتمارين قراءة نشرات حية',
          markedBy: admin?._id,
          markedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }
    console.log(`   ✅ Seeded Attendance records for: ${newsProgram.titleAr}`);
  }

  console.log('🎉 Cleanup and Attendance seeding completed successfully!');
  process.exit(0);
}

run();
