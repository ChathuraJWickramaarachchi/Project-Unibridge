import Payment from '../models/Payment.js';
import User from '../models/User.js';

// @desc    Process payment and save details
// @route   POST /api/payments/process
// @access  Private
const processPayment = async (req, res) => {
  try {
    const {
      cvData,
      paymentMethod,
      cardNumber,
      nameOnCard,
      expiryDate,
      cvv,
      amount = 9.99
    } = req.body;

    // Validate required fields
    if (!cvData || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'CV data and payment method are required'
      });
    }

    // Validate CV data
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'education', 'skills', 'experience'];
    for (const field of requiredFields) {
      if (!cvData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required in CV data`
        });
      }
    }

    // Get user ID from authenticated user
    const userId = req.user.id;
    
    // Convert string userId to ObjectId if needed
    const { ObjectId } = (await import('mongoose')).Types;
    const userIdObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;

    // Validate card details if payment method is card
    let cardLastFour = null;
    if (paymentMethod === 'card') {
      if (!cardNumber || !nameOnCard || !expiryDate || !cvv) {
        return res.status(400).json({
          success: false,
          message: 'All card details are required for card payment'
        });
      }
      // Store only last 4 digits for security
      cardLastFour = cardNumber.slice(-4);
    }

    // Create payment record
    const payment = new Payment({
      userId: userIdObjectId,
      cvData: cvData,
      paymentDetails: {
        amount: amount,
        currency: 'USD',
        paymentMethod: paymentMethod,
        paymentStatus: 'processing',
        cardLastFour: cardLastFour,
        paymentProvider: 'stripe'
      }
    });

    // Simulate payment processing (in production, integrate with Stripe/PayPal)
    setTimeout(async () => {
      try {
        // Update payment status to completed
        payment.paymentDetails.paymentStatus = 'completed';
        payment.updatedAt = new Date();
        
        // Generate download URL (in production, this would be a secure temporary URL)
        const downloadUrl = `/api/payments/download/${payment._id}`;
        payment.downloadInfo.downloadUrl = downloadUrl;
        
        await payment.save();
        
        console.log(`Payment completed: ${payment.paymentDetails.transactionId}`);
      } catch (error) {
        console.error('Error updating payment status:', error);
        payment.paymentDetails.paymentStatus = 'failed';
        await payment.save();
      }
    }, 2000); // Simulate 2 second processing time

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment processing initiated',
      data: {
        paymentId: payment._id,
        transactionId: payment.paymentDetails.transactionId,
        amount: payment.paymentDetails.amount,
        status: payment.paymentDetails.paymentStatus,
        cvData: payment.cvData
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
};

// @desc    Get payment details by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};

// @desc    Get all payments for a user
// @route   GET /api/payments
// @access  Private
const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-paymentDetails.cvv -paymentDetails.cardNumber'); // Exclude sensitive data

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// @desc    Download CV file
// @route   GET /api/payments/download/:id
// @access  Private
const downloadCV = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user.id,
      'paymentDetails.paymentStatus': 'completed'
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or not completed'
      });
    }

    // Update download count and timestamp
    payment.downloadInfo.downloadCount += 1;
    payment.downloadInfo.lastDownloadedAt = new Date();
    await payment.save();

    // Generate CV content
    const cvContent = `
CURRICULUM VITAE

Personal Information:
Name: ${payment.cvData.fullName}
Email: ${payment.cvData.email}
Phone: ${payment.cvData.phone}
Address: ${payment.cvData.address}

${payment.cvData.careerObjective ? `Career Objective:\n${payment.cvData.careerObjective}\n` : ''}Education:
${payment.cvData.education}

Skills:
${payment.cvData.skills}

Experience:
${payment.cvData.experience}

---
Generated on: ${new Date().toLocaleDateString()}
Transaction ID: ${payment.paymentDetails.transactionId}
    `.trim();

    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${payment.cvData.fullName.replace(/\s+/g, '_')}_CV.txt"`);
    
    res.send(cvContent);
  } catch (error) {
    console.error('Error downloading CV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download CV',
      error: error.message
    });
  }
};

// @desc    Get payment statistics (admin)
// @route   GET /api/payments/stats
// @access  Private/Admin
const getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ 'paymentDetails.paymentStatus': 'completed' });
    const failedPayments = await Payment.countDocuments({ 'paymentDetails.paymentStatus': 'failed' });
    const processingPayments = await Payment.countDocuments({ 'paymentDetails.paymentStatus': 'processing' });
    
    const totalRevenue = await Payment.aggregate([
      { $match: { 'paymentDetails.paymentStatus': 'completed' } },
      { $group: { _id: null, total: { $sum: '$paymentDetails.amount' } } }
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalPayments,
        completedPayments,
        failedPayments,
        processingPayments,
        totalRevenue: revenue,
        averagePayment: completedPayments > 0 ? revenue / completedPayments : 0
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics',
      error: error.message
    });
  }
};

export {
  processPayment,
  getPaymentById,
  getUserPayments,
  downloadCV,
  getPaymentStats
};
