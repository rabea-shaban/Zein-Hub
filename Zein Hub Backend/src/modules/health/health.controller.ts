import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class HealthController {
  public static getHealth = (_req: Request, res: Response): Response => {
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const dbStateMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';

    const healthData = {
      status: 'UP',
      database: dbStatus,
      uptime: Number(process.uptime().toFixed(2)),
      timestamp: new Date().toISOString(),
    };

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Health check successful',
      healthData,
      null
    );
  };
}
