import mongoose from 'mongoose';
import { Assignment, IAssignment } from '../../models/assignment.model.js';
import { Submission, ISubmission } from '../../models/submission.model.js';
import { Lesson } from '../../models/lesson.model.js';
import { Program } from '../../models/program.model.js';
import { InstructorProfile } from '../../models/instructorProfile.model.js';
import { Enrollment } from '../../models/enrollment.model.js';
import { SubmissionStatus, AssignmentSubmissionType } from '../../constants/content.enum.js';
import { CourseModulesService } from '../courseModules/courseModules.service.js';
import { UserRole } from '../../constants/roles.enum.js';
import { ApiError } from '../../utils/apiError.js';
import {
  ICreateAssignmentDTO,
  IUpdateAssignmentDTO,
  ISubmitAssignmentDTO,
  IGradeSubmissionDTO,
} from './assignments.types.js';

export class AssignmentsService {
  /**
   * Create assignment under a lesson
   */
  public static async createAssignment(
    lessonId: string,
    userId: string,
    userRole: UserRole,
    dto: ICreateAssignmentDTO
  ): Promise<IAssignment> {
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      throw ApiError.badRequest('Invalid lesson ID format');
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw ApiError.notFound('Lesson not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      lesson.programId.toString()
    );

    const assignment = new Assignment({
      programId: lesson.programId,
      moduleId: lesson.moduleId,
      title: dto.title.trim(),
      description: dto.description.trim(),
      instructions: dto.instructions?.trim() || undefined,
      submissionType: dto.submissionType || AssignmentSubmissionType.AUDIO,
      maxScore: dto.maxScore ?? 100,
      deadline: dto.deadline || null,
      isPublished: dto.isPublished ?? true,
    });

    await assignment.save();
    return assignment;
  }

  /**
   * Create assignment directly under a program by assigned instructor
   */
  public static async createProgramAssignment(
    programId: string,
    userId: string,
    userRole: UserRole,
    dto: ICreateAssignmentDTO
  ): Promise<IAssignment> {
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

    const assignment = new Assignment({
      programId: new mongoose.Types.ObjectId(programId),
      title: dto.title.trim(),
      description: dto.description.trim(),
      instructions: dto.instructions?.trim() || dto.description.trim(),
      submissionType: dto.submissionType || AssignmentSubmissionType.AUDIO,
      maxScore: dto.maxScore ?? 100,
      deadline: dto.deadline || null,
      isPublished: dto.isPublished ?? true,
    });

    await assignment.save();
    return assignment;
  }

  /**
   * Get all assignments for the current user's enrolled / assigned programs
   */
  public static async getMyAssignments(
    userId: string,
    userRole: UserRole
  ): Promise<any[]> {
    let programIds: mongoose.Types.ObjectId[] = [];

    if (userRole === UserRole.STUDENT) {
      const enrollments: any[] = await (Enrollment as any).find({
        studentId: new mongoose.Types.ObjectId(userId),
        status: { $in: ['active', 'completed'] },
      }).select('programId');

      programIds = enrollments.map((e) => new mongoose.Types.ObjectId(e.programId));
    } else if (userRole === UserRole.INSTRUCTOR) {
      const profile = await InstructorProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
      const assignedProgramIds = profile?.assignedPrograms?.map((id: any) => id.toString()) || [];
      const assignedPrograms = await Program.find({ instructorId: new mongoose.Types.ObjectId(userId) }).select('_id');
      const directProgramIds = assignedPrograms.map((p) => p._id.toString());
      programIds = Array.from(new Set([...assignedProgramIds, ...directProgramIds])).map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    const filter: any = { isPublished: true };
    if (userRole !== UserRole.SUPER_ADMIN) {
      filter.programId = { $in: programIds };
    }

    const assignments = await Assignment.find(filter)
      .populate('programId', 'title titleAr titleEn slug instructorId')
      .populate('moduleId', 'title order weekNumber')
      .sort({ createdAt: -1 });

    const results = await Promise.all(
      assignments.map(async (asg) => {
        const obj: any = asg.toObject();
        if (userRole === UserRole.STUDENT) {
          const submission = await Submission.findOne({
            assignmentId: asg._id,
            studentId: new mongoose.Types.ObjectId(userId),
          }).populate('gradedBy', 'fullName email');
          obj.submission = submission;
        }
        return obj;
      })
    );

    return results;
  }

  /**
   * Get assignment details
   */
  public static async getAssignmentById(
    assignmentId: string,
    userId?: string,
    userRole?: UserRole
  ): Promise<IAssignment> {
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw ApiError.badRequest('Invalid assignment ID format');
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw ApiError.notFound('Assignment not found');
    }

    const hasAccess = await CourseModulesService.hasFullProgramAccess(
      userId,
      userRole,
      assignment.programId.toString()
    );

    if (!hasAccess) {
      throw ApiError.forbidden('Active enrollment required to view this assignment');
    }

    return assignment;
  }

  /**
   * Update assignment details
   */
  public static async updateAssignment(
    assignmentId: string,
    userId: string,
    userRole: UserRole,
    dto: IUpdateAssignmentDTO
  ): Promise<IAssignment> {
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw ApiError.badRequest('Invalid assignment ID format');
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw ApiError.notFound('Assignment not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      assignment.programId.toString()
    );

    if (dto.title) assignment.title = dto.title.trim();
    if (dto.description) assignment.description = dto.description.trim();
    if (dto.instructions !== undefined) assignment.instructions = dto.instructions?.trim() || undefined;
    if (dto.submissionType) assignment.submissionType = dto.submissionType;
    if (dto.maxScore !== undefined) assignment.maxScore = dto.maxScore;
    if (dto.deadline !== undefined) assignment.deadline = dto.deadline;
    if (dto.isPublished !== undefined) assignment.isPublished = dto.isPublished;

    await assignment.save();
    return assignment;
  }

