import express from 'express';
import { register, login, getMe, changePassword, forgotPassword, resetPassword, verifyOTP } from '../controllers/authController.js';
import { passport, googleCallback } from '../controllers/googleAuthController.js';
import { protect } from '../middleware/auth.js';

console.log('Loading auth routes...');
console.log('Forgot password function:', typeof forgotPassword);

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.post('/verify-otp', verifyOTP);

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/auth?error=google_auth_failed' }),
  googleCallback
);

console.log('Auth routes loaded successfully');

export default router;