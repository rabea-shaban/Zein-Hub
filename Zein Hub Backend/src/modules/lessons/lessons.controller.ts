import { Request, Response } from 'express';
import { LessonsService } from './lessons.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class LessonsController {
  public static getLessonsByModule = async (req: Request, res: Response): Promise<Response> => {
    const moduleId = req.params.moduleId as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const lessons = await LessonsService.getLessonsByModule(
      moduleId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Module lessons retrieved successfully',
      lessons,
      { count: lessons.length }
    );
  };

  public static getLessonById = async (req: Request, res: Response): Promise<Response> => {
    const lessonId = req.params.id as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const lesson = await LessonsService.getLessonById(
      lessonId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Lesson details retrieved successfully',
      lesson
    );
  };

  public static createLesson = async (req: Request, res: Response): Promise<Response> => {
    const moduleId = req.params.moduleId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const lesson = await LessonsService.createLesson(
      moduleId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Lesson created successfully',
      lesson
    );
  };

  public static updateLesson = async (req: Request, res: Response): Promise<Response> => {
    const lessonId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const lesson = await LessonsService.updateLesson(
      lessonId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Lesson updated successfully',
      lesson
    );
  };

  public static publishLesson = async (req: Request, res: Response): Promise<Response> => {
    const lessonId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const lesson = await LessonsService.publishLesson(
      lessonId,
      userId,
      userRole,
      req.body.isPublished
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      `Lesson ${req.body.isPublished ? 'published' : 'unpublished'} successfully`,
      lesson
    );
  };

  public static reorderLesson = async (req: Request, res: Response): Promise<Response> => {
    const lessonId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const lesson = await LessonsService.reorderLesson(
      lessonId,
      userId,
      userRole,
      req.body.order
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Lesson reordered successfully',
      lesson
    );
  };

  public static deleteLesson = async (req: Request, res: Response): Promise<Response> => {
    const lessonId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await LessonsService.deleteLesson(
      lessonId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Lesson deleted successfully',
      result
    );
  };
}
