import { Router } from 'express';
import { ApplicationsController } from './applications.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  createApplicationSchema,
  reviewApplicationSchema,
} from './applications.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// ==========================================
// 1. Student Application Routes (/me/*)
// (Must be mounted before /:id routes)
// ==========================================
router.get(
  '/me',
  requireAuth,
  requireRole(UserRole.STUDENT),
  asyncHandler(ApplicationsController.getMyApplications)
);

router.get(
  '/me/:id',
  requireAuth,
  requireRole(UserRole.STUDENT),
  asyncHandler(ApplicationsController.getMyApplicationById)
);

router.post(
  '/',
  requireAuth,
  requireRole(UserRole.STUDENT),
  validate(createApplicationSchema),
  asyncHandler(ApplicationsController.submit)
);

// ==========================================
// 2. Super Admin Application Review Routes
// ==========================================
router.get(
  '/',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(ApplicationsController.getAllAdmin)
);

router.get(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(ApplicationsController.getByIdAdmin)
);

router.patch(
  '/:id/review',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(reviewApplicationSchema),
  asyncHandler(ApplicationsController.review)
);

export default router;
