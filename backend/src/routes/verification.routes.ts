import { Router } from 'express';
import {
  submitVerificationDocument,
  getMyVerificationDocuments,
  adminListAllPendingDocuments,
  adminReviewDocument
} from '../controllers/verification.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// User routes
router.post('/', submitVerificationDocument);
router.get('/my', getMyVerificationDocuments);

// Admin review routes
router.get('/pending', authorize('ADMIN'), adminListAllPendingDocuments);
router.patch('/:id/review', authorize('ADMIN'), adminReviewDocument);

export default router;
