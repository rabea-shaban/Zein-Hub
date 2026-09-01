import { Router } from 'express';
import { QuizzesController } from './quizzes.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  updateQuizSchema,
  createQuestionSchema,
  updateQuestionSchema,
  submitQuizSchema,
} from './quizzes.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { optionalAuth } from '../../middlewares/optionalAuth.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Question standalone routes
router.patch(
  '/questions/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(updateQuestionSchema),
  asyncHandler(QuizzesController.updateQuestion)
);

router.delete(
  '/questions/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(QuizzesController.deleteQuestion)
);

// Quiz routes
router.get('/:id', optionalAuth, asyncHandler(QuizzesController.getQuizById));

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(updateQuizSchema),
  asyncHandler(QuizzesController.updateQuiz)
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  asyncHandler(QuizzesController.deleteQuiz)
);

router.post(
  '/:id/questions',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validate(createQuestionSchema),
  asyncHandler(QuizzesController.addQuestion)
);

router.post(
  '/:id/submit',
  requireAuth,
  requireRole(UserRole.STUDENT),
  validate(submitQuizSchema),
  asyncHandler(QuizzesController.submitQuiz)
);

export default router;
