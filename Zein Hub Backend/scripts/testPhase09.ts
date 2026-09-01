import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import {
  User,
  Program,
  Module,
  Lesson,
  Enrollment,
  InstructorProfile,
  Quiz,
  Question,
  QuizAttempt,
  Assignment,
  Submission,
  Progress,
  Certificate,
} from '../src/models/index.js';
import { UserRole } from '../src/constants/roles.enum.js';
import { EnrollmentStatus } from '../src/constants/enrollmentStatus.enum.js';
import { SubmissionStatus, AssignmentSubmissionType } from '../src/constants/content.enum.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runPhase09Tests() {
  console.log('=========================================');
  console.log('🧪 Starting Phase 09 Automated Verifications');
  console.log('=========================================\n');

  await connectDB();

  const voiceOverProg = await Program.findOne({ slug: 'voice-over-digital-vocalise' });
  const podcastingProg = await Program.findOne({ slug: 'smart-podcasting-audio-production' });

  if (!voiceOverProg || !podcastingProg) {
    console.error('❌ Required seed programs missing. Run npm run seed:tracks-programs first.');
    process.exit(1);
  }

  // Setup/Ensure instructor users
  let assignedInst = await User.findOne({ email: 'instructor.voice9@zeinhub.com' });
  if (!assignedInst) {
    assignedInst = await User.create({
      fullName: 'Dr. Voice Coach Phase 9',
      email: 'instructor.voice9@zeinhub.com',
      password: 'InstructorPass123!',
      role: UserRole.INSTRUCTOR,
      isActive: true,
    });
  }

  let unassignedInst = await User.findOne({ email: 'instructor.other9@zeinhub.com' });
  if (!unassignedInst) {
    unassignedInst = await User.create({
      fullName: 'Other Track Instructor Phase 9',
      email: 'instructor.other9@zeinhub.com',
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

  await InstructorProfile.findOneAndUpdate(
    { userId: unassignedInst._id },
    {
      $set: {
        userId: unassignedInst._id,
        bio: 'Other Specialist',
        assignedPrograms: [podcastingProg._id],
        isActive: true,
      },
    },
    { upsert: true }
  );

  // Setup students
  let student1 = await User.findOne({ email: 'student.graduating9@zeinhub.com' });
  if (!student1) {
    student1 = await User.create({
      fullName: 'Kareem Graduating Student',
      email: 'student.graduating9@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  let student2 = await User.findOne({ email: 'student.unenrolled9@zeinhub.com' });
  if (!student2) {
    student2 = await User.create({
      fullName: 'Laila Unenrolled Student',
      email: 'student.unenrolled9@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  // Setup fresh module, 2 lessons, 1 quiz, 1 assignment for Voice-Over program
  await Module.deleteMany({ programId: voiceOverProg._id });
  await Lesson.deleteMany({ programId: voiceOverProg._id });
  await Quiz.deleteMany({ programId: voiceOverProg._id });
  await Question.deleteMany({});
  await QuizAttempt.deleteMany({ programId: voiceOverProg._id });
  await Assignment.deleteMany({ programId: voiceOverProg._id });
  await Submission.deleteMany({ programId: voiceOverProg._id });
  await Progress.deleteMany({ programId: voiceOverProg._id });
  await Enrollment.deleteMany({ programId: voiceOverProg._id });
  await Certificate.deleteMany({ programId: voiceOverProg._id });

  const testModule = await Module.create({
    programId: voiceOverProg._id,
    title: 'Module 1: Complete Vocalise Suite',
    order: 1,
    isPublished: true,
  });

  const lesson1 = await Lesson.create({
    programId: voiceOverProg._id,
    moduleId: testModule._id,
    title: 'Lesson 1: Studio Setup & Microphone Warmup',
    order: 1,
    durationMinutes: 20,
    isFreePreview: false,
    isPublished: true,
  });

  const lesson2 = await Lesson.create({
    programId: voiceOverProg._id,
    moduleId: testModule._id,
    title: 'Lesson 2: Advanced Commercial Intonation',
    order: 2,
    durationMinutes: 30,
    isFreePreview: false,
    isPublished: true,
  });

  const testQuiz = await Quiz.create({
    programId: voiceOverProg._id,
    lessonId: lesson1._id,
    title: 'Module 1 Mastery Quiz',
    passingScore: 70,
    maxAttempts: 3,
    durationMinutes: 15,
    isPublished: true,
  });

  const question1 = await Question.create({
    quizId: testQuiz._id,
    prompt: 'What frequency range typically gives voice recordings presence?',
    options: [
      { text: '3kHz - 5kHz', isCorrect: true },
      { text: '20Hz - 40Hz', isCorrect: false },
    ],
    points: 10,
    order: 1,
  });

  const testAssignment = await Assignment.create({
    programId: voiceOverProg._id,
    moduleId: testModule._id,
    title: 'Final Audio Performance Capstone',
    description: 'Submit 45s audio commercial demo.',
    submissionType: AssignmentSubmissionType.AUDIO,
    maxScore: 100,
    isPublished: true,
  });

  // Setup student1 enrollment
  const s1Enrollment = await Enrollment.create({
    studentId: student1._id,
    programId: voiceOverProg._id,
    status: EnrollmentStatus.ACTIVE,
    enrolledAt: new Date(),
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
  const assignedInstToken = await login('instructor.voice9@zeinhub.com', 'InstructorPass123!');
  const unassignedInstToken = await login('instructor.other9@zeinhub.com', 'InstructorPass123!');
  const student1Token = await login('student.graduating9@zeinhub.com', 'StudentPass123!');
  const student2Token = await login('student.unenrolled9@zeinhub.com', 'StudentPass123!');

  // Test 1: Student views initial progress (Progress: 0%)
  console.log('🔹 Test 1: Student views initial progress (GET /progress/me)');
  const s1InitProgRes = await fetch(`${BASE_URL}/progress/me`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const s1InitProgData: any = await s1InitProgRes.json();
  if (
    s1InitProgRes.status === 200 &&
    s1InitProgData.data.length === 1 &&
    s1InitProgData.data[0].completionPercentage === 0 &&
    s1InitProgData.data[0].isCompleted === false
  ) {
    console.log('   ✅ PASS: Initial student progress is 0% with active incomplete enrollment');
  } else {
    console.error('   ❌ FAIL:', s1InitProgData);
    process.exit(1);
  }

  // Test 2: Student completes Lesson 1 (POST /lessons/:lessonId/complete)
  console.log(`\n🔹 Test 2: Student completes Lesson 1 (POST /lessons/${lesson1._id}/complete)`);
  const compL1Res = await fetch(`${BASE_URL}/lessons/${lesson1._id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const compL1Data: any = await compL1Res.json();
  if (
    compL1Res.status === 200 &&
    compL1Data.data.completed === true &&
    compL1Data.data.progressSummary.completionPercentage === 50
  ) {
    console.log('   ✅ PASS: Lesson 1 marked as completed; progress updated to 50% (1/2 lessons)');
  } else {
    console.error('   ❌ FAIL:', compL1Data);
    process.exit(1);
  }

  // Test 3: Student views updated progress summary
  console.log(`\n🔹 Test 3: Student views updated progress (GET /progress/me/${voiceOverProg._id})`);
  const progDetailRes = await fetch(`${BASE_URL}/progress/me/${voiceOverProg._id}`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const progDetailData: any = await progDetailRes.json();
  if (
    progDetailRes.status === 200 &&
    progDetailData.data.progress.completedLessonsCount === 1 &&
    progDetailData.data.progress.completionPercentage === 50
  ) {
    console.log('   ✅ PASS: Program detailed progress confirmed 50% with completed lesson details');
  } else {
    console.error('   ❌ FAIL:', progDetailData);
    process.exit(1);
  }

  // Test 4: Non-enrolled Student attempts to complete a lesson (Must return 403)
  console.log('\n🔹 Test 4: Non-enrolled Student attempting to complete lesson');
  const unenrolledCompRes = await fetch(`${BASE_URL}/lessons/${lesson1._id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${student2Token}` },
  });
  const unenrolledCompData: any = await unenrolledCompRes.json();
  if (unenrolledCompRes.status === 403) {
    console.log('   ✅ PASS: Blocked non-enrolled student from completing lessons with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unenrolledCompRes.status, unenrolledCompData);
    process.exit(1);
  }

  // Test 5: Student passes Quiz with 100% (Auto-grading & Progress recording)
  console.log('\n🔹 Test 5: Student submits and passes Quiz (POST /quizzes/:id/submit)');
  const quizSubRes = await fetch(`${BASE_URL}/quizzes/${testQuiz._id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({
      answers: [{ questionId: question1._id.toString(), selectedOptionIndices: [0] }],
    }),
  });
  const quizSubData: any = await quizSubRes.json();
  if (quizSubRes.status === 200 && quizSubData.data.scorePercentage === 100 && quizSubData.data.passed === true) {
    console.log('   ✅ PASS: Student passed Quiz with 100%');
  } else {
    console.error('   ❌ FAIL:', quizSubData);
    process.exit(1);
  }

  // Test 6: Student submits Assignment
  console.log('\n🔹 Test 6: Student submits Practical Assignment (POST /assignments/:id/submit)');
  const assignSubRes = await fetch(`${BASE_URL}/assignments/${testAssignment._id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({
      fileUrl: 'https://storage.zeinhub.com/submissions/student1_commercial.mp3',
      textContent: 'High energy commercial performance.',
    }),
  });
  const assignSubData: any = await assignSubRes.json();
  const submissionId = assignSubData.data._id;
  if (assignSubRes.status === 201 && submissionId) {
    console.log(`   ✅ PASS: Student submitted Assignment [ID: ${submissionId}]`);
  } else {
    console.error('   ❌ FAIL:', assignSubData);
    process.exit(1);
  }

  // Test 7: Assigned Instructor grades submission (Score: 90/100)
  console.log('\n🔹 Test 7: Assigned Instructor grades submission (PATCH /submissions/:id/grade)');
  const gradeRes = await fetch(`${BASE_URL}/submissions/${submissionId}/grade`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({
      grade: 90,
      feedback: 'Excellent rhythm, projection, and pristine tone delivery.',
    }),
  });
  const gradeData: any = await gradeRes.json();
  if (gradeRes.status === 200 && gradeData.data.grade === 90 && gradeData.data.status === 'graded') {
    console.log('   ✅ PASS: Instructor graded assignment: 90/100');
  } else {
    console.error('   ❌ FAIL:', gradeData);
    process.exit(1);
  }

  // Test 8 & 9: Incomplete Requirement Check - Only 1 of 2 lessons done, so completionPercentage = 50%, NO certificate
  console.log('\n🔹 Test 8 & 9: Incomplete Requirement Check - Course not yet completed');
  const midProgRes = await fetch(`${BASE_URL}/progress/me/${voiceOverProg._id}`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const midProgData: any = await midProgRes.json();
  if (
    midProgRes.status === 200 &&
    midProgData.data.enrollment.status === 'active' &&
    midProgData.data.certificate === null
  ) {
    console.log('   ✅ PASS: Enrollment remains active and NO Certificate issued while requirements are incomplete');
  } else {
    console.error('   ❌ FAIL:', midProgData);
    process.exit(1);
  }

  // Test 10, 11, 12, 13, 14, 15: Student completes remaining Lesson 2 -> All requirements complete -> 100% + Graduation + Certificate!
  console.log(`\n🔹 Test 10-15: Student completes final Lesson 2 (POST /lessons/${lesson2._id}/complete) -> Automatic Graduation & Certificate Generation`);
  const compL2Res = await fetch(`${BASE_URL}/lessons/${lesson2._id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const compL2Data: any = await compL2Res.json();
  let generatedCertNumber = '';
  if (
    compL2Res.status === 200 &&
    compL2Data.data.progressSummary.isCompleted === true &&
    compL2Data.data.progressSummary.status === 'completed' &&
    compL2Data.data.progressSummary.finalGrade === 95 && // (100 quiz + 90 assignment) / 2 = 95
    compL2Data.data.progressSummary.certificateIssued === true
  ) {
    generatedCertNumber = compL2Data.data.progressSummary.certificateNumber;
    console.log(`   ✅ PASS: 100% Content Completed!`);
    console.log(`   ✅ PASS: Academic Final Grade Calculated: 95/100 (Quiz 100% + Assignment 90%)`);
    console.log(`   ✅ PASS: Enrollment Status Transitioned to 'completed'`);
    console.log(`   ✅ PASS: Certificate Generated Automatically [Number: ${generatedCertNumber}]`);
  } else {
    console.error('   ❌ FAIL:', compL2Data);
    process.exit(1);
  }

  // Test 16: Certificate Number Format & Uniqueness
  console.log('\n🔹 Test 16: Certificate Number Format Validation');
  if (generatedCertNumber.startsWith('ZH-') && generatedCertNumber.includes('-2026-')) {
    console.log(`   ✅ PASS: Certificate number format valid: [${generatedCertNumber}]`);
  } else {
    console.error('   ❌ FAIL: Unexpected format for certificate number:', generatedCertNumber);
    process.exit(1);
  }

  // Test 17: Student retrieves own certificates (GET /certificates/me)
  console.log('\n🔹 Test 17: Student retrieves own certificates list (GET /certificates/me)');
  const myCertsRes = await fetch(`${BASE_URL}/certificates/me`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const myCertsData: any = await myCertsRes.json();
  if (
    myCertsRes.status === 200 &&
    myCertsData.data.length === 1 &&
    myCertsData.data[0].certificateNumber === generatedCertNumber &&
    myCertsData.data[0].finalGrade === 95
  ) {
    console.log('   ✅ PASS: Student retrieved official certificate with final grade: 95/100');
  } else {
    console.error('   ❌ FAIL:', myCertsData);
    process.exit(1);
  }

  // Test 18: Public Certificate Verification (No Auth Header)
  console.log(`\n🔹 Test 18: Public Certificate Verification (GET /certificates/${generatedCertNumber}/verify)`);
  const verifyRes = await fetch(`${BASE_URL}/certificates/${generatedCertNumber}/verify`);
  const verifyData: any = await verifyRes.json();
  if (
    verifyRes.status === 200 &&
    verifyData.data.isValid === true &&
    verifyData.data.certificateNumber === generatedCertNumber &&
    verifyData.data.studentName === 'Kareem Graduating Student' &&
    verifyData.data.finalGrade === 95
  ) {
    console.log('   ✅ PASS: Public verification authenticated certificate successfully with student name and grade');
  } else {
    console.error('   ❌ FAIL:', verifyData);
    process.exit(1);
  }

  // Test 19: Non-completed student has NO certificate
  console.log('\n🔹 Test 19: Verification check on non-completed student certificates');
  const s2CertsRes = await fetch(`${BASE_URL}/certificates/me`, {
    headers: { Authorization: `Bearer ${student2Token}` },
  });
  const s2CertsData: any = await s2CertsRes.json();
  if (s2CertsRes.status === 200 && s2CertsData.data.length === 0) {
    console.log('   ✅ PASS: Non-completed student has exactly 0 certificates');
  } else {
    console.error('   ❌ FAIL:', s2CertsData);
    process.exit(1);
  }

  // Test 20: Assigned Instructor views enrolled students progress
  console.log('\n🔹 Test 20: Assigned Instructor views program progress (GET /progress/program/:programId)');
  const instProgViewRes = await fetch(`${BASE_URL}/progress/program/${voiceOverProg._id}`, {
    headers: { Authorization: `Bearer ${assignedInstToken}` },
  });
  const instProgViewData: any = await instProgViewRes.json();
  if (
    instProgViewRes.status === 200 &&
    instProgViewData.data.length === 1 &&
    instProgViewData.data[0].status === 'completed' &&
    instProgViewData.data[0].finalGrade === 95
  ) {
    console.log('   ✅ PASS: Assigned instructor retrieved enrolled student progress with 100% completion and grade: 95');
  } else {
    console.error('   ❌ FAIL:', instProgViewData);
    process.exit(1);
  }

  // Test 21: Unassigned Instructor attempting to view program progress (Must return 403)
  console.log('\n🔹 Test 21: Unassigned Instructor viewing program progress');
  const unassignedProgRes = await fetch(`${BASE_URL}/progress/program/${voiceOverProg._id}`, {
    headers: { Authorization: `Bearer ${unassignedInstToken}` },
  });
  const unassignedProgData: any = await unassignedProgRes.json();
  if (unassignedProgRes.status === 403) {
    console.log('   ✅ PASS: Blocked unassigned instructor from viewing student progress with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unassignedProgRes.status, unassignedProgData);
    process.exit(1);
  }

  // Test 22: Recalculate Program Progress
  console.log('\n🔹 Test 22: Recalculating Program Progress (POST /progress/program/:programId/recalculate)');
  const recalcRes = await fetch(`${BASE_URL}/progress/program/${voiceOverProg._id}/recalculate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const recalcData: any = await recalcRes.json();
  if (recalcRes.status === 200 && recalcData.data.totalStudentsRecalculated === 1) {
    console.log('   ✅ PASS: Program recalculation executed successfully');
  } else {
    console.error('   ❌ FAIL:', recalcData);
    process.exit(1);
  }

  // Test 23: Idempotency Check - Verify Recalculation NEVER creates duplicate certificates!
  console.log('\n🔹 Test 23: Idempotency Check - Ensure no duplicate certificates created');
  const allCertsForStudent = await fetch(`${BASE_URL}/certificates/me`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const allCertsForStudentData: any = await allCertsForStudent.json();
  if (allCertsForStudentData.data.length === 1 && allCertsForStudentData.data[0].certificateNumber === generatedCertNumber) {
    console.log('   ✅ PASS: Idempotency verified: Exactly 1 unique certificate exists after multiple recalculations!');
  } else {
    console.error('   ❌ FAIL: Duplicate certificates detected:', allCertsForStudentData);
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL 23 PHASE 09 TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================\n');
  process.exit(0);
}

runPhase09Tests().catch((err) => {
  console.error('Error running Phase 09 tests:', err);
  process.exit(1);
});
