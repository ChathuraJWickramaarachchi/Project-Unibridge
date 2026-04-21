import express from 'express';
import { getProfile, updateProfile, updateRole } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/update-role', protect, updateRole);

export default router;