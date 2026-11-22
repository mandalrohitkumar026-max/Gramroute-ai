import { Router } from 'express';
import {
  createTrip,
  listTrips,
  getTripById,
  updateTripStatus
} from '../controllers/trip.controller';
import {
  startTrip,
  arriveAtStop,
  confirmPickupStop,
  reportTripDelay,
  confirmDeliveryStop,
  completeTrip
} from '../controllers/tracking.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTripSchema, updateTripStatusSchema } from '../validators/trip.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('TRANSPORTER', 'ADMIN'),
  validate({ body: createTripSchema }),
  createTrip
);

router.get('/', listTrips);
router.get('/:id', getTripById);

router.patch(
  '/:id/status',
  authorize('TRANSPORTER', 'ADMIN'),
  validate({ body: updateTripStatusSchema }),
  updateTripStatus
);

// --- Phase 6 Trip Execution State Machine Routes ---
router.post('/:id/start', authorize('TRANSPORTER', 'ADMIN'), startTrip);
router.post('/:id/stops/:stopId/arrive', authorize('TRANSPORTER', 'ADMIN'), arriveAtStop);
router.post('/:id/stops/:stopId/confirm-pickup', authorize('TRANSPORTER', 'ADMIN'), confirmPickupStop);
router.post('/:id/report-delay', authorize('TRANSPORTER', 'ADMIN'), reportTripDelay);
router.post('/:id/stops/:stopId/confirm-delivery', authorize('TRANSPORTER', 'ADMIN'), confirmDeliveryStop);
router.post('/:id/complete', authorize('TRANSPORTER', 'ADMIN'), completeTrip);

export default router;
