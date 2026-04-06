const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

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

module.exports = router;
