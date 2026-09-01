import mongoose from 'mongoose';
import crypto from 'crypto';
import { Progress, IProgress } from '../../models/progress.model.js';
import { Enrollment } from '../../models/enrollment.model.js';
import { Lesson } from '../../models/lesson.model.js';
import { Quiz } from '../../models/quiz.model.js';
import { Assignment } from '../../models/assignment.model.js';
import { Submission } from '../../models/submission.model.js';
import { Certificate } from '../../models/certificate.model.js';
import { Program } from '../../models/program.model.js';
import { EnrollmentStatus } from '../../constants/enrollmentStatus.enum.js';
import { SubmissionStatus } from '../../constants/content.enum.js';
import { CourseModulesService } from '../courseModules/courseModules.service.js';
import { UserRole } from '../../constants/roles.enum.js';
import { ApiError } from '../../utils/apiError.js';
import { IProgramProgressSummary, IRecalculateProgressResult } from './progress.types.js';

export class ProgressService {
  /**
   * Recalculate student progress, academic grade, completion status, and issue certificate if eligible
   */
  public static async recalculateStudentProgress(
    studentId: string,
    programId: string | mongoose.Types.ObjectId
  ): Promise<IRecalculateProgressResult> {
    const progId = programId.toString();

    const [program, enrollment, publishedLessons, publishedQuizzes, publishedAssignments] =
      await Promise.all([
        Program.findById(progId),
        Enrollment.findOne({ studentId, programId: progId }),
        Lesson.find({ programId: progId, isPublished: true }),
        Quiz.find({ programId: progId, isPublished: true }),
        Assignment.find({ programId: progId, isPublished: true }),
      ]);

    if (!enrollment) {
      throw ApiError.notFound('Enrollment record not found for this program');
    }

    let progress = await Progress.findOne({ studentId, programId: progId });
    if (!progress) {
      progress = new Progress({
        studentId: new mongoose.Types.ObjectId(studentId),
        programId: new mongoose.Types.ObjectId(progId),
        completedLessons: [],
        quizProgress: [],
        completionPercentage: 0,
        lastActivityAt: new Date(),
      });
    }

    // 1. Content Completion Percentage
    const totalLessons = publishedLessons.length;
    const completedLessonIds = progress.completedLessons.map((l) => l.toString());
    const validCompletedLessons = publishedLessons.filter((l) =>
      completedLessonIds.includes(l._id.toString())
    );
    const completedLessonsCount = validCompletedLessons.length;

    const completionPercentage =
      totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 100;

    progress.completionPercentage = completionPercentage;

    // 2. Quiz Evaluation
    const totalQuizzes = publishedQuizzes.length;
    let quizzesPassedCount = 0;
    let totalQuizScoreSum = 0;

    for (const quiz of publishedQuizzes) {
      const qProg = progress.quizProgress.find(
        (qp) => qp.quizId.toString() === quiz._id.toString()
      );
      if (qProg && qProg.passed) {
        quizzesPassedCount++;
        totalQuizScoreSum += qProg.highestScore;
      }
    }

    const quizAverage =
      totalQuizzes > 0 && quizzesPassedCount === totalQuizzes
        ? Math.round(totalQuizScoreSum / totalQuizzes)
        : null;

    // 3. Assignment Evaluation
    const totalAssignments = publishedAssignments.length;
    const assignmentIds = publishedAssignments.map((a) => a._id);

    const gradedSubmissions = await Submission.find({
      programId: progId,
      studentId,
      assignmentId: { $in: assignmentIds },
      status: SubmissionStatus.GRADED,
    });

    let totalAssignmentPercentageSum = 0;
    for (const sub of gradedSubmissions) {
      const assignment = publishedAssignments.find((a) => a._id.equals(sub.assignmentId));
      if (assignment && typeof sub.grade === 'number') {
        const percentage = (sub.grade / (assignment.maxScore || 100)) * 100;
        totalAssignmentPercentageSum += percentage;
      }
    }

    const assignmentAverage =
      totalAssignments > 0 && gradedSubmissions.length === totalAssignments
        ? Math.round(totalAssignmentPercentageSum / totalAssignments)
        : null;

    // 4. Academic Final Grade Calculation
    let finalGrade: number | null = null;
    if (quizAverage !== null && assignmentAverage !== null) {
      finalGrade = Math.round((quizAverage + assignmentAverage) / 2);
    } else if (quizAverage !== null) {
      finalGrade = quizAverage;
    } else if (assignmentAverage !== null) {
      finalGrade = assignmentAverage;
    } else if (totalQuizzes === 0 && totalAssignments === 0 && completionPercentage === 100) {
      finalGrade = 100;
    }

    // 5. Course Completion Rules
    const isContentComplete = totalLessons === 0 || completedLessonsCount === totalLessons;
    const areQuizzesComplete = totalQuizzes === 0 || quizzesPassedCount === totalQuizzes;
    const areAssignmentsComplete =
      totalAssignments === 0 || gradedSubmissions.length === totalAssignments;
    const isGradePassing = finalGrade !== null && finalGrade >= 70;

    const isCourseCompleted =
      isContentComplete && areQuizzesComplete && areAssignmentsComplete && isGradePassing;

    let certificateIssued = false;
    let certificateNumber: string | undefined;

    if (isCourseCompleted) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.finalGrade = finalGrade !== null ? finalGrade : 100;
      if (!enrollment.completedAt) {
        enrollment.completedAt = new Date();
      }

      // Check or generate certificate
      let certificate = await Certificate.findOne({ enrollmentId: enrollment._id });
      if (!certificate) {
        const progCode = (program?.slug || 'ZH').substring(0, 3).toUpperCase();
        const randCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const certNum = `ZH-${progCode}-2026-${randCode}`;

        certificate = new Certificate({
          certificateNumber: certNum,
          studentId: new mongoose.Types.ObjectId(studentId),
          programId: new mongoose.Types.ObjectId(progId),
          enrollmentId: enrollment._id,
          finalGrade,
          issuedAt: new Date(),
          certificateUrl: `https://storage.zeinhub.com/certificates/${certNum}.pdf`,
          verificationUrl: `http://localhost:5000/api/v1/certificates/${certNum}/verify`,
        });
        await certificate.save();
        certificateIssued = true;
      }

      certificateNumber = certificate.certificateNumber;
      enrollment.certificateUrl = certificate.certificateUrl;
      await enrollment.save();
    }

