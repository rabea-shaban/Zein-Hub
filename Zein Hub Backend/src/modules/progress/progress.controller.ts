import { Request, Response } from 'express';
import { ProgressService } from './progress.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class ProgressController {
  public static completeLesson = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user!.id;
    const lessonId = req.params.lessonId as string;

    const result = await ProgressService.completeLesson(studentId, lessonId);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Lesson marked as completed successfully',
      result
    );
  };

  public static getMyProgressAll = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user!.id;
    const progressList = await ProgressService.getMyProgressAll(studentId);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Student progress overview retrieved successfully',
      progressList,
      { count: progressList.length }
    );
  };

  public static getMyProgressForProgram = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const studentId = req.user!.id;
    const programId = req.params.programId as string;

    const progressDetails = await ProgressService.getMyProgressForProgram(
      studentId,
      programId
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Program progress details retrieved successfully',
      progressDetails
    );
  };

  public static getProgramStudentsProgressAdmin = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const programId = req.params.programId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const studentList = await ProgressService.getProgramStudentsProgressAdmin(
      programId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Enrolled students progress list retrieved successfully',
      studentList,
      { count: studentList.length }
    );
  };

  public static recalculateProgramProgressAdmin = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const programId = req.params.programId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await ProgressService.recalculateProgramProgressAdmin(
      programId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Program progress recalculation completed for all enrolled students',
      result
    );
  };
}
