import mongoose from 'mongoose';
import {
  User,
  Program,
  Application,
  Enrollment,
  Progress,
  Certificate,
  LiveSession,
  Attendance,
  Quiz,
  QuizAttempt,
  Assignment,
  Submission,
  Review,
  InstructorProfile,
} from '../../models/index.js';
import { UserRole } from '../../constants/roles.enum.js';
import { EnrollmentStatus } from '../../constants/enrollmentStatus.enum.js';
import { ApplicationStatus } from '../../constants/applicationStatus.enum.js';
import {
  AttendanceStatus,
  LiveSessionStatus,
  SubmissionStatus,
} from '../../constants/content.enum.js';
import { ReviewStatus } from '../../models/review.model.js';
import { ApiError } from '../../utils/apiError.js';
import {
  IDashboardOverviewKPIs,
  IEnrollmentAnalytics,
  IProgressAnalytics,
  IAttendanceAnalytics,
  IAssessmentAnalytics,
  ICertificateAnalytics,
  IReviewsAnalytics,
  IProgramDetailedReport,
} from './analytics.types.js';

export class AnalyticsService {
  /**
   * Helper: Resolves allowed program IDs based on user role (Admin = null/all, Instructor = assigned)
   */
  private static async getScopedProgramIds(
    userId: string,
    userRole: UserRole
  ): Promise<mongoose.Types.ObjectId[] | null> {
    if (userRole === UserRole.SUPER_ADMIN) {
      return null; // Global access across all programs
    }

    if (userRole === UserRole.INSTRUCTOR) {
      const profile = await InstructorProfile.findOne({ userId });
      if (!profile || !profile.assignedPrograms || profile.assignedPrograms.length === 0) {
        return [];
      }
      return profile.assignedPrograms.map((id) => new mongoose.Types.ObjectId(id.toString()));
    }

    throw ApiError.forbidden('Forbidden: Access denied to analytics');
  }

