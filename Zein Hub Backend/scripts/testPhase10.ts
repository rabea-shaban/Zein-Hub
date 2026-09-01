import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.config.js';
import {
  User,
  Program,
  Enrollment,
  InstructorProfile,
  LiveSession,
  Attendance,
} from '../src/models/index.js';
import { UserRole } from '../src/constants/roles.enum.js';
import { EnrollmentStatus } from '../src/constants/enrollmentStatus.enum.js';
import {
  LiveSessionProvider,
  LiveSessionStatus,
  AttendanceStatus,
} from '../src/constants/content.enum.js';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runPhase10Tests() {
  console.log('=========================================');
  console.log('🧪 Starting Phase 10 Automated Verifications');
  console.log('=========================================\n');

  await connectDB();

  const voiceOverProg = await Program.findOne({ slug: 'voice-over-digital-vocalise' });
  const podcastingProg = await Program.findOne({ slug: 'smart-podcasting-audio-production' });

  if (!voiceOverProg || !podcastingProg) {
    console.error('❌ Required seed programs missing. Run npm run seed:tracks-programs first.');
    process.exit(1);
  }

  // Setup/Ensure instructor users
  let assignedInst = await User.findOne({ email: 'instructor.voice10@zeinhub.com' });
  if (!assignedInst) {
    assignedInst = await User.create({
      fullName: 'Dr. Voice Live Coach Phase 10',
      email: 'instructor.voice10@zeinhub.com',
      password: 'InstructorPass123!',
      role: UserRole.INSTRUCTOR,
      isActive: true,
    });
  } else {
    assignedInst.password = 'InstructorPass123!';
    await assignedInst.save();
  }

  let unassignedInst = await User.findOne({ email: 'instructor.other10@zeinhub.com' });
  if (!unassignedInst) {
    unassignedInst = await User.create({
      fullName: 'Other Track Instructor Phase 10',
      email: 'instructor.other10@zeinhub.com',
      password: 'InstructorPass123!',
      role: UserRole.INSTRUCTOR,
      isActive: true,
    });
  } else {
    unassignedInst.password = 'InstructorPass123!';
    await unassignedInst.save();
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
  let student1 = await User.findOne({ email: 'student.attendee1@zeinhub.com' });
  if (!student1) {
    student1 = await User.create({
      fullName: 'Attendee One',
      email: 'student.attendee1@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  let student2 = await User.findOne({ email: 'student.attendee2@zeinhub.com' });
  if (!student2) {
    student2 = await User.create({
      fullName: 'Attendee Two',
      email: 'student.attendee2@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  let unenrolledStudent = await User.findOne({ email: 'student.outsider10@zeinhub.com' });
  if (!unenrolledStudent) {
    unenrolledStudent = await User.create({
      fullName: 'Outsider Student',
      email: 'student.outsider10@zeinhub.com',
      password: 'StudentPass123!',
      role: UserRole.STUDENT,
      isActive: true,
    });
  }

  // Clean old test sessions & attendance
  await LiveSession.deleteMany({ programId: voiceOverProg._id });
  await Attendance.deleteMany({ programId: voiceOverProg._id });

  // Ensure enrollments for student1 and student2 in voiceOverProg
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
  const assignedInstToken = await login('instructor.voice10@zeinhub.com', 'InstructorPass123!');
  const unassignedInstToken = await login('instructor.other10@zeinhub.com', 'InstructorPass123!');
  const student1Token = await login('student.attendee1@zeinhub.com', 'StudentPass123!');
  const unenrolledToken = await login('student.outsider10@zeinhub.com', 'StudentPass123!');

  // Test 1: Super Admin creates Live Session
  console.log('🔹 Test 1: Super Admin schedules Live Session (POST /programs/:programId/sessions)');
  const adminSessRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: 'Studio Microphone Setup & Live Vocal Coaching Workshop',
      description: 'Interactive session exploring cardioid vs condenser mic techniques in real time.',
      provider: 'google_meet',
      meetingUrl: 'https://meet.google.com/abc-zein-hub',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 90000000).toISOString(),
    }),
  });
  const adminSessData: any = await adminSessRes.json();
  let session1Id = '';
  if (adminSessRes.status === 201 && adminSessData.data._id) {
    session1Id = adminSessData.data._id;
    console.log(`   ✅ PASS: Super Admin scheduled Live Session [ID: ${session1Id}]`);
  } else {
    console.error('   ❌ FAIL:', adminSessData);
    process.exit(1);
  }

  // Test 2: Assigned Instructor schedules Live Session for their program
  console.log('\n🔹 Test 2: Assigned Instructor schedules Live Session (Zoom provider)');
  const instSessRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({
      title: 'Advanced Commercial Voice-Over Pitch & Cadence Masterclass',
      description: 'Live feedback on student commercial demo tracks.',
      provider: 'zoom',
      meetingUrl: 'https://zoom.us/j/9876543210',
      meetingPassword: 'ZeinVoice2026',
      startTime: new Date(Date.now() + 172800000).toISOString(),
      endTime: new Date(Date.now() + 176400000).toISOString(),
    }),
  });
  const instSessData: any = await instSessRes.json();
  let session2Id = '';
  if (instSessRes.status === 201 && instSessData.data._id) {
    session2Id = instSessData.data._id;
    console.log(`   ✅ PASS: Assigned Instructor scheduled Live Session 2 [ID: ${session2Id}]`);
  } else {
    console.error('   ❌ FAIL:', instSessData);
    process.exit(1);
  }

  // Test 3: Unassigned Instructor attempts to schedule session for unauthorized program (Must return 403)
  console.log('\n🔹 Test 3: Unassigned Instructor scheduling session for unauthorized program');
  const unassignedSessRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${unassignedInstToken}`,
    },
    body: JSON.stringify({
      title: 'Hacked Session',
      meetingUrl: 'https://zoom.us/hacked',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
    }),
  });
  const unassignedSessData: any = await unassignedSessRes.json();
  if (unassignedSessRes.status === 403) {
    console.log('   ✅ PASS: Blocked unassigned instructor with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unassignedSessRes.status, unassignedSessData);
    process.exit(1);
  }

  // Test 4: Student attempts to create session (Must return 403)
  console.log('\n🔹 Test 4: Student attempting to create session');
  const studentCreateSessRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({
      title: 'Student Session',
      meetingUrl: 'https://meet.google.com/xyz',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
    }),
  });
  const studentCreateSessData: any = await studentCreateSessRes.json();
  if (studentCreateSessRes.status === 403) {
    console.log('   ✅ PASS: Blocked student with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', studentCreateSessRes.status, studentCreateSessData);
    process.exit(1);
  }

  // Test 5: Enrolled Student views program sessions (With valid meeting URL)
  console.log('\n🔹 Test 5: Enrolled Student views program live sessions list');
  const enrolledSessListRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/sessions`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const enrolledSessListData: any = await enrolledSessListRes.json();
  if (
    enrolledSessListRes.status === 200 &&
    enrolledSessListData.data.length === 2 &&
    enrolledSessListData.data[0].meetingUrl.includes('meet.google.com')
  ) {
    console.log('   ✅ PASS: Enrolled student retrieved sessions with real meeting access URLs');
  } else {
    console.error('   ❌ FAIL:', enrolledSessListData);
    process.exit(1);
  }

  // Test 6: Non-enrolled Student views program sessions (Meeting URL is sanitized)
  console.log('\n🔹 Test 6: Non-enrolled Student views sessions (Access Link Sanitization Check)');
  const unenrolledSessListRes = await fetch(`${BASE_URL}/programs/${voiceOverProg._id}/sessions`, {
    headers: { Authorization: `Bearer ${unenrolledToken}` },
  });
  const unenrolledSessListData: any = await unenrolledSessListRes.json();
  if (
    unenrolledSessListRes.status === 200 &&
    unenrolledSessListData.data[0].meetingUrl.includes('login-to-join')
  ) {
    console.log('   ✅ PASS: Protected meeting links concealed from non-enrolled users');
  } else {
    console.error('   ❌ FAIL:', unenrolledSessListData);
    process.exit(1);
  }

  // Test 7: Enrolled Student gets single session details
  console.log(`\n🔹 Test 7: Enrolled Student gets session details (GET /sessions/${session1Id})`);
  const singleSessRes = await fetch(`${BASE_URL}/sessions/${session1Id}`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const singleSessData: any = await singleSessRes.json();
  if (singleSessRes.status === 200 && singleSessData.data.title.includes('Microphone Setup')) {
    console.log('   ✅ PASS: Enrolled student retrieved full session details');
  } else {
    console.error('   ❌ FAIL:', singleSessData);
    process.exit(1);
  }

  // Test 8: Non-enrolled student gets single session details (Must return 403)
  console.log(`\n🔹 Test 8: Non-enrolled student viewing session details`);
  const unenrolledSingleRes = await fetch(`${BASE_URL}/sessions/${session1Id}`, {
    headers: { Authorization: `Bearer ${unenrolledToken}` },
  });
  const unenrolledSingleData: any = await unenrolledSingleRes.json();
  if (unenrolledSingleRes.status === 403) {
    console.log('   ✅ PASS: Blocked non-enrolled student with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unenrolledSingleRes.status, unenrolledSingleData);
    process.exit(1);
  }

  // Test 9: Assigned Instructor updates Session details
  console.log(`\n🔹 Test 9: Assigned Instructor updates session (PATCH /sessions/${session1Id})`);
  const updateSessRes = await fetch(`${BASE_URL}/sessions/${session1Id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({
      description: 'Updated: Includes live diaphragm pressure monitoring demo.',
    }),
  });
  const updateSessData: any = await updateSessRes.json();
  if (updateSessRes.status === 200 && updateSessData.data.description.includes('diaphragm pressure')) {
    console.log('   ✅ PASS: Session details updated successfully');
  } else {
    console.error('   ❌ FAIL:', updateSessData);
    process.exit(1);
  }

  // Test 10: Instructor updates Session status to 'live'
  console.log(`\n🔹 Test 10: Instructor starts session (PATCH /sessions/${session1Id}/status -> 'live')`);
  const liveStatusRes = await fetch(`${BASE_URL}/sessions/${session1Id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({ status: 'live' }),
  });
  const liveStatusData: any = await liveStatusRes.json();
  if (liveStatusRes.status === 200 && liveStatusData.data.status === 'live') {
    console.log("   ✅ PASS: Session status transitioned to 'live'");
  } else {
    console.error('   ❌ FAIL:', liveStatusData);
    process.exit(1);
  }

  // Test 11: Assigned Instructor marks attendance for student1 as 'present'
  console.log(`\n🔹 Test 11: Instructor marks attendance for Student 1 as 'present' (POST /sessions/${session1Id}/attendance)`);
  const att1Res = await fetch(`${BASE_URL}/sessions/${session1Id}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({
      studentId: student1._id.toString(),
      status: 'present',
      attendanceMinutes: 60,
      notes: 'Active engagement in vocal range exercises.',
    }),
  });
  const att1Data: any = await att1Res.json();
  if (att1Res.status === 200 && att1Data.data.length === 1 && att1Data.data[0].status === 'present') {
    console.log(`   ✅ PASS: Marked Student 1 attendance: 'present' (Minutes: 60)`);
  } else {
    console.error('   ❌ FAIL:', att1Data);
    process.exit(1);
  }

  // Test 12: Instructor marks attendance for student2 as 'late'
  console.log(`\n🔹 Test 12: Instructor marks attendance for Student 2 as 'late'`);
  const att2Res = await fetch(`${BASE_URL}/sessions/${session1Id}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({
      studentId: student2._id.toString(),
      status: 'late',
      attendanceMinutes: 35,
      notes: 'Joined 25 mins late due to connectivity.',
    }),
  });
  const att2Data: any = await att2Res.json();
  if (att2Res.status === 200 && att2Data.data[0].status === 'late') {
    console.log(`   ✅ PASS: Marked Student 2 attendance: 'late' (Minutes: 35)`);
  } else {
    console.error('   ❌ FAIL:', att2Data);
    process.exit(1);
  }

  // Test 13: Attempt to mark attendance for non-enrolled student (Must return 400)
  console.log('\n🔹 Test 13: Attempt to mark attendance for non-enrolled student');
  const unenrolledAttRes = await fetch(`${BASE_URL}/sessions/${session1Id}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({
      studentId: unenrolledStudent._id.toString(),
      status: 'present',
    }),
  });
  const unenrolledAttData: any = await unenrolledAttRes.json();
  if (unenrolledAttRes.status === 400 && unenrolledAttData.message.includes('not actively enrolled')) {
    console.log('   ✅ PASS: Blocked attendance recording for non-enrolled student with 400 Bad Request');
  } else {
    console.error('   ❌ FAIL: Expected 400, got', unenrolledAttRes.status, unenrolledAttData);
    process.exit(1);
  }

  // Test 14: Unassigned Instructor attempts to mark attendance (Must return 403)
  console.log('\n🔹 Test 14: Unassigned Instructor attempting to mark attendance');
  const unassignedAttRes = await fetch(`${BASE_URL}/sessions/${session1Id}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${unassignedInstToken}`,
    },
    body: JSON.stringify({
      studentId: student1._id.toString(),
      status: 'absent',
    }),
  });
  const unassignedAttData: any = await unassignedAttRes.json();
  if (unassignedAttRes.status === 403) {
    console.log('   ✅ PASS: Blocked unassigned instructor with 403 Forbidden');
  } else {
    console.error('   ❌ FAIL: Expected 403, got', unassignedAttRes.status, unassignedAttData);
    process.exit(1);
  }

  // Test 15: Instructor transitions Session status to 'completed'
  console.log(`\n🔹 Test 15: Instructor completes session (PATCH /sessions/${session1Id}/status -> 'completed')`);
  const compStatusRes = await fetch(`${BASE_URL}/sessions/${session1Id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({ status: 'completed' }),
  });
  const compStatusData: any = await compStatusRes.json();
  if (compStatusRes.status === 200 && compStatusData.data.status === 'completed') {
    console.log("   ✅ PASS: Session status transitioned to 'completed'");
  } else {
    console.error('   ❌ FAIL:', compStatusData);
    process.exit(1);
  }

  // Test 16: Student views own session attendance record
  console.log(`\n🔹 Test 16: Student views own attendance for session (GET /sessions/${session1Id}/attendance/me)`);
  const mySessAttRes = await fetch(`${BASE_URL}/sessions/${session1Id}/attendance/me`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const mySessAttData: any = await mySessAttRes.json();
  if (mySessAttRes.status === 200 && mySessAttData.data.status === 'present') {
    console.log("   ✅ PASS: Student 1 confirmed attendance status: 'present'");
  } else {
    console.error('   ❌ FAIL:', mySessAttData);
    process.exit(1);
  }

  // Test 17: Student views complete attendance history
  console.log('\n🔹 Test 17: Student views complete attendance history (GET /attendance/me)');
  const myAllAttRes = await fetch(`${BASE_URL}/attendance/me`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const myAllAttData: any = await myAllAttRes.json();
  if (myAllAttRes.status === 200 && myAllAttData.data.length === 1) {
    console.log(`   ✅ PASS: Student retrieved attendance history list (Total entries: ${myAllAttData.data.length})`);
  } else {
    console.error('   ❌ FAIL:', myAllAttData);
    process.exit(1);
  }

  // Test 18: Super Admin views all attendance records for the session
  console.log(`\n🔹 Test 18: Super Admin views session attendance list (GET /sessions/${session1Id}/attendance)`);
  const adminAttListRes = await fetch(`${BASE_URL}/sessions/${session1Id}/attendance`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminAttListData: any = await adminAttListRes.json();
  if (adminAttListRes.status === 200 && adminAttListData.data.length === 2) {
    console.log(`   ✅ PASS: Super Admin listed all ${adminAttListData.data.length} student attendance records`);
  } else {
    console.error('   ❌ FAIL:', adminAttListData);
    process.exit(1);
  }

  // Test 19: Program Attendance Summary Calculation
  console.log(`\n🔹 Test 19: Program Attendance Summary Calculation (GET /attendance/program/${voiceOverProg._id}/summary)`);
  const summaryRes = await fetch(`${BASE_URL}/attendance/program/${voiceOverProg._id}/summary`, {
    headers: { Authorization: `Bearer ${assignedInstToken}` },
  });
  const summaryData: any = await summaryRes.json();
  const s1Summary = summaryData.data?.find(
    (s: any) => s.studentId === student1._id.toString()
  );
  if (
    summaryRes.status === 200 &&
    s1Summary &&
    s1Summary.attendancePercentage === 100 // 1 attended of 1 eligible = 100%
  ) {
    console.log('   ✅ PASS: Program Attendance Summary calculated: 100% attendance rate for present student');
  } else {
    console.error('   ❌ FAIL:', summaryData);
    process.exit(1);
  }

  // Test 20: Cancelled Session Attendance Lock (Attempting to record attendance for cancelled session rejected)
  console.log('\n🔹 Test 20: Cancelled Session Attendance Lock Validation');
  const cancelSessRes = await fetch(`${BASE_URL}/sessions/${session2Id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({ status: 'cancelled' }),
  });
  await cancelSessRes.json();

  const cancelAttRes = await fetch(`${BASE_URL}/sessions/${session2Id}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${assignedInstToken}`,
    },
    body: JSON.stringify({
      studentId: student1._id.toString(),
      status: 'present',
    }),
  });
  const cancelAttData: any = await cancelAttRes.json();
  if (cancelAttRes.status === 400 && cancelAttData.message.includes('cancelled session')) {
    console.log('   ✅ PASS: Blocked recording attendance for cancelled session with 400 Bad Request');
  } else {
    console.error('   ❌ FAIL: Expected 400, got', cancelAttRes.status, cancelAttData);
    process.exit(1);
  }

  console.log('\n=========================================');
  console.log('🎉 ALL 20 PHASE 10 TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================\n');
  process.exit(0);
}

runPhase10Tests().catch((err) => {
  console.error('Error running Phase 10 tests:', err);
  process.exit(1);
});
