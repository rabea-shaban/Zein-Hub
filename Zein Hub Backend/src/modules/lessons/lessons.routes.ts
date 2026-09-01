import { Router } from 'express';
import { LessonsController } from './lessons.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  updateLessonSchema,
  publishLessonSchema,
  reorderLessonSchema,
} from './lessons.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { optionalAuth } from '../../middlewares/optionalAuth.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

import { QuizzesController } from '../quizzes/quizzes.controller.js';
import { createQuizSchema } from '../quizzes/quizzes.validation.js';
import { AssignmentsController } from '../assignments/assignments.controller.js';
import { createAssignmentSchema } from '../assignments/assignments.validation.js';
import { ProgressController } from '../progress/progress.controller.js';

const router = Router();

// Student marks lesson as completed
router.post(
  '/:lessonId/complete',
  requireAuth,
  requireRole(UserRole.STUDENT),
  asyncHandler(ProgressController.completeLesson)
);

// Nested Quiz and Assignment creation under Lesson
router.post(
  '/:lessonId/quizzes',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(createQuizSchema),
  asyncHandler(QuizzesController.createQuiz)
);

router.post(
  '/:lessonId/assignments',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(createAssignmentSchema),
  asyncHandler(AssignmentsController.createAssignment)
);

// Context-aware single lesson details (Checks Free Preview vs Active Enrollment/Instructor/Admin)
router.get('/:id', optionalAuth, asyncHandler(LessonsController.getLessonById));

// Write operations (Super Admin or Assigned Instructor)
router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(updateLessonSchema),
  asyncHandler(LessonsController.updateLesson)
);

router.patch(
  '/:id/publish',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(publishLessonSchema),
  asyncHandler(LessonsController.publishLesson)
);

router.patch(
  '/:id/reorder',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(reorderLessonSchema),
  asyncHandler(LessonsController.reorderLesson)
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(LessonsController.deleteLesson)
);

export default router;