  /**
   * 1. Dashboard Overview KPIs (Aggregated across all core modules)
   */
  public static async getDashboardOverview(
    userId: string,
    userRole: UserRole
  ): Promise<IDashboardOverviewKPIs> {
    const scopedProgIds = await this.getScopedProgramIds(userId, userRole);
    const progMatch: any = scopedProgIds ? { programId: { $in: scopedProgIds } } : {};
    const progDirectMatch: any = scopedProgIds ? { _id: { $in: scopedProgIds } } : {};

    // 1. Users
    const [totalStudents, totalInstructors, activeStudents] = await Promise.all([
      User.countDocuments({ role: UserRole.STUDENT }),
      User.countDocuments({ role: UserRole.INSTRUCTOR }),
      User.countDocuments({ role: UserRole.STUDENT, isActive: true }),
    ]);

    // 2. Programs
    const [totalProgs, openProgs, comingSoonProgs, closedProgs] = await Promise.all([
      Program.countDocuments(progDirectMatch),
      Program.countDocuments({ ...progDirectMatch, status: 'open' } as any),
      Program.countDocuments({ ...progDirectMatch, status: 'coming-soon' } as any),
      Program.countDocuments({ ...progDirectMatch, status: 'closed' } as any),
    ]);

    // 3. Applications
    const [totalApps, pendingApps, acceptedApps, rejectedApps] = await Promise.all([
      Application.countDocuments(progMatch),
      Application.countDocuments({ ...progMatch, status: ApplicationStatus.PENDING }),
      Application.countDocuments({ ...progMatch, status: ApplicationStatus.ACCEPTED }),
      Application.countDocuments({ ...progMatch, status: ApplicationStatus.REJECTED }),
    ]);

    // 4. Enrollments
    const [totalEnrs, activeEnrs, completedEnrs, droppedEnrs] = await Promise.all([
      Enrollment.countDocuments(progMatch),
      Enrollment.countDocuments({ ...progMatch, status: EnrollmentStatus.ACTIVE }),
      Enrollment.countDocuments({ ...progMatch, status: EnrollmentStatus.COMPLETED }),
      Enrollment.countDocuments({ ...progMatch, status: EnrollmentStatus.DROPPED }),
    ]);

    // 5. Academic & Grades Aggregation
    const progressStats = await Progress.aggregate([
      ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
      {
        $group: {
          _id: null,
          avgCompletion: { $avg: '$completionPercentage' },
        },
      },
    ]);

    const gradeStats = await Enrollment.aggregate([
      {
        $match: {
          ...(scopedProgIds ? { programId: { $in: scopedProgIds } } : {}),
          finalGrade: { $ne: null, $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          avgGrade: { $avg: '$finalGrade' },
        },
      },
    ]);

    const totalCertificates = await Certificate.countDocuments({
      ...progMatch,
      isRevoked: false,
    });

    // 6. Attendance Aggregation
    const totalLiveSessions = await LiveSession.countDocuments({
      ...progMatch,
      status: { $in: [LiveSessionStatus.COMPLETED, LiveSessionStatus.LIVE] },
    });

    const attendanceStats = await Attendance.aggregate([
      ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          attendedRecords: {
            $sum: {
              $cond: [
                {
                  $in: ['$status', [AttendanceStatus.PRESENT, AttendanceStatus.LATE]],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const overallAttendanceRate =
      attendanceStats.length > 0 && attendanceStats[0].totalRecords > 0
        ? Math.round(
            (attendanceStats[0].attendedRecords / attendanceStats[0].totalRecords) * 100
          )
        : 100;

    // 7. Reviews Aggregation
    const reviewStats = await Review.aggregate([
      ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', ReviewStatus.PENDING] }, 1, 0] },
          },
          avgRating: {
            $avg: {
              $cond: [{ $eq: ['$status', ReviewStatus.APPROVED] }, '$rating', null],
            },
          },
        },
      },
    ]);

    return {
      users: {
        totalStudents,
        totalInstructors,
        activeStudents,
      },
      programs: {
        total: totalProgs,
        open: openProgs,
        comingSoon: comingSoonProgs,
        closed: closedProgs,
      },
      applications: {
        total: totalApps,
        pending: pendingApps,
        accepted: acceptedApps,
        rejected: rejectedApps,
      },
      enrollments: {
        total: totalEnrs,
        active: activeEnrs,
        completed: completedEnrs,
        cancelled: droppedEnrs,
      },
      academic: {
        averageCompletionRate: progressStats.length > 0 ? Math.round(progressStats[0].avgCompletion || 0) : 0,
        averageFinalGrade: gradeStats.length > 0 ? Math.round(gradeStats[0].avgGrade || 0) : 0,
        totalCertificatesIssued: totalCertificates,
      },
      attendance: {
        overallAttendanceRate,
        totalLiveSessions,
      },
      reviews: {
        averagePlatformRating: reviewStats.length > 0 && reviewStats[0].avgRating ? Number(reviewStats[0].avgRating.toFixed(1)) : 5.0,
        totalReviews: reviewStats.length > 0 ? reviewStats[0].total : 0,
        pendingModerationCount: reviewStats.length > 0 ? reviewStats[0].pending : 0,
      },
    };
  }

  /**
   * 2. Enrollment Analytics by Status, Track, and Program
   */
  public static async getEnrollmentAnalytics(
    userId: string,
    userRole: UserRole
  ): Promise<IEnrollmentAnalytics> {
    const scopedProgIds = await this.getScopedProgramIds(userId, userRole);
    const progMatch: any = scopedProgIds ? { programId: { $in: scopedProgIds } } : {};

    const [totalEnrollments, activeCount, completedCount, droppedCount] =
      await Promise.all([
        Enrollment.countDocuments(progMatch),
        Enrollment.countDocuments({ ...progMatch, status: EnrollmentStatus.ACTIVE }),
        Enrollment.countDocuments({ ...progMatch, status: EnrollmentStatus.COMPLETED }),
        Enrollment.countDocuments({ ...progMatch, status: EnrollmentStatus.DROPPED }),
      ]);

    // Group by Program
    const byProgramAgg = await Enrollment.aggregate([
      ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
      {
        $group: {
          _id: '$programId',
          enrollmentCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', EnrollmentStatus.COMPLETED] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'programs',
          localField: '_id',
          foreignField: '_id',
          as: 'program',
        },
      },
      { $unwind: '$program' },
      {
        $lookup: {
          from: 'tracks',
          localField: 'program.trackId',
          foreignField: '_id',
          as: 'track',
        },
      },
      { $unwind: { path: '$track', preserveNullAndEmptyArrays: true } },
    ]);

    const byProgram = byProgramAgg.map((p) => ({
      programId: p._id.toString(),
      programTitleAr: p.program.titleAr,
      programTitleEn: p.program.titleEn,
      enrollmentCount: p.enrollmentCount,
      completedCount: p.completedCount,
      completionRate:
        p.enrollmentCount > 0 ? Math.round((p.completedCount / p.enrollmentCount) * 100) : 0,
    }));

    // Group by Track
    const trackMap = new Map<string, any>();
    byProgramAgg.forEach((item) => {
      if (item.track) {
        const trackId = item.track._id.toString();
        if (!trackMap.has(trackId)) {
          trackMap.set(trackId, {
            trackId,
            trackNameAr: item.track.nameAr,
            trackNameEn: item.track.nameEn,
            enrollmentCount: 0,
          });
        }
        trackMap.get(trackId).enrollmentCount += item.enrollmentCount;
      }
    });

    return {
      totalEnrollments,
      byStatus: {
        active: activeCount,
        completed: completedCount,
        cancelled: droppedCount,
      },
      byTrack: Array.from(trackMap.values()),
      byProgram,
    };
  }

  /**
   * 3. Progress Analytics & Distribution Tiers
   */
  public static async getProgressAnalytics(
    userId: string,
    userRole: UserRole
  ): Promise<IProgressAnalytics> {
    const scopedProgIds = await this.getScopedProgramIds(userId, userRole);

    const progressTiersAgg = await Progress.aggregate([
      ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
      {
        $group: {
          _id: null,
          avgCompletion: { $avg: '$completionPercentage' },
          tier0to24: {
            $sum: { $cond: [{ $lt: ['$completionPercentage', 25] }, 1, 0] },
          },
          tier25to49: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$completionPercentage', 25] },
                    { $lt: ['$completionPercentage', 50] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          tier50to74: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$completionPercentage', 50] },
                    { $lt: ['$completionPercentage', 75] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          tier75to99: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$completionPercentage', 75] },
                    { $lt: ['$completionPercentage', 100] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          tier100: {
            $sum: { $cond: [{ $eq: ['$completionPercentage', 100] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = progressTiersAgg[0] || {
      avgCompletion: 0,
      tier0to24: 0,
      tier25to49: 0,
      tier50to74: 0,
      tier75to99: 0,
      tier100: 0,
    };

    const programProgressAgg = await Progress.aggregate([
      ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
      {
        $group: {
          _id: '$programId',
          enrolledStudents: { $sum: 1 },
          avgCompletion: { $avg: '$completionPercentage' },
        },
      },
      {
        $lookup: {
          from: 'programs',
          localField: '_id',
          foreignField: '_id',
          as: 'program',
        },
      },
      { $unwind: '$program' },
    ]);

    return {
      averageCompletionPercentage: Math.round(stats.avgCompletion || 0),
      progressTiers: {
        tier0to24: stats.tier0to24,
        tier25to49: stats.tier25to49,
        tier50to74: stats.tier50to74,
        tier75to99: stats.tier75to99,
        tier100: stats.tier100,
      },
      programsProgress: programProgressAgg.map((p) => ({
        programId: p._id.toString(),
        programTitleAr: p.program.titleAr,
        programTitleEn: p.program.titleEn,
        enrolledStudents: p.enrolledStudents,
        averageCompletionPercentage: Math.round(p.avgCompletion || 0),
      })),
    };
  }

  /**
   * 4. Attendance Analytics
   */
  public static async getAttendanceAnalytics(
    userId: string,
    userRole: UserRole
  ): Promise<IAttendanceAnalytics> {
    const scopedProgIds = await this.getScopedProgramIds(userId, userRole);
    const progMatch: any = scopedProgIds ? { programId: { $in: scopedProgIds } } : {};

    const [totalSessions, breakdownAgg, programAttendanceAgg] = await Promise.all([
      LiveSession.countDocuments({
        ...progMatch,
        status: { $in: [LiveSessionStatus.COMPLETED, LiveSessionStatus.LIVE] },
      }),
      Attendance.aggregate([
        ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Attendance.aggregate([
        ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
        {
          $group: {
            _id: '$programId',
            totalRecords: { $sum: 1 },
            attendedRecords: {
              $sum: {
                $cond: [
                  { $in: ['$status', [AttendanceStatus.PRESENT, AttendanceStatus.LATE]] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: 'programs',
            localField: '_id',
            foreignField: '_id',
            as: 'program',
          },
        },
        { $unwind: '$program' },
      ]),
    ]);

    const breakdown: any = { present: 0, late: 0, absent: 0, excused: 0 };
    breakdownAgg.forEach((b) => {
      if (b._id) breakdown[b._id] = b.count;
    });

    const totalEligible = (breakdown.present || 0) + (breakdown.late || 0) + (breakdown.absent || 0);
    const totalAttended = (breakdown.present || 0) + (breakdown.late || 0);
    const overallRate = totalEligible > 0 ? Math.round((totalAttended / totalEligible) * 100) : 100;

    return {
      overallAttendanceRate: overallRate,
      totalSessionsConducted: totalSessions,
      attendanceBreakdown: breakdown,
      programsAttendance: programAttendanceAgg.map((p) => ({
        programId: p._id.toString(),
        programTitleAr: p.program.titleAr,
        programTitleEn: p.program.titleEn,
        totalSessions: p.totalRecords,
        attendanceRate:
          p.totalRecords > 0 ? Math.round((p.attendedRecords / p.totalRecords) * 100) : 100,
      })),
    };
  }

  /**
   * 5. Assessment Analytics (Quizzes & Assignments)
   */
  public static async getAssessmentAnalytics(
    userId: string,
    userRole: UserRole
  ): Promise<IAssessmentAnalytics> {
    const scopedProgIds = await this.getScopedProgramIds(userId, userRole);
    const progMatch: any = scopedProgIds ? { programId: { $in: scopedProgIds } } : {};

    const [totalQuizzes, quizAttemptsAgg, totalAssignments, submissionsAgg] =
      await Promise.all([
        Quiz.countDocuments(progMatch),
        QuizAttempt.aggregate([
          ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
          {
            $group: {
              _id: null,
              totalAttempts: { $sum: 1 },
              avgScore: { $avg: '$score' },
              passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
            },
          },
        ]),
        Assignment.countDocuments(progMatch),
        Submission.aggregate([
          ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
          {
            $group: {
              _id: null,
              totalSubmissions: { $sum: 1 },
              gradedCount: {
                $sum: { $cond: [{ $eq: ['$status', SubmissionStatus.GRADED] }, 1, 0] },
              },
              pendingCount: {
                $sum: { $cond: [{ $eq: ['$status', SubmissionStatus.SUBMITTED] }, 1, 0] },
              },
              avgGrade: { $avg: '$grade' },
            },
          },
        ]),
      ]);

    const qStats = quizAttemptsAgg[0] || { totalAttempts: 0, avgScore: 0, passedCount: 0 };
    const sStats = submissionsAgg[0] || {
      totalSubmissions: 0,
      gradedCount: 0,
      pendingCount: 0,
      avgGrade: 0,
    };

    const passRate =
      qStats.totalAttempts > 0 ? Math.round((qStats.passedCount / qStats.totalAttempts) * 100) : 100;

    return {
      quizzes: {
        totalQuizzes,
        totalAttempts: qStats.totalAttempts,
        averageScore: Math.round(qStats.avgScore || 0),
        passRate,
      },
      assignments: {
        totalAssignments,
        totalSubmissions: sStats.totalSubmissions,
        gradedSubmissions: sStats.gradedCount,
        pendingGradingSubmissions: sStats.pendingCount,
        averageGrade: Math.round(sStats.avgGrade || 0),
      },
    };
  }

  /**
   * 6. Certificates Analytics
   */
  public static async getCertificateAnalytics(
    userId: string,
    userRole: UserRole
  ): Promise<ICertificateAnalytics> {
    const scopedProgIds = await this.getScopedProgramIds(userId, userRole);
    const progMatch: any = scopedProgIds ? { programId: { $in: scopedProgIds } } : {};

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalCertificates, totalCompletedEnrollments, issuedThisMonth, byProgramAgg] =
      await Promise.all([
        Certificate.countDocuments({ ...progMatch, isRevoked: false }),
        Enrollment.countDocuments({ ...progMatch, status: EnrollmentStatus.COMPLETED }),
        Certificate.countDocuments({
          ...progMatch,
          isRevoked: false,
          issuedAt: { $gte: startOfMonth },
        }),
        Certificate.aggregate([
          ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
          { $match: { isRevoked: false } },
          {
            $group: {
              _id: '$programId',
              certificatesCount: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: 'programs',
              localField: '_id',
              foreignField: '_id',
              as: 'program',
            },
          },
          { $unwind: '$program' },
        ]),
      ]);

    const totalEnrollments = await Enrollment.countDocuments(progMatch);
    const conversionRate =
      totalEnrollments > 0 ? Math.round((totalCompletedEnrollments / totalEnrollments) * 100) : 0;

    return {
      totalCertificatesIssued: totalCertificates,
      completionConversionRate: conversionRate,
      issuedThisMonth,
      byProgram: byProgramAgg.map((p) => ({
        programId: p._id.toString(),
        programTitleAr: p.program.titleAr,
        programTitleEn: p.program.titleEn,
        certificatesCount: p.certificatesCount,
      })),
    };
  }

  /**
   * 7. Reviews & Ratings Analytics
   */
  public static async getReviewsAnalytics(
    userId: string,
    userRole: UserRole
  ): Promise<IReviewsAnalytics> {
    const scopedProgIds = await this.getScopedProgramIds(userId, userRole);
    const progMatch: any = scopedProgIds ? { programId: { $in: scopedProgIds } } : {};

    const [totalReviews, featuredCount, statusAgg, starAgg, avgRatingAgg] =
      await Promise.all([
        Review.countDocuments(progMatch),
        Review.countDocuments({ ...progMatch, isFeatured: true }),
        Review.aggregate([
          ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
        Review.aggregate([
          ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
          { $match: { status: ReviewStatus.APPROVED } },
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 },
            },
          },
        ]),
        Review.aggregate([
          ...(scopedProgIds ? [{ $match: { programId: { $in: scopedProgIds } } }] : []),
          { $match: { status: ReviewStatus.APPROVED } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating' },
            },
          },
        ]),
      ]);

    const statusBreakdown: any = { pending: 0, approved: 0, rejected: 0 };
    statusAgg.forEach((s) => {
      if (s._id) statusBreakdown[s._id] = s.count;
    });

    const starDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    starAgg.forEach((s) => {
      if (s._id) starDistribution[s._id] = s.count;
    });

    const avgRating =
      avgRatingAgg.length > 0 && avgRatingAgg[0].avgRating
        ? Number(avgRatingAgg[0].avgRating.toFixed(1))
        : 5.0;

    return {
      averagePlatformRating: avgRating,
      totalReviews,
      statusBreakdown,
      starDistribution,
      featuredReviewsCount: featuredCount,
    };
  }

  /**
   * 8. Deep-Dive Detailed Report for a Single Program
   */
  public static async getProgramDetailedReport(
    programId: string,
    userId: string,
    userRole: UserRole
  ): Promise<IProgramDetailedReport> {
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const program = await Program.findById(programId);
    if (!program) {
      throw ApiError.notFound('Program not found');
    }

    // Role scoping
    if (userRole === UserRole.INSTRUCTOR) {
      const profile = await InstructorProfile.findOne({ userId });
      const isAssigned = profile?.assignedPrograms?.some((id) => id.toString() === programId);
      if (!isAssigned) {
        throw ApiError.forbidden('Forbidden: You are not assigned to this program report');
      }
    } else if (userRole !== UserRole.SUPER_ADMIN) {
      throw ApiError.forbidden('Forbidden: Access denied');
    }

    const pId = new mongoose.Types.ObjectId(programId);

    const [
      totalApplications,
      totalEnrollments,
      activeStudents,
      graduatedStudents,
      gradeStats,
      totalCertificates,
      totalLiveSessions,
      attendanceStats,
      reviewStats,
    ] = await Promise.all([
      Application.countDocuments({ programId: pId }),
      Enrollment.countDocuments({ programId: pId }),
      Enrollment.countDocuments({ programId: pId, status: EnrollmentStatus.ACTIVE }),
      Enrollment.countDocuments({ programId: pId, status: EnrollmentStatus.COMPLETED }),
      Enrollment.aggregate([
        { $match: { programId: pId, finalGrade: { $ne: null, $gt: 0 } } },
        { $group: { _id: null, avgGrade: { $avg: '$finalGrade' } } },
      ]),
      Certificate.countDocuments({ programId: pId, isRevoked: false }),
      LiveSession.countDocuments({
        programId: pId,
        status: { $in: [LiveSessionStatus.COMPLETED, LiveSessionStatus.LIVE] },
      }),
      Attendance.aggregate([
        { $match: { programId: pId } },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            attendedRecords: {
              $sum: {
                $cond: [
                  { $in: ['$status', [AttendanceStatus.PRESENT, AttendanceStatus.LATE]] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Review.aggregate([
        { $match: { programId: pId, status: ReviewStatus.APPROVED } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgRating: { $avg: '$rating' },
          },
        },
      ]),
    ]);

    const completionRate =
      totalEnrollments > 0 ? Math.round((graduatedStudents / totalEnrollments) * 100) : 0;
    const averageFinalGrade =
      gradeStats.length > 0 && gradeStats[0].avgGrade ? Math.round(gradeStats[0].avgGrade) : 0;
    const attendanceRate =
      attendanceStats.length > 0 && attendanceStats[0].totalRecords > 0
        ? Math.round(
            (attendanceStats[0].attendedRecords / attendanceStats[0].totalRecords) * 100
          )
        : 100;
    const averageRating =
      reviewStats.length > 0 && reviewStats[0].avgRating
        ? Number(reviewStats[0].avgRating.toFixed(1))
        : 5.0;
    const totalReviews = reviewStats.length > 0 ? reviewStats[0].total : 0;

    return {
      program: {
        id: program._id.toString(),
        titleAr: program.titleAr,
        titleEn: program.titleEn,
        slug: program.slug,
        status: program.status,
        price: program.price ?? 0,
      },
      metrics: {
        totalApplications,
        totalEnrollments,
        activeStudents,
        graduatedStudents,
        completionRate,
        averageFinalGrade,
        totalCertificates,
        totalLiveSessions,
        attendanceRate,
        averageRating,
        totalReviews,
      },
    };
  }

  /**
   * 9. Paginated Students Performance Report
   */
  public static async getStudentsReport(
    userId: string,
    userRole: UserRole,
    filters: any
  ): Promise<any> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const scopedProgIds = await this.getScopedProgramIds(userId, userRole);
    const matchQuery: any = {};
    if (scopedProgIds) {
      matchQuery.programId = { $in: scopedProgIds };
    }
    if (filters.programId && mongoose.Types.ObjectId.isValid(filters.programId)) {
      matchQuery.programId = new mongoose.Types.ObjectId(filters.programId);
    }
    if (filters.status) {
      matchQuery.status = filters.status;
    }

    const [enrollments, total] = await Promise.all([
      Enrollment.find(matchQuery)
        .populate('studentId', 'fullName email phone avatarUrl')
        .populate('programId', 'titleAr titleEn slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Enrollment.countDocuments(matchQuery),
    ]);

    const reportItems = await Promise.all(
      enrollments.map(async (enr) => {
        const studentId = (enr.studentId as any)?._id?.toString() || enr.studentId.toString();
        const programId = (enr.programId as any)?._id?.toString() || enr.programId.toString();

        const [progress, certificate] = await Promise.all([
          Progress.findOne({ studentId, programId }),
          Certificate.findOne({ enrollmentId: enr._id }),
        ]);

        return {
          enrollmentId: enr._id,
          student: enr.studentId,
          program: enr.programId,
          status: enr.status,
          completionPercentage: progress?.completionPercentage || 0,
          finalGrade: enr.finalGrade,
          completedAt: enr.completedAt,
          certificateNumber: certificate?.certificateNumber,
          enrolledAt: enr.enrolledAt,
        };
      })
    );

    return {
      report: reportItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
