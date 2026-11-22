import { Router } from 'express';
import {
  getPlatformMetrics,
  verifyVehicle,
  verifyVehicleDocument,
  verifyUserIdentity,
  getFlaggedActivities
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/metrics', getPlatformMetrics);
router.get('/flagged', getFlaggedActivities);
router.patch('/vehicles/:id/verify', verifyVehicle);
router.patch('/vehicles/:vehicleId/documents/:documentId/verify', verifyVehicleDocument);
router.patch('/users/:id/verify-identity', verifyUserIdentity);

export default router;
