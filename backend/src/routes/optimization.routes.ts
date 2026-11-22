import { Router } from 'express';
import {
  optimizeRouteHandler,
  evaluateBackhaulHandler,
  getAuditHistoryHandler,
  getEngineStatusHandler
} from '../controllers/optimization.controller';

const router = Router();

router.post('/route', optimizeRouteHandler);
router.post('/backhaul', evaluateBackhaulHandler);
router.get('/audit-history', getAuditHistoryHandler);
router.get('/engine-status', getEngineStatusHandler);

export default router;
