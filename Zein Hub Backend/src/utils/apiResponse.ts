import { Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export interface IApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  meta: Record<string, any> | null;
}

export class ApiResponse {
  static send<T>(
    res: Response,
    statusCode: number = HTTP_STATUS.OK,
    message: string = 'Success',
    data: T | null = null,
    meta: Record<string, any> | null = null
  ): Response {
    const payload: IApiResponse<T> = {
      success: statusCode >= 200 && statusCode < 300,
      statusCode,
      message,
      data,
      meta,
    };
    return res.status(statusCode).json(payload);
  }
}
