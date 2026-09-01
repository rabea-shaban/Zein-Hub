import { Router } from 'express';
import { CourseModulesController } from './courseModules.controller.js';
import { LessonsController } from '../lessons/lessons.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  updateModuleSchema,
  reorderModuleSchema,
} from './courseModules.validation.js';
import { createLessonSchema } from '../lessons/lessons.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { optionalAuth } from '../../middlewares/optionalAuth.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Nested lessons under module
router.get(
  '/:moduleId/lessons',
  optionalAuth,
  asyncHandler(LessonsController.getLessonsByModule)
);

router.post(
  '/:moduleId/lessons',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(createLessonSchema),
  asyncHandler(LessonsController.createLesson)
);

// Module details
router.get('/:id', optionalAuth, asyncHandler(CourseModulesController.getModuleById));

// Write routes (Super Admin or Assigned Instructor)
router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(updateModuleSchema),
  asyncHandler(CourseModulesController.updateModule)
);

router.patch(
  '/:id/reorder',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(reorderModuleSchema),
  asyncHandler(CourseModulesController.reorderModule)
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(CourseModulesController.deleteModule)
);

export default router;
