import { Router } from 'express';
import { UploadController } from './upload.controller.js';
import { upload } from '../../middlewares/upload.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Upload image handler supporting both field names: 'image' and 'file'
const uploadMiddleware = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 },
]);

const normalizeFileMiddleware = (req: any, _res: any, next: any) => {
  if (req.files) {
    if (req.files['image'] && req.files['image'][0]) {
      req.file = req.files['image'][0];
    } else if (req.files['file'] && req.files['file'][0]) {
      req.file = req.files['file'][0];
    }
  }
  next();
};

// Route: POST /api/v1/upload/image
router.post(
  '/image',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  uploadMiddleware,
  normalizeFileMiddleware,
  asyncHandler(UploadController.uploadImage)
);

// Route: POST /api/v1/upload
router.post(
  '/',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  uploadMiddleware,
  normalizeFileMiddleware,
  asyncHandler(UploadController.uploadImage)
);

// Route: DELETE /api/v1/upload/image
router.delete(
  '/image',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(UploadController.deleteImage)
);

export default router;
