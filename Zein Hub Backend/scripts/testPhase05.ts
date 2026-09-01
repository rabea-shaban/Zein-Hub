import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { User, Track, Program, InstructorProfile } from '../src/models/index.js';
import { UserRole } from '../src/constants/roles.enum.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runPhase05Tests() {
  console.log('=========================================');
  console.log('🧪 Starting Phase 05 Automated Verifications');
  console.log('=========================================\n');

  await connectDB();

  // Find Voice-Over and Podcasting programs for testing
  const voiceOverProg = await Program.findOne({ slug: 'voice-over-digital-vocalise' });
  const podcastingProg = await Program.findOne({ slug: 'smart-podcasting-audio-production' });
  const audioTrack = await Track.findOne({ slug: 'audio-media' });

  if (!voiceOverProg || !podcastingProg || !audioTrack) {
    console.error('❌ Required seed data missing. Run npm run seed:tracks-programs first.');
    process.exit(1);
  }

  // Setup test student account
  let studentUser = await User.findOne({ email: 'student.phase5@zeinhub.com' });
  if (!studentUser) {
    studentUser = await User.create({
      fullName: 'Student Phase 5',
      email: 'student.phase5@zeinhub.com',
      password: 'StudentPassword123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  await mongoose.connection.close();

  // 1. Login as Super Admin
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@zeinhub.com',
      password: 'Admin@ZeinHub2026!',
    }),
  });
  const adminLoginData: any = await adminLoginRes.json();
  const superAdminToken = adminLoginData.data.tokens.accessToken;

  // 2. Login as Student
  const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student.phase5@zeinhub.com',
      password: 'StudentPassword123!',
    }),
  });
  const studentLoginData: any = await studentLoginRes.json();
  const studentToken = studentLoginData.data.tokens.accessToken;

  // Test 1: Student attempting to create an Instructor (Must return 403)
  console.log('🔹 Test 1: Student attempting to create an Instructor (POST /instructors)');
  const studentCreateRes = await fetch(`${BASE_URL}/instructors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      fullName: 'Hacker Instructor',
      email: 'hacker.inst@example.com',
      password: 'Password123!',
      bio: 'Unauthorized instructor attempt',
    }),
  });
  const studentCreateData: any = await studentCreateRes.json();
  if (studentCreateRes.status === 403) {
    console.log('   ✅ PASS: Returns 403 Forbidden for non-admin user');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', studentCreateRes.status, studentCreateData);
    process.exit(1);
  }

  // Test 2: Super Admin creating a new Instructor
  console.log('\n🔹 Test 2: Super Admin creating a new Instructor with specialization and assigned program');
  const instructorEmail = `dr.hassan_${Date.now()}@zeinhub.com`;
  const adminCreateRes = await fetch(`${BASE_URL}/instructors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({
      fullName: 'Dr. Hassan Audio Expert',
      email: instructorEmail,
      password: 'InstructorSecurePass2026!',
      phone: '01055554444',
      specializationTrackId: audioTrack._id.toString(),
      specializations: ['Voice Over Techniques', 'Sound Design', 'Acoustics'],
      bio: 'Senior Audio Engineer and Voice Performance Coach with 15 years experience in media broadcasting.',
      experienceYears: 15,
      assignedPrograms: [voiceOverProg._id.toString()],
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/hassan-audio',
        portfolio: 'https://hassanaudio.com',
      },
    }),
  });
  const adminCreateData: any = await adminCreateRes.json();
  let createdInstructorProfileId = '';
  let createdInstructorUserId = '';
  if (adminCreateRes.status === 201 && adminCreateData.data.user.role === 'instructor') {
    createdInstructorProfileId = adminCreateData.data.instructorProfile._id;
    createdInstructorUserId = adminCreateData.data.user.id;
    console.log(`   ✅ PASS: Instructor created [ID: ${createdInstructorProfileId}, Email: ${instructorEmail}]`);
  } else {
    console.error('   ❌ FAIL:', adminCreateData);
    process.exit(1);
  }

  // Test 3: Public listing of instructors
  console.log('\n🔹 Test 3: Public GET /instructors (Listing active instructors)');
  const publicListRes = await fetch(`${BASE_URL}/instructors`);
  const publicListData: any = await publicListRes.json();
  if (publicListRes.status === 200 && publicListData.data.length >= 1) {
    console.log(`   ✅ PASS: Public catalog returned ${publicListData.data.length} active instructors`);
  } else {
    console.error('   ❌ FAIL:', publicListData);
    process.exit(1);
  }

  // Test 4: Public single instructor details
  console.log(`\n🔹 Test 4: Public GET /instructors/${createdInstructorProfileId}`);
  const publicDetailRes = await fetch(`${BASE_URL}/instructors/${createdInstructorProfileId}`);
  const publicDetailData: any = await publicDetailRes.json();
  if (publicDetailRes.status === 200 && publicDetailData.data.bio.includes('Senior Audio Engineer')) {
    console.log('   ✅ PASS: Single instructor public profile retrieved with assigned programs');
  } else {
    console.error('   ❌ FAIL:', publicDetailData);
    process.exit(1);
  }

  // Test 5: Instructor Login
  console.log('\n🔹 Test 5: Instructor Login (POST /auth/login)');
  const instructorLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: instructorEmail,
      password: 'InstructorSecurePass2026!',
    }),
  });
  const instructorLoginData: any = await instructorLoginRes.json();
  let instructorToken = '';
  if (instructorLoginRes.status === 200 && instructorLoginData.data.tokens.accessToken) {
    instructorToken = instructorLoginData.data.tokens.accessToken;
    console.log('   ✅ PASS: Instructor logged in successfully and received JWT access token');
  } else {
    console.error('   ❌ FAIL:', instructorLoginData);
    process.exit(1);
  }

  // Test 6: Instructor accessing own profile
  console.log('\n🔹 Test 6: Instructor accessing own profile (GET /instructors/me/profile)');
  const meProfileRes = await fetch(`${BASE_URL}/instructors/me/profile`, {
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  const meProfileData: any = await meProfileRes.json();
  if (meProfileRes.status === 200 && meProfileData.data.user.email === instructorEmail) {
    console.log('   ✅ PASS: Instructor retrieved own profile via /me/profile');
  } else {
    console.error('   ❌ FAIL:', meProfileData);
    process.exit(1);
  }

  // Test 7: Instructor updating own bio and photo
  console.log('\n🔹 Test 7: Instructor updating own bio and photo (PATCH /instructors/me/profile)');
  const updateSelfRes = await fetch(`${BASE_URL}/instructors/me/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${instructorToken}`,
    },
    body: JSON.stringify({
      bio: 'Updated bio: Lead vocal trainer and international media consultant.',
      experienceYears: 16,
    }),
  });
  const updateSelfData: any = await updateSelfRes.json();
  if (updateSelfRes.status === 200 && updateSelfData.data.instructorProfile.bio.startsWith('Updated bio')) {
    console.log('   ✅ PASS: Instructor updated permitted self-profile fields');
  } else {
    console.error('   ❌ FAIL:', updateSelfData);
    process.exit(1);
  }

  // Test 8: Instructor Dashboard
  console.log('\n🔹 Test 8: Instructor Dashboard metrics (GET /instructors/me/dashboard)');
  const dashboardRes = await fetch(`${BASE_URL}/instructors/me/dashboard`, {
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  const dashboardData: any = await dashboardRes.json();
  if (dashboardRes.status === 200 && dashboardData.data.metrics.totalAssignedPrograms === 1) {
    console.log('   ✅ PASS: Dashboard returned metrics and assigned programs correctly');
  } else {
    console.error('   ❌ FAIL:', dashboardData);
    process.exit(1);
  }

  // Test 9: Instructor Assigned Programs list
  console.log('\n🔹 Test 9: Instructor My Programs list (GET /instructors/me/programs)');
  const myProgsRes = await fetch(`${BASE_URL}/instructors/me/programs`, {
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  const myProgsData: any = await myProgsRes.json();
  if (myProgsRes.status === 200 && myProgsData.data.length === 1 && myProgsData.data[0].slug === 'voice-over-digital-vocalise') {
    console.log('   ✅ PASS: Instructor assigned programs listed with instructor stats');
  } else {
    console.error('   ❌ FAIL:', myProgsData);
    process.exit(1);
  }

  // Test 10: Instructor Accessing Assigned Program Test Endpoint
  console.log(`\n🔹 Test 10: Instructor accessing assigned program [${voiceOverProg.slug}]`);
  const assignedAccessRes = await fetch(`${BASE_URL}/auth/instructor-test/${voiceOverProg._id}`, {
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  const assignedAccessData: any = await assignedAccessRes.json();
  if (assignedAccessRes.status === 200) {
    console.log('   ✅ PASS: Instructor granted access to assigned program');
  } else {
    console.error('   ❌ FAIL:', assignedAccessData);
    process.exit(1);
  }

  // Test 11: Instructor Accessing Unassigned Program (Must return 403)
  console.log(`\n🔹 Test 11: Instructor accessing unassigned program [${podcastingProg.slug}]`);
  const unassignedAccessRes = await fetch(`${BASE_URL}/auth/instructor-test/${podcastingProg._id}`, {
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  const unassignedAccessData: any = await unassignedAccessRes.json();
  if (unassignedAccessRes.status === 403) {
    console.log('   ✅ PASS: Returns 403 Forbidden for program not in assignedPrograms');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unassignedAccessRes.status, unassignedAccessData);
    process.exit(1);
  }

  // Test 12: Super Admin assigning additional program to Instructor
  console.log('\n🔹 Test 12: Super Admin assigning additional program to Instructor (POST /instructors/:id/assigned-programs)');
  const assignSecondRes = await fetch(`${BASE_URL}/instructors/${createdInstructorProfileId}/assigned-programs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({
      assignedPrograms: [voiceOverProg._id.toString(), podcastingProg._id.toString()],
    }),
  });
  const assignSecondData: any = await assignSecondRes.json();
  if (assignSecondRes.status === 200 && assignSecondData.data.totalPrograms === 2) {
    console.log('   ✅ PASS: Super Admin added Podcasting to instructor assigned programs');
  } else {
    console.error('   ❌ FAIL:', assignSecondData);
    process.exit(1);
  }

  // Test 13: Instructor now accessing the newly assigned program
  console.log(`\n🔹 Test 13: Instructor accessing newly assigned program [${podcastingProg.slug}]`);
  const newlyAssignedAccessRes = await fetch(`${BASE_URL}/auth/instructor-test/${podcastingProg._id}`, {
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  const newlyAssignedAccessData: any = await newlyAssignedAccessRes.json();
  if (newlyAssignedAccessRes.status === 200) {
    console.log('   ✅ PASS: Instructor can now access the newly assigned program');
  } else {
    console.error('   ❌ FAIL:', newlyAssignedAccessData);
    process.exit(1);
  }

  // Test 14: Super Admin Deactivating Instructor Account
  console.log(`\n🔹 Test 14: Super Admin deactivating instructor account`);
  const deactRes = await fetch(`${BASE_URL}/instructors/${createdInstructorProfileId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({ isActive: false }),
  });
  const deactData: any = await deactRes.json();
  if (deactRes.status === 200 && deactData.data.isActive === false) {
    console.log('   ✅ PASS: Instructor account deactivated');
  } else {
    console.error('   ❌ FAIL:', deactData);
    process.exit(1);
  }

  // Test 15: Deactivated Instructor trying to access protected endpoint (Must return 403)
  console.log('\n🔹 Test 15: Deactivated Instructor accessing protected route (Must return 403)');
  const deactAccessRes = await fetch(`${BASE_URL}/instructors/me/dashboard`, {
    headers: { Authorization: `Bearer ${instructorToken}` },
  });
  const deactAccessData: any = await deactAccessRes.json();
  if (deactAccessRes.status === 403) {
    console.log('   ✅ PASS: Deactivated instructor request blocked with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', deactAccessRes.status, deactAccessData);
    process.exit(1);
  }

  // Test 16: Super Admin Reactivating Instructor
  console.log('\n🔹 Test 16: Super Admin reactivating instructor account');
  const reactRes = await fetch(`${BASE_URL}/instructors/${createdInstructorProfileId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({ isActive: true }),
  });
  const reactData: any = await reactRes.json();
  if (reactRes.status === 200 && reactData.data.isActive === true) {
    console.log('   ✅ PASS: Instructor reactivated successfully');
  } else {
    console.error('   ❌ FAIL:', reactData);
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL 16 PHASE 05 TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================\n');
  process.exit(0);
}

runPhase05Tests().catch((err) => {
  console.error('Error running Phase 05 tests:', err);
  process.exit(1);
});
