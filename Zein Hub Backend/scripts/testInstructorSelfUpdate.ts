import mongoose from 'mongoose';
import { User } from '../src/models/user.model.js';
import { InstructorProfile } from '../src/models/instructorProfile.model.js';
import { ENV } from '../src/config/env.config.js';
import { UserRole } from '../src/constants/roles.enum.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function testInstructorSelfUpdate() {
  console.log('=========================================');
  console.log('👨‍🏫 Testing Instructor Profile Self-Update (Photo, Bio, Password, Social Links)');
  console.log('=========================================\n');

  // Step 0: Ensure fresh instructor user in database
  const mongoUri = process.env.MONGODB_URI || ENV.MONGODB_URI || 'mongodb://127.0.0.1:27017/zein_hub';
  await mongoose.connect(mongoUri);
  let instructorUser = await User.findOne({ email: 'instructor.voice10@zeinhub.com' });
  if (!instructorUser) {
    instructorUser = new User({
      fullName: 'Dr. Tarek Initial Voice Coach',
      email: 'instructor.voice10@zeinhub.com',
      password: 'InstructorPass123!',
      role: UserRole.INSTRUCTOR,
      isActive: true,
    });
    await instructorUser.save();
  } else {
    instructorUser.password = 'InstructorPass123!';
    await instructorUser.save();
  }

  await InstructorProfile.findOneAndUpdate(
    { userId: instructorUser._id },
    {
      $set: {
        userId: instructorUser._id,
        bio: 'Initial biography for voice coach.',
        specializations: ['Voice Over'],
        experienceYears: 10,
        isActive: true,
      },
    },
    { upsert: true }
  );

  await mongoose.connection.close();

  // Step 1: Login as Instructor
  console.log('🔹 Step 1: Login as Instructor');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'instructor.voice10@zeinhub.com',
      password: 'InstructorPass123!',
    }),
  });

  const setCookie = loginRes.headers.get('set-cookie') || '';
  const accessTokenMatch = setCookie.match(/zh_access_token=([^;]+)/);
  const cookie = accessTokenMatch ? `zh_access_token=${accessTokenMatch[1]}` : '';

  if (loginRes.status !== 200 || !cookie) {
    console.error('❌ Failed to login as instructor:', await loginRes.json());
    process.exit(1);
  }
  console.log('   ✅ PASS: Logged in successfully');

  // Step 2: Update Profile (Photo, Bio, Password, Social Links)
  console.log('\n🔹 Step 2: Update Profile (Photo, Bio, Password, Social Links)');
  const updateRes = await fetch(`${BASE_URL}/instructors/me/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify({
      fullName: 'Dr. Tarek Updated Voice Coach',
      phone: '+201099991111',
      avatarUrl: 'https://cdn.zeinhub.com/avatars/dr_tarek_v2.jpg',
      photoUrl: 'https://cdn.zeinhub.com/avatars/dr_tarek_v2.jpg',
      bio: 'خبير إذاعي ومدرب صوتي معتمد لأكثر من 16 عاماً في التعليق الصوتي المتقدم.',
      specializations: ['Voice Over', 'Vocal Acoustics', 'Smart Podcasting'],
      experienceYears: 16,
      reelUrl: 'https://cdn.zeinhub.com/reels/dr_tarek_showreel_2026.mp4',
      currentPassword: 'InstructorPass123!',
      newPassword: 'BrandNewPass2026!',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/drtarekvoice',
        youtube: 'https://youtube.com/@drtarekvoice',
        portfolio: 'https://drtarekvoice.com',
      },
    }),
  });

  const updateData: any = await updateRes.json();
  if (
    updateRes.status === 200 &&
    updateData.data?.user?.fullName === 'Dr. Tarek Updated Voice Coach' &&
    updateData.data?.user?.avatarUrl === 'https://cdn.zeinhub.com/avatars/dr_tarek_v2.jpg' &&
    updateData.data?.instructorProfile?.experienceYears === 16 &&
    updateData.data?.instructorProfile?.socialLinks?.portfolio === 'https://drtarekvoice.com'
  ) {
    console.log('   ✅ PASS: Profile fields updated successfully:');
    console.log(`      - Full Name: ${updateData.data.user.fullName}`);
    console.log(`      - Avatar: ${updateData.data.user.avatarUrl}`);
    console.log(`      - Experience Years: ${updateData.data.instructorProfile.experienceYears}`);
    console.log(`      - Specializations: ${updateData.data.instructorProfile.specializations.join(', ')}`);
    console.log(`      - Portfolio: ${updateData.data.instructorProfile.socialLinks.portfolio}`);
  } else {
    console.error('   ❌ FAIL: Update failed:', updateData);
    process.exit(1);
  }

  // Step 3: Login with NEW Password to verify password change
  console.log('\n🔹 Step 3: Login with NEW Password to verify password hashing & update');
  const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'instructor.voice10@zeinhub.com',
      password: 'BrandNewPass2026!',
    }),
  });

  const newLoginData: any = await newLoginRes.json();
  if (newLoginRes.status === 200 && newLoginData.success) {
    console.log('   ✅ PASS: Successfully authenticated with the NEW updated password!');
  } else {
    console.error('   ❌ FAIL: Could not login with new password:', newLoginData);
    process.exit(1);
  }

  // Step 4: Revert password back for test idempotency
  const newSetCookie = newLoginRes.headers.get('set-cookie') || '';
  const newCookie = `zh_access_token=${newSetCookie.match(/zh_access_token=([^;]+)/)?.[1] || ''}`;

  await fetch(`${BASE_URL}/instructors/me/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: newCookie,
    },
    body: JSON.stringify({
      newPassword: 'InstructorPass123!',
    }),
  });

  console.log('\n=========================================');
  console.log('🎉 INSTRUCTOR PROFILE & PASSWORD UPDATE TESTS PASSED 100%!');
  console.log('=========================================\n');
}

testInstructorSelfUpdate().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
