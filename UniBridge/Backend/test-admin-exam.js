const axios = require('axios');

// Test admin exam creation
async function testAdminExam() {
  try {
    console.log('Testing admin exam creation...');
    
    // First, try to login as admin (you'll need to replace with actual admin credentials)
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@example.com', // Replace with actual admin email
      password: 'password123'      // Replace with actual admin password
    });
    
    console.log('Login successful:', loginResponse.data);
    
    const token = loginResponse.data.token;
    
    // Now test exam creation
    const examData = {
      title: 'Test Exam',
      description: 'This is a test exam',
      timeLimit: 60,
      passingScore: 50
    };
    
    const examResponse = await axios.post('http://localhost:5001/api/admin/exams', examData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Exam creation successful:', examResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAdminExam();
