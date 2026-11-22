import { Router } from 'express';
import {
  createShipment,
  listShipments,
  getShipmentById,
  updateShipment,
  cancelShipment
} from '../controllers/shipment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createShipmentSchema, updateShipmentSchema } from '../validators/shipment.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('FARMER', 'BUSINESS', 'ADMIN'),
  validate({ body: createShipmentSchema }),
  createShipment
);

router.get('/', listShipments);
router.get('/:id', getShipmentById);

router.patch(
  '/:id',
  authorize('FARMER', 'BUSINESS', 'ADMIN'),
  validate({ body: updateShipmentSchema }),
  updateShipment
);

router.post('/:id/cancel', cancelShipment);

export default router;
