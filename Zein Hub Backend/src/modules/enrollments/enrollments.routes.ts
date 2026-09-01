import { Router } from 'express';
import { EnrollmentsController } from './enrollments.controller.js';
import { validate } from '../../middlewares/validate.js';
import { updateEnrollmentStatusSchema } from './enrollments.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// ==========================================
// 1. Student Enrollment Routes (/me/*)
// ==========================================
router.get(
  '/me',
  requireAuth,
  requireRole(UserRole.STUDENT),
  asyncHandler(EnrollmentsController.getMyEnrollments)
);

router.get(
  '/me/:programId',
  requireAuth,
  requireRole(UserRole.STUDENT),
  asyncHandler(EnrollmentsController.getMyEnrollmentForProgram)
);

// ==========================================
// 2. Super Admin Management Routes
// ==========================================
router.get(
  '/admin/all',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(EnrollmentsController.getAllAdmin)
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(updateEnrollmentStatusSchema),
  asyncHandler(EnrollmentsController.updateStatus)
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(EnrollmentsController.deleteEnrollment)
);

router.delete(
  '/admin/students/:studentId',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(EnrollmentsController.deleteStudent)
);

export default router;
