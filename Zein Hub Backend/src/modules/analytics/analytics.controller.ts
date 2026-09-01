import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class AnalyticsController {
  public static getDashboardOverview = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const data = await AnalyticsService.getDashboardOverview(userId, userRole);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Super Admin dashboard overview KPIs retrieved successfully',
      data
    );
  };

  public static getEnrollmentAnalytics = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const data = await AnalyticsService.getEnrollmentAnalytics(userId, userRole);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Enrollment analytics retrieved successfully',
      data
    );
  };

  public static getProgressAnalytics = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const data = await AnalyticsService.getProgressAnalytics(userId, userRole);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Student progress analytics and tiers distribution retrieved successfully',
      data
    );
  };

  public static getAttendanceAnalytics = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const data = await AnalyticsService.getAttendanceAnalytics(userId, userRole);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Live sessions attendance analytics retrieved successfully',
      data
    );
  };

  public static getAssessmentAnalytics = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const data = await AnalyticsService.getAssessmentAnalytics(userId, userRole);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Assessments (quizzes & assignments) analytics retrieved successfully',
      data
    );
  };

  public static getCertificateAnalytics = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const data = await AnalyticsService.getCertificateAnalytics(userId, userRole);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Certificates and graduation analytics retrieved successfully',
      data
    );
  };

  public static getReviewsAnalytics = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const data = await AnalyticsService.getReviewsAnalytics(userId, userRole);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Reviews, star ratings, and testimonials analytics retrieved successfully',
      data
    );
  };

  public static getProgramDetailedReport = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const programId = req.params.programId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const report = await AnalyticsService.getProgramDetailedReport(
      programId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Detailed program performance report retrieved successfully',
      report
    );
  };

  public static getStudentsReport = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await AnalyticsService.getStudentsReport(
      userId,
      userRole,
      req.query
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Students enrollments performance report retrieved successfully',
      result.report,
      {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }
    );
  };
}
