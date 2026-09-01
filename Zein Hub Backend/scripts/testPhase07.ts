import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import { User, Program, Module, Lesson, Enrollment, InstructorProfile } from '../src/models/index.js';
import { UserRole } from '../src/constants/roles.enum.js';
import { EnrollmentStatus } from '../src/constants/enrollmentStatus.enum.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runPhase07Tests() {
  console.log('=========================================');
  console.log('🧪 Starting Phase 07 Automated Verifications');
  console.log('=========================================\n');

  await connectDB();

  const voiceOverProg = await Program.findOne({ slug: 'voice-over-digital-vocalise' });
  const podcastingProg = await Program.findOne({ slug: 'smart-podcasting-audio-production' });

  if (!voiceOverProg || !podcastingProg) {
    console.error('❌ Required seed programs missing. Run npm run seed:tracks-programs first.');
    process.exit(1);
  }

  // Ensure test users
  let adminUser = await User.findOne({ email: 'admin@zeinhub.com' });
  let assignedInstUser = await User.findOne({ email: 'instructor.assigned@zeinhub.com' });
  if (!assignedInstUser) {
    assignedInstUser = await User.create({
      fullName: 'Assigned Instructor',
      email: 'instructor.assigned@zeinhub.com',
      password: 'InstructorPass123!',
      role: UserRole.INSTRUCTOR,
      isActive: true,
    });
  }

  let unassignedInstUser = await User.findOne({ email: 'instructor.unassigned@zeinhub.com' });
  if (!unassignedInstUser) {
    unassignedInstUser = await User.create({
      fullName: 'Unassigned Instructor',
      email: 'instructor.unassigned@zeinhub.com',
      password: 'InstructorPass123!',
      role: UserRole.INSTRUCTOR,
      isActive: true,
    });
  }

  // Setup instructor profiles
  await InstructorProfile.findOneAndUpdate(
    { userId: assignedInstUser._id },
    {
      $set: {
        userId: assignedInstUser._id,
        bio: 'Assigned Voice Coach',
        assignedPrograms: [voiceOverProg._id],
        isActive: true,
      },
    },
    { upsert: true }
  );

  await InstructorProfile.findOneAndUpdate(
    { userId: unassignedInstUser._id },
    {
      $set: {
        userId: unassignedInstUser._id,
        bio: 'Unassigned Coach',
        assignedPrograms: [podcastingProg._id],
        isActive: true,
      },
    },
    { upsert: true }
  );

  let enrolledStudent = await User.findOne({ email: 'student.enrolled@zeinhub.com' });
  if (!enrolledStudent) {
    enrolledStudent = await User.create({
      fullName: 'Enrolled Student',
      email: 'student.enrolled@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  let completedStudent = await User.findOne({ email: 'student.completed@zeinhub.com' });
  if (!completedStudent) {
    completedStudent = await User.create({
      fullName: 'Completed Student',
      email: 'student.completed@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  let unenrolledStudent = await User.findOne({ email: 'student.unenrolled@zeinhub.com' });
  if (!unenrolledStudent) {
    unenrolledStudent = await User.create({
      fullName: 'Unenrolled Student',
      email: 'student.unenrolled@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  // Setup enrollments
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

  await Enrollment.findOneAndUpdate(
    { studentId: completedStudent._id, programId: voiceOverProg._id },
    {
      $set: {
        studentId: completedStudent._id,
        programId: voiceOverProg._id,
        status: EnrollmentStatus.COMPLETED,
        enrolledAt: new Date(),
        completedAt: new Date(),
      },
    },
    { upsert: true }
  );

  // Remove any enrollment for unenrolled student on voice over
  await Enrollment.deleteMany({ studentId: unenrolledStudent._id, programId: voiceOverProg._id });

  // Clean old test modules and lessons
  await Module.deleteMany({ programId: voiceOverProg._id });
  await Lesson.deleteMany({ programId: voiceOverProg._id });

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
  const assignedInstToken = await login('instructor.assigned@zeinhub.com', 'InstructorPass123!');
  const unassignedInstToken = await login('instructor.unassigned@zeinhub.com', 'InstructorPass123!');
  const enrolledStudentToken = await login('student.enrolled@zeinhub.com', 'StudentPass123!');
  const completedStudentToken = await login('student.completed@zeinhub.com', 'StudentPass123!');
  const unenrolledStudentToken = await login('student.unenrolled@zeinhub.com', 'StudentPass123!');

  // Test 1: Super Admin creates Module
  console.log('🔹 Test 1: Super Admin creates Module (POST /programs/:programId/modules)');
  const adminModRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/modules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: 'Module 01: Fundamentals of Vocal Performance',
      description: 'Introduction to voice over, acoustics, and breathing exercises.',
      order: 1,
    }),
  });
  const adminModData: any = await adminModRes.json();
  let module1Id = '';
  if (adminModRes.status === 201 && adminModData.data._id) {
    module1Id = adminModData.data._id;
    console.log(`   ✅ PASS: Super Admin created Module [ID: ${module1Id}]`);
  } else {
    console.error('   ❌ FAIL:', adminModData);
    process.exit(1);
  }

  // Test 2: Assigned Instructor creates Module
  console.log('\n🔹 Test 2: Assigned Instructor creates Module on assigned program');
  const assignedModRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/modules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({
      title: 'Module 02: Digital Studio & Microphone Techniques',
      description: 'Microphone types, positioning, and acoustic treatment.',
      order: 2,
    }),
  });
  const assignedModData: any = await assignedModRes.json();
  let module2Id = '';
  if (assignedModRes.status === 201 && assignedModData.data._id) {
    module2Id = assignedModData.data._id;
    console.log(`   ✅ PASS: Assigned Instructor created Module [ID: ${module2Id}]`);
  } else {
    console.error('   ❌ FAIL:', assignedModData);
    process.exit(1);
  }

  // Test 3: Unassigned Instructor attempts to create Module on Voice-Over (Must return 403)
  console.log('\n🔹 Test 3: Unassigned Instructor creating Module on unauthorized program');
  const unassignedModRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/modules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${unassignedInstToken}`,
    },
    body: JSON.stringify({
      title: 'Hacked Module',
      description: 'Unauthorized attempt',
    }),
  });
  const unassignedModData: any = await unassignedModRes.json();
  if (unassignedModRes.status === 403) {
    console.log('   ✅ PASS: Blocked unassigned instructor with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unassignedModRes.status, unassignedModData);
    process.exit(1);
  }

  // Test 4: Student attempts to create Module (Must return 403)
  console.log('\n🔹 Test 4: Student attempting to create Module');
  const studentModRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/modules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${enrolledStudentToken}`,
    },
    body: JSON.stringify({ title: 'Student Module' }),
  });
  const studentModData: any = await studentModRes.json();
  if (studentModRes.status === 403) {
    console.log('   ✅ PASS: Blocked student from creating module with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', studentModRes.status, studentModData);
    process.exit(1);
  }

  // Test 5: Super Admin creates Free Lesson (isFreePreview: true)
  console.log('\n🔹 Test 5: Super Admin creating Free Lesson (isFreePreview: true)');
  const freeLessonRes = await fetch(`${BASE_URL}/course-modules/${module1Id}/lessons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: 'Lesson 1.1: Welcome & Course Roadmap (Free Preview)',
      description: 'Free introductory lecture on voice career opportunities.',
      order: 1,
      contentType: 'video',
      contentUrl: 'https://storage.zeinhub.com/videos/free_intro_vocalise.mp4',
      textBody: '<p>Welcome to Zein Hub Media LMS Voice-Over program.</p>',
      durationMinutes: 15,
      isFreePreview: true,
      isPublished: true,
    }),
  });
  const freeLessonData: any = await freeLessonRes.json();
  let freeLessonId = '';
  if (freeLessonRes.status === 201 && freeLessonData.data._id) {
    freeLessonId = freeLessonData.data._id;
    console.log(`   ✅ PASS: Free Lesson created [ID: ${freeLessonId}, isFreePreview: true]`);
  } else {
    console.error('   ❌ FAIL:', freeLessonData);
    process.exit(1);
  }

  // Test 6: Assigned Instructor creates Paid Lesson (isFreePreview: false)
  console.log('\n🔹 Test 6: Assigned Instructor creating Paid Lesson (isFreePreview: false)');
  const paidLessonRes = await fetch(`${BASE_URL}/course-modules/${module1Id}/lessons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({
      title: 'Lesson 1.2: Vocal Cord Physiology & Diaphragmatic Breathing (Paid)',
      description: 'Deep technical training on breathing techniques.',
      order: 2,
      contentType: 'video',
      contentUrl: 'https://storage.zeinhub.com/videos/paid_secret_breathing_technique.mp4',
      textBody: '<p>Secret advanced vocalization techniques only for enrolled members.</p>',
      resources: [{ title: 'Breathing Exercises Guide.pdf', fileUrl: 'https://storage.zeinhub.com/files/guide.pdf' }],
      durationMinutes: 45,
      isFreePreview: false,
      isPublished: true,
    }),
  });
  const paidLessonData: any = await paidLessonRes.json();
  let paidLessonId = '';
  if (paidLessonRes.status === 201 && paidLessonData.data._id) {
    paidLessonId = paidLessonData.data._id;
    console.log(`   ✅ PASS: Paid Lesson created [ID: ${paidLessonId}, isFreePreview: false]`);
  } else {
    console.error('   ❌ FAIL:', paidLessonData);
    process.exit(1);
  }

  // Test 7: Visitor/Guest accessing Free Lesson (GET /lessons/:id without Auth)
  console.log('\n🔹 Test 7: Visitor/Guest accessing Free Lesson (No Auth Header)');
  const visitorFreeRes = await fetch(`${BASE_URL}/lessons/${freeLessonId}`);
  const visitorFreeData: any = await visitorFreeRes.json();
  if (visitorFreeRes.status === 200 && visitorFreeData.data.contentUrl.includes('free_intro')) {
    console.log('   ✅ PASS: Visitor successfully accessed Free Preview lesson content');
  } else {
    console.error('   ❌ FAIL:', visitorFreeData);
    process.exit(1);
  }

  // Test 8: Visitor/Guest accessing Paid Lesson (GET /lessons/:id without Auth) -> Must return 403
  console.log('\n🔹 Test 8: Visitor/Guest accessing Paid Lesson (No Auth Header)');
  const visitorPaidRes = await fetch(`${BASE_URL}/lessons/${paidLessonId}`);
  const visitorPaidData: any = await visitorPaidRes.json();
  if (visitorPaidRes.status === 403 && visitorPaidData.message.includes('Active enrollment required')) {
    console.log('   ✅ PASS: Visitor blocked from Paid Lesson with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', visitorPaidRes.status, visitorPaidData);
    process.exit(1);
  }

  // Test 9: Unenrolled Student accessing Paid Lesson -> Must return 403
  console.log('\n🔹 Test 9: Unenrolled Student accessing Paid Lesson');
  const unenrolledPaidRes = await fetch(`${BASE_URL}/lessons/${paidLessonId}`, {
    headers: { Authorization: `Bearer ${unenrolledStudentToken}` },
  });
  const unenrolledPaidData: any = await unenrolledPaidRes.json();
  if (unenrolledPaidRes.status === 403 && unenrolledPaidData.message.includes('Active enrollment required')) {
    console.log('   ✅ PASS: Unenrolled student blocked from Paid Lesson with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unenrolledPaidRes.status, unenrolledPaidData);
    process.exit(1);
  }

  // Test 10: Enrolled Student accessing Paid Lesson -> Must return 200 with content
  console.log('\n🔹 Test 10: Enrolled Student (status: active) accessing Paid Lesson');
  const enrolledPaidRes = await fetch(`${BASE_URL}/lessons/${paidLessonId}`, {
    headers: { Authorization: `Bearer ${enrolledStudentToken}` },
  });
  const enrolledPaidData: any = await enrolledPaidRes.json();
  if (enrolledPaidRes.status === 200 && enrolledPaidData.data.contentUrl.includes('paid_secret_breathing')) {
    console.log('   ✅ PASS: Enrolled student granted full access to paid lesson media and resources');
  } else {
    console.error('   ❌ FAIL:', enrolledPaidData);
    process.exit(1);
  }

  // Test 11: Completed Student accessing Paid Lesson -> Must return 200
  console.log('\n🔹 Test 11: Completed Student (status: completed) accessing Paid Lesson');
  const completedPaidRes = await fetch(`${BASE_URL}/lessons/${paidLessonId}`, {
    headers: { Authorization: `Bearer ${completedStudentToken}` },
  });
  const completedPaidData: any = await completedPaidRes.json();
  if (completedPaidRes.status === 200 && completedPaidData.data.contentUrl) {
    console.log('   ✅ PASS: Completed graduate student retained full access to course content');
  } else {
    console.error('   ❌ FAIL:', completedPaidData);
    process.exit(1);
  }

  // Test 12: Assigned Instructor accessing Paid Lesson
  console.log('\n🔹 Test 12: Assigned Instructor accessing Paid Lesson');
  const assignedInstLessonRes = await fetch(`${BASE_URL}/lessons/${paidLessonId}`, {
    headers: { Authorization: `Bearer ${assignedInstToken}` },
  });
  const assignedInstLessonData: any = await assignedInstLessonRes.json();
  if (assignedInstLessonRes.status === 200 && assignedInstLessonData.data.contentUrl) {
    console.log('   ✅ PASS: Assigned instructor granted full access');
  } else {
    console.error('   ❌ FAIL:', assignedInstLessonData);
    process.exit(1);
  }

  // Test 13: Unassigned Instructor accessing Paid Lesson -> Must return 403
  console.log('\n🔹 Test 13: Unassigned Instructor accessing Paid Lesson on unauthorized program');
  const unassignedInstLessonRes = await fetch(`${BASE_URL}/lessons/${paidLessonId}`, {
    headers: { Authorization: `Bearer ${unassignedInstToken}` },
  });
  const unassignedInstLessonData: any = await unassignedInstLessonRes.json();
  if (unassignedInstLessonRes.status === 403) {
    console.log('   ✅ PASS: Unassigned instructor blocked with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unassignedInstLessonRes.status, unassignedInstLessonData);
    process.exit(1);
  }

  // Test 14: Student attempting to edit Lesson (Must return 403)
  console.log('\n🔹 Test 14: Student attempting to edit Lesson');
  const studentEditRes = await fetch(`${BASE_URL}/lessons/${paidLessonId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${enrolledStudentToken}`,
    },
    body: JSON.stringify({ title: 'Hacked Title' }),
  });
  const studentEditData: any = await studentEditRes.json();
  if (studentEditRes.status === 403) {
    console.log('   ✅ PASS: Blocked student from editing lesson with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', studentEditRes.status, studentEditData);
    process.exit(1);
  }

  // Test 15: Reorder Module
  console.log('\n🔹 Test 15: Reordering Module (PATCH /course-modules/:id/reorder)');
  const reorderModRes = await fetch(`${BASE_URL}/course-modules/${module2Id}/reorder`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({ order: 10 }),
  });
  const reorderModData: any = await reorderModRes.json();
  if (reorderModRes.status === 200 && reorderModData.data.order === 10) {
    console.log('   ✅ PASS: Module reordered successfully to order: 10');
  } else {
    console.error('   ❌ FAIL:', reorderModData);
    process.exit(1);
  }

  // Test 16: Reorder Lesson
  console.log('\n🔹 Test 16: Reordering Lesson (PATCH /lessons/:id/reorder)');
  const reorderLesRes = await fetch(`${BASE_URL}/lessons/${freeLessonId}/reorder`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({ order: 5 }),
  });
  const reorderLesData: any = await reorderLesRes.json();
  if (reorderLesRes.status === 200 && reorderLesData.data.order === 5) {
    console.log('   ✅ PASS: Lesson reordered successfully to order: 5');
  } else {
    console.error('   ❌ FAIL:', reorderLesData);
    process.exit(1);
  }

  // Test 17: Publish / Unpublish Lesson
  console.log('\n🔹 Test 17: Publish / Unpublish Lesson (PATCH /lessons/:id/publish)');
  const unpubRes = await fetch(`${BASE_URL}/lessons/${freeLessonId}/publish`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({ isPublished: false }),
  });
  const unpubData: any = await unpubRes.json();

  const repubRes = await fetch(`${BASE_URL}/lessons/${freeLessonId}/publish`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({ isPublished: true }),
  });
  const repubData: any = await repubRes.json();

  if (unpubRes.status === 200 && unpubData.data.isPublished === false && repubData.data.isPublished === true) {
    console.log('   ✅ PASS: Lesson published and unpublished successfully');
  } else {
    console.error('   ❌ FAIL:', unpubData, repubData);
    process.exit(1);
  }

  // Create a temporary lesson to test single lesson deletion
  const tempLessonRes = await fetch(`${BASE_URL}/course-modules/${module2Id}/lessons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ title: 'Temporary Lesson to Delete', isFreePreview: true }),
  });
  const tempLessonData: any = await tempLessonRes.json();
  const tempLessonId = tempLessonData.data._id;

  // Test 18: Delete Lesson
  console.log('\n🔹 Test 18: Deleting Lesson (DELETE /lessons/:id)');
  const deleteLesRes = await fetch(`${BASE_URL}/lessons/${tempLessonId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const deleteLesData: any = await deleteLesRes.json();
  if (deleteLesRes.status === 200 && deleteLesData.data.deleted === true) {
    console.log('   ✅ PASS: Lesson deleted successfully');
  } else {
    console.error('   ❌ FAIL:', deleteLesData);
    process.exit(1);
  }

  // Test 19: Delete Module (Cascades linked lessons)
  console.log('\n🔹 Test 19: Deleting Module (DELETE /course-modules/:id)');
  const deleteModRes = await fetch(`${BASE_URL}/course-modules/${module2Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const deleteModData: any = await deleteModRes.json();
  if (deleteModRes.status === 200 && deleteModData.data.deleted === true) {
    console.log('   ✅ PASS: Module and cascaded lessons deleted successfully');
  } else {
    console.error('   ❌ FAIL:', deleteModData);
    process.exit(1);
  }

  // Test 20: Critical Security Check - Verify Paid Content is Sanitized in Curriculum Listing
  console.log('\n🔹 Test 20: Critical Security Check - Curriculum Listing Content Masking (GET /programs/:id/modules)');
  const visitorCurriculumRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/modules`);
  const visitorCurriculumData: any = await visitorCurriculumRes.json();

  const enrolledCurriculumRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/modules`, {
    headers: { Authorization: `Bearer ${enrolledStudentToken}` },
  });
  const enrolledCurriculumData: any = await enrolledCurriculumRes.json();

  const visitorModule = visitorCurriculumData.data[0];
  const enrolledModule = enrolledCurriculumData.data[0];

  const visitorPaidLesson = visitorModule.lessons.find((l: any) => l._id === paidLessonId);
  const visitorFreeLesson = visitorModule.lessons.find((l: any) => l._id === freeLessonId);
  const enrolledPaidLesson = enrolledModule.lessons.find((l: any) => l._id === paidLessonId);

  const isMaskedForVisitor =
    visitorPaidLesson.contentUrl === null &&
    visitorPaidLesson.textBody === null &&
    visitorPaidLesson.resources.length === 0 &&
    visitorPaidLesson.isLocked === true;

  const isFreeVisibleForVisitor =
    visitorFreeLesson.contentUrl !== null && visitorFreeLesson.isLocked === false;

  const isPaidVisibleForEnrolled =
    enrolledPaidLesson.contentUrl !== null && enrolledPaidLesson.isLocked === false;

  if (isMaskedForVisitor && isFreeVisibleForVisitor && isPaidVisibleForEnrolled) {
    console.log('   ✅ PASS: Paid media URLs and text bodies are 100% masked for visitors in curriculum listing!');
    console.log('   ✅ PASS: Free preview is fully accessible to visitors in curriculum listing!');
    console.log('   ✅ PASS: Paid content is unmasked only for enrolled students!');
  } else {
    console.error('   ❌ FAIL Security Masking Check:', {
      visitorPaidLesson,
      enrolledPaidLesson,
    });
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL 20 PHASE 07 TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================\n');
  process.exit(0);
}

runPhase07Tests().catch((err) => {
  console.error('Error running Phase 07 tests:', err);
  process.exit(1);
});
