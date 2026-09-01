import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { User } from '../src/models/user.model.js';
import { Program } from '../src/models/program.model.js';
import { Enrollment } from '../src/models/enrollment.model.js';
import { Certificate } from '../src/models/certificate.model.js';
import { UserRole } from '../src/constants/roles.enum.js';

async function seedCertificates() {
  console.log('🔄 Connecting to MongoDB to seed verified graduation certificates...');
  await connectDB();

  // Drop obsolete unique index on enrollmentId if exists
  try {
    await Certificate.collection.dropIndex('enrollmentId_1');
    console.log('✅ Dropped obsolete enrollmentId_1 index');
  } catch (idxErr) {
    // Ignore if not present
  }

  const students = await User.find({ role: UserRole.STUDENT });
  const programs = await Program.find({});

  console.log(`Found ${students.length} students and ${programs.length} programs.`);

  if (students.length > 0 && programs.length > 0) {
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const prog = programs[i % programs.length];
      const certNum = `ZH-CERT-2026-${8800 + i}`;

      const enrollment = await Enrollment.findOne({
        studentId: student._id,
        programId: prog._id,
      });

      const existing = await Certificate.findOne({
        studentId: student._id,
        programId: prog._id,
      });

      if (!existing) {
        await Certificate.create({
          certificateNumber: certNum,
          studentId: student._id,
          programId: prog._id,
          enrollmentId: enrollment?._id || new mongoose.Types.ObjectId(),
          finalGrade: 94 + (i % 5),
          issuedAt: new Date(),
          isRevoked: false,
          certificateUrl: `/certificates/${certNum}`,
          verificationUrl: `/certificates/${certNum}`,
        });
        console.log(`✅ Created Certificate (${certNum}) for Student (${student.fullName}) in (${prog.titleAr})`);
      } else {
        console.log(`ℹ️ Certificate already exists for (${student.fullName})`);
      }
    }
  }

  console.log('🎉 Certificates seeded successfully!');
  await mongoose.connection.close();
  process.exit(0);
}

seedCertificates().catch((err) => {
  console.error('❌ Error seeding certificates:', err);
  process.exit(1);
});
