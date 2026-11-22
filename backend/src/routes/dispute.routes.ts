import { Router } from 'express';
import { createDispute, listDisputes, resolveDispute } from '../controllers/dispute.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createDispute);
router.get('/', listDisputes);
router.patch('/:id/resolve', authorize('ADMIN'), resolveDispute);

export default router;
