import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';
import { CookieUtil, REFRESH_TOKEN_COOKIE_NAME } from '../../utils/cookie.util.js';
import { ApiError } from '../../utils/apiError.js';

export class AuthController {
  /**
   * Register a new student and set httpOnly authentication cookies
   */
  public static register = async (req: Request, res: Response): Promise<Response> => {
    const data = await AuthService.registerStudent(req.body);

    // Set secure httpOnly cookies
    CookieUtil.setAuthCookies(res, data.tokens.accessToken, data.tokens.refreshToken);

    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Student registration successful',
      data
    );
  };

  /**
   * Login user and set secure httpOnly authentication cookies
   */
  public static login = async (req: Request, res: Response): Promise<Response> => {
    const data = await AuthService.loginUser(req.body);

    // Set secure httpOnly cookies
    CookieUtil.setAuthCookies(res, data.tokens.accessToken, data.tokens.refreshToken);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Login successful',
      data
    );
  };

  /**
   * Refresh access token from httpOnly cookie or request body
   */
  public static refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] || req.body?.refreshToken;

    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token is required in cookie or body');
    }

    const data = await AuthService.refreshAccessToken(refreshToken);

    // Set new access token cookie
    CookieUtil.setAuthCookies(res, data.accessToken);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Access token refreshed successfully',
      data
    );
  };

  /**
   * Logout user and clear all authentication cookies
   */
  public static logout = async (_req: Request, res: Response): Promise<Response> => {
    CookieUtil.clearAuthCookies(res);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Logged out successfully and auth session cleared'
    );
  };

  /**
   * Get current authenticated user profile
   */
  public static getProfile = async (req: Request, res: Response): Promise<Response> => {
    const data = await AuthService.getProfile(req.user!.id);
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'User profile retrieved successfully',
      data
    );
  };

  /**
   * Test endpoint for Super Admin verification
   */
  public static adminTest = async (req: Request, res: Response): Promise<Response> => {
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Super Admin access verified successfully',
      {
        currentUser: req.user,
        serverTime: new Date().toISOString(),
      }
    );
  };

  /**
   * Test endpoint for Student verification
   */
  public static studentTest = async (req: Request, res: Response): Promise<Response> => {
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Student access verified successfully',
      {
        currentUser: req.user,
        serverTime: new Date().toISOString(),
      }
    );
  };

  /**
   * Test endpoint for Instructor Program Access verification
   */
  public static instructorTest = async (req: Request, res: Response): Promise<Response> => {
    const programId = req.params.programId;
    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      `Instructor access authorized for program: ${programId}`,
      {
        currentUser: req.user,
        programId,
        authorizedAt: new Date().toISOString(),
      }
    );
  };
}
