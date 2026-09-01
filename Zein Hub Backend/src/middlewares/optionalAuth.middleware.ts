import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.config.js';
import { User } from '../models/user.model.js';
import { ITokenPayload } from '../modules/auth/auth.types.js';
import { ACCESS_TOKEN_COOKIE_NAME } from '../utils/cookie.util.js';

/**
 * Optional authentication middleware:
 * Checks httpOnly cookie first, then Bearer header.
 * Populates req.user if valid, or continues gracefully without error if not authenticated.
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return next();
    }

    let decoded: ITokenPayload;
    try {
      decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as ITokenPayload;
    } catch {
      return next();
    }

    const user = await User.findById(decoded.userId);
    if (user && user.isActive) {
      req.user = {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
      };
    }

    next();
  } catch {
    next();
  }
};
