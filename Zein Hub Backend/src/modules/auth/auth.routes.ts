import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from './auth.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { verifyInstructorProgramAccess } from '../../middlewares/instructorAccess.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

import { authRateLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

// Public Authentication Routes with Rate Limiting
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  asyncHandler(AuthController.register)
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(AuthController.login)
);

router.post(
  '/refresh-token',
  authRateLimiter,
  validate(refreshTokenSchema),
  asyncHandler(AuthController.refreshToken)
);

router.post(
  '/logout',
  asyncHandler(AuthController.logout)
);

// Protected Profile Route
router.get(
  '/profile',
  requireAuth,
  asyncHandler(AuthController.getProfile)
);

// RBAC & Permission Verification Test Routes
router.get(
  '/admin-test',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(AuthController.adminTest)
);

router.get(
  '/student-test',
  requireAuth,
  requireRole(UserRole.STUDENT),
  asyncHandler(AuthController.studentTest)
);

router.get(
  '/instructor-test/:programId',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  verifyInstructorProgramAccess,
  asyncHandler(AuthController.instructorTest)
);

export default router;
