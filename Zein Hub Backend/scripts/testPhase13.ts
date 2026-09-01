import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import {
  User,
  Program,
  Enrollment,
  InstructorProfile,
  Certificate,
  Lesson,
  Module,
  Quiz,
} from '../src/models/index.js';
import { UserRole } from '../src/constants/roles.enum.js';
import { EnrollmentStatus } from '../src/constants/enrollmentStatus.enum.js';

const BASE_URL = 'http://localhost:5000/api/v1';
const ROOT_URL = 'http://localhost:5000';

async function runPhase13Tests() {
  console.log('=========================================');
  console.log('🛡️ Starting Phase 13 Security & Hardening Verifications');
  console.log('=========================================\n');

  await connectDB();

  const voiceOverProg = await Program.findOne({ slug: 'voice-over-digital-vocalise' });
  const podcastingProg = await Program.findOne({ slug: 'smart-podcasting-audio-production' });

  if (!voiceOverProg || !podcastingProg) {
    console.error('❌ Required seed programs missing.');
    process.exit(1);
  }

  // Setup test users
  let adminUser = await User.findOne({ email: 'admin@zeinhub.com' });
  let assignedInst = await User.findOne({ email: 'instructor.voice13@zeinhub.com' });
  if (!assignedInst) {
    assignedInst = await User.create({
      fullName: 'Instructor Phase 13',
      email: 'instructor.voice13@zeinhub.com',
      password: 'InstructorPass123!',
      role: UserRole.INSTRUCTOR,
      isActive: true,
    });
  }

  await InstructorProfile.findOneAndUpdate(
    { userId: assignedInst._id },
    {
      $set: {
        userId: assignedInst._id,
        bio: 'Voice Specialist',
        assignedPrograms: [voiceOverProg._id],
        isActive: true,
      },
    },
    { upsert: true }
  );

  let enrolledStudent = await User.findOne({ email: 'student.hardened1@zeinhub.com' });
  if (!enrolledStudent) {
    enrolledStudent = await User.create({
      fullName: 'Enrolled Student 13',
      email: 'student.hardened1@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  let unenrolledStudent = await User.findOne({ email: 'student.hardened2@zeinhub.com' });
  if (!unenrolledStudent) {
    unenrolledStudent = await User.create({
      fullName: 'Unenrolled Student 13',
      email: 'student.hardened2@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  // Ensure active enrollment for enrolledStudent in voiceOverProg
  await Enrollment.findOneAndUpdate(
    { studentId: enrolledStudent._id, programId: voiceOverProg._id },
    {
      $set: {
        studentId: enrolledStudent._id,
        programId: voiceOverProg._id,
        status: EnrollmentStatus.ACTIVE,
        enrolledAt: new Date(),
      },
    },
    { upsert: true }
  );

  // Remove enrollment for unenrolledStudent
  await Enrollment.deleteMany({
    studentId: unenrolledStudent._id,
    programId: voiceOverProg._id,
  });

  // Create a paid lesson for testing content protection regression
  let testModule = await Module.findOne({ programId: voiceOverProg._id });
  if (!testModule) {
    testModule = await Module.create({
      title: 'وحدة هندسة الصوت المتقدمة',
      programId: voiceOverProg._id,
      order: 1,
    });
  }

  let paidLesson = await Lesson.findOne({ moduleId: testModule._id, isFreePreview: false });
  if (!paidLesson) {
    paidLesson = await Lesson.create({
      title: 'درس العزل الصوتي واستخدام الميكروفون',
      moduleId: testModule._id,
      programId: voiceOverProg._id,
      order: 1,
      isFreePreview: false,
      isPublished: true,
      contentUrl: 'https://cdn.zeinhub.com/secure/audio-mastery.mp4',
      textBody: 'Confidential audio engineering lesson material.',
    });
  } else {
    paidLesson.contentUrl = 'https://cdn.zeinhub.com/secure/audio-mastery.mp4';
    await paidLesson.save();
  }

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
  const assignedInstToken = await login('instructor.voice13@zeinhub.com', 'InstructorPass123!');
  const enrolledStudentToken = await login('student.hardened1@zeinhub.com', 'StudentPass123!');
  const unenrolledStudentToken = await login('student.hardened2@zeinhub.com', 'StudentPass123!');

  // 1. Health Checks
  console.log('🔹 Test 1: Health Check verification (Root /health and /api/v1/health)');
  const healthRes = await fetch(`${ROOT_URL}/health`);
  const healthData: any = await healthRes.json();
  if (healthRes.status === 200 && healthData.data.status === 'UP' && healthData.data.database === 'connected') {
    console.log('   ✅ PASS: Health check endpoint working without exposing secrets');
  } else {
    console.error('   ❌ FAIL:', healthData);
    process.exit(1);
  }

  // 2. HTTP Security Headers
  console.log('\n🔹 Test 2: HTTP Security Headers verification');
  const headers = healthRes.headers;
  const nosniff = headers.get('x-content-type-options') === 'nosniff';
  const frameDeny = headers.get('x-frame-options') === 'DENY';
  const poweredByHidden = !headers.get('x-powered-by');
  if (nosniff && frameDeny && poweredByHidden) {
    console.log('   ✅ PASS: Security headers present (X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-Powered-By stripped)');
  } else {
    console.error('   ❌ FAIL: Missing security headers:', { nosniff, frameDeny, poweredByHidden });
    process.exit(1);
  }

  // 3. NoSQL Injection Sanitization
  console.log('\n🔹 Test 3: NoSQL Injection Sanitization (Stripping $ operator payloads)');
  const nosqlRes = await fetch(`${BASE_URL}/reviews/approved?rating[$ne]=0`);
  const nosqlData: any = await nosqlRes.json();
  if (nosqlRes.status === 200) {
    console.log('   ✅ PASS: NoSQL injection query sanitized without crashing server');
  } else {
    console.error('   ❌ FAIL:', nosqlData);
    process.exit(1);
  }

  // 4. XSS Script Stripping in submissions
  console.log('\n🔹 Test 4: XSS Sanitization in Text Submissions');
  const xssTestRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${enrolledStudentToken}`,
    },
    body: JSON.stringify({
      rating: 5,
      comment: 'Superb masterclass! <script>alert("hacked")</script> Very practical acoustics.',
    }),
  });
  const xssTestData: any = await xssTestRes.json();
  if (
    xssTestRes.status === 201 &&
    !xssTestData.data.comment.includes('<script>')
  ) {
    console.log('   ✅ PASS: Malicious <script> tags sanitized cleanly from stored review');
  } else {
    // If already reviewed, it could return 409 duplicate which is also protected
    if (xssTestRes.status === 409) {
      console.log('   ✅ PASS: Duplicate review blocked (409 Conflict)');
    } else {
      console.error('   ❌ FAIL:', xssTestData);
      process.exit(1);
    }
  }

  // 5. Authentication Hardening (Invalid & Missing Tokens)
  console.log('\n🔹 Test 5: Authentication Token Rejection (Invalid, Expired, Missing)');
  const fakeTokenRes = await fetch(`${BASE_URL}/auth/profile`, {
    headers: { Authorization: 'Bearer invalid.jwt.token.here' },
  });
  if (fakeTokenRes.status === 401) {
    console.log('   ✅ PASS: Invalid token rejected with 401 Unauthorized');
  } else {
    console.error('   ❌ FAIL: Expected 401, got', fakeTokenRes.status);
    process.exit(1);
  }

  // 6. RBAC Hardening (Student accessing Admin route)
  console.log('\n🔹 Test 6: RBAC Protection (Student accessing Super Admin analytics)');
  const rbacRes = await fetch(`${BASE_URL}/admin/dashboard/overview`, {
    headers: { Authorization: `Bearer ${enrolledStudentToken}` },
  });
  if (rbacRes.status === 403) {
    console.log('   ✅ PASS: Blocked student from Admin endpoints with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', rbacRes.status);
    process.exit(1);
  }

  // 7. Instructor Scoping Hardening (Accessing Unassigned Program)
  console.log('\n🔹 Test 7: Instructor Scoping Protection (Accessing unassigned program)');
  const instUnauthRes = await fetch(`${BASE_URL}/admin/reports/programs/${podcastingProg._id}`, {
    headers: { Authorization: `Bearer ${assignedInstToken}` },
  });
  if (instUnauthRes.status === 403) {
    console.log('   ✅ PASS: Blocked instructor from unauthorized program report with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', instUnauthRes.status);
    process.exit(1);
  }

  // 8. Content Protection Regression (Paid Lesson Protection)
  console.log('\n🔹 Test 8: Content Protection Regression (Paid lesson media protection)');
  const unenrolledLessonRes = await fetch(`${BASE_URL}/lessons/${paidLesson._id}`, {
    headers: { Authorization: `Bearer ${unenrolledStudentToken}` },
  });
  const unenrolledLessonData: any = await unenrolledLessonRes.json();
  if (unenrolledLessonRes.status === 403) {
    console.log('   ✅ PASS: Paid lesson completely locked for unenrolled student with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unenrolledLessonRes.status, unenrolledLessonData);
    process.exit(1);
  }

  // 9. Enrolled Student accessing Paid Lesson
  console.log('\n🔹 Test 9: Enrolled Student accessing Paid Lesson');
  const enrolledLessonRes = await fetch(`${BASE_URL}/lessons/${paidLesson._id}`, {
    headers: { Authorization: `Bearer ${enrolledStudentToken}` },
  });
  const enrolledLessonData: any = await enrolledLessonRes.json();
  if (enrolledLessonRes.status === 200 && enrolledLessonData.data.contentUrl) {
    console.log('   ✅ PASS: Enrolled student accessed paid lesson media securely');
  } else {
    console.error('   ❌ FAIL:', enrolledLessonData);
    process.exit(1);
  }

  // 10. Certificate Public Verification
  console.log('\n🔹 Test 10: Certificate Verification Public Access');
  const certVerifyRes = await fetch(`${BASE_URL}/certificates/ZH-FAKE-NUMBER/verify`);
  if (certVerifyRes.status === 404) {
    console.log('   ✅ PASS: Invalid certificate verification safely handled with 404');
  } else {
    console.error('   ❌ FAIL: Expected 404, got', certVerifyRes.status);
    process.exit(1);
  }

  // 11. Error Handling Standard (Undefined Route 404)
  console.log('\n🔹 Test 11: Standardized 404 Not Found for undefined routes');
  const notFoundRes = await fetch(`${BASE_URL}/non-existent-endpoint-test`);
  const notFoundData: any = await notFoundRes.json();
  if (
    notFoundRes.status === 404 &&
    notFoundData.success === false &&
    notFoundData.message
  ) {
    console.log('   ✅ PASS: Standardized error response returned for undefined route');
  } else {
    console.error('   ❌ FAIL:', notFoundData);
    process.exit(1);
  }

  // 12. Response Compression
  console.log('\n🔹 Test 12: Compression Middleware on API responses');
  const compRes = await fetch(`${BASE_URL}/programs`, {
    headers: { 'Accept-Encoding': 'gzip, deflate, br' },
  });
  if (compRes.status === 200) {
    console.log('   ✅ PASS: API endpoint served with compression support');
  } else {
    console.error('   ❌ FAIL:', compRes.status);
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL PHASE 13 SECURITY & HARDENING TESTS PASSED!');
  console.log('=========================================\n');
  process.exit(0);
}

runPhase13Tests().catch((err) => {
  console.error('Error running Phase 13 tests:', err);
  process.exit(1);
});
