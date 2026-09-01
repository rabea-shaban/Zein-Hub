import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { User, Track, Program, InstructorProfile } from '../src/models/index.js';
import { UserRole } from '../src/constants/roles.enum.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runPhase04Tests() {
  console.log('=========================================');
  console.log('🧪 Starting Phase 04 Automated Verifications');
  console.log('=========================================\n');

  await connectDB();

  // Clean up any legacy test-specific mock tracks/programs from previous phases
  await Program.deleteMany({ slug: { $regex: /-test$/ } });
  await Track.deleteMany({ slug: { $regex: /-test$/ } });

  // Setup / verify Instructor User and Student User
  let instructorUser = await User.findOne({ email: 'instructor.voice@zeinhub.com' });
  if (!instructorUser) {
    instructorUser = await User.create({
      fullName: 'Dr. Voice Instructor',
      email: 'instructor.voice@zeinhub.com',
      password: 'InstructorPass123!',
      phone: '01099887766',
      role: UserRole.INSTRUCTOR,
      isActive: true,
    });
  }

  let studentUser = await User.findOne({ email: 'student.test4@zeinhub.com' });
  if (!studentUser) {
    studentUser = await User.create({
      fullName: 'Test Student Phase 4',
      email: 'student.test4@zeinhub.com',
      password: 'StudentPass123!',
      phone: '01011223344',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  await mongoose.connection.close();

  // 1. Authenticate Super Admin & Student
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@zeinhub.com',
      password: 'Admin@ZeinHub2026!',
    }),
  });
  const adminLoginData: any = await adminLoginRes.json();
  const superAdminToken = adminLoginData.data?.tokens?.accessToken;

  const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student.test4@zeinhub.com',
      password: 'StudentPass123!',
    }),
  });
  const studentLoginData: any = await studentLoginRes.json();
  const studentToken = studentLoginData.data?.tokens?.accessToken;

  // Test 1: Public GET /tracks
  console.log('🔹 Test 1: Public GET /tracks (Listing 3 tracks with stats)');
  const tracksRes = await fetch(`${BASE_URL}/tracks`);
  const tracksData: any = await tracksRes.json();
  if (tracksRes.status === 200 && tracksData.data.length === 3 && tracksData.data[0].stats) {
    console.log(`   ✅ PASS: Retrieved exactly ${tracksData.data.length} tracks with program counts`);
  } else {
    console.error('   ❌ FAIL:', tracksData);
    process.exit(1);
  }

  // Test 2: Public GET /tracks/:idOrSlug
  console.log('🔹 Test 2: Public GET /tracks/audio-media (Track details with programs)');
  const trackDetailsRes = await fetch(`${BASE_URL}/tracks/audio-media`);
  const trackDetailsData: any = await trackDetailsRes.json();
  if (trackDetailsRes.status === 200 && trackDetailsData.data.programs.length === 4) {
    console.log(`   ✅ PASS: Retrieved track '${trackDetailsData.data.track.nameEn}' with ${trackDetailsData.data.programs.length} programs`);
  } else {
    console.error('   ❌ FAIL:', trackDetailsData);
    process.exit(1);
  }

  // Test 3: Public GET /programs
  console.log('🔹 Test 3: Public GET /programs (Pagination and listing)');
  const programsRes = await fetch(`${BASE_URL}/programs?page=1&limit=10`);
  const programsData: any = await programsRes.json();
  if (programsRes.status === 200 && programsData.data.length === 10 && programsData.meta.total === 12) {
    console.log(`   ✅ PASS: Paginated list returned ${programsData.data.length} items (Total in DB: ${programsData.meta.total})`);
  } else {
    console.error('   ❌ FAIL:', programsData);
    process.exit(1);
  }

  // Test 4: Public GET /programs/featured
  console.log('🔹 Test 4: Public GET /programs/featured');
  const featuredRes = await fetch(`${BASE_URL}/programs/featured`);
  const featuredData: any = await featuredRes.json();
  if (featuredRes.status === 200 && featuredData.data.length === 1 && featuredData.data[0].slug === 'voice-over-digital-vocalise') {
    console.log(`   ✅ PASS: Featured program correctly retrieved: [${featuredData.data[0].titleEn}]`);
  } else {
    console.error('   ❌ FAIL:', featuredData);
    process.exit(1);
  }

  // Test 5: Filter by status=open
  console.log('🔹 Test 5: Filter programs by status=open');
  const openRes = await fetch(`${BASE_URL}/programs?status=open`);
  const openData: any = await openRes.json();
  if (openRes.status === 200 && openData.data.length === 1 && openData.data[0].slug === 'voice-over-digital-vocalise') {
    console.log('   ✅ PASS: Exactly 1 open program returned (Voice-Over)');
  } else {
    console.error('   ❌ FAIL:', openData);
    process.exit(1);
  }

  // Test 6: Filter by status=coming-soon
  console.log('🔹 Test 6: Filter programs by status=coming-soon');
  const comingSoonRes = await fetch(`${BASE_URL}/programs?status=coming-soon&limit=20`);
  const comingSoonData: any = await comingSoonRes.json();
  if (comingSoonRes.status === 200 && comingSoonData.meta.total === 11) {
    console.log(`   ✅ PASS: Correctly found ${comingSoonData.meta.total} coming-soon programs`);
  } else {
    console.error('   ❌ FAIL:', comingSoonData);
    process.exit(1);
  }

  // Test 7: Search by keyword
  console.log('🔹 Test 7: Search programs by keyword "Podcasting"');
  const searchRes = await fetch(`${BASE_URL}/programs?search=Podcasting`);
  const searchData: any = await searchRes.json();
  if (searchRes.status === 200 && searchData.data.length >= 1) {
    console.log(`   ✅ PASS: Found search result: [${searchData.data[0].titleEn}]`);
  } else {
    console.error('   ❌ FAIL:', searchData);
    process.exit(1);
  }

  // Test 8: Get Program Details by Slug
  console.log('🔹 Test 8: GET /programs/voice-over-digital-vocalise');
  const voiceOverRes = await fetch(`${BASE_URL}/programs/voice-over-digital-vocalise`);
  const voiceOverData: any = await voiceOverRes.json();
  const voiceOverId = voiceOverData.data.program._id;
  if (voiceOverRes.status === 200 && voiceOverData.data.program.slug === 'voice-over-digital-vocalise') {
    console.log('   ✅ PASS: Single program details retrieved with track data');
  } else {
    console.error('   ❌ FAIL:', voiceOverData);
    process.exit(1);
  }

  // Test 9: RBAC - Student attempting to create program (Must return 403)
  console.log('\n🔹 Test 9: RBAC - Student attempting to create a program');
  const studentCreateRes = await fetch(`${BASE_URL}/programs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      titleAr: 'برنامج ممنوع',
      titleEn: 'Forbidden Program',
      trackId: voiceOverData.data.program.trackId._id,
      descriptionAr: 'وصف تجريبي للبرنامج',
    }),
  });
  const studentCreateData: any = await studentCreateRes.json();
  if (studentCreateRes.status === 403) {
    console.log('   ✅ PASS: Returns 403 Forbidden for non-admin user');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', studentCreateRes.status, studentCreateData);
    process.exit(1);
  }

  // Test 10: Super Admin creating a new program
  console.log('🔹 Test 10: Super Admin creating a temporary program');
  const adminCreateRes = await fetch(`${BASE_URL}/programs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({
      titleAr: 'برنامج تجريبي جديد',
      titleEn: 'Temporary Custom Program',
      slug: 'temp-custom-program',
      trackId: voiceOverData.data.program.trackId._id,
      descriptionAr: 'برنامج مخصص لاختبار الـ Admin APIs والتعديل والحذف',
      descriptionEn: 'Program dedicated to test admin modifications and deletions',
      status: 'coming-soon',
      price: 1500,
    }),
  });
  const adminCreateData: any = await adminCreateRes.json();
  let createdProgramId = '';
  if (adminCreateRes.status === 201 && adminCreateData.data._id) {
    createdProgramId = adminCreateData.data._id;
    console.log(`   ✅ PASS: Super Admin created program [ID: ${createdProgramId}]`);
  } else {
    console.error('   ❌ FAIL:', adminCreateData);
    process.exit(1);
  }

  // Test 11: Super Admin changing program status
  console.log(`🔹 Test 11: Super Admin changing status to 'open' for program [${createdProgramId}]`);
  const statusRes = await fetch(`${BASE_URL}/programs/${createdProgramId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({ status: 'open' }),
  });
  const statusData: any = await statusRes.json();
  if (statusRes.status === 200 && statusData.data.status === 'open') {
    console.log('   ✅ PASS: Program status updated to open');
  } else {
    console.error('   ❌ FAIL:', statusData);
    process.exit(1);
  }

  // Test 12: Super Admin toggling featured status
  console.log(`🔹 Test 12: Super Admin toggling featured status for [${createdProgramId}]`);
  const featuredToggleRes = await fetch(`${BASE_URL}/programs/${createdProgramId}/featured`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
  });
  const featuredToggleData: any = await featuredToggleRes.json();
  if (featuredToggleRes.status === 200 && featuredToggleData.data.isFeatured === true) {
    console.log('   ✅ PASS: Program featured toggled to true');
  } else {
    console.error('   ❌ FAIL:', featuredToggleData);
    process.exit(1);
  }

  // Test 13: Assign Instructor to Program
  console.log(`🔹 Test 13: Super Admin assigning instructor to program [${voiceOverId}]`);
  const assignRes = await fetch(`${BASE_URL}/programs/${voiceOverId}/assign-instructor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({ instructorId: instructorUser._id.toString() }),
  });
  const assignData: any = await assignRes.json();
  if (assignRes.status === 200 && assignData.data.assigned === true) {
    console.log(`   ✅ PASS: Instructor [${assignData.data.instructor.email}] assigned to [${assignData.data.program.titleEn}]`);
  } else {
    console.error('   ❌ FAIL:', assignData);
    process.exit(1);
  }

  // Test 14: Assign Non-Instructor validation (Must return 400)
  console.log('🔹 Test 14: Attempting to assign student as an instructor (Validation check)');
  const assignStudentRes = await fetch(`${BASE_URL}/programs/${voiceOverId}/assign-instructor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({ instructorId: studentUser._id.toString() }),
  });
  const assignStudentData: any = await assignStudentRes.json();
  if (assignStudentRes.status === 400) {
    console.log('   ✅ PASS: Rejected student assignment with 400 Bad Request');
  } else {
    console.error('   ❌ FAIL: Expected 400, got', assignStudentRes.status, assignStudentData);
    process.exit(1);
  }

  // Test 15: Unassign Instructor from Program
  console.log(`🔹 Test 15: Super Admin unassigning instructor from program`);
  const unassignRes = await fetch(`${BASE_URL}/programs/${voiceOverId}/unassign-instructor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({ instructorId: instructorUser._id.toString() }),
  });
  const unassignData: any = await unassignRes.json();
  if (unassignRes.status === 200 && unassignData.data.unassigned === true) {
    console.log('   ✅ PASS: Instructor unassigned from program successfully');
  } else {
    console.error('   ❌ FAIL:', unassignData);
    process.exit(1);
  }

  // Test 16: Super Admin deleting the temporary program
  console.log(`🔹 Test 16: Super Admin deactivating temporary program [${createdProgramId}]`);
  const deleteRes = await fetch(`${BASE_URL}/programs/${createdProgramId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${superAdminToken}`,
    },
  });
  const deleteData: any = await deleteRes.json();
  if (deleteRes.status === 200 && deleteData.data.deleted === true) {
    console.log('   ✅ PASS: Temporary program deactivated successfully');
  } else {
    console.error('   ❌ FAIL:', deleteData);
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL 16 PHASE 04 TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================\n');
  process.exit(0);
}

runPhase04Tests().catch((err) => {
  console.error('Error running Phase 04 tests:', err);
  process.exit(1);
});
