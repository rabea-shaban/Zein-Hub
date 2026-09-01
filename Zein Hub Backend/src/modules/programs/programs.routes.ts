import { Router } from 'express';
import { ProgramsController } from './programs.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  createProgramSchema,
  updateProgramSchema,
  changeProgramStatusSchema,
  assignInstructorSchema,
} from './programs.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

import { CourseModulesController } from '../courseModules/courseModules.controller.js';
import { createModuleSchema } from '../courseModules/courseModules.validation.js';
import { optionalAuth } from '../../middlewares/optionalAuth.middleware.js';

import { LiveSessionsController } from '../liveSessions/liveSessions.controller.js';
import { createLiveSessionSchema } from '../liveSessions/liveSessions.validation.js';
import { ReviewsController } from '../reviews/reviews.controller.js';
import { createReviewSchema } from '../reviews/reviews.validation.js';
import { AssignmentsController } from '../assignments/assignments.controller.js';
import { createAssignmentSchema } from '../assignments/assignments.validation.js';

const router = Router();

// Nested Program Reviews
router.get(
  '/:programId/reviews',
  optionalAuth,
  asyncHandler(ReviewsController.getProgramReviews)
);

router.post(
  '/:programId/reviews',
  requireAuth,
  requireRole(UserRole.STUDENT),
  validate(createReviewSchema),
  asyncHandler(ReviewsController.createReview)
);

// Nested Program Live Sessions
router.get(
  '/:programId/sessions',
  optionalAuth,
  asyncHandler(LiveSessionsController.getProgramLiveSessions)
);

router.post(
  '/:programId/sessions',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(createLiveSessionSchema),
  asyncHandler(LiveSessionsController.createLiveSession)
);

// Nested Program Modules (Curriculum)
router.get(
  '/:programId/modules',
  optionalAuth,
  asyncHandler(CourseModulesController.getProgramModules)
);

router.post(
  '/:programId/modules',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(createModuleSchema),
  asyncHandler(CourseModulesController.createModule)
);

// Nested Program Practical Assignments
router.post(
  '/:programId/assignments',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(createAssignmentSchema),
  asyncHandler(AssignmentsController.createProgramAssignment)
);

// Public Programs Routes
router.get('/featured', asyncHandler(ProgramsController.getFeaturedPrograms));
router.get('/', asyncHandler(ProgramsController.getAllPrograms));
router.get('/:idOrSlug', asyncHandler(ProgramsController.getProgramByIdOrSlug));

// Super Admin Protected Routes
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(createProgramSchema),
  asyncHandler(ProgramsController.createProgram)
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(updateProgramSchema),
  asyncHandler(ProgramsController.updateProgram)
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(changeProgramStatusSchema),
  asyncHandler(ProgramsController.changeStatus)
);

router.patch(
  '/:id/featured',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(ProgramsController.toggleFeatured)
);

router.post(
  '/:id/assign-instructor',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(assignInstructorSchema),
  asyncHandler(ProgramsController.assignInstructor)
);

router.post(
  '/:id/unassign-instructor',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(assignInstructorSchema),
  asyncHandler(ProgramsController.unassignInstructor)
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(ProgramsController.deleteProgram)
);

export default router;
