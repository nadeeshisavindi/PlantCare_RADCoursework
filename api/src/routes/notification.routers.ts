import { Router } from 'express';
import {
  deleteNotification,
  getUnreadCount,
  listNotifications,
  markAllRead,
  markRead,
} from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { notificationIdRule, notificationListRules } from '../validators/notification.validators';

const router = Router();

router.use(authenticate);

router.get('/', notificationListRules, validate, listNotifications);
router.get('/unread-count', getUnreadCount);
// "read-all" is declared before "/:id/read" so it is not mistaken for an id
router.patch('/read-all', markAllRead);
router.patch('/:id/read', notificationIdRule, validate, markRead);
router.delete('/:id', notificationIdRule, validate, deleteNotification);

export default router;