    progress.lastActivityAt = new Date();
    await progress.save();

    return {
      studentId,
      programId: progId,
      completionPercentage,
      finalGrade,
      status: enrollment.status,
      isCompleted: isCourseCompleted,
      certificateIssued,
      certificateNumber,
    };
  }

  /**
   * Student marks a lesson as completed
   */
  public static async completeLesson(
    studentId: string,
    lessonId: string
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      throw ApiError.badRequest('Invalid lesson ID format');
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw ApiError.notFound('Lesson not found');
    }

    // Strict enrollment check: Student must be actively enrolled in this program
    const enrollment = await Enrollment.findOne({
      studentId,
      programId: lesson.programId,
      status: { $in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
    });

    if (!enrollment) {
      throw ApiError.forbidden(
        'Active enrollment required to complete lessons for this program'
      );
    }

    let progress = await Progress.findOne({
      studentId,
      programId: lesson.programId,
    });

    if (!progress) {
      progress = new Progress({
        studentId: new mongoose.Types.ObjectId(studentId),
        programId: lesson.programId,
        completedLessons: [],
        quizProgress: [],
        completionPercentage: 0,
        lastActivityAt: new Date(),
      });
    }

    const lessonObjId = new mongoose.Types.ObjectId(lessonId);
    if (!progress.completedLessons.some((id) => id.equals(lessonObjId))) {
      progress.completedLessons.push(lessonObjId);
      await progress.save();
    }

    // Trigger recalculation
    const summary = await this.recalculateStudentProgress(
      studentId,
      lesson.programId.toString()
    );

    return {
      lessonId,
      programId: lesson.programId,
      completed: true,
      progressSummary: summary,
    };
  }

  /**
   * Get all progress records for currently logged-in student
   */
  public static async getMyProgressAll(studentId: string): Promise<any[]> {
    const enrollments = await Enrollment.find({ studentId })
      .populate('programId', 'titleAr titleEn slug coverImageUrl durationWeeks')
      .sort({ enrolledAt: -1 });

    const summaries = await Promise.all(
      enrollments.map(async (enr) => {
        const progId = (enr.programId as any)?._id?.toString() || enr.programId.toString();
        const [progress, certificate, publishedLessons, publishedQuizzes, publishedAssignments] =
          await Promise.all([
            Progress.findOne({ studentId, programId: progId }),
            Certificate.findOne({ enrollmentId: enr._id }),
            Lesson.countDocuments({ programId: progId, isPublished: true }),
            Quiz.countDocuments({ programId: progId, isPublished: true }),
            Assignment.countDocuments({ programId: progId, isPublished: true }),
          ]);

        const completedLessonsCount = progress?.completedLessons?.length || 0;
        const completionPercentage = progress?.completionPercentage || 0;

        return {
          enrollmentId: enr._id,
          program: enr.programId,
          status: enr.status,
          completionPercentage,
          totalLessons: publishedLessons,
          completedLessonsCount,
          totalQuizzes: publishedQuizzes,
          totalAssignments: publishedAssignments,
          finalGrade: enr.finalGrade,
          isCompleted: enr.status === EnrollmentStatus.COMPLETED,
          certificate: certificate
            ? {
                certificateNumber: certificate.certificateNumber,
                certificateUrl: certificate.certificateUrl,
                issuedAt: certificate.issuedAt,
                verificationUrl: certificate.verificationUrl,
              }
            : null,
          lastActivityAt: progress?.lastActivityAt || enr.enrolledAt,
        };
      })
    );

    return summaries;
  }

  /**
   * Get progress for a specific program for the logged in student
   */
  public static async getMyProgressForProgram(
    studentId: string,
    programId: string
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const enrollment = await Enrollment.findOne({
      studentId,
      programId,
    }).populate('programId', 'titleAr titleEn slug coverImageUrl');

    if (!enrollment) {
      throw ApiError.notFound('Enrollment not found for this program');
    }

    const [progress, certificate, lessons, quizzes, assignments, submissions] =
      await Promise.all([
        Progress.findOne({ studentId, programId }),
        Certificate.findOne({ enrollmentId: enrollment._id }),
        Lesson.find({ programId, isPublished: true }).select('title order durationMinutes isFreePreview'),
        Quiz.find({ programId, isPublished: true }).select('title passingScore maxAttempts'),
        Assignment.find({ programId, isPublished: true }).select('title submissionType maxScore'),
        Submission.find({ studentId, programId }),
      ]);

    const completedLessonIds = (progress?.completedLessons || []).map((l) => l.toString());

    const lessonsWithStatus = lessons.map((les) => ({
      _id: les._id,
      title: les.title,
      order: les.order,
      durationMinutes: les.durationMinutes,
      isCompleted: completedLessonIds.includes(les._id.toString()),
    }));

    return {
      enrollment: {
        id: enrollment._id,
        status: enrollment.status,
        finalGrade: enrollment.finalGrade,
        completedAt: enrollment.completedAt,
      },
      program: enrollment.programId,
      progress: {
        completionPercentage: progress?.completionPercentage || 0,
        completedLessonsCount: completedLessonIds.length,
        totalLessons: lessons.length,
        lastActivityAt: progress?.lastActivityAt || enrollment.enrolledAt,
      },
      quizzesProgress: progress?.quizProgress || [],
      assignmentsProgress: submissions.map((s) => ({
        assignmentId: s.assignmentId,
        status: s.status,
        grade: s.grade,
        feedback: s.feedback,
      })),
      certificate: certificate || null,
      lessons: lessonsWithStatus,
    };
  }

  /**
   * Instructor / Super Admin: Get all students progress in a program
   */
  public static async getProgramStudentsProgressAdmin(
    programId: string,
    userId: string,
    userRole: UserRole
  ): Promise<any[]> {
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    await CourseModulesService.verifyProgramWriteAccess(userId, userRole, programId);

    const enrollments = await Enrollment.find({ programId })
      .populate('studentId', 'fullName email phone avatarUrl')
      .sort({ enrolledAt: -1 });

    const studentSummaries = await Promise.all(
      enrollments.map(async (enr) => {
        const studentId = (enr.studentId as any)?._id?.toString() || enr.studentId.toString();
        const progress = await Progress.findOne({ studentId, programId });
        const certificate = await Certificate.findOne({ enrollmentId: enr._id });

        return {
          enrollmentId: enr._id,
          student: enr.studentId,
          status: enr.status,
          finalGrade: enr.finalGrade,
          completedAt: enr.completedAt,
          completionPercentage: progress?.completionPercentage || 0,
          completedLessonsCount: progress?.completedLessons?.length || 0,
          certificateNumber: certificate?.certificateNumber,
          lastActivityAt: progress?.lastActivityAt || enr.enrolledAt,
        };
      })
    );

    return studentSummaries;
  }

  /**
   * Recalculate progress for all students in a program
   */
  public static async recalculateProgramProgressAdmin(
    programId: string,
    userId: string,
    userRole: UserRole
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    await CourseModulesService.verifyProgramWriteAccess(userId, userRole, programId);

    const enrollments = await Enrollment.find({ programId });
    const results = await Promise.all(
      enrollments.map((enr) => {
        const studentId = enr.studentId.toString();
        return this.recalculateStudentProgress(studentId, programId);
      })
    );

    return {
      programId,
      totalStudentsRecalculated: results.length,
      results,
    };
  }
}
