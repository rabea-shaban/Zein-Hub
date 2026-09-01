import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { User, Program, Application, Enrollment, Progress } from '../src/models/index.js';
import { UserRole } from '../src/constants/roles.enum.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runPhase06Tests() {
  console.log('=========================================');
  console.log('🧪 Starting Phase 06 Automated Verifications');
  console.log('=========================================\n');

  await connectDB();

  const voiceOverProg = await Program.findOne({ slug: 'voice-over-digital-vocalise' });
  const podcastingProg = await Program.findOne({ slug: 'smart-podcasting-audio-production' });

  if (!voiceOverProg || !podcastingProg) {
    console.error('❌ Required seed data missing. Run npm run seed:tracks-programs first.');
    process.exit(1);
  }

  // Clean existing applications and enrollments for test users
  const testStudent1Email = 'student.app1@zeinhub.com';
  const testStudent2Email = 'student.app2@zeinhub.com';

  let student1 = await User.findOne({ email: testStudent1Email });
  if (!student1) {
    student1 = await User.create({
      fullName: 'Mustafa Voice Student',
      email: testStudent1Email,
      password: 'StudentPass123!',
      phone: '01012349999',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  let student2 = await User.findOne({ email: testStudent2Email });
  if (!student2) {
    student2 = await User.create({
      fullName: 'Nour Media Student',
      email: testStudent2Email,
      password: 'StudentPass123!',
      phone: '01012348888',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  let instructorUser = await User.findOne({ email: 'instructor.voice@zeinhub.com' });
  if (!instructorUser) {
    instructorUser = await User.create({
      fullName: 'Dr. Voice Instructor',
      email: 'instructor.voice@zeinhub.com',
      password: 'InstructorPass123!',
      role: UserRole.INSTRUCTOR,
      isActive: true,
    });
  }

  // Clean up any old test records for these students
  await Application.deleteMany({ studentId: { $in: [student1._id, student2._id] } });
  await Enrollment.deleteMany({ studentId: { $in: [student1._id, student2._id] } });
  await Progress.deleteMany({ studentId: { $in: [student1._id, student2._id] } });

  await mongoose.connection.close();

  // Log in users
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@zeinhub.com', password: 'Admin@ZeinHub2026!' }),
  });
  const adminLoginData: any = await adminLoginRes.json();
  const superAdminToken = adminLoginData.data.tokens.accessToken;

  const s1LoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testStudent1Email, password: 'StudentPass123!' }),
  });
  const s1LoginData: any = await s1LoginRes.json();
  const student1Token = s1LoginData.data.tokens.accessToken;

  const s2LoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testStudent2Email, password: 'StudentPass123!' }),
  });
  const s2LoginData: any = await s2LoginRes.json();
  const student2Token = s2LoginData.data.tokens.accessToken;

  const instLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'instructor.voice@zeinhub.com', password: 'InstructorPass123!' }),
  });
  const instLoginData: any = await instLoginRes.json();
  const instructorToken = instLoginData.data.tokens.accessToken;

  // Test 1: Student applying for COMING_SOON program (Must return 400)
  console.log(`🔹 Test 1: Student applying for COMING_SOON program [${podcastingProg.titleEn}]`);
  const comingSoonAppRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({
      programId: podcastingProg._id.toString(),
      motivation: 'I really want to join early',
    }),
  });
  const comingSoonAppData: any = await comingSoonAppRes.json();
  if (comingSoonAppRes.status === 400 && comingSoonAppData.message.includes('only accepted for OPEN programs')) {
    console.log('   ✅ PASS: Rejected application for COMING_SOON program with 400 Bad Request');
  } else {
    console.error('   ❌ FAIL: Expected 400, got', comingSoonAppRes.status, comingSoonAppData);
    process.exit(1);
  }

  // Test 2: Student applying for OPEN program (Voice-Over)
  console.log(`\n🔹 Test 2: Student applying for OPEN program [${voiceOverProg.titleEn}]`);
  const validAppRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({
      programId: voiceOverProg._id.toString(),
      motivation: 'Passionate about digital voice over and audio presentation in Upper Egypt media.',
      portfolioUrl: 'https://soundcloud.com/mustafa-voice-sample',
      audioSampleUrl: 'https://storage.zeinhub.com/samples/voice_sample_1.mp3',
      governorate: 'Assiut',
    }),
  });
  const validAppData: any = await validAppRes.json();
  let student1AppId = '';
  if (validAppRes.status === 201 && validAppData.data.status === 'pending') {
    student1AppId = validAppData.data._id;
    console.log(`   ✅ PASS: Application submitted successfully [ID: ${student1AppId}, Status: pending]`);
  } else {
    console.error('   ❌ FAIL:', validAppData);
    process.exit(1);
  }

  // Test 3: Duplicate Application check (Must return 409 Conflict)
  console.log('\n🔹 Test 3: Duplicate Application prevention for same student and program');
  const dupAppRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({
      programId: voiceOverProg._id.toString(),
      motivation: 'Trying to apply again',
    }),
  });
  const dupAppData: any = await dupAppRes.json();
  if (dupAppRes.status === 409) {
    console.log('   ✅ PASS: Returns 409 Conflict for duplicate application submission');
  } else {
    console.error('   ❌ FAIL: Expected 409, got', dupAppRes.status, dupAppData);
    process.exit(1);
  }

  // Test 4: Student viewing own applications (GET /applications/me)
  console.log('\n🔹 Test 4: Student viewing own applications list (GET /applications/me)');
  const myAppsRes = await fetch(`${BASE_URL}/applications/me`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const myAppsData: any = await myAppsRes.json();
  if (myAppsRes.status === 200 && myAppsData.data.length === 1 && myAppsData.data[0].programId.slug === 'voice-over-digital-vocalise') {
    console.log('   ✅ PASS: Student retrieved own applications list with populated program details');
  } else {
    console.error('   ❌ FAIL:', myAppsData);
    process.exit(1);
  }

  // Test 5: Student viewing single application details
  console.log(`\n🔹 Test 5: Student viewing single application details (GET /applications/me/${student1AppId})`);
  const singleAppRes = await fetch(`${BASE_URL}/applications/me/${student1AppId}`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const singleAppData: any = await singleAppRes.json();
  if (singleAppRes.status === 200 && singleAppData.data.governorate === 'Assiut') {
    console.log('   ✅ PASS: Single application retrieved successfully by student');
  } else {
    console.error('   ❌ FAIL:', singleAppData);
    process.exit(1);
  }

  // Test 6: Super Admin viewing all applications
  console.log('\n🔹 Test 6: Super Admin viewing all applications list (GET /applications)');
  const adminAppsRes = await fetch(`${BASE_URL}/applications`, {
    headers: { Authorization: `Bearer ${superAdminToken}` },
  });
  const adminAppsData: any = await adminAppsRes.json();
  if (adminAppsRes.status === 200 && adminAppsData.data.length >= 1 && adminAppsData.meta.total >= 1) {
    console.log(`   ✅ PASS: Super Admin listed applications (Total: ${adminAppsData.meta.total})`);
  } else {
    console.error('   ❌ FAIL:', adminAppsData);
    process.exit(1);
  }

  // Test 7: Student attempting to review application (Must return 403)
  console.log('\n🔹 Test 7: Student attempting to review application (PATCH /applications/:id/review)');
  const studentReviewRes = await fetch(`${BASE_URL}/applications/${student1AppId}/review`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({ status: 'accepted' }),
  });
  const studentReviewData: any = await studentReviewRes.json();
  if (studentReviewRes.status === 403) {
    console.log('   ✅ PASS: Blocked non-admin from reviewing application with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', studentReviewRes.status, studentReviewData);
    process.exit(1);
  }

  // Test 8: Instructor attempting to review application (Must return 403)
  console.log('\n🔹 Test 8: Instructor attempting to review application');
  const instReviewRes = await fetch(`${BASE_URL}/applications/${student1AppId}/review`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${instructorToken}`,
    },
    body: JSON.stringify({ status: 'accepted' }),
  });
  const instReviewData: any = await instReviewRes.json();
  if (instReviewRes.status === 403) {
    console.log('   ✅ PASS: Blocked instructor from reviewing application with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', instReviewRes.status, instReviewData);
    process.exit(1);
  }

  // Student 2 applies for testing rejection flow
  const s2AppRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student2Token}`,
    },
    body: JSON.stringify({
      programId: voiceOverProg._id.toString(),
      motivation: 'Second student application',
    }),
  });
  const s2AppData: any = await s2AppRes.json();
  const student2AppId = s2AppData.data._id;

  // Test 9: Super Admin REJECTING student 2 application
  console.log('\n🔹 Test 9: Super Admin rejecting student 2 application');
  const rejectRes = await fetch(`${BASE_URL}/applications/${student2AppId}/review`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({
      status: 'rejected',
      reviewNotes: 'Applicant does not meet background prerequisites for this cohort.',
    }),
  });
  const rejectData: any = await rejectRes.json();
  if (rejectRes.status === 200 && rejectData.data.application.status === 'rejected' && rejectData.data.enrollment === null) {
    console.log('   ✅ PASS: Application rejected successfully and NO Enrollment created');
  } else {
    console.error('   ❌ FAIL:', rejectData);
    process.exit(1);
  }

  // Test 10: Super Admin ACCEPTING student 1 application (Automatic Enrollment & Progress Creation)
  console.log('\n🔹 Test 10: Super Admin ACCEPTING student 1 application (Automatic Enrollment creation)');
  const acceptRes = await fetch(`${BASE_URL}/applications/${student1AppId}/review`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({
      status: 'accepted',
      reviewNotes: 'Outstanding vocal sample and high potential. Accepted into cohort 1.',
    }),
  });
  const acceptData: any = await acceptRes.json();
  let createdEnrollmentId = '';
  if (
    acceptRes.status === 200 &&
    acceptData.data.application.status === 'accepted' &&
    acceptData.data.enrollment &&
    acceptData.data.enrollment.status === 'active'
  ) {
    createdEnrollmentId = acceptData.data.enrollment._id;
    console.log(`   ✅ PASS: Application accepted & Enrollment created automatically [Enrollment ID: ${createdEnrollmentId}, Status: active]`);
  } else {
    console.error('   ❌ FAIL:', acceptData);
    process.exit(1);
  }

  // Test 11: Student viewing their active enrolled courses (GET /enrollments/me)
  console.log('\n🔹 Test 11: Student viewing enrolled courses (GET /enrollments/me)');
  const myEnrsRes = await fetch(`${BASE_URL}/enrollments/me`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const myEnrsData: any = await myEnrsRes.json();
  if (
    myEnrsRes.status === 200 &&
    myEnrsData.data.length === 1 &&
    myEnrsData.data[0].enrollment.status === 'active' &&
    myEnrsData.data[0].progress.completionPercentage === 0
  ) {
    console.log(`   ✅ PASS: Student retrieved enrolled course: [${myEnrsData.data[0].enrollment.programId.titleEn}] with initialized progress`);
  } else {
    console.error('   ❌ FAIL:', myEnrsData);
    process.exit(1);
  }

  // Test 12: Student checking enrollment for specific program
  console.log(`\n🔹 Test 12: Student checking enrollment for enrolled program [${voiceOverProg.slug}]`);
  const enrCheckRes = await fetch(`${BASE_URL}/enrollments/me/${voiceOverProg._id}`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const enrCheckData: any = await enrCheckRes.json();
  if (enrCheckRes.status === 200 && enrCheckData.data.enrollment.status === 'active') {
    console.log('   ✅ PASS: Enrollment confirmed for program');
  } else {
    console.error('   ❌ FAIL:', enrCheckData);
    process.exit(1);
  }

  // Test 13: Student checking enrollment for unenrolled program (Must return 404)
  console.log(`\n🔹 Test 13: Student checking enrollment for unenrolled program [${podcastingProg.slug}]`);
  const notEnrRes = await fetch(`${BASE_URL}/enrollments/me/${podcastingProg._id}`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const notEnrData: any = await notEnrRes.json();
  if (notEnrRes.status === 404) {
    console.log('   ✅ PASS: Returns 404 Not Found for unenrolled program');
  } else {
    console.error('   ❌ FAIL: Expected 404, got', notEnrRes.status, notEnrData);
    process.exit(1);
  }

  // Test 14: Super Admin viewing all enrollments
  console.log('\n🔹 Test 14: Super Admin viewing all enrollments (GET /enrollments/admin/all)');
  const adminEnrsRes = await fetch(`${BASE_URL}/enrollments/admin/all`, {
    headers: { Authorization: `Bearer ${superAdminToken}` },
  });
  const adminEnrsData: any = await adminEnrsRes.json();
  if (adminEnrsRes.status === 200 && adminEnrsData.data.length >= 1) {
    console.log(`   ✅ PASS: Super Admin listed platform enrollments (Total: ${adminEnrsData.meta.total})`);
  } else {
    console.error('   ❌ FAIL:', adminEnrsData);
    process.exit(1);
  }

  // Test 15: Super Admin updating enrollment status to completed
  console.log(`\n🔹 Test 15: Super Admin marking enrollment [${createdEnrollmentId}] as completed with final grade`);
  const updateEnrRes = await fetch(`${BASE_URL}/enrollments/${createdEnrollmentId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${superAdminToken}`,
    },
    body: JSON.stringify({
      status: 'completed',
      finalGrade: 95,
      certificateUrl: 'https://storage.zeinhub.com/certificates/cert_vo_2026_001.pdf',
    }),
  });
  const updateEnrData: any = await updateEnrRes.json();
  if (
    updateEnrRes.status === 200 &&
    updateEnrData.data.status === 'completed' &&
    updateEnrData.data.finalGrade === 95
  ) {
    console.log('   ✅ PASS: Enrollment marked as completed with final grade: 95/100');
  } else {
    console.error('   ❌ FAIL:', updateEnrData);
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL 15 PHASE 06 TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================\n');
  process.exit(0);
}

runPhase06Tests().catch((err) => {
  console.error('Error running Phase 06 tests:', err);
  process.exit(1);
});
