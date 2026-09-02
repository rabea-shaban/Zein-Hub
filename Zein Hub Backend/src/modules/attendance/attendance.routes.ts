import { Router } from 'express';
import { AttendanceController } from './attendance.controller.js';
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
  asyncHandler(AttendanceController.getMyAttendanceAll)
);

// Admin / Assigned Instructor routes
router.get(
  '/session/:sessionId',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(AttendanceController.getSessionAttendance)
);

router.post(
  '/session/:sessionId',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(AttendanceController.markAttendance)
);

router.get(
  '/program/:programId',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(AttendanceController.getProgramAttendanceSummary)
);

router.get(
  '/program/:programId/summary',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(AttendanceController.getProgramAttendanceSummary)
);

export default router;
