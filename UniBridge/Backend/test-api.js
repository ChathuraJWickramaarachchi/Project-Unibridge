// Simple test script to verify API endpoints
const testEndpoints = async () => {
  const baseUrl = 'http://localhost:5001/api';
  
  console.log('Testing API endpoints...\n');
  
  // Test health endpoint
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✓ Health check:', healthData);
  } catch (error) {
    console.log('✗ Health check failed:', error.message);
  }
  
  // Test register endpoint
  try {
    console.log('\n2. Testing register endpoint...');
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      }),
    });
    const registerData = await registerResponse.json();
    console.log('✓ Register response:', registerData);
  } catch (error) {
    console.log('✗ Register test failed:', error.message);
  }
  
  // Test login endpoint
  try {
    console.log('\n3. Testing login endpoint...');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });
    const loginData = await loginResponse.json();
    console.log('✓ Login response:', loginData);
  } catch (error) {
    console.log('✗ Login test failed:', error.message);
  }
};

// Run tests
testEndpoints();