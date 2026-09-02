import { Request, Response } from 'express';
import { ProgramsService } from './programs.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { ProgramStatus } from '../../constants/programStatus.enum.js';

export class ProgramsController {
  public static getAllPrograms = async (req: Request, res: Response): Promise<Response> => {
    const query = {
      trackId: req.query.trackId as string | undefined,
      trackSlug: req.query.trackSlug as string | undefined,
      status: req.query.status as ProgramStatus | undefined,
      isFeatured:
        req.query.isFeatured !== undefined ? req.query.isFeatured === 'true' : undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
    };

    const { programs, meta } = await ProgramsService.getAllPrograms(query);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Programs retrieved successfully',
      programs,
      meta
    );
  };

  public static getFeaturedPrograms = async (_req: Request, res: Response): Promise<Response> => {
    const programs = await ProgramsService.getFeaturedPrograms();
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Featured programs retrieved successfully',
      programs,
      { count: programs.length }
    );
  };

  public static getProgramByIdOrSlug = async (req: Request, res: Response): Promise<Response> => {
    const idOrSlug = req.params.idOrSlug as string;
    const data = await ProgramsService.getProgramByIdOrSlug(idOrSlug);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Program details retrieved successfully',
      data
    );
  };

  public static createProgram = async (req: Request, res: Response): Promise<Response> => {
    const program = await ProgramsService.createProgram(req.body);
    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Program created successfully',
      program
    );
  };

  public static updateProgram = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const program = await ProgramsService.updateProgram(id, req.body);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Program updated successfully',
      program
    );
  };

  public static updateCapstoneProject = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const user = req.user!;
    const program = await ProgramsService.updateCapstoneProject(
      id,
      req.body,
      user.id,
      user.role
    );
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Capstone project updated successfully',
      program
    );
  };

  public static changeStatus = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const program = await ProgramsService.changeStatus(id, req.body.status);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      `Program status updated to '${req.body.status}' successfully`,
      program
    );
  };

  public static toggleFeatured = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const program = await ProgramsService.toggleFeatured(id);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      `Program featured status updated to ${program.isFeatured}`,
      program
    );
  };

  public static assignInstructor = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const result = await ProgramsService.assignInstructor(
      id,
      req.body.instructorId
    );
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Instructor assigned to program successfully',
      result
    );
  };

  public static unassignInstructor = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const result = await ProgramsService.unassignInstructor(
      id,
      req.body.instructorId
    );
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Instructor unassigned from program successfully',
      result
    );
  };

  public static deleteProgram = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const result = await ProgramsService.deleteProgram(id);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Program deactivated successfully',
      result
    );
  };
}
