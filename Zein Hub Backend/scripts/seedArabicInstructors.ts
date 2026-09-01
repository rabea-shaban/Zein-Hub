import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.config.js';
import { User } from '../src/models/user.model.js';
import { InstructorProfile } from '../src/models/instructorProfile.model.js';
import { Track } from '../src/models/track.model.js';
import { Program } from '../src/models/program.model.js';
import { UserRole } from '../src/constants/roles.enum.js';

const arabicInstructorsData = [
  {
    fullName: 'د. طارق السوهاجي',
    email: 'dr.tarek@zeinhub.com',
    phone: '+201011223344',
    password: 'InstructorPass2026!',
    trackSlug: 'audio-media',
    specializations: ['التعليق الصوتي', 'الفوكاليز الرقمي', 'هندسة الصوت', 'صناعة البودكاست'],
    bio: 'خبير إذاعي ومدرب صوتي معتمد لأكثر من 15 عاماً لدى كبرى القنوات والمنصات الرقمية في الوطن العربي وصعيد مصر.',
    experienceYears: 16,
    avatarUrl: '/images/instructors/tarek-voice.jpg',
  },
  {
    fullName: 'أ. سارة المنياوي',
    email: 'sara.minya@zeinhub.com',
    phone: '+201022334455',
    password: 'InstructorPass2026!',
    trackSlug: 'audio-media',
    specializations: ['التقديم التلفزيوني', 'قراءة النشرات الإخبارية', 'إدارة الحوارات', 'الأداء المسرحي'],
    bio: 'مذيعة ومقدمة برامج رئيسية ومدربة أداء إعلامي وصوتي معتمدة لتأهيل كوادر الشاشة وغرف الأخبار.',
    experienceYears: 12,
    avatarUrl: '/images/instructors/sara-tv.jpg',
  },
  {
    fullName: 'م. حسام الأقصري',
    email: 'hossam.luxor@zeinhub.com',
    phone: '+201033445566',
    password: 'InstructorPass2026!',
    trackSlug: 'tech-ai-solutions',
    specializations: ['صحافة الذكاء الاصطناعي', 'الإنتاج الرقمي', 'التحقق من التزييف العميق', 'أتمتة المحتوى'],
    bio: 'مستشار تكنولوجيا الإعلام الرقمي ومطور تطبيقات الذكاء الاصطناعي التوليدي والواقع المعزز للإعلاميين.',
    experienceYears: 10,
    avatarUrl: '/images/instructors/hossam-tech.jpg',
  },
  {
    fullName: 'د. ريهام الأسيوطي',
    email: 'reham.assiut@zeinhub.com',
    phone: '+201044556677',
    password: 'InstructorPass2026!',
    trackSlug: 'strategic-growth-pr',
    specializations: ['العلاقات العامة الرقمية', 'إدارة السمعة الإعلامية', 'التسويق الرقمي المؤتمت', 'بناء الهوية'],
    bio: 'استشارية العلاقات العامة وبناء الهوية المؤسسية للمنصات الرقمية والمؤسسات الإعلامية الكبرى.',
    experienceYears: 14,
    avatarUrl: '/images/instructors/reham-pr.jpg',
  },
];

async function seedArabicInstructors() {
  try {
    console.log('🔄 Connecting to Database...');
    await connectDB();

    console.log('🧹 Cleaning old test instructor accounts...');
    const oldInstructors = await User.find({
      role: UserRole.INSTRUCTOR,
      email: { $nin: ['admin@zeinhub.com'] },
    });

    const oldUserIds = oldInstructors.map((u) => u._id);
    await InstructorProfile.deleteMany({ userId: { $in: oldUserIds } });
    await User.deleteMany({ _id: { $in: oldUserIds } });

    console.log('🌱 Seeding Professional Arabic Instructors...');
    const hashedPassword = await bcrypt.hash('InstructorPass2026!', 10);

    for (const instData of arabicInstructorsData) {
      // Find Track
      const track = await Track.findOne({ slug: instData.trackSlug });
      const programs = track ? await Program.find({ trackId: track._id }).select('_id') : [];

      // Create User
      const user = await User.create({
        fullName: instData.fullName,
        email: instData.email,
        phone: instData.phone,
        password: hashedPassword,
        role: UserRole.INSTRUCTOR,
        avatarUrl: instData.avatarUrl,
        isActive: true,
      });

      // Create Profile
      await InstructorProfile.create({
        userId: user._id,
        specializationTrackId: track?._id || null,
        specializations: instData.specializations,
        bio: instData.bio,
        experienceYears: instData.experienceYears,
        photoUrl: instData.avatarUrl,
        assignedPrograms: programs.map((p) => p._id),
        isActive: true,
      });

      console.log(`   ✅ Seeded Instructor: ${instData.fullName} (${instData.email})`);
    }

    console.log('🎉 Successfully seeded all Arabic Instructors!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Arabic instructors:', error);
    process.exit(1);
  }
}

seedArabicInstructors();
