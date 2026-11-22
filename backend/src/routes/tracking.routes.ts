import { Router } from 'express';
import {
  recordLocationPing,
  getTripLiveTracking,
  getTripTrackingHistory
} from '../controllers/tracking.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// GPS Periodic Ping
router.post('/ping', recordLocationPing);

// Live Trip Status & Staleness Check
router.get('/:tripId', getTripLiveTracking);

// Historical Breadcrumbs Trajectory
router.get('/:tripId/history', getTripTrackingHistory);

export default router;
