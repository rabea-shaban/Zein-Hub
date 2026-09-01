import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants/roles.enum.js';
import { ApiError } from '../utils/apiError.js';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Forbidden: Insufficient permissions. Required role: [${roles.join(', ')}]`
        )
      );
    }

    next();
  };
};
