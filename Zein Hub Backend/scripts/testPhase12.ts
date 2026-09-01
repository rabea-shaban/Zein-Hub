import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import {
  User,
  Program,
  Enrollment,
  InstructorProfile,
  Certificate,
  Attendance,
  LiveSession,
  Review,
  Application,
} from '../src/models/index.js';
import { UserRole } from '../src/constants/roles.enum.js';
import { EnrollmentStatus } from '../src/constants/enrollmentStatus.enum.js';
import { ApplicationStatus } from '../src/constants/applicationStatus.enum.js';
import { LiveSessionStatus, AttendanceStatus } from '../src/constants/content.enum.js';
import { ReviewStatus } from '../src/models/review.model.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runPhase12Tests() {
  console.log('=========================================');
  console.log('🧪 Starting Phase 12 Automated Verifications');
  console.log('=========================================\n');

  await connectDB();

  const voiceOverProg = await Program.findOne({ slug: 'voice-over-digital-vocalise' });
  const podcastingProg = await Program.findOne({ slug: 'smart-podcasting-audio-production' });

  if (!voiceOverProg || !podcastingProg) {
    console.error('❌ Required seed programs missing.');
    process.exit(1);
  }

  // Setup test users
  let assignedInst = await User.findOne({ email: 'instructor.voice12@zeinhub.com' });
  if (!assignedInst) {
    assignedInst = await User.create({
      fullName: 'Instructor Phase 12',
      email: 'instructor.voice12@zeinhub.com',
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

  let studentUser = await User.findOne({ email: 'student.analytics12@zeinhub.com' });
  if (!studentUser) {
    studentUser = await User.create({
      fullName: 'Student Phase 12',
      email: 'student.analytics12@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  // Direct MongoDB Ground-Truth Counts for Cross-Validation
  const expectedTotalStudents = await User.countDocuments({ role: UserRole.STUDENT });
  const expectedTotalPrograms = await Program.countDocuments({});
  const expectedTotalCertificates = await Certificate.countDocuments({ isRevoked: false });
  const expectedTotalEnrollments = await Enrollment.countDocuments({});

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
  const assignedInstToken = await login('instructor.voice12@zeinhub.com', 'InstructorPass123!');
  const studentToken = await login('student.analytics12@zeinhub.com', 'StudentPass123!');

  // Test 1: Super Admin gets Dashboard Overview KPIs
  console.log('🔹 Test 1: Super Admin gets Dashboard Overview KPIs (GET /admin/dashboard/overview)');
  const adminOverviewRes = await fetch(`${BASE_URL}/admin/dashboard/overview`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminOverviewData: any = await adminOverviewRes.json();
  if (
    adminOverviewRes.status === 200 &&
    adminOverviewData.data.users &&
    adminOverviewData.data.programs &&
    adminOverviewData.data.enrollments
  ) {
    console.log('   ✅ PASS: Dashboard Overview KPIs retrieved successfully');
  } else {
    console.error('   ❌ FAIL:', adminOverviewData);
    process.exit(1);
  }

  // Test 2: Cross-Validation with direct MongoDB ground-truth numbers
  console.log('\n🔹 Test 2: Mathematical Cross-Validation against direct MongoDB queries');
  const d = adminOverviewData.data;
  const isStudentsMatch = d.users.totalStudents === expectedTotalStudents;
  const isProgramsMatch = d.programs.total === expectedTotalPrograms;
  const isCertsMatch = d.academic.totalCertificatesIssued === expectedTotalCertificates;
  const isEnrsMatch = d.enrollments.total === expectedTotalEnrollments;

  if (isStudentsMatch && isProgramsMatch && isCertsMatch && isEnrsMatch) {
    console.log(`   ✅ PASS: Cross-Validation 100% Exact Match:`);
    console.log(`      - Total Students: ${d.users.totalStudents} === ${expectedTotalStudents}`);
    console.log(`      - Total Programs: ${d.programs.total} === ${expectedTotalPrograms}`);
    console.log(`      - Total Certificates: ${d.academic.totalCertificatesIssued} === ${expectedTotalCertificates}`);
    console.log(`      - Total Enrollments: ${d.enrollments.total} === ${expectedTotalEnrollments}`);
  } else {
    console.error('   ❌ FAIL: Discrepancy detected in cross-validation:', {
      expected: { expectedTotalStudents, expectedTotalPrograms, expectedTotalCertificates, expectedTotalEnrollments },
      received: {
        students: d.users.totalStudents,
        programs: d.programs.total,
        certificates: d.academic.totalCertificatesIssued,
        enrollments: d.enrollments.total,
      },
    });
    process.exit(1);
  }

  // Test 3: Enrollment Analytics by Status, Track, Program
  console.log('\n🔹 Test 3: Enrollment Analytics (GET /admin/analytics/enrollments)');
  const enrAnalyticsRes = await fetch(`${BASE_URL}/admin/analytics/enrollments`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const enrAnalyticsData: any = await enrAnalyticsRes.json();
  if (
    enrAnalyticsRes.status === 200 &&
    enrAnalyticsData.data.byStatus &&
    Array.isArray(enrAnalyticsData.data.byTrack) &&
    Array.isArray(enrAnalyticsData.data.byProgram)
  ) {
    console.log(`   ✅ PASS: Enrollment analytics grouped by Track (${enrAnalyticsData.data.byTrack.length}) and Program (${enrAnalyticsData.data.byProgram.length})`);
  } else {
    console.error('   ❌ FAIL:', enrAnalyticsData);
    process.exit(1);
  }

  // Test 4: Progress Analytics & Distribution Tiers
  console.log('\n🔹 Test 4: Progress Analytics & Tiers Distribution (GET /admin/analytics/progress)');
  const progAnalyticsRes = await fetch(`${BASE_URL}/admin/analytics/progress`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const progAnalyticsData: any = await progAnalyticsRes.json();
  if (
    progAnalyticsRes.status === 200 &&
    progAnalyticsData.data.progressTiers &&
    typeof progAnalyticsData.data.averageCompletionPercentage === 'number'
  ) {
    console.log(`   ✅ PASS: Progress analytics retrieved (Avg completion: ${progAnalyticsData.data.averageCompletionPercentage}%, Tier 100%: ${progAnalyticsData.data.progressTiers.tier100})`);
  } else {
    console.error('   ❌ FAIL:', progAnalyticsData);
    process.exit(1);
  }

  // Test 5: Attendance Analytics
  console.log('\n🔹 Test 5: Attendance Analytics (GET /admin/analytics/attendance)');
  const attAnalyticsRes = await fetch(`${BASE_URL}/admin/analytics/attendance`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const attAnalyticsData: any = await attAnalyticsRes.json();
  if (
    attAnalyticsRes.status === 200 &&
    typeof attAnalyticsData.data.overallAttendanceRate === 'number' &&
    attAnalyticsData.data.attendanceBreakdown
  ) {
    console.log(`   ✅ PASS: Attendance analytics retrieved (Rate: ${attAnalyticsData.data.overallAttendanceRate}%, Present: ${attAnalyticsData.data.attendanceBreakdown.present})`);
  } else {
    console.error('   ❌ FAIL:', attAnalyticsData);
    process.exit(1);
  }

  // Test 6: Assessments (Quizzes & Assignments) Analytics
  console.log('\n🔹 Test 6: Assessments Analytics (GET /admin/analytics/assessments)');
  const assessAnalyticsRes = await fetch(`${BASE_URL}/admin/analytics/assessments`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const assessAnalyticsData: any = await assessAnalyticsRes.json();
  if (
    assessAnalyticsRes.status === 200 &&
    assessAnalyticsData.data.quizzes &&
    assessAnalyticsData.data.assignments
  ) {
    console.log(`   ✅ PASS: Assessment analytics retrieved (Quiz Pass Rate: ${assessAnalyticsData.data.quizzes.passRate}%, Submissions: ${assessAnalyticsData.data.assignments.totalSubmissions})`);
  } else {
    console.error('   ❌ FAIL:', assessAnalyticsData);
    process.exit(1);
  }

  // Test 7: Certificates Analytics
  console.log('\n🔹 Test 7: Certificates Analytics (GET /admin/analytics/certificates)');
  const certAnalyticsRes = await fetch(`${BASE_URL}/admin/analytics/certificates`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const certAnalyticsData: any = await certAnalyticsRes.json();
  if (
    certAnalyticsRes.status === 200 &&
    typeof certAnalyticsData.data.totalCertificatesIssued === 'number' &&
    typeof certAnalyticsData.data.completionConversionRate === 'number'
  ) {
    console.log(`   ✅ PASS: Certificate analytics retrieved (Total: ${certAnalyticsData.data.totalCertificatesIssued}, Conversion Rate: ${certAnalyticsData.data.completionConversionRate}%)`);
  } else {
    console.error('   ❌ FAIL:', certAnalyticsData);
    process.exit(1);
  }

  // Test 8: Reviews & Ratings Analytics
  console.log('\n🔹 Test 8: Reviews Analytics (GET /admin/analytics/reviews)');
  const revAnalyticsRes = await fetch(`${BASE_URL}/admin/analytics/reviews`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const revAnalyticsData: any = await revAnalyticsRes.json();
  if (
    revAnalyticsRes.status === 200 &&
    typeof revAnalyticsData.data.averagePlatformRating === 'number' &&
    revAnalyticsData.data.starDistribution
  ) {
    console.log(`   ✅ PASS: Reviews analytics retrieved (Avg platform rating: ${revAnalyticsData.data.averagePlatformRating}, Star Distribution: 1-5 stars breakdown)`);
  } else {
    console.error('   ❌ FAIL:', revAnalyticsData);
    process.exit(1);
  }

  // Test 9: Program-Specific Deep Dive Report
  console.log(`\n🔹 Test 9: Program-Specific Deep Dive Report (GET /admin/reports/programs/${voiceOverProg._id})`);
  const progReportRes = await fetch(`${BASE_URL}/admin/reports/programs/${voiceOverProg._id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const progReportData: any = await progReportRes.json();
  if (
    progReportRes.status === 200 &&
    progReportData.data.program.titleAr &&
    progReportData.data.metrics
  ) {
    console.log(`   ✅ PASS: Program detailed report retrieved for: ${progReportData.data.program.titleEn}`);
  } else {
    console.error('   ❌ FAIL:', progReportData);
    process.exit(1);
  }

  // Test 10: Students Enrollments Operational Report with Pagination
  console.log('\n🔹 Test 10: Students Operational Report with Pagination (GET /admin/reports/students?page=1&limit=10)');
  const studentsReportRes = await fetch(`${BASE_URL}/admin/reports/students?page=1&limit=10`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const studentsReportData: any = await studentsReportRes.json();
  if (
    studentsReportRes.status === 200 &&
    Array.isArray(studentsReportData.data) &&
    studentsReportData.meta.page === 1
  ) {
    console.log(`   ✅ PASS: Students report paginated successfully (Total records: ${studentsReportData.meta.total})`);
  } else {
    console.error('   ❌ FAIL:', studentsReportData);
    process.exit(1);
  }

  // Test 11: Student attempting to access Dashboard (Must return 403)
  console.log('\n🔹 Test 11: Student attempting to access admin dashboard (Security Check)');
  const studentDashRes = await fetch(`${BASE_URL}/admin/dashboard/overview`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const studentDashData: any = await studentDashRes.json();
  if (studentDashRes.status === 403) {
    console.log('   ✅ PASS: Blocked student from admin analytics with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', studentDashRes.status, studentDashData);
    process.exit(1);
  }

  // Test 12: Unauthenticated Visitor attempting to access Dashboard (Must return 401)
  console.log('\n🔹 Test 12: Guest attempting to access admin dashboard');
  const guestDashRes = await fetch(`${BASE_URL}/admin/dashboard/overview`);
  const guestDashData: any = await guestDashRes.json();
  if (guestDashRes.status === 401) {
    console.log('   ✅ PASS: Blocked guest with 401 Unauthorized');
  } else {
    console.error('   ❌ FAIL: Expected 401, got', guestDashRes.status, guestDashData);
    process.exit(1);
  }

  // Test 13: Assigned Instructor accesses Scoped Dashboard Overview
  console.log('\n🔹 Test 13: Assigned Instructor accesses Scoped Dashboard Overview');
  const instOverviewRes = await fetch(`${BASE_URL}/admin/dashboard/overview`, {
    headers: { Authorization: `Bearer ${assignedInstToken}` },
  });
  const instOverviewData: any = await instOverviewRes.json();
  if (
    instOverviewRes.status === 200 &&
    instOverviewData.data.programs.total === 1 // Instructor only assigned to 1 program
  ) {
    console.log(`   ✅ PASS: Instructor overview successfully scoped to assigned programs (Total: 1)`);
  } else {
    console.error('   ❌ FAIL:', instOverviewData);
    process.exit(1);
  }

  // Test 14: Assigned Instructor views report for assigned program
  console.log(`\n🔹 Test 14: Assigned Instructor views report for assigned program`);
  const instProgReportRes = await fetch(`${BASE_URL}/admin/reports/programs/${voiceOverProg._id}`, {
    headers: { Authorization: `Bearer ${assignedInstToken}` },
  });
  const instProgReportData: any = await instProgReportRes.json();
  if (instProgReportRes.status === 200 && instProgReportData.data.metrics) {
    console.log('   ✅ PASS: Assigned instructor retrieved assigned program report');
  } else {
    console.error('   ❌ FAIL:', instProgReportData);
    process.exit(1);
  }

  // Test 15: Assigned Instructor attempts to view unassigned program report (Must return 403)
  console.log('\n🔹 Test 15: Assigned Instructor attempts to view unauthorized program report');
  const unauthProgReportRes = await fetch(`${BASE_URL}/admin/reports/programs/${podcastingProg._id}`, {
    headers: { Authorization: `Bearer ${assignedInstToken}` },
  });
  const unauthProgReportData: any = await unauthProgReportRes.json();
  if (unauthProgReportRes.status === 403) {
    console.log('   ✅ PASS: Blocked instructor from unassigned program report with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unauthProgReportRes.status, unauthProgReportData);
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL 15 PHASE 12 TESTS & GROUND-TRUTH CROSS-VALIDATIONS PASSED SUCCESSFULLY!');
  console.log('=========================================\n');
  process.exit(0);
}

runPhase12Tests().catch((err) => {
  console.error('Error running Phase 12 tests:', err);
  process.exit(1);
});
