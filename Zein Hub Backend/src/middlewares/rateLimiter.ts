import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';
import { ENV } from '../config/env.config.js';

const isDevOrTest = ENV.NODE_ENV === 'development' || ENV.NODE_ENV === 'test';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevOrTest ? 100000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevOrTest,
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
  max: isDevOrTest ? 100000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevOrTest,
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
  max: isDevOrTest ? 100000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevOrTest,
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
