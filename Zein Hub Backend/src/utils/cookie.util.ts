import { Response, CookieOptions } from 'express';
import { ENV } from '../config/env.config.js';

export const ACCESS_TOKEN_COOKIE_NAME = 'zh_access_token';
export const REFRESH_TOKEN_COOKIE_NAME = 'zh_refresh_token';

const isProduction = ENV.NODE_ENV === 'production';

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  maxAge: isProduction ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 1 hour in prod, 24 hours in dev
  path: '/',
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export class CookieUtil {
  /**
   * Sets secure httpOnly access and refresh token cookies on the response
   */
  public static setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken?: string
  ): void {
    res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, accessTokenCookieOptions);
    if (refreshToken) {
      res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenCookieOptions);
    }
  }

  /**
   * Clears auth cookies on logout
   */
  public static clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    });
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    });
  }
}
