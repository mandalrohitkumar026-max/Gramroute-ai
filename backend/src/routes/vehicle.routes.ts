import { Router } from 'express';
import {
  createVehicle,
  listVehicles,
  getVehicleById,
  updateVehicle,
  updateVehicleAvailability,
  uploadVehicleDocument,
  deleteVehicle
} from '../controllers/vehicle.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicle.validator';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('TRANSPORTER', 'ADMIN'),
  validate({ body: createVehicleSchema }),
  createVehicle
);

router.get('/', listVehicles);
router.get('/:id', getVehicleById);

router.patch(
  '/:id',
  authorize('TRANSPORTER', 'ADMIN'),
  validate({ body: updateVehicleSchema }),
  updateVehicle
);

router.patch(
  '/:id/availability',
  authorize('TRANSPORTER', 'ADMIN'),
  updateVehicleAvailability
);

router.post(
  '/:id/documents',
  authorize('TRANSPORTER', 'ADMIN'),
  uploadVehicleDocument
);

router.delete('/:id', authorize('TRANSPORTER', 'ADMIN'), deleteVehicle);

export default router;
