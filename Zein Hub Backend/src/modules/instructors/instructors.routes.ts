import { Router } from 'express';
import { InstructorsController } from './instructors.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  createInstructorSchema,
  updateInstructorAdminSchema,
  updateInstructorSelfSchema,
  changeInstructorStatusSchema,
  updateAssignedProgramsSchema,
} from './instructors.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// ==========================================
// 1. Instructor Self-Service Routes (/me/*)
// (Must be mounted before /:id routes)
// ==========================================
router.get(
  '/me/profile',
  requireAuth,
  requireRole(UserRole.INSTRUCTOR),
  asyncHandler(InstructorsController.getMyProfile)
);

router.patch(
  '/me/profile',
  requireAuth,
  requireRole(UserRole.INSTRUCTOR),
  validate(updateInstructorSelfSchema),
  asyncHandler(InstructorsController.updateMyProfile)
);

router.get(
  '/me/dashboard',
  requireAuth,
  requireRole(UserRole.INSTRUCTOR),
  asyncHandler(InstructorsController.getDashboard)
);

router.get(
  '/me/programs',
  requireAuth,
  requireRole(UserRole.INSTRUCTOR),
  asyncHandler(InstructorsController.getMyPrograms)
);

router.get(
  '/me/students',
  requireAuth,
  requireRole(UserRole.INSTRUCTOR),
  asyncHandler(InstructorsController.getMyStudents)
);

// ==========================================
// 2. Super Admin Specific List Route
// ==========================================
router.get(
  '/admin/all',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(InstructorsController.getAllAdmin)
);

// ==========================================
// 3. Public Routes
// ==========================================
router.get('/', asyncHandler(InstructorsController.getAllPublic));
router.get('/:id', asyncHandler(InstructorsController.getPublicById));

// ==========================================
// 4. Super Admin Management Routes
// ==========================================
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(createInstructorSchema),
  asyncHandler(InstructorsController.create)
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(updateInstructorAdminSchema),
  asyncHandler(InstructorsController.updateByAdmin)
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(changeInstructorStatusSchema),
  asyncHandler(InstructorsController.changeStatus)
);

router.post(
  '/:id/assigned-programs',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(updateAssignedProgramsSchema),
  asyncHandler(InstructorsController.updateAssignedPrograms)
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(InstructorsController.deleteInstructor)
);

export default router;
