import mongoose from 'mongoose';
import { Review, IReview, ReviewStatus } from '../../models/review.model.js';
import { Enrollment } from '../../models/enrollment.model.js';
import { Program } from '../../models/program.model.js';
import { UserRole } from '../../constants/roles.enum.js';
import { ApiError } from '../../utils/apiError.js';
import {
  ICreateReviewDTO,
  IUpdateReviewDTO,
  IModerateReviewDTO,
  IReviewQueryFilters,
} from './reviews.types.js';

export class ReviewsService {
  /**
   * Enrolled student creates a review for a program
   */
  public static async createReview(
    programId: string,
    studentId: string,
    dto: ICreateReviewDTO
  ): Promise<IReview> {
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const program = await Program.findById(programId);
    if (!program) {
      throw ApiError.notFound('Program not found');
    }

    // Check student is enrolled in this program
    const enrollment = await Enrollment.findOne({
      studentId,
      programId,
      status: { $in: ['active', 'completed'] },
    } as any);

    if (!enrollment) {
      throw ApiError.forbidden('Only enrolled students can review this program');
    }

    // Check duplicate review
    const existingReview = await Review.findOne({ studentId, programId });
    if (existingReview) {
      throw ApiError.conflict(
        'You have already submitted a review for this program. You can edit your existing review.'
      );
    }

    const review = new Review({
      studentId: new mongoose.Types.ObjectId(studentId),
      programId: new mongoose.Types.ObjectId(programId),
      rating: dto.rating,
      comment: dto.comment.trim(),
      status: ReviewStatus.PENDING,
    });

    await review.save();
    return review;
  }

  /**
   * Public: Get approved reviews with filtering and pagination
   */
  public static async getApprovedReviews(filters: IReviewQueryFilters): Promise<any> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const query: any = { status: ReviewStatus.APPROVED };
    if (filters.rating) query.rating = Number(filters.rating);
    if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
    if (filters.programId && mongoose.Types.ObjectId.isValid(filters.programId)) {
      query.programId = filters.programId;
    }

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('studentId', 'fullName avatarUrl')
        .populate('programId', 'titleAr titleEn slug coverImageUrl')
        .select('-moderationNotes -reviewedBy')
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Public: Get approved reviews for a specific program with average rating calculation
   */
  public static async getProgramReviewsPublic(
    programId: string,
    filters: IReviewQueryFilters
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      throw ApiError.badRequest('Invalid program ID format');
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const query: any = {
      programId: new mongoose.Types.ObjectId(programId),
      status: ReviewStatus.APPROVED,
    };
    if (filters.rating) query.rating = Number(filters.rating);

    const [reviews, total, allApprovedReviews] = await Promise.all([
      Review.find(query)
        .populate('studentId', 'fullName avatarUrl')
        .select('-moderationNotes -reviewedBy')
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
      Review.find({ programId, status: ReviewStatus.APPROVED }).select('rating'),
    ]);

    const totalRatings = allApprovedReviews.length;
    const sumRatings = allApprovedReviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalRatings > 0 ? Number((sumRatings / totalRatings).toFixed(1)) : 0;

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allApprovedReviews.forEach((r) => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });

    return {
      programId,
      averageRating,
      totalReviews: totalRatings,
      breakdown,
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Student views own reviews history
   */
  public static async getMyReviews(studentId: string): Promise<IReview[]> {
    return Review.find({ studentId })
      .populate('programId', 'titleAr titleEn slug coverImageUrl')
      .sort({ createdAt: -1 });
  }

  /**
   * Get single review by ID with permission handling
   */
  public static async getReviewById(
    reviewId: string,
    userId?: string,
    userRole?: UserRole
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      throw ApiError.badRequest('Invalid review ID format');
    }

    const review = await Review.findById(reviewId)
      .populate('studentId', 'fullName email avatarUrl')
      .populate('programId', 'titleAr titleEn slug coverImageUrl')
      .populate('reviewedBy', 'fullName email');

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
    const isOwner = userId && review.studentId && (review.studentId as any)._id?.toString() === userId;

    if (!isSuperAdmin && !isOwner) {
      if (review.status !== ReviewStatus.APPROVED) {
        throw ApiError.notFound('Review not found or awaiting moderation approval');
      }
      // Public viewer: strip moderation internals
      const sanitized = review.toObject();
      delete sanitized.moderationNotes;
      delete sanitized.reviewedBy;
      return sanitized;
    }

    return review;
  }

  /**
   * Student updates own review (Triggers re-moderation status: pending)
   */
  public static async updateReview(
    reviewId: string,
    studentId: string,
    dto: IUpdateReviewDTO
  ): Promise<IReview> {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      throw ApiError.badRequest('Invalid review ID format');
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (review.studentId.toString() !== studentId) {
      throw ApiError.forbidden('Forbidden: You can only edit your own review');
    }

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment) review.comment = dto.comment.trim();

    // Any edit puts review back in PENDING moderation queue
    review.status = ReviewStatus.PENDING;
    review.reviewedBy = undefined as any;
    review.reviewedAt = undefined as any;

    await review.save();
    return review;
  }

  /**
   * Delete review (Owner student or Super Admin)
   */
  public static async deleteReview(
    reviewId: string,
    userId: string,
    userRole: UserRole
  ): Promise<{ deleted: boolean }> {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      throw ApiError.badRequest('Invalid review ID format');
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
    const isOwner = review.studentId.toString() === userId;

    if (!isSuperAdmin && !isOwner) {
      throw ApiError.forbidden('Forbidden: You cannot delete another user review');
    }

    await Review.findByIdAndDelete(reviewId);
    return { deleted: true };
  }

  /**
   * Super Admin Moderation: Approve or Reject review with notes and feature flag
   */
  public static async moderateReview(
    reviewId: string,
    adminId: string,
    dto: IModerateReviewDTO
  ): Promise<IReview> {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      throw ApiError.badRequest('Invalid review ID format');
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    review.status = dto.status;
    if (dto.moderationNotes !== undefined) {
      review.moderationNotes = dto.moderationNotes?.trim() || undefined;
    }
    if (dto.isFeatured !== undefined) {
      review.isFeatured = dto.isFeatured;
    }
    review.reviewedBy = new mongoose.Types.ObjectId(adminId);
    review.reviewedAt = new Date();

    await review.save();

    return review;
  }

  /**
   * Super Admin: List all reviews across system with filters and pagination
   */
  public static async getAllReviewsAdmin(filters: IReviewQueryFilters): Promise<any> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.rating) query.rating = Number(filters.rating);
    if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;
    if (filters.programId && mongoose.Types.ObjectId.isValid(filters.programId)) {
      query.programId = filters.programId;
    }

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('studentId', 'fullName email phone avatarUrl')
        .populate('programId', 'titleAr titleEn slug')
        .populate('reviewedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
