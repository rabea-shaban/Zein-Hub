import mongoose from 'mongoose';
import { Application, IApplication } from '../../models/application.model.js';
import { Program } from '../../models/program.model.js';
import { User } from '../../models/user.model.js';
import { Enrollment } from '../../models/enrollment.model.js';
import { Progress } from '../../models/progress.model.js';
import { ProgramStatus } from '../../constants/programStatus.enum.js';
import { ApplicationStatus } from '../../constants/applicationStatus.enum.js';
import { EnrollmentStatus } from '../../constants/enrollmentStatus.enum.js';
import { ApiError } from '../../utils/apiError.js';
import {
  ICreateApplicationDTO,
  IReviewApplicationDTO,
  IApplicationFilterQuery,
} from './applications.types.js';

export class ApplicationsService {
  /**
   * Student submits an application for an OPEN program
   */
  public static async submitApplication(
    studentId: string,
    dto: ICreateApplicationDTO
  ): Promise<IApplication> {
    if (!mongoose.Types.ObjectId.isValid(dto.programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const program = await Program.findOne({ _id: dto.programId, isActive: true });
    if (!program) {
      throw ApiError.notFound('Program not found or is currently inactive');
    }

    // Critical Business Rule: Program MUST have status 'open'
    if (program.status !== ProgramStatus.OPEN) {
      throw ApiError.badRequest(
        `Applications are only accepted for OPEN programs. Current program status is '${program.status}'`
      );
    }

    // Check for existing application
    const existingApp = await Application.findOne({
      studentId,
      programId: dto.programId,
    });

    if (existingApp) {
      throw ApiError.conflict(
        `You have already applied for this program. Current application status: ${existingApp.status}`
      );
    }

    try {
      const application = new Application({
        studentId: new mongoose.Types.ObjectId(studentId),
        programId: new mongoose.Types.ObjectId(dto.programId),
        status: ApplicationStatus.PENDING,
        motivation: dto.motivation?.trim() || undefined,
        portfolioUrl: dto.portfolioUrl?.trim() || null,
        audioSampleUrl: dto.audioSampleUrl?.trim() || null,
        governorate: dto.governorate?.trim() || undefined,
      });

      await application.save();

      const populatedApp = await Application.findById(application._id).populate(
        'programId',
        'titleAr titleEn slug coverImageUrl durationWeeks price status'
      );

      return populatedApp || application;
    } catch (err: any) {
      if (err.code === 11000) {
        throw ApiError.conflict('You have already applied for this program');
      }
      throw err;
    }
  }

  /**
   * Student views all submitted applications
   */
  public static async getMyApplications(studentId: string): Promise<IApplication[]> {
    return Application.find({ studentId })
      .populate('programId', 'titleAr titleEn slug coverImageUrl durationWeeks price status')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });
  }

  /**
   * Student views single application details
   */
  public static async getMyApplicationById(
    studentId: string,
    applicationId: string
  ): Promise<IApplication> {
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      throw ApiError.badRequest('Invalid application ID format');
    }

    const application = await Application.findOne({
      _id: applicationId,
      studentId,
    })
      .populate('programId', 'titleAr titleEn slug descriptionAr descriptionEn coverImageUrl durationWeeks price status')
      .populate('reviewedBy', 'fullName email');

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    return application;
  }

  /**
   * Super Admin: List and filter applications
   */
  public static async getAllApplicationsAdmin(query: IApplicationFilterQuery = {}): Promise<{
    applications: any[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const filter: Record<string, any> = {};

    if (query.programId && mongoose.Types.ObjectId.isValid(query.programId)) {
      filter.programId = query.programId;
    }

    if (query.studentId && mongoose.Types.ObjectId.isValid(query.studentId)) {
      filter.studentId = query.studentId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      const matchingUsers = await User.find({
        $or: [{ fullName: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);
      filter.studentId = { $in: userIds };
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('studentId', 'fullName email phone avatarUrl')
        .populate('programId', 'titleAr titleEn slug status coverImageUrl durationWeeks price')
        .populate('reviewedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      applications,
      meta: { total, page, limit, totalPages },
    };
  }

  /**
   * Super Admin: View single application details
   */
  public static async getApplicationByIdAdmin(applicationId: string): Promise<IApplication> {
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      throw ApiError.badRequest('Invalid application ID format');
    }

    const application = await Application.findById(applicationId)
      .populate('studentId', 'fullName email phone avatarUrl')
      .populate('programId', 'titleAr titleEn slug status coverImageUrl durationWeeks price')
      .populate('reviewedBy', 'fullName email');

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    return application;
  }

  /**
   * Super Admin: Review application (Accept or Reject) and trigger automatic Enrollment & Progress
   */
  public static async reviewApplication(
    applicationId: string,
    reviewerId: string,
    dto: IReviewApplicationDTO
  ): Promise<{ application: IApplication; enrollment: any | null }> {
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      throw ApiError.badRequest('Invalid application ID format');
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    application.status = dto.status;
    application.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
    application.reviewedAt = new Date();
    if (dto.reviewNotes !== undefined) {
      application.reviewNotes = dto.reviewNotes?.trim() || undefined;
    }

    await application.save();

    let enrollment: any = null;

    // Automatic Enrollment & Progress creation on ACCEPT
    if (dto.status === ApplicationStatus.ACCEPTED) {
      // 1. Create or ensure Enrollment exists
      enrollment = await Enrollment.findOneAndUpdate(
        {
          studentId: application.studentId,
          programId: application.programId,
        },
        {
          $setOnInsert: {
            applicationId: application._id,
            status: EnrollmentStatus.ACTIVE,
            enrolledAt: new Date(),
          },
        },
        { upsert: true, new: true }
      ).populate('programId', 'titleAr titleEn slug coverImageUrl');

      // 2. Initialize student Progress tracking record
      await Progress.findOneAndUpdate(
        {
          studentId: application.studentId,
          programId: application.programId,
        },
        {
          $setOnInsert: {
            completedLessons: [],
            quizProgress: [],
            completionPercentage: 0,
            lastActivityAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
    }

    const populatedApp = await Application.findById(application._id)
      .populate('studentId', 'fullName email phone')
      .populate('programId', 'titleAr titleEn slug status')
      .populate('reviewedBy', 'fullName email');

    return {
      application: populatedApp || application,
      enrollment,
    };
  }
}
