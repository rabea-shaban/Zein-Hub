import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.config.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { Logger } from '../utils/logger.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = 'INVALID_IDENTIFIER_FORMAT';
    message = `Invalid format for field: ${err.path}`;
    errors = [`${err.value} is not a valid identifier`];
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    errorCode = 'DUPLICATE_RESOURCE';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}`;
    errors = [`${field} already exists`];
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = 'VALIDATION_FAILED';
    message = 'Validation Error';
    errors = Object.values(err.errors || {}).map((e: any) => e.message);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid token. Please authenticate.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Token expired. Please log in again.';
  }

  // Handle Express SyntaxError (Malformed JSON body)
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = 'MALFORMED_JSON';
    message = 'Malformed JSON in request body';
    errors = ['Please check your JSON syntax'];
  }

  // Handle Rate Limiting
  if (statusCode === HTTP_STATUS.TOO_MANY_REQUESTS) {
    errorCode = errorCode || 'TOO_MANY_REQUESTS';
  }

  // Log internal unexpected errors
  if (statusCode >= 500) {
    Logger.error(`[Server Error] ${req.method} ${req.originalUrl}: ${err.message}`, {
      stack: err.stack,
      ip: req.ip,
      body: req.body,
    });

    if (ENV.NODE_ENV === 'production' && !err.isOperational) {
      message = 'An unexpected internal error occurred. Please try again later.';
      errors = [];
    }
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    errorCode,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
    ...(ENV.NODE_ENV === 'development' && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
      ? { stack: err.stack }
      : {}),
  });
};
