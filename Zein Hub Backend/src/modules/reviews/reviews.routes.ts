import { Router } from 'express';
import { ReviewsController } from './reviews.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  updateReviewSchema,
  moderateReviewSchema,
  reviewQuerySchema,
} from './reviews.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { optionalAuth } from '../../middlewares/optionalAuth.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Public approved testimonials
router.get(
  '/approved',
  validate({ query: reviewQuerySchema }),
  asyncHandler(ReviewsController.getApprovedReviews)
);

// Student own reviews
router.get(
  '/me',
  requireAuth,
  requireRole(UserRole.STUDENT),
  asyncHandler(ReviewsController.getMyReviews)
);

// Super Admin all reviews
router.get(
  '/admin/all',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate({ query: reviewQuerySchema }),
  asyncHandler(ReviewsController.getAllReviewsAdmin)
);

// Single review details (Context-aware)
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(ReviewsController.getReviewById)
);

// Student updates own review
router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.STUDENT),
  validate(updateReviewSchema),
  asyncHandler(ReviewsController.updateReview)
);

// Student or Admin deletes review
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(ReviewsController.deleteReview)
);

// Super Admin moderation (Approve / Reject)
router.patch(
  '/:id/moderate',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(moderateReviewSchema),
  asyncHandler(ReviewsController.moderateReview)
);

export default router;
