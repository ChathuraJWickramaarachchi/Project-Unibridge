const express = require('express');
const {
  processPayment,
  getPaymentById,
  getUserPayments,
  downloadCV,
  getPaymentStats
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// @route   POST /api/payments/process
// @desc    Process payment and save details
// @access  Private
router.post('/process', processPayment);

// @route   GET /api/payments
// @desc    Get all payments for a user
// @access  Private
router.get('/', getUserPayments);

// @route   GET /api/payments/:id
// @desc    Get payment details by ID
// @access  Private
router.get('/:id', getPaymentById);

// @route   GET /api/payments/download/:id
// @desc    Download CV file
// @access  Private
router.get('/download/:id', downloadCV);

// @route   GET /api/payments/stats
// @desc    Get payment statistics (admin only)
// @access  Private/Admin
router.get('/stats/all', getPaymentStats);

module.exports = router;
