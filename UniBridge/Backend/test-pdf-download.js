// Test the PDF download endpoint
const axios = require('axios');

async function testPDFDownload() {
  try {
    console.log('Testing PDF download endpoint...');
    
    // First, create a test payment
    const Payment = require('./models/Payment');
    const User = require('./models/User');
    
    // Find or create a test user
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123',
        role: 'student'
      });
      await testUser.save();
    }
    
    // Create a test payment
    const testPayment = new Payment({
      userId: testUser._id,
      cvData: {
        fullName: "Test PDF Download",
        email: "test@example.com",
        phone: "1234567890",
        address: "123 Test Street",
        education: "Bachelor in Computer Science",
        skills: "JavaScript, React, Node.js",
        experience: "2 years experience",
        careerObjective: "Seeking a challenging position"
      },
      paymentDetails: {
        amount: 9.99,
        currency: 'USD',
        paymentMethod: 'card',
        paymentStatus: 'completed',
        paymentProvider: 'stripe',
        transactionId: 'TEST_TXN_' + Date.now()
      },
      downloadInfo: {
        downloadCount: 0,
        lastDownloadedAt: null,
        downloadUrl: null
      }
    });
    
    await testPayment.save();
    console.log('Test payment created:', testPayment._id);
    
    // Now test the download
    const response = await axios.get(`http://localhost:5000/api/payments/download/${testPayment._id}`, {
      headers: {
        'Authorization': 'Bearer test-token', // This will fail but we can see the response
      },
      responseType: 'arraybuffer'
    }).catch(error => {
      console.log('Expected auth error, checking if endpoint exists...');
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response headers:', error.response.headers['content-type']);
        return error.response;
      }
      throw error;
    });
    
    if (response && response.headers) {
      console.log('Content-Type:', response.headers['content-type']);
      console.log('Content-Disposition:', response.headers['content-disposition']);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPDFDownload();
