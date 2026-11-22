import { Router } from 'express';
import {
  findMatchesForShipmentHandler,
  listMatches,
  getMatchById,
  acceptMatch,
  rejectMatch
} from '../controllers/match.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', listMatches);
router.get('/shipment/:shipmentId', findMatchesForShipmentHandler);
router.get('/:id', getMatchById);
router.post('/:id/accept', acceptMatch);
router.post('/:id/reject', rejectMatch);

export default router;
