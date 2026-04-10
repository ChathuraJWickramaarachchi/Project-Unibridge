import express from 'express';
import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  getMyFeedback,
  updateFeedbackStatus,
  addAdminResponse,
  updateFeedback,
  deleteFeedback,
  getPublicFeedback,
  getFeedbackStats,
} from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createFeedback);
router.get('/public', getPublicFeedback);

// Protected routes (for logged in users)
router.get('/my-feedback', protect, getMyFeedback);

// Admin only routes
router.get('/stats', protect, authorize('admin'), getFeedbackStats);
router.get('/', protect, authorize('admin'), getAllFeedback);
router.get('/:id', protect, authorize('admin'), getFeedbackById);
router.put('/:id', protect, authorize('admin'), updateFeedback);
router.put('/:id/status', protect, authorize('admin'), updateFeedbackStatus);
router.put('/:id/response', protect, authorize('admin'), addAdminResponse);
router.delete('/:id', protect, authorize('admin'), deleteFeedback);

export default router;
