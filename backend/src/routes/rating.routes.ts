import { Router } from 'express';
import { createRating, listRatingsForUser } from '../controllers/rating.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createRating);
router.get('/user/:userId', listRatingsForUser);

export default router;
