import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  analyticsQuerySchema,
  reportPaginationSchema,
  programReportParamSchema,
} from './analytics.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Protect all analytics & dashboard routes to Super Admin & Instructor
router.use(requireAuth, requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR));

// 1. Dashboard Overview
router.get(
  '/dashboard/overview',
  asyncHandler(AnalyticsController.getDashboardOverview)
);

// 2. Specific Analytics Modules
router.get(
  '/analytics/students',
  validate({ query: reportPaginationSchema }),
  asyncHandler(AnalyticsController.getStudentsReport)
);

router.get(
  '/analytics/enrollments',
  validate({ query: analyticsQuerySchema }),
  asyncHandler(AnalyticsController.getEnrollmentAnalytics)
);

router.get(
  '/analytics/progress',
  validate({ query: analyticsQuerySchema }),
  asyncHandler(AnalyticsController.getProgressAnalytics)
);

router.get(
  '/analytics/attendance',
  validate({ query: analyticsQuerySchema }),
  asyncHandler(AnalyticsController.getAttendanceAnalytics)
);

router.get(
  '/analytics/assessments',
  validate({ query: analyticsQuerySchema }),
  asyncHandler(AnalyticsController.getAssessmentAnalytics)
);

router.get(
  '/analytics/certificates',
  validate({ query: analyticsQuerySchema }),
  asyncHandler(AnalyticsController.getCertificateAnalytics)
);

router.get(
  '/analytics/reviews',
  validate({ query: analyticsQuerySchema }),
  asyncHandler(AnalyticsController.getReviewsAnalytics)
);

// 3. Operational Reports
router.get(
  '/reports/programs/:programId',
  validate({ params: programReportParamSchema }),
  asyncHandler(AnalyticsController.getProgramDetailedReport)
);

router.get(
  '/reports/students',
  validate({ query: reportPaginationSchema }),
  asyncHandler(AnalyticsController.getStudentsReport)
);

router.get(
  '/reports/enrollments',
  validate({ query: reportPaginationSchema }),
  asyncHandler(AnalyticsController.getStudentsReport)
);

export default router;
