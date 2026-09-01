import mongoose from 'mongoose';
import { Attendance, IAttendance } from '../../models/attendance.model.js';
import { LiveSession } from '../../models/liveSession.model.js';
import { Enrollment } from '../../models/enrollment.model.js';
import { AttendanceStatus, LiveSessionStatus } from '../../constants/content.enum.js';
import { CourseModulesService } from '../courseModules/courseModules.service.js';
import { UserRole } from '../../constants/roles.enum.js';
import { ApiError } from '../../utils/apiError.js';
import {
  IMarkAttendanceDTO,
  IProgramAttendanceSummary,
} from './attendance.types.js';

export class AttendanceService {
  /**
   * Mark or update attendance for one or more students in a live session
   */
  public static async markSessionAttendance(
    sessionId: string,
    userId: string,
    userRole: UserRole,
    records: IMarkAttendanceDTO[]
  ): Promise<IAttendance[]> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw ApiError.badRequest('Invalid live session ID format');
    }

    const session = await LiveSession.findById(sessionId);
    if (!session) {
      throw ApiError.notFound('Live session not found');
    }

    if (session.status === LiveSessionStatus.CANCELLED) {
      throw ApiError.badRequest('Cannot record attendance for a cancelled session');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      session.programId.toString()
    );

    const updatedAttendances: IAttendance[] = [];

    for (const rec of records) {
      if (!mongoose.Types.ObjectId.isValid(rec.studentId)) {
        throw ApiError.badRequest(`Invalid student ID: ${rec.studentId}`);
      }

      // Check student is actively enrolled in this program
      const enrollment = await Enrollment.findOne({
        studentId: rec.studentId,
        programId: session.programId,
        status: { $in: ['active', 'completed'] },
      } as any);

      if (!enrollment) {
        throw ApiError.badRequest(
          `Student with ID ${rec.studentId} is not actively enrolled in this program`
        );
      }

      const isPresent =
        rec.status === AttendanceStatus.PRESENT || rec.status === AttendanceStatus.LATE;

      const attendance = await Attendance.findOneAndUpdate(
        {
          liveSessionId: session._id,
          studentId: new mongoose.Types.ObjectId(rec.studentId),
        },
        {
          $set: {
            programId: session.programId,
            status: rec.status || AttendanceStatus.PRESENT,
            isPresent,
            attendanceMinutes: rec.attendanceMinutes ?? null,
            joinedAt: rec.joinedAt ?? null,
            leftAt: rec.leftAt ?? null,
            notes: rec.notes?.trim() || null,
            markedBy: new mongoose.Types.ObjectId(userId),
            markedAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      updatedAttendances.push(attendance);
    }

    return updatedAttendances;
  }

  /**
   * Get all attendance records for a specific session (Admin / Assigned Instructor)
   */
  public static async getSessionAttendance(
    sessionId: string,
    userId: string,
    userRole: UserRole
  ): Promise<IAttendance[]> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw ApiError.badRequest('Invalid live session ID format');
    }

    const session = await LiveSession.findById(sessionId);
    if (!session) {
      throw ApiError.notFound('Live session not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      session.programId.toString()
    );

    return Attendance.find({ liveSessionId: session._id })
      .populate('studentId', 'fullName email phone avatarUrl')
      .populate('markedBy', 'fullName email')
      .sort({ createdAt: 1 });
  }

  /**
   * Student views their own attendance record for a specific session
   */
  public static async getMySessionAttendance(
    sessionId: string,
    studentId: string
  ): Promise<IAttendance | null> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw ApiError.badRequest('Invalid live session ID format');
    }

    return Attendance.findOne({
      liveSessionId: sessionId,
      studentId,
    }).populate('liveSessionId', 'title startTime endTime status');
  }

  /**
   * Student views all attendance history across all enrolled programs
   */
  public static async getMyAttendanceAll(studentId: string): Promise<any[]> {
    const attendances = await Attendance.find({ studentId })
      .populate('liveSessionId', 'title startTime endTime provider meetingUrl status recordingUrl')
      .populate('programId', 'titleAr titleEn slug')
      .sort({ createdAt: -1 });

    return attendances;
  }

  /**
   * Get attendance summary for all enrolled students in a program
   */
  public static async getProgramAttendanceSummary(
    programId: string,
    userId: string,
    userRole: UserRole
  ): Promise<IProgramAttendanceSummary[]> {
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    await CourseModulesService.verifyProgramWriteAccess(userId, userRole, programId);

    const [enrollments, totalSessions] = await Promise.all([
      Enrollment.find({ programId }).populate('studentId', 'fullName email'),
      LiveSession.countDocuments({
        programId,
        status: { $in: [LiveSessionStatus.COMPLETED, LiveSessionStatus.LIVE] },
      }),
    ]);

    const summaries: IProgramAttendanceSummary[] = await Promise.all(
      enrollments.map(async (enr) => {
        const student = enr.studentId as any;
        const studentId = student?._id?.toString() || enr.studentId.toString();

        const studentAttendances = await Attendance.find({
          programId,
          studentId,
        });

        let attendedCount = 0;
        let absentCount = 0;
        let excusedCount = 0;

        for (const att of studentAttendances) {
          if (att.status === AttendanceStatus.PRESENT || att.status === AttendanceStatus.LATE) {
            attendedCount++;
          } else if (att.status === AttendanceStatus.ABSENT) {
            absentCount++;
          } else if (att.status === AttendanceStatus.EXCUSED) {
            excusedCount++;
          }
        }

        const eligibleSessions = totalSessions - excusedCount;
        const attendancePercentage =
          eligibleSessions > 0
            ? Math.min(100, Math.round((attendedCount / eligibleSessions) * 100))
            : 100;

        return {
          studentId,
          studentName: student?.fullName || 'Student',
          studentEmail: student?.email || '',
          totalEligibleSessions: Math.max(0, eligibleSessions),
          attendedSessions: attendedCount,
          absentSessions: absentCount,
          excusedSessions: excusedCount,
          attendancePercentage,
        };
      })
    );

    return summaries;
  }
}
