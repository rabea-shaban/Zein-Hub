import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.config.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { ITokenPayload } from '../modules/auth/auth.types.js';
import { ACCESS_TOKEN_COOKIE_NAME } from '../utils/cookie.util.js';

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Check httpOnly cookie first
    let token: string | undefined = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];

    // 2. Fallback to Authorization Bearer header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return next(
        ApiError.unauthorized('Authentication required: Missing access token or cookie session')
      );
    }

    let decoded: ITokenPayload;
    try {
      decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as ITokenPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized('Token expired: Please log in again or refresh token'));
      }
      return next(ApiError.unauthorized('Invalid token: Authentication failed'));
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(ApiError.unauthorized('User not found: Account may have been deleted'));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden('Account deactivated: Please contact platform administrator'));
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};
