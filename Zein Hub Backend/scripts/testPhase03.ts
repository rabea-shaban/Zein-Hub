import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { User, Track, Program, InstructorProfile } from '../src/models/index.js';
import { UserRole } from '../src/constants/roles.enum.js';
import { ProgramStatus } from '../src/constants/programStatus.enum.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function setupTestData() {
  await connectDB();

  // Create a Track for test programs
  let track = await Track.findOne({ slug: 'audio-media-test' });
  if (!track) {
    track = await Track.create({
      nameAr: 'مجال الصوت والإعلام التجريبي',
      nameEn: 'Audio & Media Test Track',
      slug: 'audio-media-test',
      descriptionAr: 'مسار تجريبي',
      order: 1,
      isActive: true,
    });
  }

  // Create Program A
  let programA = await Program.findOne({ slug: 'voice-over-test' });
  if (!programA) {
    programA = await Program.create({
      titleAr: 'التعليق الصوتي والفوكاليز الرقمي',
      titleEn: 'Voice-Over & Digital Vocalise Test',
      slug: 'voice-over-test',
      trackId: track._id,
      descriptionAr: 'برنامج تدريبي مخصص',
      status: ProgramStatus.OPEN,
      durationWeeks: 6,
      order: 1,
      isActive: true,
    });
  }

  // Create Program B (Unassigned to instructor)
  let programB = await Program.findOne({ slug: 'smart-podcasting-test' });
  if (!programB) {
    programB = await Program.create({
      titleAr: 'صناعة البودكاست الذكي',
      titleEn: 'Smart Podcasting Test',
      slug: 'smart-podcasting-test',
      trackId: track._id,
      descriptionAr: 'برنامج تدريبي للبودكاست',
      status: ProgramStatus.COMING_SOON,
      durationWeeks: 4,
      order: 2,
      isActive: true,
    });
  }

  // Create Instructor User
  let instructorUser = await User.findOne({ email: 'instructor.ahmed@zeinhub.com' });
  if (!instructorUser) {
    instructorUser = await User.create({
      fullName: 'Ahmed Voice Instructor',
      email: 'instructor.ahmed@zeinhub.com',
      password: 'InstructorPassword123!',
      phone: '01122334455',
      role: UserRole.INSTRUCTOR,
      isActive: true,
    });
  }

  // Create / Update Instructor Profile with assigned Program A only
  let instructorProfile = await InstructorProfile.findOne({ userId: instructorUser._id });
  if (!instructorProfile) {
    instructorProfile = await InstructorProfile.create({
      userId: instructorUser._id,
      bio: 'Professional Voice Over artist & trainer',
      specializations: ['Voice Over', 'Vocal Techniques'],
      assignedPrograms: [programA._id],
      isActive: true,
    });
  } else {
    instructorProfile.assignedPrograms = [programA._id as any];
    await instructorProfile.save();
  }

  console.log('✅ Test Data Setup Complete:');
  console.log(`   Program A (Assigned): ${programA._id} [${programA.slug}]`);
  console.log(`   Program B (Unassigned): ${programB._id} [${programB.slug}]`);
  console.log(`   Instructor: ${instructorUser.email}`);

  await mongoose.connection.close();

  return {
    programAId: programA._id.toString(),
    programBId: programB._id.toString(),
    instructorEmail: 'instructor.ahmed@zeinhub.com',
    instructorPassword: 'InstructorPassword123!',
  };
}

