import { Router } from 'express';
import { LiveSessionsController } from './liveSessions.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  updateLiveSessionSchema,
  updateLiveSessionStatusSchema,
} from './liveSessions.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { optionalAuth } from '../../middlewares/optionalAuth.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

import { AttendanceController } from '../attendance/attendance.controller.js';

const router = Router();

// Nested Session Attendance routes
router.get(
  '/:sessionId/attendance',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(AttendanceController.getSessionAttendance)
);

router.post(
  '/:sessionId/attendance',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(AttendanceController.markAttendance)
);

router.patch(
  '/:sessionId/attendance',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(AttendanceController.markAttendance)
);

router.get(
  '/:sessionId/attendance/me',
  requireAuth,
  requireRole(UserRole.STUDENT),
  asyncHandler(AttendanceController.getMySessionAttendance)
);

router.get('/', optionalAuth, asyncHandler(LiveSessionsController.getAllLiveSessions));
router.get('/:id', optionalAuth, asyncHandler(LiveSessionsController.getLiveSessionById));

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(updateLiveSessionSchema),
  asyncHandler(LiveSessionsController.updateLiveSession)
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(updateLiveSessionStatusSchema),
  asyncHandler(LiveSessionsController.updateLiveSessionStatus)
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(LiveSessionsController.deleteLiveSession)
);

export default router;
