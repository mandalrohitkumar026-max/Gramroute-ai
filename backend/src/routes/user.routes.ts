import { Router } from 'express';
import { listUsers, getUserById, updateUserStatus, softDeleteUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Admin-only endpoints
router.get('/', authorize('ADMIN'), listUsers);
router.get('/:id', authorize('ADMIN'), getUserById);
router.patch('/:id/status', authorize('ADMIN'), updateUserStatus);
router.delete('/:id', authorize('ADMIN'), softDeleteUser);

export default router;
