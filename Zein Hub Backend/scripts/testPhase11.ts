import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import {
  User,
  Program,
  Enrollment,
  Review,
} from '../src/models/index.js';
import { UserRole } from '../src/constants/roles.enum.js';
import { EnrollmentStatus } from '../src/constants/enrollmentStatus.enum.js';
import { ReviewStatus } from '../src/models/review.model.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runPhase11Tests() {
  console.log('=========================================');
  console.log('🧪 Starting Phase 11 Automated Verifications');
  console.log('=========================================\n');

  await connectDB();

  const voiceOverProg = await Program.findOne({ slug: 'voice-over-digital-vocalise' });
  if (!voiceOverProg) {
    console.error('❌ Required seed program missing.');
    process.exit(1);
  }

  // Setup test instructor & students
  let instructorUser = await User.findOne({ email: 'instructor.voice11@zeinhub.com' });
  if (!instructorUser) {
    instructorUser = await User.create({
      fullName: 'Instructor Phase 11',
      email: 'instructor.voice11@zeinhub.com',
      password: 'InstructorPass123!',
      role: UserRole.INSTRUCTOR,
      isActive: true,
    });
  }

  let student1 = await User.findOne({ email: 'student.reviewer1@zeinhub.com' });
  if (!student1) {
    student1 = await User.create({
      fullName: 'Youssef Reviewer',
      email: 'student.reviewer1@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  let student2 = await User.findOne({ email: 'student.reviewer2@zeinhub.com' });
  if (!student2) {
    student2 = await User.create({
      fullName: 'Mona Reviewer',
      email: 'student.reviewer2@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  let unenrolledStudent = await User.findOne({ email: 'student.outsider11@zeinhub.com' });
  if (!unenrolledStudent) {
    unenrolledStudent = await User.create({
      fullName: 'Outsider Student 11',
      email: 'student.outsider11@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  // Clean old reviews for voiceOverProg
  await Review.deleteMany({ programId: voiceOverProg._id });

  // Ensure active enrollment for student1 and student2
  await Enrollment.findOneAndUpdate(
    { studentId: student1._id, programId: voiceOverProg._id },
    {
      $set: {
        studentId: student1._id,
        programId: voiceOverProg._id,
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
      },
    },
    { upsert: true }
  );

  await Enrollment.findOneAndUpdate(
    { studentId: student2._id, programId: voiceOverProg._id },
    {
      $set: {
        studentId: student2._id,
        programId: voiceOverProg._id,
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
      },
    },
    { upsert: true }
  );

  await Enrollment.deleteMany({
    studentId: unenrolledStudent._id,
    programId: voiceOverProg._id,
  });

  await mongoose.connection.close();

  // Helper login function
  async function login(email: string, password: string): Promise<string> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data: any = await res.json();
    return data.data?.tokens?.accessToken || '';
  }

  const adminToken = await login('admin@zeinhub.com', 'Admin@ZeinHub2026!');
  const instructorToken = await login('instructor.voice11@zeinhub.com', 'InstructorPass123!');
  const student1Token = await login('student.reviewer1@zeinhub.com', 'StudentPass123!');
  const student2Token = await login('student.reviewer2@zeinhub.com', 'StudentPass123!');
  const unenrolledToken = await login('student.outsider11@zeinhub.com', 'StudentPass123!');

  // Test 1: Enrolled student submits valid Review (POST /programs/:programId/reviews)
  console.log('🔹 Test 1: Enrolled student submits valid review (POST /programs/:programId/reviews)');
  const createRevRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({
      rating: 5,
      comment: 'Exceptional training! The voice modulation and vocal resonance techniques transformed my broadcasting skills.',
    }),
  });
  const createRevData: any = await createRevRes.json();
  let review1Id = '';
  if (
    createRevRes.status === 201 &&
    createRevData.data._id &&
    createRevData.data.status === 'pending'
  ) {
    review1Id = createRevData.data._id;
    console.log(`   ✅ PASS: Student submitted review [ID: ${review1Id}, Status: pending]`);
  } else {
    console.error('   ❌ FAIL:', createRevData);
    process.exit(1);
  }

  // Test 2: Non-enrolled student attempts to review (Must return 403)
  console.log('\n🔹 Test 2: Non-enrolled student attempting to review program');
  const unenrolledRevRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${unenrolledToken}`,
    },
    body: JSON.stringify({
      rating: 4,
      comment: 'Fake review from unenrolled user',
    }),
  });
  const unenrolledRevData: any = await unenrolledRevRes.json();
  if (unenrolledRevRes.status === 403) {
    console.log('   ✅ PASS: Blocked non-enrolled user with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unenrolledRevRes.status, unenrolledRevData);
    process.exit(1);
  }

  // Test 3: Duplicate review prevention (Must return 409)
  console.log('\n🔹 Test 3: Duplicate review attempt for same program by same student');
  const dupRevRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({
      rating: 5,
      comment: 'Trying to post second review on same program',
    }),
  });
  const dupRevData: any = await dupRevRes.json();
  if (dupRevRes.status === 409) {
    console.log('   ✅ PASS: Blocked duplicate review with 409 Conflict');
  } else {
    console.error('   ❌ FAIL: Expected 409, got', dupRevRes.status, dupRevData);
    process.exit(1);
  }

  // Test 4: Student views own reviews (GET /reviews/me)
  console.log('\n🔹 Test 4: Student views own reviews (GET /reviews/me)');
  const myRevsRes = await fetch(`${BASE_URL}/reviews/me`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const myRevsData: any = await myRevsRes.json();
  if (
    myRevsRes.status === 200 &&
    myRevsData.data.length === 1 &&
    myRevsData.data[0].status === 'pending'
  ) {
    console.log(`   ✅ PASS: Student retrieved own reviews (Status: pending)`);
  } else {
    console.error('   ❌ FAIL:', myRevsData);
    process.exit(1);
  }

  // Test 5: Public Approved Testimonials (GET /reviews/approved) -> pending review NOT visible
  console.log('\n🔹 Test 5: Public Approved Testimonials query (Pending review must NOT appear)');
  const pubApprRes = await fetch(`${BASE_URL}/reviews/approved`);
  const pubApprData: any = await pubApprRes.json();
  if (pubApprRes.status === 200 && pubApprData.data.length === 0) {
    console.log('   ✅ PASS: Public testimonials endpoint does not show pending review');
  } else {
    console.error('   ❌ FAIL:', pubApprData);
    process.exit(1);
  }

  // Test 6: Public Program Reviews (GET /programs/:programId/reviews) -> pending review NOT visible
  console.log('\n🔹 Test 6: Public Program Reviews query (Pending review must NOT appear)');
  const pubProgRevsRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/reviews`);
  const pubProgRevsData: any = await pubProgRevsRes.json();
  if (pubProgRevsRes.status === 200 && pubProgRevsData.data.reviews.length === 0 && pubProgRevsData.data.totalReviews === 0) {
    console.log('   ✅ PASS: Program reviews page does not display pending reviews');
  } else {
    console.error('   ❌ FAIL:', pubProgRevsData);
    process.exit(1);
  }

  // Test 7: Non-admin single review query on pending review (Must return 404)
  console.log(`\n🔹 Test 7: Public / Other student querying single pending review`);
  const pubSingleRevRes = await fetch(`${BASE_URL}/reviews/${review1Id}`);
  const pubSingleRevData: any = await pubSingleRevRes.json();
  if (pubSingleRevRes.status === 404) {
    console.log('   ✅ PASS: Pending review details hidden from public with 404 Not Found');
  } else {
    console.error('   ❌ FAIL: Expected 404, got', pubSingleRevRes.status, pubSingleRevData);
    process.exit(1);
  }

  // Test 8: Student attempts moderation (Must return 403)
  console.log('\n🔹 Test 8: Student attempting to approve/moderate review');
  const studentModRes = await fetch(`${BASE_URL}/reviews/${review1Id}/moderate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({ status: 'approved' }),
  });
  const studentModData: any = await studentModRes.json();
  if (studentModRes.status === 403) {
    console.log('   ✅ PASS: Blocked student from moderation with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', studentModRes.status, studentModData);
    process.exit(1);
  }

  // Test 9: Instructor attempts moderation (Must return 403)
  console.log('\n🔹 Test 9: Instructor attempting to moderate review');
  const instModRes = await fetch(`${BASE_URL}/reviews/${review1Id}/moderate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${instructorToken}`,
    },
    body: JSON.stringify({ status: 'approved' }),
  });
  const instModData: any = await instModRes.json();
  if (instModRes.status === 403) {
    console.log('   ✅ PASS: Blocked instructor from moderation with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', instModRes.status, instModData);
    process.exit(1);
  }

  // Test 10: Super Admin lists all reviews across system (GET /reviews/admin/all)
  console.log('\n🔹 Test 10: Super Admin lists all reviews (GET /reviews/admin/all)');
  const adminRevsRes = await fetch(`${BASE_URL}/reviews/admin/all`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminRevsData: any = await adminRevsRes.json();
  if (adminRevsRes.status === 200 && adminRevsData.data.length >= 1) {
    console.log(`   ✅ PASS: Super Admin listed all reviews (Total: ${adminRevsData.data.length})`);
  } else {
    console.error('   ❌ FAIL:', adminRevsData);
    process.exit(1);
  }

  // Test 11: Super Admin approves review (PATCH /reviews/:id/moderate)
  console.log('\n🔹 Test 11: Super Admin approves review (status -> approved, isFeatured -> true)');
  const approveRes = await fetch(`${BASE_URL}/reviews/${review1Id}/moderate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'approved',
      isFeatured: true,
      moderationNotes: 'Excellent constructive feedback.',
    }),
  });
  const approveData: any = await approveRes.json();
  if (
    approveRes.status === 200 &&
    approveData.data.status === 'approved' &&
    approveData.data.isFeatured === true
  ) {
    console.log("   ✅ PASS: Super Admin approved review [Status: 'approved', isFeatured: true]");
  } else {
    console.error('   ❌ FAIL:', approveData);
    process.exit(1);
  }

  // Test 12: Public Approved Testimonials now shows approved review
  console.log('\n🔹 Test 12: Public Approved Testimonials query (Now contains approved review)');
  const pubApprRes2 = await fetch(`${BASE_URL}/reviews/approved`);
  const pubApprData2: any = await pubApprRes2.json();
  if (pubApprData2.data.length === 1 && pubApprData2.data[0].rating === 5) {
    console.log('   ✅ PASS: Public testimonials now renders approved review');
  } else {
    console.error('   ❌ FAIL:', pubApprData2);
    process.exit(1);
  }

  // Test 13: Public Program Reviews calculation
  console.log(`\n🔹 Test 13: Public Program Reviews & Average Rating Calculation`);
  const progRevsRes2 = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/reviews`);
  const progRevsData2: any = await progRevsRes2.json();
  if (
    progRevsData2.data.totalReviews === 1 &&
    progRevsData2.data.averageRating === 5 &&
    progRevsData2.data.breakdown['5'] === 1
  ) {
    console.log('   ✅ PASS: Program reviews calculated: Total 1, Average 5.0, Breakdown {5: 1}');
  } else {
    console.error('   ❌ FAIL:', progRevsData2);
    process.exit(1);
  }

  // Test 14: Student updates own review (Triggers re-moderation status: pending)
  console.log('\n🔹 Test 14: Student updates own review (Triggers automatic re-moderation -> pending)');
  const updateRevRes = await fetch(`${BASE_URL}/reviews/${review1Id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({
      rating: 5,
      comment: 'Updated: Outstanding practical recording sessions and thorough instructor feedback!',
    }),
  });
  const updateRevData: any = await updateRevRes.json();
  if (updateRevRes.status === 200 && updateRevData.data.status === 'pending') {
    console.log("   ✅ PASS: Review updated and successfully moved to 'pending' moderation review");
  } else {
    console.error('   ❌ FAIL:', updateRevData);
    process.exit(1);
  }

  // Test 15: Verify updated review is temporarily removed from public API
  console.log('\n🔹 Test 15: Public endpoint verify updated review temporarily removed from public view');
  const pubApprRes3 = await fetch(`${BASE_URL}/reviews/approved`);
  const pubApprData3: any = await pubApprRes3.json();
  if (pubApprData3.data.length === 0) {
    console.log('   ✅ PASS: Pending re-moderation review is safely hidden from public view');
  } else {
    console.error('   ❌ FAIL:', pubApprData3);
    process.exit(1);
  }

  // Test 16: Another student attempts to edit review (Must return 403)
  console.log('\n🔹 Test 16: Other student attempting to edit review');
  const otherStudentEditRes = await fetch(`${BASE_URL}/reviews/${review1Id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student2Token}`,
    },
    body: JSON.stringify({ comment: 'Hacked edit' }),
  });
  const otherStudentEditData: any = await otherStudentEditRes.json();
  if (otherStudentEditRes.status === 403) {
    console.log('   ✅ PASS: Blocked unauthorized student from editing review with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', otherStudentEditRes.status, otherStudentEditData);
    process.exit(1);
  }

  // Test 17: Super Admin rejects review with moderation notes
  console.log('\n🔹 Test 17: Super Admin rejects review with notes (status -> rejected)');
  const rejectRes = await fetch(`${BASE_URL}/reviews/${review1Id}/moderate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'rejected',
      moderationNotes: 'Contains external promo links.',
    }),
  });
  const rejectData: any = await rejectRes.json();
  if (rejectRes.status === 200 && rejectData.data.status === 'rejected') {
    console.log("   ✅ PASS: Review status set to 'rejected' with moderation notes");
  } else {
    console.error('   ❌ FAIL:', rejectData);
    process.exit(1);
  }

  // Test 18: Student views rejected review status
  console.log('\n🔹 Test 18: Student views own reviews list containing rejected status');
  const myRevsRes2 = await fetch(`${BASE_URL}/reviews/me`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const myRevsData2: any = await myRevsRes2.json();
  if (myRevsData2.data[0].status === 'rejected') {
    console.log("   ✅ PASS: Student can see their review is 'rejected'");
  } else {
    console.error('   ❌ FAIL:', myRevsData2);
    process.exit(1);
  }

  // Test 19: Super Admin re-approves review
  console.log('\n🔹 Test 19: Super Admin re-approves review (status -> approved)');
  const reApproveRes = await fetch(`${BASE_URL}/reviews/${review1Id}/moderate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'approved',
      isFeatured: true,
    }),
  });
  const reApproveData: any = await reApproveRes.json();
  if (reApproveRes.status === 200 && reApproveData.data.status === 'approved') {
    console.log("   ✅ PASS: Review successfully re-approved");
  } else {
    console.error('   ❌ FAIL:', reApproveData);
    process.exit(1);
  }

  // Test 20: Student deletes own review
  console.log('\n🔹 Test 20: Student deletes own review (DELETE /reviews/:id)');
  const deleteRevRes = await fetch(`${BASE_URL}/reviews/${review1Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const deleteRevData: any = await deleteRevRes.json();
  if (deleteRevRes.status === 200) {
    console.log('   ✅ PASS: Student deleted own review successfully');
  } else {
    console.error('   ❌ FAIL:', deleteRevData);
    process.exit(1);
  }

  // Test 21: Verify review is completely removed
  console.log('\n🔹 Test 21: Verify deleted review does not exist in public listings');
  const pubApprRes4 = await fetch(`${BASE_URL}/reviews/approved`);
  const pubApprData4: any = await pubApprRes4.json();
  if (pubApprData4.data.length === 0) {
    console.log('   ✅ PASS: Review completely eradicated from public listings');
  } else {
    console.error('   ❌ FAIL:', pubApprData4);
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL 21 PHASE 11 TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================\n');
  process.exit(0);
}

runPhase11Tests().catch((err) => {
  console.error('Error running Phase 11 tests:', err);
  process.exit(1);
});
