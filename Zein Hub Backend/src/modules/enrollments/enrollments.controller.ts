import { Request, Response } from 'express';
import { EnrollmentsService } from './enrollments.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { EnrollmentStatus } from '../../constants/enrollmentStatus.enum.js';

export class EnrollmentsController {
  // Student Controllers
  public static getMyEnrollments = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user!.id;
    const enrollments = await EnrollmentsService.getMyEnrollments(studentId);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'My enrollments retrieved successfully',
      enrollments,
      { count: enrollments.length }
    );
  };

  public static getMyEnrollmentForProgram = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const studentId = req.user!.id;
    const programId = req.params.programId as string;
    const result = await EnrollmentsService.getStudentEnrollmentForProgram(
      studentId,
      programId
    );
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Program enrollment details retrieved successfully',
      result
    );
  };

  public static enrollSelf = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user!.id;
    const programId = req.params.programId as string;
    const enrollment = await EnrollmentsService.createEnrollment(
      studentId,
      programId,
      EnrollmentStatus.ACTIVE
    );
    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Enrolled in program successfully',
      enrollment
    );
  };

  public static adminCreateEnrollment = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { studentId, programId, status } = req.body;
    const enrollment = await EnrollmentsService.createEnrollment(
      studentId,
      programId,
      status || EnrollmentStatus.ACTIVE
    );
    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Student enrolled in program successfully by Admin',
      enrollment
    );
  };

  // Super Admin Controllers
  public static getAllAdmin = async (req: Request, res: Response): Promise<Response> => {
    const query = {
      programId: req.query.programId as string | undefined,
      studentId: req.query.studentId as string | undefined,
      status: req.query.status as EnrollmentStatus | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 50,
    };

    const { enrollments, meta } = await EnrollmentsService.getAllEnrollmentsAdmin(query);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'All enrollments retrieved successfully',
      enrollments,
      meta
    );
  };

  public static updateStatus = async (req: Request, res: Response): Promise<Response> => {
    const enrollmentId = req.params.id as string;
    const enrollment = await EnrollmentsService.updateEnrollmentStatusByAdmin(
      enrollmentId,
      req.body
    );
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Enrollment status updated successfully',
      enrollment
    );
  };

  public static deleteEnrollment = async (req: Request, res: Response): Promise<Response> => {
    const enrollmentId = req.params.id as string;
    await EnrollmentsService.deleteEnrollment(enrollmentId);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Enrollment deleted successfully'
    );
  };

  public static deleteStudent = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.params.studentId as string;
    await EnrollmentsService.deleteStudentUser(studentId);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Student account and all associated data deleted successfully'
    );
  };
}
