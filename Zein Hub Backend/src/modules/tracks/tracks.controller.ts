import { Request, Response } from 'express';
import { TracksService } from './tracks.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class TracksController {
  public static getAllTracks = async (req: Request, res: Response): Promise<Response> => {
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const search = req.query.search as string | undefined;

    const tracks = await TracksService.getAllTracks({ isActive, search });
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Tracks retrieved successfully',
      tracks,
      { count: tracks.length }
    );
  };

  public static getTrackByIdOrSlug = async (req: Request, res: Response): Promise<Response> => {
    const idOrSlug = req.params.idOrSlug as string;
    const data = await TracksService.getTrackByIdOrSlug(idOrSlug);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Track details retrieved successfully',
      data
    );
  };

  public static createTrack = async (req: Request, res: Response): Promise<Response> => {
    const track = await TracksService.createTrack(req.body);
    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Track created successfully',
      track
    );
  };

  public static updateTrack = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const track = await TracksService.updateTrack(id, req.body);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Track updated successfully',
      track
    );
  };

  public static deleteTrack = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as string;
    const result = await TracksService.deleteTrack(id);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Track deleted / deactivated successfully',
      result
    );
  };
}
