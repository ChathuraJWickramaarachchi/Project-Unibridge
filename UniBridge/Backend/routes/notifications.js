import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMyNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

// GET /api/notifications/my
router.get('/my', getMyNotifications);

// PUT /api/notifications/read-all
router.put('/read-all', markAllAsRead);

// GET /api/notifications/:userId
router.get('/:userId', getUserNotifications);

// PUT /api/notifications/read/:id
router.put('/read/:id', markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', deleteNotification);

export default router;
