import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { User } from '../src/models/user.model.js';
import { Program } from '../src/models/program.model.js';
import { Track } from '../src/models/track.model.js';
import { InstructorProfile } from '../src/models/instructorProfile.model.js';
import { UserRole } from '../src/constants/roles.enum.js';

async function seedInstructor() {
  console.log('=========================================');
  console.log('🎙️ Seeding Instructor: Eng. Abdelrahman Sultan...');
  console.log('=========================================');

  await connectDB();

  const email = 'abdelrahman.sultan@zeinhub.com';
  let instructor = await User.findOne({ email });

  if (!instructor) {
    instructor = new User({
      fullName: 'م. عبد الرحمن سلطان',
      email,
      password: 'Instructor@ZeinHub2026!',
      phone: '01000000000',
      role: UserRole.INSTRUCTOR,
      avatarUrl: '/images/instructors/abdelrahman-sultan.jpg',
      isActive: true,
    });
    await instructor.save();
    console.log(`✅ Created Instructor user: ${instructor.fullName} (${instructor.email})`);
  } else {
    instructor.fullName = 'م. عبد الرحمن سلطان';
    instructor.role = UserRole.INSTRUCTOR;
    instructor.avatarUrl = '/images/instructors/abdelrahman-sultan.jpg';
    instructor.isActive = true;
    await instructor.save();
    console.log(`ℹ️ Updated Instructor user: ${instructor.fullName} (${instructor.email})`);
  }

  // Find Track & Program
  const audioTrack = await Track.findOne({ slug: 'audio-media' });
  const voiceOverProgram = await Program.findOne({ slug: 'voice-over-digital-vocalise' });

  if (voiceOverProgram) {
    voiceOverProgram.instructorId = instructor._id as mongoose.Types.ObjectId;
    await voiceOverProgram.save();
    console.log(`🔗 Successfully linked instructor [${instructor.fullName}] to program [${voiceOverProgram.titleAr}]`);
  }

  // Create or Update InstructorProfile
  let profile = await InstructorProfile.findOne({ userId: instructor._id });
  if (!profile) {
    profile = new InstructorProfile({
      userId: instructor._id,
      specializationTrackId: audioTrack?._id || null,
      specializations: [
        'التعليق الصوتي (Voice-Over)',
        'الفوكاليز وهندسة الصوت',
        'العمل الحر (Freelancing)',
        'معتمد من منصة Soundeals',
      ],
      bio: 'صاحب خبرة حقيقية اكتسبها من قلب السوق المصري والخليجي لأكثر من 9 سنوات. احترف العمل كمعلق صوتي مستقل (Freelancer) والتعامل مع كافة قوالب النصوص الإعلانية والوثائقية، ومعتمد رسميًا من منصة سونديلز (Soundeals). اتعلم من واحد عاش التجربة، مش بس بيشرحها.',
      experienceYears: 9,
      assignedPrograms: voiceOverProgram ? [voiceOverProgram._id] : [],
      photoUrl: '/images/instructors/abdelrahman-sultan.jpg',
      isActive: true,
      socialLinks: {
        linkedin: 'https://linkedin.com',
      },
    });
    await profile.save();
    console.log(`✅ Created InstructorProfile for ${instructor.fullName}`);
  } else {
    profile.specializationTrackId = audioTrack?._id || null;
    profile.specializations = [
      'التعليق الصوتي (Voice-Over)',
      'الفوكاليز وهندسة الصوت',
      'العمل الحر (Freelancing)',
      'معتمد من منصة Soundeals',
    ];
    profile.bio = 'صاحب خبرة حقيقية اكتسبها من قلب السوق المصري والخليجي لأكثر من 9 سنوات. احترف العمل كمعلق صوتي مستقل (Freelancer) والتعامل مع كافة قوالب النصوص الإعلانية والوثائقية، ومعتمد رسميًا من منصة سونديلز (Soundeals). اتعلم من واحد عاش التجربة، مش بس بيشرحها.';
    profile.experienceYears = 9;
    profile.assignedPrograms = voiceOverProgram ? [voiceOverProgram._id] : [];
    profile.photoUrl = '/images/instructors/abdelrahman-sultan.jpg';
    profile.isActive = true;
    await profile.save();
    console.log(`ℹ️ Updated InstructorProfile for ${instructor.fullName}`);
  }

  console.log('=========================================');
  console.log('🎉 Instructor Profile is LIVE in MongoDB Atlas!');
  console.log('=========================================');

  await mongoose.connection.close();
  console.log('Database connection closed.');
  process.exit(0);
}

seedInstructor().catch((err) => {
  console.error('❌ Failed to seed instructor:', err);
  process.exit(1);
});
