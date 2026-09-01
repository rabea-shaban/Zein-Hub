import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { User } from '../src/models/user.model.js';
import { Program } from '../src/models/program.model.js';
import { InstructorProfile } from '../src/models/instructorProfile.model.js';
import { Enrollment } from '../src/models/enrollment.model.js';
import { UserRole } from '../src/constants/roles.enum.js';
import { EnrollmentStatus } from '../src/constants/enrollmentStatus.enum.js';

async function linkAllInstructorStudents() {
  console.log('🔄 Connecting to MongoDB to link instructor programs & students...');
  await connectDB();

  const allPrograms = await Program.find({});
  const instructors = await User.find({ role: UserRole.INSTRUCTOR });

  console.log(`Found ${allPrograms.length} programs and ${instructors.length} instructors.`);

  if (allPrograms.length > 0 && instructors.length > 0) {
    // Distribute programs across instructors
    for (let i = 0; i < instructors.length; i++) {
      const inst = instructors[i];
      const prog = allPrograms[i % allPrograms.length];

      // Assign instructor to program
      prog.instructorId = inst._id;
      await prog.save();

      // Update instructor profile assignedPrograms
      let profile = await InstructorProfile.findOne({ userId: inst._id });
      if (!profile) {
        profile = new InstructorProfile({
          userId: inst._id,
          bio: 'خبير ومدرب إعلامي وصوتي معتمد لدى منصة Zein Hub.',
          specializations: ['التدريب الإذاعي والصوتي', 'التقديم التلفزيوني'],
          experienceYears: 12,
          assignedPrograms: [prog._id],
          isActive: true,
        });
      } else {
        if (!profile.assignedPrograms.includes(prog._id)) {
          profile.assignedPrograms.push(prog._id);
        }
      }
      await profile.save();

      console.log(`✅ Assigned Program (${prog.titleAr}) to Instructor (${inst.fullName} - ${inst.email})`);
    }

    // Ensure students exist and are enrolled in these programs
    const students = await User.find({ role: UserRole.STUDENT });
    console.log(`Found ${students.length} students.`);

    for (let j = 0; j < students.length; j++) {
      const student = students[j];
      const targetProg = allPrograms[j % allPrograms.length];

      const existingEnrollment = await Enrollment.findOne({
        studentId: student._id,
        programId: targetProg._id,
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          studentId: student._id,
          programId: targetProg._id,
          status: EnrollmentStatus.ACTIVE,
          progressPercentage: (j + 1) * 20,
          enrolledAt: new Date(),
        });
        console.log(`   🎓 Enrolled Student (${student.fullName}) in Program (${targetProg.titleAr})`);
      } else {
        console.log(`   ℹ️ Student (${student.fullName}) already enrolled in (${targetProg.titleAr})`);
      }
    }
  }

  console.log('🎉 Instructor programs & student enrollments linked successfully!');
  await mongoose.connection.close();
  process.exit(0);
}

linkAllInstructorStudents().catch((err) => {
  console.error('❌ Link error:', err);
  process.exit(1);
});
