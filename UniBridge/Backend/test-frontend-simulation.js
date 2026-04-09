// Test frontend simulation of PDF download
const axios = require('axios');
const fs = require('fs');

async function testFrontendSimulation() {
  try {
    console.log('Testing frontend simulation...');
    
    // First, let's create a test payment and user in the database
    // But for now, let's test the endpoint directly
    
    // Test 1: Test without authentication (should fail)
    console.log('\n=== Test 1: Without Authentication ===');
    try {
      const response = await axios.get('http://localhost:5000/api/payments/download/test-id', {
        responseType: 'arraybuffer'
      });
      console.log('Unexpected success:', response.status);
    } catch (error) {
      if (error.response) {
        console.log('Expected auth failure - Status:', error.response.status);
        const text = Buffer.from(error.response.data).toString('utf8');
        console.log('Response text:', text);
      }
    }
    
    // Test 2: Let's try to register a user and create a payment first
    console.log('\n=== Test 2: Creating Test User ===');
    try {
      const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
        name: 'Test PDF User',
        email: 'testpdf@example.com',
        password: 'test123',
        role: 'student'
      });
      console.log('User registration successful:', registerResponse.data.success);
      
      // Test 3: Login to get token
      console.log('\n=== Test 3: Login ===');
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'testpdf@example.com',
        password: 'test123'
      });
      
      if (loginResponse.data.success && loginResponse.data.token) {
        const token = loginResponse.data.token;
        console.log('Login successful, got token');
        
        // Test 4: Create a payment
        console.log('\n=== Test 4: Creating Payment ===');
        const paymentResponse = await axios.post('http://localhost:5000/api/payments/process', {
          cvData: {
            fullName: "Test PDF Download",
            email: "testpdf@example.com",
            phone: "1234567890",
            address: "123 Test Street",
            education: "Bachelor in Computer Science",
            skills: "JavaScript, React, Node.js",
            experience: "2 years experience",
            careerObjective: "Seeking a challenging position"
          },
          paymentMethod: 'card',
          amount: 9.99
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (paymentResponse.data.success) {
          const paymentId = paymentResponse.data.data.paymentId;
          console.log('Payment created:', paymentId);
          
          // Wait a moment for processing
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Test 5: Download the PDF
          console.log('\n=== Test 5: Downloading PDF ===');
          const downloadResponse = await axios.get(`http://localhost:5000/api/payments/download/${paymentId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            responseType: 'arraybuffer'
          });
          
          console.log('Download response:', {
            status: downloadResponse.status,
            contentType: downloadResponse.headers['content-type'],
            contentDisposition: downloadResponse.headers['content-disposition'],
            dataSize: downloadResponse.data.length
          });
          
          // Save the downloaded PDF
          fs.writeFileSync('frontend_simulation_test.pdf', downloadResponse.data);
          console.log('Frontend simulation PDF saved as frontend_simulation_test.pdf');
          
          // Test 6: Simulate blob creation (like frontend does)
          console.log('\n=== Test 6: Simulating Blob Creation ===');
          const blobData = Buffer.from(downloadResponse.data);
          console.log('Blob data size:', blobData.length);
          console.log('Content-Type verified:', downloadResponse.headers['content-type'] === 'application/pdf');
          
          console.log('\n=== All Tests Completed Successfully! ===');
          
        } else {
          console.log('Payment creation failed:', paymentResponse.data);
        }
      } else {
        console.log('Login failed:', loginResponse.data);
      }
      
    } catch (error) {
      console.error('Test failed:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('Frontend simulation failed:', error);
  }
}

testFrontendSimulation();
