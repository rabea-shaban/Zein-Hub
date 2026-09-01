import { Request, Response } from 'express';
import { LiveSessionsService } from './liveSessions.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class LiveSessionsController {
  public static createLiveSession = async (req: Request, res: Response): Promise<Response> => {
    const programId = req.params.programId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const session = await LiveSessionsService.createLiveSession(
      programId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Live interactive session scheduled successfully',
      session
    );
  };

  public static getAllLiveSessions = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const programId = req.query.programId as string | undefined;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const sessions = await LiveSessionsService.getAllLiveSessions(
      userId,
      userRole,
      programId
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Live interactive sessions retrieved successfully',
      sessions,
      { count: sessions.length }
    );
  };

  public static getProgramLiveSessions = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const programId = req.params.programId as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const sessions = await LiveSessionsService.getProgramLiveSessions(
      programId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Program live sessions retrieved successfully',
      sessions,
      { count: sessions.length }
    );
  };

  public static getLiveSessionById = async (req: Request, res: Response): Promise<Response> => {
    const sessionId = req.params.id as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const session = await LiveSessionsService.getLiveSessionById(
      sessionId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Live session details retrieved successfully',
      session
    );
  };

  public static updateLiveSession = async (req: Request, res: Response): Promise<Response> => {
    const sessionId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const session = await LiveSessionsService.updateLiveSession(
      sessionId,
      userId,
      userRole,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Live session updated successfully',
      session
    );
  };

  public static updateLiveSessionStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const sessionId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { status } = req.body;

    const session = await LiveSessionsService.updateLiveSessionStatus(
      sessionId,
      userId,
      userRole,
      status
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      `Live session status updated to '${status}' successfully`,
      session
    );
  };

  public static deleteLiveSession = async (req: Request, res: Response): Promise<Response> => {
    const sessionId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await LiveSessionsService.deleteLiveSession(
      sessionId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Live session deleted successfully',
      result
    );
  };
}
