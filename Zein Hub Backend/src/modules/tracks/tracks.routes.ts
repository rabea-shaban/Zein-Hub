import { Router } from 'express';
import { TracksController } from './tracks.controller.js';
import { validate } from '../../middlewares/validate.js';
import { createTrackSchema, updateTrackSchema } from './tracks.validation.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(TracksController.getAllTracks));
router.get('/:idOrSlug', asyncHandler(TracksController.getTrackByIdOrSlug));

// Super Admin Protected routes
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(createTrackSchema),
  asyncHandler(TracksController.createTrack)
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate(updateTrackSchema),
  asyncHandler(TracksController.updateTrack)
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(TracksController.deleteTrack)
);

export default router;
