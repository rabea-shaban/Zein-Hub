import { Router } from 'express';
import { CertificatesController } from './certificates.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { optionalAuth } from '../../middlewares/optionalAuth.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

// Public verification endpoints
router.get(
  '/verify/:certificateNumber',
  asyncHandler(CertificatesController.verifyCertificate)
);

router.get(
  '/:certificateNumber/verify',
  asyncHandler(CertificatesController.verifyCertificate)
);

// Super Admin certificate management routes
router.get(
  '/admin/all',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(CertificatesController.getAllAdmin)
);

router.post(
  '/admin/issue',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(CertificatesController.issueCertificate)
);

router.patch(
  '/admin/:id/revoke',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  asyncHandler(CertificatesController.toggleRevoke)
);

// Student certificates list
router.get(
  '/me',
  requireAuth,
  requireRole(UserRole.STUDENT),
  asyncHandler(CertificatesController.getMyCertificates)
);

// Single certificate details (Context-aware)
router.get(
  '/:id',
  optionalAuth,
  asyncHandler(CertificatesController.getCertificateById)
);

export default router;
