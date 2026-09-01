import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export class ApiError extends Error {
  public statusCode: number;
  public errors: any[];
  public isOperational: boolean;

  constructor(
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: string = 'Something went wrong',
    errors: any[] = [],
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string = 'Bad request', errors: any[] = []): ApiError {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errors);
  }

  static unauthorized(message: string = 'Unauthorized access'): ApiError {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message: string = 'Forbidden access'): ApiError {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message: string = 'Conflict detected'): ApiError {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
  }
}
