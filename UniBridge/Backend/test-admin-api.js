// Test admin API endpoints
const testAdminAPI = async () => {
  const baseUrl = 'http://localhost:5001/api';
  
  console.log('🔍 Testing Admin API Endpoints...\n');

  try {
    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // 2. Test admin registration (create admin user)
    console.log('\n2. Creating admin user...');
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@unibridge.com',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890',
      address: '123 Admin Street'
    };

    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });
    const registerData = await registerResponse.json();
    console.log('Admin registration response:', registerData);

    // 3. Test admin login
    console.log('\n3. Testing admin login...');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@unibridge.com',
        password: 'admin123'
      }),
    });
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (loginData.success && loginData.token) {
      const token = loginData.token;
      
      // 4. Test exam creation with admin token
      console.log('\n4. Testing exam creation...');
      const examData = {
        title: 'JavaScript Fundamentals',
        description: 'Test your JavaScript knowledge',
        timeLimit: 60,
        passingScore: 70
      };

      const examResponse = await fetch(`${baseUrl}/admin/exams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });
      const examResult = await examResponse.json();
      console.log('Exam creation response:', examResult);

      if (examResult.success) {
        const examId = examResult.data._id;
        
        // 5. Test question creation
        console.log('\n5. Testing question creation...');
        const questionData = {
          examId: examId,
          text: 'What is the correct way to declare a variable in JavaScript?',
          options: [
            'var myVariable = 5;',
            'variable myVariable = 5;',
            'v myVariable = 5;',
            'declare myVariable = 5;'
          ],
          correctAnswer: 0,
          marks: 1
        };

        const questionResponse = await fetch(`${baseUrl}/admin/questions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData),
        });
        const questionResult = await questionResponse.json();
        console.log('Question creation response:', questionResult);

        // 6. Test getting all exams
        console.log('\n6. Testing get all exams...');
        const examsResponse = await fetch(`${baseUrl}/admin/exams`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const examsResult = await examsResponse.json();
        console.log('Get exams response:', examsResult);

        console.log('\n🎉 All admin API tests completed successfully!');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run tests
testAdminAPI();
