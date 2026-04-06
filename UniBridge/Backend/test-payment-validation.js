const Payment = require('./models/Payment');

// Test payment validation
async function testPaymentValidation() {
  try {
    const testCVData = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      address: '123 Test Street',
      education: 'Bachelor in CS',
      skills: 'JavaScript',
      experience: '2 years'
    };

    const testPaymentData = {
      cvData: testCVData,
      paymentMethod: 'card',
      cardNumber: '4242424242424242',
      nameOnCard: 'Test User',
      expiryDate: '12/25',
      cvv: '123',
      amount: 9.99
    };

    console.log('Testing payment data validation...');
    console.log('CV Data:', JSON.stringify(testCVData, null, 2));
    console.log('Payment Data:', JSON.stringify(testPaymentData, null, 2));

    // Create a mock request object
    const mockReq = {
      body: testPaymentData,
      user: { id: 'test-user-id' }
    };

    // Create a mock response object
    const mockRes = {
      status: (code) => ({ success: true, data: {} }),
      json: (data) => console.log('Response:', JSON.stringify(data, null, 2))
    };

    // Import and test the actual processPayment function
    const { processPayment } = require('./controllers/paymentController');

    // Call the function
    await processPayment(mockReq, mockRes);

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Test the payment model directly
async function testPaymentModel() {
  try {
    const { ObjectId } = require('mongoose').Types;
    
    console.log('Testing payment model...');
    
    const payment = new Payment({
      userId: new ObjectId('507f1f77bcf86d766f39'), // Use proper ObjectId
      cvData: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        address: '123 Test Street',
        education: 'Bachelor in CS',
        skills: 'JavaScript',
        experience: '2 years'
      },
      paymentDetails: {
        amount: 9.99,
        currency: 'USD',
        paymentMethod: 'card',
        paymentStatus: 'processing'
      }
    });

    console.log('Payment before save:', JSON.stringify(payment, null, 2));

    // This should trigger the pre-save middleware
    const savedPayment = await payment.save();
    
    console.log('Payment after save:', JSON.stringify(savedPayment, null, 2));
    console.log('Transaction ID:', savedPayment.paymentDetails.transactionId);
    
    // Test if we can find it
    const foundPayment = await Payment.findOne({ 
      _id: savedPayment._id 
    });
    
    console.log('Found payment:', JSON.stringify(foundPayment, null, 2));
    
  } catch (error) {
    console.error('Payment model test error:', error.message);
  }
}

// Run tests
testPaymentValidation();
testPaymentModel();
