// Test the actual PDF download endpoint
const axios = require('axios');

async function testPDFEndpoint() {
  try {
    console.log('Testing PDF download endpoint...');
    
    // Test the endpoint without auth first to see if it exists
    const response = await axios.get('http://localhost:5000/api/payments/download/test-id', {
      responseType: 'arraybuffer'
    }).catch(error => {
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response headers:', error.response.headers);
        console.log('Response data type:', typeof error.response.data);
        console.log('Response data length:', error.response.data?.length || 'undefined');
        
        // Try to parse the response if it's JSON
        try {
          const text = Buffer.from(error.response.data).toString('utf8');
          console.log('Response text:', text);
        } catch (e) {
          console.log('Response is binary data');
        }
        
        return error.response;
      }
      throw error;
    });
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPDFEndpoint();
