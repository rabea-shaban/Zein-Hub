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
} from '../src/models/index.js';
import { UserRole } from '../src/constants/roles.enum.js';
import { EnrollmentStatus } from '../src/constants/enrollmentStatus.enum.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runPhase08Tests() {
  console.log('=========================================');
  console.log('🧪 Starting Phase 08 Automated Verifications');
  console.log('=========================================\n');

  await connectDB();

  const voiceOverProg = await Program.findOne({ slug: 'voice-over-digital-vocalise' });
  const podcastingProg = await Program.findOne({ slug: 'smart-podcasting-audio-production' });

  if (!voiceOverProg || !podcastingProg) {
    console.error('❌ Required seed programs missing. Run npm run seed:tracks-programs first.');
    process.exit(1);
  }

  // Setup/Ensure instructor users
  let assignedInst = await User.findOne({ email: 'instructor.voice8@zeinhub.com' });
  if (!assignedInst) {
    assignedInst = await User.create({
      fullName: 'Dr. Voice Instructor Phase 8',
      email: 'instructor.voice8@zeinhub.com',
      password: 'InstructorPass123!',
      role: UserRole.INSTRUCTOR,
      isActive: true,
    });
  }

  let unassignedInst = await User.findOne({ email: 'instructor.other8@zeinhub.com' });
  if (!unassignedInst) {
    unassignedInst = await User.create({
      fullName: 'Other Track Instructor Phase 8',
      email: 'instructor.other8@zeinhub.com',
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
  let enrolledStudent = await User.findOne({ email: 'student.enrolled8@zeinhub.com' });
  if (!enrolledStudent) {
    enrolledStudent = await User.create({
      fullName: 'Enrolled Student Phase 8',
      email: 'student.enrolled8@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  let unenrolledStudent = await User.findOne({ email: 'student.unenrolled8@zeinhub.com' });
  if (!unenrolledStudent) {
    unenrolledStudent = await User.create({
      fullName: 'Unenrolled Student Phase 8',
      email: 'student.unenrolled8@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

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

  await Enrollment.deleteMany({
    studentId: unenrolledStudent._id,
    programId: voiceOverProg._id,
  });

  // Ensure test Module and Lesson exist for voiceOverProg
  let testModule = await Module.findOne({ programId: voiceOverProg._id });
  if (!testModule) {
    testModule = await Module.create({
      programId: voiceOverProg._id,
      title: 'Module 01: Audio Training',
      order: 1,
      isPublished: true,
    });
  }

  let testLesson = await Lesson.findOne({ programId: voiceOverProg._id });
  if (!testLesson) {
    testLesson = await Lesson.create({
      programId: voiceOverProg._id,
      moduleId: testModule._id,
      title: 'Lesson 1.1: Vocal Basics',
      order: 1,
      isFreePreview: false,
      isPublished: true,
    });
  }

  // Clean old test quizzes/assignments for this lesson
  await Quiz.deleteMany({ lessonId: testLesson._id });
  await Assignment.deleteMany({ programId: voiceOverProg._id });
  await Submission.deleteMany({ programId: voiceOverProg._id });
  await QuizAttempt.deleteMany({ programId: voiceOverProg._id });

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
  const assignedInstToken = await login('instructor.voice8@zeinhub.com', 'InstructorPass123!');
  const unassignedInstToken = await login('instructor.other8@zeinhub.com', 'InstructorPass123!');
  const enrolledStudentToken = await login('student.enrolled8@zeinhub.com', 'StudentPass123!');
  const unenrolledStudentToken = await login('student.unenrolled8@zeinhub.com', 'StudentPass123!');

  // Test 1: Super Admin creates Quiz
  console.log('🔹 Test 1: Super Admin creates Quiz (POST /lessons/:lessonId/quizzes)');
  const adminQuizRes = await fetch(`${BASE_URL}/lessons/${testLesson._id}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: 'Voice Over Knowledge Check',
      description: 'Test your understanding of diaphragmatic breathing and acoustics.',
      passingScore: 70,
      maxAttempts: 3,
      durationMinutes: 20,
    }),
  });
  const adminQuizData: any = await adminQuizRes.json();
  let quizId = '';
  if (adminQuizRes.status === 201 && adminQuizData.data._id) {
    quizId = adminQuizData.data._id;
    console.log(`   ✅ PASS: Super Admin created Quiz [ID: ${quizId}]`);
  } else {
    console.error('   ❌ FAIL:', adminQuizData);
    process.exit(1);
  }

  // Test 2: Assigned Instructor adds Question to Quiz
  console.log('\n🔹 Test 2: Assigned Instructor adds Question to Quiz (POST /quizzes/:id/questions)');
  const q1Res = await fetch(`${BASE_URL}/quizzes/${quizId}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({
      prompt: 'Which breathing technique provides optimal vocal support for voice artists?',
      type: 'mcq',
      points: 10,
      options: [
        { text: 'Clavicular breathing (Upper chest)', isCorrect: false },
        { text: 'Diaphragmatic breathing (Abdominal support)', isCorrect: true },
        { text: 'Shallow throat breathing', isCorrect: false },
      ],
      explanation: 'Diaphragmatic breathing engages the abdominal muscles to support steady airflow.',
    }),
  });
  const q1Data: any = await q1Res.json();
  let question1Id = '';
  if (q1Res.status === 201 && q1Data.data._id) {
    question1Id = q1Data.data._id;
    console.log(`   ✅ PASS: Assigned Instructor added Question 1 [ID: ${question1Id}]`);
  } else {
    console.error('   ❌ FAIL:', q1Data);
    process.exit(1);
  }

  // Add Question 2
  const q2Res = await fetch(`${BASE_URL}/quizzes/${quizId}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({
      prompt: 'A condenser microphone requires 48V phantom power to operate.',
      type: 'true_false',
      points: 10,
      options: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
      explanation: 'Active condenser microphones need +48V phantom power.',
    }),
  });
  const q2Data: any = await q2Res.json();
  const question2Id = q2Data.data._id;

  // Test 3: Unassigned Instructor attempts to add question (Must return 403)
  console.log('\n🔹 Test 3: Unassigned Instructor adding question to unauthorized quiz');
  const unassignedQRes = await fetch(`${BASE_URL}/quizzes/${quizId}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${unassignedInstToken}`,
    },
    body: JSON.stringify({
      prompt: 'Hacked question',
      options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }],
    }),
  });
  const unassignedQData: any = await unassignedQRes.json();
  if (unassignedQRes.status === 403) {
    console.log('   ✅ PASS: Blocked unassigned instructor with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unassignedQRes.status, unassignedQData);
    process.exit(1);
  }

  // Test 4: Student attempts to add question (Must return 403)
  console.log('\n🔹 Test 4: Student attempting to add question');
  const studentQRes = await fetch(`${BASE_URL}/quizzes/${quizId}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${enrolledStudentToken}`,
    },
    body: JSON.stringify({
      prompt: 'Student question',
      options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }],
    }),
  });
  const studentQData: any = await studentQRes.json();
  if (studentQRes.status === 403) {
    console.log('   ✅ PASS: Blocked student with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', studentQRes.status, studentQData);
    process.exit(1);
  }

  // Test 5: Non-enrolled Student attempts to view Quiz (Must return 403)
  console.log('\n🔹 Test 5: Non-enrolled Student viewing Quiz');
  const unenrolledQuizRes = await fetch(`${BASE_URL}/quizzes/${quizId}`, {
    headers: { Authorization: `Bearer ${unenrolledStudentToken}` },
  });
  const unenrolledQuizData: any = await unenrolledQuizRes.json();
  if (unenrolledQuizRes.status === 403 && unenrolledQuizData.message.includes('Active enrollment required')) {
    console.log('   ✅ PASS: Blocked non-enrolled student from quiz with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unenrolledQuizRes.status, unenrolledQuizData);
    process.exit(1);
  }

  // Test 6: Enrolled Student views Quiz & Critical Anti-Cheat Check
  console.log('\n🔹 Test 6: Enrolled Student views Quiz & Anti-Cheat Validation');
  const enrolledQuizRes = await fetch(`${BASE_URL}/quizzes/${quizId}`, {
    headers: { Authorization: `Bearer ${enrolledStudentToken}` },
  });
  const enrolledQuizData: any = await enrolledQuizRes.json();
  const q1StudentView = enrolledQuizData.data.questions[0];

  const hasNoIsCorrect = q1StudentView.options.every((opt: any) => opt.isCorrect === undefined);
  const hasNoExplanation = q1StudentView.explanation === undefined;

  if (enrolledQuizRes.status === 200 && hasNoIsCorrect && hasNoExplanation) {
    console.log('   ✅ PASS: Enrolled student retrieved Quiz questions successfully');
    console.log('   ✅ PASS: Critical Anti-Cheat: isCorrect and explanation are completely concealed from student!');
  } else {
    console.error('   ❌ FAIL: Anti-Cheat failed! Student saw answers:', q1StudentView);
    process.exit(1);
  }

  // Test 7: Non-enrolled student attempts to submit quiz (Must return 403)
  console.log('\n🔹 Test 7: Non-enrolled Student submitting quiz');
  const unenrolledSubmitRes = await fetch(`${BASE_URL}/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${unenrolledStudentToken}`,
    },
    body: JSON.stringify({
      answers: [{ questionId: question1Id, selectedOptionIndices: [1] }],
    }),
  });
  const unenrolledSubmitData: any = await unenrolledSubmitRes.json();
  if (unenrolledSubmitRes.status === 403) {
    console.log('   ✅ PASS: Blocked non-enrolled student submission with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unenrolledSubmitRes.status, unenrolledSubmitData);
    process.exit(1);
  }

  // Test 8: Enrolled student submits quiz answers (Both correct: 100%)
  console.log('\n🔹 Test 8: Enrolled student submits quiz answers (Auto-grading & Scoring)');
  const submitRes = await fetch(`${BASE_URL}/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${enrolledStudentToken}`,
    },
    body: JSON.stringify({
      answers: [
        { questionId: question1Id, selectedOptionIndices: [1] }, // Correct
        { questionId: question2Id, selectedOptionIndices: [0] }, // Correct
      ],
    }),
  });
  const submitData: any = await submitRes.json();
  if (
    submitRes.status === 200 &&
    submitData.data.scorePercentage === 100 &&
    submitData.data.passed === true &&
    submitData.data.attemptNumber === 1
  ) {
    console.log(`   ✅ PASS: Quiz auto-graded: 100% (Passed: true, Attempt: 1)`);
  } else {
    console.error('   ❌ FAIL:', submitData);
    process.exit(1);
  }

  // Test 9: Super Admin creates Practical Assignment
  console.log('\n🔹 Test 9: Super Admin creates Practical Assignment (POST /lessons/:lessonId/assignments)');
  const adminAssignRes = await fetch(`${BASE_URL}/lessons/${testLesson._id}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: 'Assignment 1: Commercial Voice-Over Recording & Tone Matching',
      description: 'Record a 30-second commercial script using a confident, energetic tone.',
      instructions: 'Deliver clean WAV or MP3 audio with no background noise.',
      submissionType: 'audio',
      maxScore: 100,
    }),
  });
  const adminAssignData: any = await adminAssignRes.json();
  let assignmentId = '';
  if (adminAssignRes.status === 201 && adminAssignData.data._id) {
    assignmentId = adminAssignData.data._id;
    console.log(`   ✅ PASS: Super Admin created Assignment [ID: ${assignmentId}]`);
  } else {
    console.error('   ❌ FAIL:', adminAssignData);
    process.exit(1);
  }

  // Test 10: Non-enrolled student submitting assignment (Must return 403)
  console.log('\n🔹 Test 10: Non-enrolled Student submitting assignment');
  const unenrolledAssignRes = await fetch(`${BASE_URL}/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${unenrolledStudentToken}`,
    },
    body: JSON.stringify({
      fileUrl: 'https://storage.zeinhub.com/submissions/fake_voice.mp3',
    }),
  });
  const unenrolledAssignData: any = await unenrolledAssignRes.json();
  if (unenrolledAssignRes.status === 403) {
    console.log('   ✅ PASS: Blocked non-enrolled student with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unenrolledAssignRes.status, unenrolledAssignData);
    process.exit(1);
  }

  // Test 11: Enrolled student submits audio practical assignment
  console.log('\n🔹 Test 11: Enrolled student submits practical audio submission');
  const studentSubmitAssignRes = await fetch(`${BASE_URL}/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${enrolledStudentToken}`,
    },
    body: JSON.stringify({
      fileUrl: 'https://storage.zeinhub.com/submissions/student1_commercial_demo.mp3',
      textContent: 'Recorded with Shure SM7B in treated acoustic booth.',
    }),
  });
  const studentSubmitAssignData: any = await studentSubmitAssignRes.json();
  let submissionId = '';
  if (
    studentSubmitAssignRes.status === 201 &&
    studentSubmitAssignData.data.status === 'submitted'
  ) {
    submissionId = studentSubmitAssignData.data._id;
    console.log(`   ✅ PASS: Student uploaded submission [ID: ${submissionId}, Status: submitted]`);
  } else {
    console.error('   ❌ FAIL:', studentSubmitAssignData);
    process.exit(1);
  }

  // Test 12: Student viewing own submission
  console.log(`\n🔹 Test 12: Student viewing own submission (GET /assignments/${assignmentId}/my-submission)`);
  const mySubRes = await fetch(`${BASE_URL}/assignments/${assignmentId}/my-submission`, {
    headers: { Authorization: `Bearer ${enrolledStudentToken}` },
  });
  const mySubData: any = await mySubRes.json();
  if (mySubRes.status === 200 && mySubData.data.status === 'submitted') {
    console.log('   ✅ PASS: Student retrieved own submission details');
  } else {
    console.error('   ❌ FAIL:', mySubData);
    process.exit(1);
  }

  // Test 13: Unassigned Instructor attempting to view submissions (Must return 403)
  console.log('\n🔹 Test 13: Unassigned Instructor attempting to view submissions');
  const unassignedSubViewRes = await fetch(`${BASE_URL}/assignments/${assignmentId}/submissions`, {
    headers: { Authorization: `Bearer ${unassignedInstToken}` },
  });
  const unassignedSubViewData: any = await unassignedSubViewRes.json();
  if (unassignedSubViewRes.status === 403) {
    console.log('   ✅ PASS: Blocked unassigned instructor with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unassignedSubViewRes.status, unassignedSubViewData);
    process.exit(1);
  }

  // Test 14: Assigned Instructor viewing assignment submissions
  console.log('\n🔹 Test 14: Assigned Instructor viewing submissions list');
  const assignedSubViewRes = await fetch(`${BASE_URL}/assignments/${assignmentId}/submissions`, {
    headers: { Authorization: `Bearer ${assignedInstToken}` },
  });
  const assignedSubViewData: any = await assignedSubViewRes.json();
  if (assignedSubViewRes.status === 200 && assignedSubViewData.data.length === 1) {
    console.log(`   ✅ PASS: Assigned instructor listed ${assignedSubViewData.data.length} pending submissions`);
  } else {
    console.error('   ❌ FAIL:', assignedSubViewData);
    process.exit(1);
  }

  // Test 15: Unassigned Instructor attempting to grade submission (Must return 403)
  console.log('\n🔹 Test 15: Unassigned Instructor attempting to grade submission');
  const unassignedGradeRes = await fetch(`${BASE_URL}/submissions/${submissionId}/grade`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${unassignedInstToken}`,
    },
    body: JSON.stringify({ grade: 80, feedback: 'Unauthorized' }),
  });
  const unassignedGradeData: any = await unassignedGradeRes.json();
  if (unassignedGradeRes.status === 403) {
    console.log('   ✅ PASS: Blocked unauthorized instructor from grading with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unassignedGradeRes.status, unassignedGradeData);
    process.exit(1);
  }

  // Test 16: Assigned Instructor grading submission
  console.log('\n🔹 Test 16: Assigned Instructor grading submission with score and feedback');
  const gradeRes = await fetch(`${BASE_URL}/submissions/${submissionId}/grade`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({
      grade: 95,
      feedback: 'Excellent vocal modulation, clear diction, and crisp tone resonance. Well done!',
    }),
  });
  const gradeData: any = await gradeRes.json();
  if (
    gradeRes.status === 200 &&
    gradeData.data.status === 'graded' &&
    gradeData.data.grade === 95
  ) {
    console.log(`   ✅ PASS: Submission graded successfully: 95/100 (Status: graded)`);
  } else {
    console.error('   ❌ FAIL:', gradeData);
    process.exit(1);
  }

  // Test 17: Student viewing graded result and instructor feedback
  console.log('\n🔹 Test 17: Student viewing graded result & feedback');
  const studentViewGradedRes = await fetch(`${BASE_URL}/assignments/${assignmentId}/my-submission`, {
    headers: { Authorization: `Bearer ${enrolledStudentToken}` },
  });
  const studentViewGradedData: any = await studentViewGradedRes.json();
  if (
    studentViewGradedRes.status === 200 &&
    studentViewGradedData.data.grade === 95 &&
    studentViewGradedData.data.feedback.includes('Excellent vocal modulation')
  ) {
    console.log('   ✅ PASS: Student received grade: 95/100 with detailed instructor feedback');
  } else {
    console.error('   ❌ FAIL:', studentViewGradedData);
    process.exit(1);
  }

  // Test 18: Super Admin overriding/updating grade
  console.log('\n🔹 Test 18: Super Admin overriding/updating grade');
  const adminOverrideRes = await fetch(`${BASE_URL}/submissions/${submissionId}/grade`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      grade: 98,
      feedback: 'Super Admin adjustment: Exemplary broadcast recording quality.',
    }),
  });
  const adminOverrideData: any = await adminOverrideRes.json();
  if (adminOverrideRes.status === 200 && adminOverrideData.data.grade === 98) {
    console.log('   ✅ PASS: Super Admin override succeeded with grade: 98/100');
  } else {
    console.error('   ❌ FAIL:', adminOverrideData);
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL 18 PHASE 08 TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================\n');
  process.exit(0);
}

runPhase08Tests().catch((err) => {
  console.error('Error running Phase 08 tests:', err);
  process.exit(1);
});
