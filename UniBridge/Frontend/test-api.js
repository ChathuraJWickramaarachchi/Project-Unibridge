// Test API endpoints
const testAPI = async () => {
  try {
    // Test login
    console.log('Testing login...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'employer@test.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success && loginData.token) {
      const token = loginData.token;
      console.log('Login successful! Token received');
      
      // Test dashboard API with token
      console.log('Testing dashboard API...');
      const dashboardResponse = await fetch('http://localhost:5001/api/jobs/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const dashboardData = await dashboardResponse.json();
      console.log('Dashboard API response:', dashboardData);
      
      // Test departments API
      console.log('Testing departments API...');
      const deptResponse = await fetch('http://localhost:5001/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const deptData = await deptResponse.json();
      console.log('Departments API response:', deptData);
      
    } else {
      console.error('Login failed:', loginData);
    }
  } catch (error) {
    console.error('API test error:', error);
  }
};

testAPI();
