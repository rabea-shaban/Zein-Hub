import { Request, Response } from 'express';
import { InstructorsService } from './instructors.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class InstructorsController {
  // Public Controllers
  public static getAllPublic = async (_req: Request, res: Response): Promise<Response> => {
    const instructors = await InstructorsService.getAllPublicInstructors();
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Instructors retrieved successfully',
      instructors,
      { count: instructors.length }
    );
  };

  public static getPublicById = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const instructor = await InstructorsService.getPublicInstructorById(id);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Instructor details retrieved successfully',
      instructor
    );
  };

  // Super Admin Controllers
  public static getAllAdmin = async (req: Request, res: Response): Promise<Response> => {
    const query = {
      trackId: req.query.trackId as string | undefined,
      search: req.query.search as string | undefined,
      isActive:
        req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    };

    const { instructors, meta } = await InstructorsService.getAllInstructorsAdmin(query);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Admin instructors list retrieved successfully',
      instructors,
      meta
    );
  };

  public static create = async (req: Request, res: Response): Promise<Response> => {
    if (req.body.trackId && !req.body.specializationTrackId) {
      req.body.specializationTrackId = req.body.trackId;
    }
    if (req.body.specializationTrackId === '') {
      req.body.specializationTrackId = null;
    }
    if (Array.isArray(req.body.assignedPrograms)) {
      req.body.assignedPrograms = req.body.assignedPrograms.filter(
        (p: string) => p && typeof p === 'string' && p.trim() !== ''
      );
    }

    const result = await InstructorsService.createInstructor(req.body);
    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Instructor created successfully',
      result
    );
  };

  public static updateByAdmin = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const result = await InstructorsService.updateInstructorByAdmin(id, req.body);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Instructor updated successfully by administrator',
      result
    );
  };

  public static changeStatus = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const result = await InstructorsService.changeStatus(id, req.body.isActive);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      result.message,
      result
    );
  };

  public static updateAssignedPrograms = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const result = await InstructorsService.updateAssignedPrograms(
      id,
      req.body.assignedPrograms
    );
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Assigned programs updated successfully',
      result
    );
  };

  // Instructor Self Controllers
  public static getMyProfile = async (req: Request, res: Response): Promise<Response> => {
    const instructor = await InstructorsService.getPublicInstructorById(req.user!.id);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Instructor profile retrieved successfully',
      instructor
    );
  };

  public static updateMyProfile = async (req: Request, res: Response): Promise<Response> => {
    const result = await InstructorsService.updateSelfProfile(req.user!.id, req.body);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Profile updated successfully',
      result
    );
  };

  public static getDashboard = async (req: Request, res: Response): Promise<Response> => {
    const dashboard = await InstructorsService.getInstructorDashboard(req.user!.id);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Instructor dashboard metrics retrieved successfully',
      dashboard
    );
  };

  public static getMyPrograms = async (req: Request, res: Response): Promise<Response> => {
    const programs = await InstructorsService.getMyAssignedPrograms(req.user!.id);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Assigned programs retrieved successfully',
      programs,
      { count: programs.length }
    );
  };

  public static getMyStudents = async (req: Request, res: Response): Promise<Response> => {
    const students = await InstructorsService.getMyEnrolledStudents(req.user!.id, {
      programId: req.query.programId as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    });
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Instructor enrolled students retrieved successfully',
      students,
      { count: students.length }
    );
  };

  public static deleteInstructor = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    await InstructorsService.deleteInstructor(id);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Instructor deleted successfully',
      null
    );
  };
}
