import axios from 'axios';

const API_BASE_URL = '/api/payments';

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

class PaymentService {
  // Process payment and save details
  async processPayment(paymentData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/process`, paymentData, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to process payment' };
    }
  }

  // Get payment details by ID
  async getPaymentById(paymentId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${paymentId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payment details' };
    }
  }

  // Get all payments for a user
  async getUserPayments() {
    try {
      const response = await axios.get(API_BASE_URL, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payments' };
    }
  }

  // Download CV file
  async downloadCV(paymentId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/download/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to download CV' };
    }
  }

  // Get payment statistics (admin only)
  async getPaymentStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats/all`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payment statistics' };
    }
  }
}

export default new PaymentService();