  /**
   * Delete assignment and linked submissions
   */
  public static async deleteAssignment(
    assignmentId: string,
    userId: string,
    userRole: UserRole
  ): Promise<{ deleted: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw ApiError.badRequest('Invalid assignment ID format');
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw ApiError.notFound('Assignment not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      assignment.programId.toString()
    );

    await Submission.deleteMany({ assignmentId: assignment._id });
    await Assignment.findByIdAndDelete(assignmentId);
    return { deleted: true };
  }

  /**
   * Student submits practical assignment
   */
  public static async submitAssignment(
    assignmentId: string,
    studentId: string,
    dto: ISubmitAssignmentDTO
  ): Promise<ISubmission> {
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw ApiError.badRequest('Invalid assignment ID format');
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw ApiError.notFound('Assignment not found');
    }

    // Verify active enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      programId: assignment.programId,
      status: { $in: ['active', 'completed'] },
    } as any);

    if (!enrollment) {
      throw ApiError.forbidden('Active enrollment required to submit this assignment');
    }

    // Create or update existing submission for this student and assignment
    let submission = await Submission.findOne({
      assignmentId: assignment._id,
      studentId: new mongoose.Types.ObjectId(studentId),
    });

    if (submission) {
      submission.fileUrl = dto.fileUrl?.trim() || undefined;
      submission.textContent = dto.textContent || undefined;
      submission.status = SubmissionStatus.SUBMITTED;
      submission.grade = undefined;
      submission.feedback = undefined;
      submission.gradedBy = undefined as any;
      submission.gradedAt = undefined as any;
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      submission = new Submission({
        assignmentId: assignment._id,
        programId: assignment.programId,
        studentId: new mongoose.Types.ObjectId(studentId),
        fileUrl: dto.fileUrl?.trim() || undefined,
        textContent: dto.textContent || undefined,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      });
      await submission.save();
    }

    return submission;
  }

  /**
   * Student gets own submission
   */
  public static async getMySubmission(
    assignmentId: string,
    studentId: string
  ): Promise<ISubmission | null> {
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw ApiError.badRequest('Invalid assignment ID format');
    }

    return Submission.findOne({
      assignmentId,
      studentId,
    }).populate('gradedBy', 'fullName email');
  }

  /**
   * Instructor / Super Admin: Get all submissions for an assignment
   */
  public static async getAssignmentSubmissions(
    assignmentId: string,
    userId: string,
    userRole: UserRole
  ): Promise<ISubmission[]> {
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw ApiError.badRequest('Invalid assignment ID format');
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw ApiError.notFound('Assignment not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      userId,
      userRole,
      assignment.programId.toString()
    );

    return Submission.find({ assignmentId: assignment._id })
      .populate('studentId', 'fullName email phone avatarUrl')
      .populate('gradedBy', 'fullName email')
      .sort({ createdAt: -1 });
  }

  /**
   * Grade a student submission (Super Admin or Assigned Instructor)
   */
  public static async gradeSubmission(
    submissionId: string,
    graderId: string,
    graderRole: UserRole,
    dto: IGradeSubmissionDTO
  ): Promise<ISubmission> {
    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      throw ApiError.badRequest('Invalid submission ID format');
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw ApiError.notFound('Submission not found');
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) {
      throw ApiError.notFound('Assignment record not found');
    }

    await CourseModulesService.verifyProgramWriteAccess(
      graderId,
      graderRole,
      assignment.programId.toString()
    );

    if (dto.grade > assignment.maxScore) {
      throw ApiError.badRequest(
        `Grade score (${dto.grade}) cannot exceed assignment max score (${assignment.maxScore})`
      );
    }

    submission.grade = dto.grade;
    if (dto.feedback !== undefined) {
      submission.feedback = dto.feedback?.trim() || undefined;
    }
    submission.status = (dto as any).status || SubmissionStatus.GRADED;
    submission.gradedBy = new mongoose.Types.ObjectId(graderId);
    submission.gradedAt = new Date();

    await submission.save();

    const populated = await Submission.findById(submission._id)
      .populate('studentId', 'fullName email')
      .populate('assignmentId', 'title description maxScore')
      .populate('programId', 'title titleAr titleEn slug')
      .populate('gradedBy', 'fullName email');

    return populated || submission;
  }

  /**
   * Instructor / Super Admin: Get all submissions filtered by instructor's assigned programs
   */
  public static async getAllSubmissions(
    userId: string,
    userRole: UserRole,
    status?: string
  ): Promise<ISubmission[]> {
    const filter: any = {};

    if (userRole === UserRole.INSTRUCTOR) {
      const instructorObjId = new mongoose.Types.ObjectId(userId);
      const profile = await InstructorProfile.findOne({ userId: instructorObjId });
      const assignedProgramIds = profile?.assignedPrograms?.map((id: any) => id.toString()) || [];

      const assignedPrograms = await Program.find({ instructorId: instructorObjId }).select('_id');
      const directProgramIds = assignedPrograms.map((p) => p._id.toString());

      const allInstructorProgramIds = Array.from(new Set([...assignedProgramIds, ...directProgramIds])).map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      filter.programId = { $in: allInstructorProgramIds };
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    return Submission.find(filter)
      .populate('studentId', 'fullName email phone avatarUrl')
      .populate('assignmentId', 'title description maxScore submissionType instructions')
      .populate('programId', 'title titleAr titleEn slug')
      .populate('gradedBy', 'fullName email')
      .sort({ submittedAt: -1, createdAt: -1 });
  }
}
