import { Request, Response } from 'express';
import { CourseModulesService } from './courseModules.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class CourseModulesController {
  public static getProgramModules = async (req: Request, res: Response): Promise<Response> => {
    const programId = req.params.programId as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const modules = await CourseModulesService.getProgramModules(
      programId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Program modules and curriculum retrieved successfully',
      modules,
      { count: modules.length }
    );
  };

  public static getModuleById = async (req: Request, res: Response): Promise<Response> => {
    const moduleId = req.params.id as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const moduleData = await CourseModulesService.getModuleById(
      moduleId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Module details retrieved successfully',
      moduleData
    );
  };

  public static createModule = async (req: Request, res: Response): Promise<Response> => {
    const programId = req.params.programId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const module = await CourseModulesService.createModule(
      programId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Course module created successfully',
      module
    );
  };

  public static updateModule = async (req: Request, res: Response): Promise<Response> => {
    const moduleId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const module = await CourseModulesService.updateModule(
      moduleId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Course module updated successfully',
      module
    );
  };

  public static reorderModule = async (req: Request, res: Response): Promise<Response> => {
    const moduleId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const module = await CourseModulesService.reorderModule(
      moduleId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Module reordered successfully',
      module
    );
  };

  public static deleteModule = async (req: Request, res: Response): Promise<Response> => {
    const moduleId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await CourseModulesService.deleteModule(
      moduleId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Course module and associated lessons deleted successfully',
      result
    );
  };
}
