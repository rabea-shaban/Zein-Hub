import { Router } from 'express';
import { ContactController } from './contact.controller.js';
import { validate } from '../../middlewares/validate.js';
import {
  createContactMessageSchema,
  updateContactMessageStatusSchema,
} from './contact.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Public: Submit message
router.post(
  '/',
  validate(createContactMessageSchema),
  asyncHandler(ContactController.createContactMessage)
);

// Admin: Get all inquiries
router.get(
  '/',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(ContactController.getAllContactMessages)
);

// Admin: Get single message
router.get(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(ContactController.getContactMessageById)
);

// Admin: Update status & notes
router.patch(
  '/:id/status',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(updateContactMessageStatusSchema),
  asyncHandler(ContactController.updateContactMessageStatus)
);

// Admin: Delete message
router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(ContactController.deleteContactMessage)
);

export default router;
