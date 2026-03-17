const axios = require('axios');

const testRegistration = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test Admin',
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      storeName: 'Test Store'
    });
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error Status:', error.response?.status);
    console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
  }
};

testRegistration();
