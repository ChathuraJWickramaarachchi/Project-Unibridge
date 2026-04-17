const express = require('express');
const router = express.Router();
const {
  setup2FA,
  verify2FA,
  disable2FA,
  verify2FALogin,
  get2FAStatus,
  regenerateBackupCodes,
} = require('../controllers/twoFactorController');
const { protect } = require('../middleware/auth');

// Public route - no authentication required (user is still logging in)
router.post('/login-verify', verify2FALogin);

// Protected routes - require authentication
router.use(protect);

// Setup 2FA (generate secret and QR code)
router.post('/setup', setup2FA);

// Verify and enable 2FA
router.post('/verify', verify2FA);

// Disable 2FA
router.post('/disable', disable2FA);

// Get 2FA status
router.get('/status', get2FAStatus);

// Regenerate backup codes
router.post('/backup-codes', regenerateBackupCodes);

module.exports = router;
