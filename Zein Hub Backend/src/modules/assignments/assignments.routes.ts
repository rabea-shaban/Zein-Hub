import { Router } from 'express';
import { AssignmentsController } from './assignments.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  updateAssignmentSchema,
  submitAssignmentSchema,
} from './assignments.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { optionalAuth } from '../../middlewares/optionalAuth.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/me', requireAuth, asyncHandler(AssignmentsController.getMyAssignments));
router.get('/:id', optionalAuth, asyncHandler(AssignmentsController.getAssignmentById));

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(updateAssignmentSchema),
  asyncHandler(AssignmentsController.updateAssignment)
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(AssignmentsController.deleteAssignment)
);

router.post(
  '/:id/submit',
  requireAuth,
  requireRole(UserRole.STUDENT),
  validate(submitAssignmentSchema),
  asyncHandler(AssignmentsController.submitAssignment)
);

router.get(
  '/:id/my-submission',
  requireAuth,
  requireRole(UserRole.STUDENT),
  asyncHandler(AssignmentsController.getMySubmission)
);

router.get(
  '/:id/submissions',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(AssignmentsController.getAssignmentSubmissions)
);

export default router;
