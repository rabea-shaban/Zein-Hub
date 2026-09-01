import { Request, Response } from 'express';
import { AssignmentsService } from './assignments.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class AssignmentsController {
  public static getMyAssignments = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const assignments = await AssignmentsService.getMyAssignments(userId, userRole);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Assignments retrieved successfully',
      assignments,
      { count: assignments.length }
    );
  };

  public static createProgramAssignment = async (req: Request, res: Response): Promise<Response> => {
    const programId = req.params.programId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const assignment = await AssignmentsService.createProgramAssignment(
      programId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Practical assignment created successfully',
      assignment
    );
  };

  public static createAssignment = async (req: Request, res: Response): Promise<Response> => {
    const lessonId = req.params.lessonId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const assignment = await AssignmentsService.createAssignment(
      lessonId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Practical assignment created successfully',
      assignment
    );
  };

  public static getAssignmentById = async (req: Request, res: Response): Promise<Response> => {
    const assignmentId = req.params.id as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const assignment = await AssignmentsService.getAssignmentById(
      assignmentId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Assignment retrieved successfully',
      assignment
    );
  };

  public static updateAssignment = async (req: Request, res: Response): Promise<Response> => {
    const assignmentId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const assignment = await AssignmentsService.updateAssignment(
      assignmentId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Assignment updated successfully',
      assignment
    );
  };

  public static deleteAssignment = async (req: Request, res: Response): Promise<Response> => {
    const assignmentId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await AssignmentsService.deleteAssignment(
      assignmentId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Assignment and associated submissions deleted successfully',
      result
    );
  };

  public static submitAssignment = async (req: Request, res: Response): Promise<Response> => {
    const assignmentId = req.params.id as string;
    const studentId = req.user!.id;

    const submission = await AssignmentsService.submitAssignment(
      assignmentId,
      studentId,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Assignment submission uploaded successfully. It is now awaiting instructor grading.',
      submission
    );
  };

  public static getMySubmission = async (req: Request, res: Response): Promise<Response> => {
    const assignmentId = req.params.id as string;
    const studentId = req.user!.id;

    const submission = await AssignmentsService.getMySubmission(
      assignmentId,
      studentId
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      submission
        ? 'Submission details retrieved successfully'
        : 'No submission found for this assignment yet',
      submission
    );
  };

  public static getAssignmentSubmissions = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const assignmentId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const submissions = await AssignmentsService.getAssignmentSubmissions(
      assignmentId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Assignment submissions retrieved successfully',
      submissions,
      { count: submissions.length }
    );
  };

  public static gradeSubmission = async (req: Request, res: Response): Promise<Response> => {
    const submissionId = req.params.id as string;
    const graderId = req.user!.id;
    const graderRole = req.user!.role;

    const submission = await AssignmentsService.gradeSubmission(
      submissionId,
      graderId,
      graderRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Submission graded successfully',
      submission
    );
  };

  public static getAllSubmissions = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const status = req.query.status as string | undefined;

    const submissions = await AssignmentsService.getAllSubmissions(
      userId,
      userRole,
      status
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Submissions retrieved successfully',
      submissions,
      { count: submissions.length }
    );
  };
}
