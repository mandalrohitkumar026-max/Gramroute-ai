import { Router } from 'express';
import {
  createBooking,
  listBookings,
  getBookingById,
  respondToBooking,
  transitionBookingStatus,
  cancelBooking
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createBookingSchema,
  respondBookingSchema,
  transitionBookingStatusSchema,
  cancelBookingSchema
} from '../validators/booking.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: createBookingSchema }), createBooking);
router.get('/', listBookings);
router.get('/:id', getBookingById);
router.post('/:id/respond', validate({ body: respondBookingSchema }), respondToBooking);
router.patch('/:id/status', validate({ body: transitionBookingStatusSchema }), transitionBookingStatus);
router.post('/:id/cancel', validate({ body: cancelBookingSchema }), cancelBooking);

export default router;
