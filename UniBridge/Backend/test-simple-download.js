// Simple test to check if the download endpoint is working
const axios = require('axios');

async function testSimpleDownload() {
  try {
    console.log('Testing simple PDF download...');
    
    // Test the endpoint with a fake ID to see the error response
    const response = await axios.get('http://localhost:5001/api/payments/download/fake-id', {
      responseType: 'arraybuffer'
    }).catch(error => {
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response headers:', error.response.headers);
        
        // Try to parse the response
        try {
          const text = Buffer.from(error.response.data).toString('utf8');
          console.log('Response text:', text);
        } catch (e) {
          console.log('Response is binary data, length:', error.response.data.length);
        }
        
        return error.response;
      }
      throw error;
    });
    
  } catch (error) {
    console.error('Simple test failed:', error.message);
  }
}

testSimpleDownload();
