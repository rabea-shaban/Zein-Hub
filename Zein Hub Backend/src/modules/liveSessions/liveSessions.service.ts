import mongoose from 'mongoose';
import { LiveSession, ILiveSession } from '../../models/liveSession.model.js';
import { Attendance } from '../../models/attendance.model.js';
import { Program } from '../../models/program.model.js';
import { InstructorProfile } from '../../models/instructorProfile.model.js';
import { Enrollment } from '../../models/enrollment.model.js';
import { LiveSessionStatus, LiveSessionProvider } from '../../constants/content.enum.js';
import { CourseModulesService } from '../courseModules/courseModules.service.js';
import { UserRole } from '../../constants/roles.enum.js';
import { ApiError } from '../../utils/apiError.js';
import {
  ICreateLiveSessionDTO,
  IUpdateLiveSessionDTO,
} from './liveSessions.types.js';

export class LiveSessionsService {
  /**
   * Create a new live session for a program
   */
  public static async createLiveSession(
    programId: string,
    userId: string,
    userRole: UserRole,
    dto: ICreateLiveSessionDTO
  ): Promise<ILiveSession> {
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const program = await Program.findById(programId);
    if (!program) {
      throw ApiError.notFound('Program not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      programId
    );

    const liveSession = new LiveSession({
      programId: new mongoose.Types.ObjectId(programId),
      instructorId: new mongoose.Types.ObjectId(userId),
      title: dto.title.trim(),
      description: dto.description?.trim() || undefined,
      provider: dto.provider || LiveSessionProvider.GOOGLE_MEET,
      meetingUrl: dto.meetingUrl.trim(),
      meetingPassword: dto.meetingPassword?.trim() || undefined,
      startTime: dto.startTime,
      endTime: dto.endTime,
      status: LiveSessionStatus.SCHEDULED,
      recordingUrl: dto.recordingUrl?.trim() || undefined,
    });

    await liveSession.save();
    return liveSession;
  }

  public static async getAllLiveSessions(
    userId?: string,
    userRole?: UserRole,
    programId?: string
  ): Promise<any[]> {
    const filter: any = {};

    if (programId && mongoose.Types.ObjectId.isValid(programId)) {
      filter.programId = programId;
    }

    if (userRole === UserRole.INSTRUCTOR && userId) {
      const instructorObjId = new mongoose.Types.ObjectId(userId);
      const profile = await InstructorProfile.findOne({ userId: instructorObjId });
      const assignedProgramIds = profile?.assignedPrograms?.map((id: any) => id.toString()) || [];

      const assignedPrograms = await Program.find({ instructorId: instructorObjId }).select('_id');
      const directProgramIds = assignedPrograms.map((p) => p._id.toString());

      const allInstructorProgramIds = Array.from(new Set([...assignedProgramIds, ...directProgramIds])).map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      filter.$or = [
        { instructorId: instructorObjId },
        { programId: { $in: allInstructorProgramIds } },
      ];
    } else if (userRole === UserRole.STUDENT && userId) {
      const studentObjId = new mongoose.Types.ObjectId(userId);
      const enrollments = await Enrollment.find({
        studentId: studentObjId,
        status: { $in: ['active', 'completed'] },
      }).select('programId');

      const enrolledProgramIds = enrollments.map((e) => e.programId);
      filter.programId = { $in: enrolledProgramIds };
    }

    const sessions = await LiveSession.find(filter)
      .populate('instructorId', 'fullName avatarUrl email')
      .populate('programId', 'title titleAr titleEn slug')
      .sort({ startTime: 1 });

    return sessions;
  }

  /**
   * Get all live sessions for a program (Context-Aware for enrolled students vs guests)
   */
  public static async getProgramLiveSessions(
    programId: string,
    userId?: string,
    userRole?: UserRole
  ): Promise<any[]> {
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const hasAccess = await CourseModulesService.hasFullProgramAccess(
      userId,
      userRole,
      programId
    );

    const sessions = await LiveSession.find({ programId })
      .populate('instructorId', 'fullName avatarUrl email')
      .sort({ startTime: 1 });

    return sessions.map((sess) => {
      const obj = sess.toObject();
      if (!hasAccess) {
        // Conceal meeting access details for non-enrolled users/guests
        obj.meetingUrl = 'https://zeinhub.com/login-to-join';
        obj.meetingPassword = undefined;
      }
      return obj;
    });
  }

  /**
   * Get single live session by ID
   */
  public static async getLiveSessionById(
    sessionId: string,
    userId?: string,
    userRole?: UserRole
  ): Promise<ILiveSession> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw ApiError.badRequest('Invalid session ID format');
    }

    const session = await LiveSession.findById(sessionId)
      .populate('instructorId', 'fullName email avatarUrl')
      .populate('programId', 'titleAr titleEn slug');

    if (!session) {
      throw ApiError.notFound('Live session not found');
    }

    const hasAccess = await CourseModulesService.hasFullProgramAccess(
      userId,
      userRole,
      session.programId._id.toString()
    );

    if (!hasAccess) {
      throw ApiError.forbidden('Active enrollment required to access live session details');
    }

    return session;
  }

  /**
   * Update live session details
   */
  public static async updateLiveSession(
    sessionId: string,
    userId: string,
    userRole: UserRole,
    dto: IUpdateLiveSessionDTO
  ): Promise<ILiveSession> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw ApiError.badRequest('Invalid session ID format');
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

    if (dto.title) session.title = dto.title.trim();
    if (dto.description !== undefined) session.description = dto.description?.trim() || undefined;
    if (dto.provider) session.provider = dto.provider;
    if (dto.meetingUrl) session.meetingUrl = dto.meetingUrl.trim();
    if (dto.meetingPassword !== undefined) session.meetingPassword = dto.meetingPassword?.trim() || undefined;
    if (dto.startTime) session.startTime = dto.startTime;
    if (dto.endTime) session.endTime = dto.endTime;
    if (dto.status) session.status = dto.status;
    if (dto.recordingUrl !== undefined) session.recordingUrl = dto.recordingUrl?.trim() || undefined;

    await session.save();
    return session;
  }

  /**
   * Update live session status (scheduled -> live -> completed | cancelled)
   */
  public static async updateLiveSessionStatus(
    sessionId: string,
    userId: string,
    userRole: UserRole,
    status: LiveSessionStatus
  ): Promise<ILiveSession> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw ApiError.badRequest('Invalid session ID format');
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

    session.status = status;
    await session.save();
    return session;
  }

  /**
   * Delete live session and related attendance records
   */
  public static async deleteLiveSession(
    sessionId: string,
    userId: string,
    userRole: UserRole
  ): Promise<{ deleted: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw ApiError.badRequest('Invalid session ID format');
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

    await Attendance.deleteMany({ liveSessionId: session._id });
    await LiveSession.findByIdAndDelete(sessionId);

    return { deleted: true };
  }
}
