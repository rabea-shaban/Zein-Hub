import mongoose from 'mongoose';
import { Enrollment, IEnrollment } from '../../models/enrollment.model.js';
import { Progress } from '../../models/progress.model.js';
import { User } from '../../models/user.model.js';
import { Application } from '../../models/application.model.js';
import { EnrollmentStatus } from '../../constants/enrollmentStatus.enum.js';
import { ApiError } from '../../utils/apiError.js';
import {
  IUpdateEnrollmentStatusDTO,
  IEnrollmentFilterQuery,
} from './enrollments.types.js';

export class EnrollmentsService {
  /**
   * Student views all active and completed enrolled courses
   */
  public static async getMyEnrollments(studentId: string): Promise<any[]> {
    const enrollments = await Enrollment.find({ studentId })
      .populate('programId', 'titleAr titleEn slug coverImageUrl durationWeeks totalHours status isFeatured')
      .sort({ enrolledAt: -1 });

    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enr) => {
        const progress = await Progress.findOne({
          studentId,
          programId: (enr.programId as any)?._id || enr.programId,
        });

        return {
          enrollment: enr,
          progress: progress || {
            completionPercentage: 0,
            completedLessonsCount: 0,
            lastActivityAt: enr.enrolledAt,
          },
        };
      })
    );

    return enrollmentsWithProgress;
  }

  /**
   * Check and retrieve student enrollment details for a specific program
   */
  public static async getStudentEnrollmentForProgram(
    studentId: string,
    programId: string
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const enrollment = await Enrollment.findOne({
      studentId,
      programId,
    }).populate('programId', 'titleAr titleEn slug descriptionAr descriptionEn coverImageUrl durationWeeks status');

    if (!enrollment) {
      throw ApiError.notFound('No enrollment found for this program');
    }

    const progress = await Progress.findOne({
      studentId,
      programId,
    });

    return {
      enrollment,
      progress: progress || {
        completionPercentage: 0,
        completedLessonsCount: 0,
        lastActivityAt: enrollment.enrolledAt,
      },
    };
  }

  /**
   * Super Admin: List and filter all enrollments
   */
  public static async getAllEnrollmentsAdmin(query: IEnrollmentFilterQuery = {}): Promise<{
    enrollments: any[];
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
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      const matchingUsers = await User.find({
        $or: [{ fullName: searchRegex }, { email: searchRegex }, { phone: searchRegex }],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);
      filter.studentId = { $in: userIds };
    }

    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter)
        .populate('studentId', 'fullName email phone avatarUrl isActive createdAt')
        .populate('programId', 'titleAr titleEn slug status coverImageUrl durationWeeks price')
        .sort({ enrolledAt: -1 })
        .skip(skip)
        .limit(limit),
      Enrollment.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      enrollments,
      meta: { total, page, limit, totalPages },
    };
  }

  /**
   * Super Admin: Update enrollment status, final grade, and certificate
   */
  public static async updateEnrollmentStatusByAdmin(
    enrollmentId: string,
    dto: IUpdateEnrollmentStatusDTO
  ): Promise<IEnrollment> {
    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
      throw ApiError.badRequest('Invalid enrollment ID format');
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      throw ApiError.notFound('Enrollment record not found');
    }

    enrollment.status = dto.status;
    if (dto.finalGrade !== undefined) {
      enrollment.finalGrade = dto.finalGrade;
    }
    if (dto.certificateUrl !== undefined) {
      enrollment.certificateUrl = dto.certificateUrl?.trim() || undefined;
    }

    if (dto.status === EnrollmentStatus.COMPLETED && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('studentId', 'fullName email phone avatarUrl isActive')
      .populate('programId', 'titleAr titleEn slug status price');

    return populatedEnrollment || enrollment;
  }

  /**
   * Super Admin: Delete single enrollment record
   */
  public static async deleteEnrollment(enrollmentId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
      throw ApiError.badRequest('Invalid enrollment ID format');
    }
    const enr = await Enrollment.findByIdAndDelete(enrollmentId);
    if (!enr) {
      throw ApiError.notFound('Enrollment record not found');
    }
  }

  /**
   * Create or register new enrollment (Allows student to enroll in multiple courses, and course to have multiple students)
   */
  public static async createEnrollment(
    studentId: string,
    programId: string,
    status: EnrollmentStatus = EnrollmentStatus.ACTIVE
  ): Promise<IEnrollment> {
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid student ID or program ID format');
    }

    const existing = await Enrollment.findOne({ studentId, programId });
    if (existing) {
      throw ApiError.conflict('Student is already actively enrolled in this program');
    }

    const enrollment = new Enrollment({
      studentId: new mongoose.Types.ObjectId(studentId),
      programId: new mongoose.Types.ObjectId(programId),
      status,
      enrolledAt: new Date(),
    });

    await enrollment.save();

    // Initialize Progress record
    await Progress.findOneAndUpdate(
      { studentId: new mongoose.Types.ObjectId(studentId), programId: new mongoose.Types.ObjectId(programId) },
      {
        $setOnInsert: {
          studentId: new mongoose.Types.ObjectId(studentId),
          programId: new mongoose.Types.ObjectId(programId),
          completedLessons: [],
          completionPercentage: 0,
          lastActivityAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    const populated = await Enrollment.findById(enrollment._id)
      .populate('studentId', 'fullName email phone avatarUrl')
      .populate('programId', 'titleAr titleEn slug coverImageUrl price durationWeeks');

    return populated || enrollment;
  }

  /**
   * Delete student user account and all their enrollments & progress
   */
  public static async deleteStudentUser(studentId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw ApiError.badRequest('Invalid student ID format');
    }
    const studentObjId = new mongoose.Types.ObjectId(studentId);
    await Enrollment.deleteMany({ studentId: studentObjId });
    await Progress.deleteMany({ studentId: studentObjId });
    await User.findByIdAndDelete(studentId);
  }
}
