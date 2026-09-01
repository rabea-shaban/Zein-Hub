import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

export class ReviewsController {
  public static createReview = async (req: Request, res: Response): Promise<Response> => {
    const programId = req.params.programId as string;
    const studentId = req.user!.id;

    const review = await ReviewsService.createReview(
      programId,
      studentId,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.CREATED,
      'Your review has been submitted successfully and is pending administrator moderation.',
      review
    );
  };

  public static getProgramReviews = async (req: Request, res: Response): Promise<Response> => {
    const programId = req.params.programId as string;
    const result = await ReviewsService.getProgramReviewsPublic(
      programId,
      req.query
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Program reviews retrieved successfully',
      result
    );
  };

  public static getApprovedReviews = async (req: Request, res: Response): Promise<Response> => {
    const result = await ReviewsService.getApprovedReviews(req.query);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Approved testimonials retrieved successfully',
      result.reviews,
      {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }
    );
  };

  public static getMyReviews = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user!.id;
    const reviews = await ReviewsService.getMyReviews(studentId);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Student reviews retrieved successfully',
      reviews,
      { count: reviews.length }
    );
  };

  public static getReviewById = async (req: Request, res: Response): Promise<Response> => {
    const reviewId = req.params.id as string;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const review = await ReviewsService.getReviewById(
      reviewId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Review retrieved successfully',
      review
    );
  };

  public static updateReview = async (req: Request, res: Response): Promise<Response> => {
    const reviewId = req.params.id as string;
    const studentId = req.user!.id;

    const updated = await ReviewsService.updateReview(
      reviewId,
      studentId,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Review updated successfully. It has been moved to pending moderation review.',
      updated
    );
  };

  public static deleteReview = async (req: Request, res: Response): Promise<Response> => {
    const reviewId = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const result = await ReviewsService.deleteReview(
      reviewId,
      userId,
      userRole
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'Review deleted successfully',
      result
    );
  };

  public static moderateReview = async (req: Request, res: Response): Promise<Response> => {
    const reviewId = req.params.id as string;
    const adminId = req.user!.id;

    const review = await ReviewsService.moderateReview(
      reviewId,
      adminId,
      req.body
    );

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      `Review status updated to '${review.status}' successfully`,
      review
    );
  };

  public static getAllReviewsAdmin = async (req: Request, res: Response): Promise<Response> => {
    const result = await ReviewsService.getAllReviewsAdmin(req.query);

    return ApiResponse.send(
      res,
      HTTP_STATUS.OK,
      'All reviews retrieved for administration',
      result.reviews,
      {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }
    );
  };
}
