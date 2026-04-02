const API_BASE_URL = 'http://localhost:5001/api';

class FeedbackService {
  // Create new feedback (public)
  async createFeedback(feedbackData) {
    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Get public feedback
  async getPublicFeedback(page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/feedback/public?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching public feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's own feedback (requires auth)
  async getMyFeedback() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const response = await fetch(`${API_BASE_URL}/feedback/my-feedback`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching my feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Admin: Get all feedback
  async getAllFeedback(params = {}) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/feedback${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching all feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Admin: Get feedback by ID
  async getFeedbackById(id) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching feedback by ID:', error);
      return { success: false, error: error.message };
    }
  }

  // Admin: Update feedback status
  async updateFeedbackStatus(id, status) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const response = await fetch(`${API_BASE_URL}/feedback/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating feedback status:', error);
      return { success: false, error: error.message };
    }
  }

  // Admin: Add response to feedback
  async addAdminResponse(id, message) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const response = await fetch(`${API_BASE_URL}/feedback/${id}/response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding admin response:', error);
      return { success: false, error: error.message };
    }
  }

  // Admin: Update feedback
  async updateFeedback(id, updateData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Admin: Delete feedback
  async deleteFeedback(id) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Admin: Get feedback statistics
  async getFeedbackStats() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'Not authenticated' };

      const response = await fetch(`${API_BASE_URL}/feedback/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new FeedbackService();
