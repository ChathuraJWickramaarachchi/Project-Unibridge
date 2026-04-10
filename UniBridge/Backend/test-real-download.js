// Test PDF download with real payment data
const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/unibridge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testRealDownload() {
  try {
    console.log('Testing real PDF download...');
    
    // Find a real payment
    const payments = await Payment.find({ 'paymentDetails.paymentStatus': 'completed' }).limit(1);
    
    if (payments.length === 0) {
      console.log('No completed payments found. Creating a test payment...');
      
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
      
      // Now test the PDF generation directly
      const { downloadCV } = require('./controllers/paymentController');
      
      // Mock request and response objects
      const mockReq = {
        params: { id: testPayment._id },
        user: { _id: testUser._id }
      };
      
      let responseData = null;
      let responseHeaders = {};
      
      const mockRes = {
        setHeader: (name, value) => {
          responseHeaders[name] = value;
        },
        send: (data) => {
          responseData = data;
          console.log('Response sent, data length:', data.length);
          console.log('Response headers:', responseHeaders);
          
          // Save the PDF to verify it's valid
          require('fs').writeFileSync('test_download.pdf', data);
          console.log('PDF saved as test_download.pdf');
        },
        status: (code) => ({
          json: (data) => {
            console.log('Status', code, ':', data);
          }
        })
      };
      
      // Call the downloadCV function
      await downloadCV(mockReq, mockRes);
      
    } else {
      console.log('Found existing payment:', payments[0]._id);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testRealDownload();
