import Payment from '../models/Payment.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';

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
    const userId = req.user._id; // Use _id since user comes from database

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

    // Generate unique transaction ID
    const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create payment record
    const payment = new Payment({
      userId: userId,
      cvData: cvData,
      paymentDetails: {
        amount: amount,
        currency: 'USD',
        paymentMethod: paymentMethod,
        paymentStatus: 'processing',
        cardLastFour: cardLastFour,
        paymentProvider: 'stripe',
        transactionId: transactionId
      },
      downloadInfo: {
        downloadCount: 0,
        lastDownloadedAt: null,
        downloadUrl: null
      }
    });

    // Save payment record first
    await payment.save();

    // Send immediate response
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

    // Simulate payment processing in background (in production, integrate with Stripe/PayPal)
    setTimeout(async () => {
      try {
        // Find the payment again to avoid parallel save issues
        const updatedPayment = await Payment.findById(payment._id);
        
        // Update payment status to completed
        updatedPayment.paymentDetails.paymentStatus = 'completed';
        updatedPayment.updatedAt = new Date();
        
        // Generate download URL (in production, this would be a secure temporary URL)
        const downloadUrl = `/api/payments/download/${updatedPayment._id}`;
        updatedPayment.downloadInfo.downloadUrl = downloadUrl;
        
        await updatedPayment.save();
        
        console.log(`Payment completed: ${updatedPayment.paymentDetails.transactionId}`);
      } catch (error) {
        console.error('Error updating payment status:', error);
        try {
          const failedPayment = await Payment.findById(payment._id);
          failedPayment.paymentDetails.paymentStatus = 'failed';
          await failedPayment.save();
        } catch (updateError) {
          console.error('Error updating payment to failed status:', updateError);
        }
      }
    }, 2000); // Simulate 2 second processing time
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
      userId: req.user._id
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
      userId: req.user._id,
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

    // Generate CV PDF using pdfkit (more robust for Node.js)
    console.log('Starting PDF generation with PDFKit...');
    
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        
        // Set proper headers for binary file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${(payment.cvData.fullName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_')}_CV.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Pragma', 'no-cache');
        
        console.log('Sending PDF as binary stream...');
        res.end(pdfBuffer);
      });
      
      // Build the PDF content
      doc.fontSize(20).font('Helvetica-Bold').text('CURRICULUM VITAE', { align: 'center' });
      doc.moveDown(1.5);
      
      const addSection = (title, content) => {
        if (content && content.trim()) {
          doc.fontSize(14).font('Helvetica-Bold').text(title);
          doc.moveDown(0.5);
          doc.fontSize(12).font('Helvetica').text(content, { align: 'justify' });
          doc.moveDown(1.5);
        }
      };

      doc.fontSize(14).font('Helvetica-Bold').text('PERSONAL INFORMATION');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Name: ${payment.cvData.fullName || ''}`);
      doc.text(`Email: ${payment.cvData.email || ''}`);
      doc.text(`Phone: ${payment.cvData.phone || ''}`);
      doc.text(`Address: ${payment.cvData.address || ''}`);
      doc.moveDown(1.5);
      
      addSection('CAREER OBJECTIVE', payment.cvData.careerObjective);
      addSection('EDUCATION', payment.cvData.education);
      addSection('SKILLS', payment.cvData.skills);
      addSection('EXPERIENCE', payment.cvData.experience);
      addSection('CERTIFICATIONS', payment.cvData.certifications);
      addSection('LANGUAGES', payment.cvData.languages);
      
      // Footer
      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica-Oblique');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`);
      doc.text(`Transaction ID: ${payment.paymentDetails.transactionId}`);
      
      // Finalize document
      doc.end();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text generation if PDF fails
      console.log('Falling back to text generation...');
      return generateTextCV(res, payment);
    }
  } catch (error) {
    console.error('Error downloading CV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download CV',
      error: error.message
    });
  }
};

// Fallback text generation function
const generateTextCV = (res, payment) => {
  console.log('Generating text CV as fallback...');
  
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
