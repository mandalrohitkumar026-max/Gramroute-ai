import { Router } from 'express';
import {
  listMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', listMyNotifications);
router.patch('/:id/read', markNotificationAsRead);
router.patch('/read-all', markAllNotificationsAsRead);

export default router;
