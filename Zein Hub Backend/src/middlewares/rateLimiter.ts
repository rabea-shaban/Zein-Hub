import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { ENV } from '../config/env.config.js';

const isTest = ENV.NODE_ENV === 'test';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : 300, // 300 in production, relaxed for tests
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  handler: (_req: Request, res: Response) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      errorCode: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes.',
      errors: ['Rate limit exceeded. Please slow down.'],
    });
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : 20, // 20 in production, relaxed for tests
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  handler: (_req: Request, res: Response) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many login/authentication attempts. Please try again after 15 minutes.',
      errors: ['Brute-force protection: Rate limit exceeded for authentication.'],
    });
  },
});

export const sensitiveActionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: isTest ? 10000 : 30, // 30 in production, relaxed for tests
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  handler: (_req: Request, res: Response) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      errorCode: 'ACTION_RATE_LIMIT_EXCEEDED',
      message: 'Too many requests for this sensitive operation. Please try again shortly.',
      errors: ['Rate limit exceeded for sensitive operation.'],
    });
  },
});
