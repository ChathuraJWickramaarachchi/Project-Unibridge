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
      console.error('Payment service error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to process payment';
      throw { message: errorMessage, details: error.response?.data };
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

  // Download CV file - rebuilt from scratch
  async downloadCV(paymentId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/download/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob',
        timeout: 30000 // 30 second timeout
      });
      
      // Verify response
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Check if response is actually a PDF
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/pdf')) {
        console.warn('Unexpected content type:', contentType);
      }
      
      // Log response details for debugging
      console.log('PDF download response:', {
        status: response.status,
        contentType: response.headers['content-type'],
        contentDisposition: response.headers['content-disposition'],
        dataSize: response.data.size || response.data.length || 'unknown'
      });
      
      return response;
      
    } catch (error) {
      console.error('Payment service download error:', error);
      
      // Handle different error types
      if (error.code === 'ECONNABORTED') {
        throw { message: 'Download timeout. Please try again.' };
      }
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Download failed';
        throw { 
          message: errorMessage,
          status: error.response.status,
          details: error.response.data 
        };
      }
      
      // Network or other error
      throw { 
        message: 'Network error during download. Please check your connection and try again.',
        originalError: error.message 
      };
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
