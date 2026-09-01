import { Router } from 'express';
import { AssignmentsController } from './assignments.controller.js';
import { validate } from '../../middlewares/validate.js';
import { gradeSubmissionSchema } from './assignments.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(AssignmentsController.getAllSubmissions)
);

router.patch(
  '/:id/grade',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(gradeSubmissionSchema),
  asyncHandler(AssignmentsController.gradeSubmission)
);

export default router;
