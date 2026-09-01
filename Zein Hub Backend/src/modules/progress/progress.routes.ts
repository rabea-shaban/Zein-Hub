import { Router } from 'express';
import { ProgressController } from './progress.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Student routes
router.get(
  '/me',
  requireAuth,
  requireRole(UserRole.STUDENT),
  asyncHandler(ProgressController.getMyProgressAll)
);

router.get(
  '/me/:programId',
  requireAuth,
  requireRole(UserRole.STUDENT),
  asyncHandler(ProgressController.getMyProgressForProgram)
);

// Admin & Assigned Instructor routes
router.get(
  '/program/:programId',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(ProgressController.getProgramStudentsProgressAdmin)
);

router.post(
  '/program/:programId/recalculate',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(ProgressController.recalculateProgramProgressAdmin)
);

export default router;