async function runTests() {
  console.log('\n=========================================');
  console.log('🧪 Starting Phase 03 Automated Verifications');
  console.log('=========================================\n');

  const testEnv = await setupTestData();

  let studentAccessToken = '';
  let studentRefreshToken = '';
  let superAdminAccessToken = '';
  let instructorAccessToken = '';

  const studentEmail = `student_${Date.now()}@example.com`;

  // Test 1: Student Registration
  console.log('🔹 Test 1: Student Registration (POST /auth/register)');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Sara Student',
      email: studentEmail,
      password: 'StrongStudentPass123!',
      phone: '01012345678',
    }),
  });
  const regData: any = await regRes.json();
  if (regRes.status === 201 && regData.data.user.role === 'student' && regData.data.tokens.accessToken) {
    console.log('   ✅ PASS: Student registered successfully with role student');
    studentAccessToken = regData.data.tokens.accessToken;
    studentRefreshToken = regData.data.tokens.refreshToken;
  } else {
    console.error('   ❌ FAIL:', regData);
    process.exit(1);
  }

  // Test 2: Role Injection Prevention
  console.log('\n🔹 Test 2: Registration Role Injection (trying role = super_admin)');
  const injectEmail = `hacker_${Date.now()}@example.com`;
  const injectRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Hacker User',
      email: injectEmail,
      password: 'StrongPassword123!',
      role: 'super_admin',
    }),
  });
  const injectData: any = await injectRes.json();
  if (injectRes.status === 201 && injectData.data.user.role === 'student') {
    console.log('   ✅ PASS: Role parameter ignored, account created strictly as student');
  } else {
    console.error('   ❌ FAIL:', injectData);
    process.exit(1);
  }

  // Test 3: Duplicate Email Prevention
  console.log('\n🔹 Test 3: Duplicate Email Registration (POST /auth/register)');
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Sara Duplicate',
      email: studentEmail,
      password: 'StrongStudentPass123!',
    }),
  });
  const dupData: any = await dupRes.json();
  if (dupRes.status === 409) {
    console.log('   ✅ PASS: Returns 409 Conflict for duplicate email');
  } else {
    console.error('   ❌ FAIL: Expected 409, got', dupRes.status, dupData);
    process.exit(1);
  }

  // Test 4: Valid Student Login
  console.log('\n🔹 Test 4: Valid Student Login (POST /auth/login)');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentEmail,
      password: 'StrongStudentPass123!',
    }),
  });
  const loginData: any = await loginRes.json();
  if (loginRes.status === 200 && loginData.data.tokens.accessToken && loginData.data.user.email === studentEmail) {
    console.log('   ✅ PASS: Login successful, returned accessToken and refreshToken');
  } else {
    console.error('   ❌ FAIL:', loginData);
    process.exit(1);
  }

  // Test 5: Invalid Password Login
  console.log('\n🔹 Test 5: Wrong Password Login (POST /auth/login)');
  const wrongPassRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentEmail,
      password: 'WrongPassword999!',
    }),
  });
  const wrongPassData: any = await wrongPassRes.json();
  if (wrongPassRes.status === 401) {
    console.log('   ✅ PASS: Returns 401 Unauthorized for incorrect password');
  } else {
    console.error('   ❌ FAIL:', wrongPassData);
    process.exit(1);
  }

  // Test 6: Profile without token
  console.log('\n🔹 Test 6: Get Profile without Token (GET /auth/profile)');
  const noTokenRes = await fetch(`${BASE_URL}/auth/profile`);
  const noTokenData: any = await noTokenRes.json();
  if (noTokenRes.status === 401) {
    console.log('   ✅ PASS: Returns 401 Unauthorized when Authorization header is missing');
  } else {
    console.error('   ❌ FAIL:', noTokenData);
    process.exit(1);
  }

  // Test 7: Profile with valid token
  console.log('\n🔹 Test 7: Get Profile with Valid Token (GET /auth/profile)');
  const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${studentAccessToken}` },
  });
  const profileData: any = await profileRes.json();
  if (profileRes.status === 200 && profileData.data.user.email === studentEmail) {
    console.log('   ✅ PASS: User profile retrieved successfully with Bearer token');
  } else {
    console.error('   ❌ FAIL:', profileData);
    process.exit(1);
  }

  // Test 8: Student accessing Admin Test Route
  console.log('\n🔹 Test 8: Student accessing Admin Test Route (GET /auth/admin-test)');
  const studentAdminRes = await fetch(`${BASE_URL}/auth/admin-test`, {
    headers: { Authorization: `Bearer ${studentAccessToken}` },
  });
  const studentAdminData: any = await studentAdminRes.json();
  if (studentAdminRes.status === 403) {
    console.log('   ✅ PASS: Returns 403 Forbidden for Student accessing Super Admin endpoint');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', studentAdminRes.status, studentAdminData);
    process.exit(1);
  }

  // Test 9: Super Admin Login & accessing Admin Test Route
  console.log('\n🔹 Test 9: Super Admin Login & accessing Admin Test Route');
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@zeinhub.com',
      password: 'Admin@ZeinHub2026!',
    }),
  });
  const adminLoginData: any = await adminLoginRes.json();
  superAdminAccessToken = adminLoginData.data.tokens.accessToken;

  const adminTestRes = await fetch(`${BASE_URL}/auth/admin-test`, {
    headers: { Authorization: `Bearer ${superAdminAccessToken}` },
  });
  const adminTestData: any = await adminTestRes.json();
  if (adminTestRes.status === 200 && adminTestData.data.currentUser.role === 'super_admin') {
    console.log('   ✅ PASS: Super Admin authenticated and accessed admin-test route');
  } else {
    console.error('   ❌ FAIL:', adminTestData);
    process.exit(1);
  }

  // Test 10: Student accessing Student Test Route
  console.log('\n🔹 Test 10: Student accessing Student Test Route (GET /auth/student-test)');
  const studentTestRes = await fetch(`${BASE_URL}/auth/student-test`, {
    headers: { Authorization: `Bearer ${studentAccessToken}` },
  });
  const studentTestData: any = await studentTestRes.json();
  if (studentTestRes.status === 200) {
    console.log('   ✅ PASS: Student accessed student-test route successfully');
  } else {
    console.error('   ❌ FAIL:', studentTestData);
    process.exit(1);
  }

  // Instructor Login
  const instructorLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEnv.instructorEmail,
      password: testEnv.instructorPassword,
    }),
  });
  const instructorLoginData: any = await instructorLoginRes.json();
  instructorAccessToken = instructorLoginData.data.tokens.accessToken;

  // Test 11: Instructor accessing Assigned Program
  console.log(`\n🔹 Test 11: Instructor accessing Assigned Program [${testEnv.programAId}]`);
  const assignedRes = await fetch(`${BASE_URL}/auth/instructor-test/${testEnv.programAId}`, {
    headers: { Authorization: `Bearer ${instructorAccessToken}` },
  });
  const assignedData: any = await assignedRes.json();
  if (assignedRes.status === 200) {
    console.log('   ✅ PASS: Instructor authorized to access assigned program');
  } else {
    console.error('   ❌ FAIL: Expected 200, got', assignedRes.status, assignedData);
    process.exit(1);
  }

  // Test 12: Instructor accessing Unassigned Program
  console.log(`\n🔹 Test 12: Instructor accessing Unassigned Program [${testEnv.programBId}]`);
  const unassignedRes = await fetch(`${BASE_URL}/auth/instructor-test/${testEnv.programBId}`, {
    headers: { Authorization: `Bearer ${instructorAccessToken}` },
  });
  const unassignedData: any = await unassignedRes.json();
  if (unassignedRes.status === 403) {
    console.log('   ✅ PASS: Returns 403 Forbidden when Instructor tries to access unassigned program');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unassignedRes.status, unassignedData);
    process.exit(1);
  }

  // Test 13: Invalid JWT Token
  console.log('\n🔹 Test 13: Invalid JWT Token signature');
  const invalidJwtRes = await fetch(`${BASE_URL}/auth/profile`, {
    headers: { Authorization: 'Bearer invalid.jwt.token.here' },
  });
  const invalidJwtData: any = await invalidJwtRes.json();
  if (invalidJwtRes.status === 401) {
    console.log('   ✅ PASS: Returns 401 Unauthorized for malformed/invalid JWT token');
  } else {
    console.error('   ❌ FAIL:', invalidJwtData);
    process.exit(1);
  }

  // Test 14: Refresh Token Flow
  console.log('\n🔹 Test 14: Refresh Access Token (POST /auth/refresh-token)');
  const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: studentRefreshToken }),
  });
  const refreshData: any = await refreshRes.json();
  if (refreshRes.status === 200 && refreshData.data.accessToken) {
    console.log('   ✅ PASS: New access token issued successfully via refresh token');

    // Verify new token works
    const newProfileRes = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${refreshData.data.accessToken}` },
    });
    if (newProfileRes.status === 200) {
      console.log('   ✅ PASS: New access token authenticated profile endpoint successfully');
    } else {
      console.error('   ❌ FAIL with new token');
      process.exit(1);
    }
  } else {
    console.error('   ❌ FAIL:', refreshData);
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL 14 PHASE 03 TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Error running Phase 03 tests:', err);
  process.exit(1);
});
