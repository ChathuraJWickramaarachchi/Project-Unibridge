import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';
const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/exams` : '/api/exams';

class ExamService {
  // Get auth headers with JWT token
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  // ==================== PUBLIC EXAM ENDPOINTS ====================

  // Get all public exams (no authentication required)
  async getAllPublicExams() {
    try {
      const response = await axios.get(`${API_URL}/public`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public exams:', error);
      throw error.response?.data || { message: 'Failed to fetch exams' };
    }
  }

  // Get public exam by ID (no authentication required)
  async getPublicExamById(examId) {
    try {
      const response = await axios.get(`${API_URL}/public/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public exam:', error);
      throw error.response?.data || { message: 'Failed to fetch exam' };
    }
  }

  // Get public questions by exam ID (no authentication required)
  async getPublicQuestionsByExam(examId) {
    try {
      const response = await axios.get(`${API_URL}/public/${examId}/questions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching public questions:', error);
      throw error.response?.data || { message: 'Failed to fetch questions' };
    }
  }

  // Submit exam results (no authentication required)
  async submitExamResults(examId, examData) {
    try {
      const response = await axios.post(`${API_URL}/public/${examId}/submit`, examData);
      return response.data;
    } catch (error) {
      console.error('Error submitting exam results:', error);
      throw error.response?.data || { message: 'Failed to submit exam results' };
    }
  }

  // ==================== SECURE EXAM ENDPOINTS (SEB - Authenticated) ====================

  // Get exam by ID (authenticated — for SEB secure exam flow)
  async getSecureExamById(examId) {
    try {
      const response = await axios.get(`${API_URL}/secure/${examId}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching secure exam:', error);
      return error.response?.data || { success: false, message: 'Failed to fetch exam' };
    }
  }

  // Get questions by exam ID (authenticated — for SEB secure exam flow)
  async getSecureQuestionsByExam(examId) {
    try {
      const response = await axios.get(`${API_URL}/secure/${examId}/questions`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching secure questions:', error);
      return error.response?.data || { success: false, message: 'Failed to fetch questions' };
    }
  }

  // Submit exam results (authenticated — uses server-side user identity)
  async submitSecureExamResults(examId, examData) {
    try {
      const response = await axios.post(`${API_URL}/secure/${examId}/submit`, examData, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error submitting secure exam results:', error);
      return error.response?.data || { success: false, message: 'Failed to submit exam results' };
    }
  }

  // ==================== COMPANY/STUDENT EXAM ENDPOINTS ====================

  // Create a new exam schedule
  async createExam(examData) {
    try {
      const response = await axios.post(API_URL, examData, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error.response?.data || { message: 'Failed to create exam' };
    }
  }

  // Get all exams for a company
  async getCompanyExams(companyId) {
    try {
      const response = await axios.get(
        `${API_URL}/company/${companyId}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching company exams:', error);
      throw error.response?.data || { message: 'Failed to fetch exams' };
    }
  }

  // Get all exams for a student
  async getStudentExams(studentId) {
    try {
      const response = await axios.get(
        `${API_URL}/student/${studentId}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching student exams:', error);
      throw error.response?.data || { message: 'Failed to fetch exams' };
    }
  }

  // Get single exam by ID
  async getExamById(examId) {
    try {
      const response = await axios.get(
        `${API_URL}/${examId}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw error.response?.data || { message: 'Failed to fetch exam' };
    }
  }

  // Update an exam
  async updateExam(examId, updateData) {
    try {
      const response = await axios.put(
        `${API_URL}/${examId}`,
        updateData,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error.response?.data || { message: 'Failed to update exam' };
    }
  }

  // Delete an exam
  async deleteExam(examId) {
    try {
      const response = await axios.delete(
        `${API_URL}/${examId}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error.response?.data || { message: 'Failed to delete exam' };
    }
  }

  // ==================== ADMIN DASHBOARD ENDPOINTS ====================

  // Create exam (admin)
  async createAdminExam(examData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/exams`, examData, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get all exams (admin)
  async getAllAdminExams() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/exams`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get exam by ID (admin)
  async getAdminExamById(examId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/exams/${examId}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update exam (admin)
  async updateAdminExam(examId, examData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/exams/${examId}`, examData, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Delete exam (admin)
  async deleteAdminExam(examId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/exams/${examId}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Add question (admin)
  async addQuestion(questionData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/questions`, questionData, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get questions by exam (admin)
  async getQuestionsByExam(examId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/questions/${examId}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get all questions (admin)
  async getAllQuestions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/questions`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get question by ID (admin)
  async getQuestionById(questionId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/questions/single/${questionId}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update question (admin)
  async updateQuestion(questionId, questionData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/questions/${questionId}`, questionData, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Delete question (admin)
  async deleteQuestion(questionId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/admin/questions/${questionId}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get all results (admin)
  async getAllResults() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/results`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get results by exam (admin)
  async getResultsByExam(examId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/results/${examId}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get result details (admin)
  async getResultDetails(examId, email) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/results/${examId}/${email}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get results statistics (admin)
  async getResultsStatistics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/results/stats/summary`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Download SEB configuration for exam
  async downloadSEBConfig(examId) {
    try {
      const response = await axios.get(
        `${API_URL}/${examId}/seb-config`,
        {
          ...this.getAuthHeaders(),
          responseType: 'arraybuffer'
        }
      );

      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/json') || contentType.includes('text/html')) {
        const text = new TextDecoder('utf-8').decode(response.data);
        console.error('Unexpected SEB response:', text);
        throw { message: 'Failed to download SEB configuration. The server returned an error.' };
      }

      const fileBlob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exam_${examId}.seb`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error downloading SEB config:', error);
      throw error.response?.data || error.message || { message: 'Failed to download SEB configuration' };
    }
  }

  // ==================== CONVENIENCE ALIASES FOR ADMIN COMPONENTS ====================

  // Alias for admin exam creation
  async createExam(examData) {
    return this.createAdminExam(examData);
  }

  // Alias for getting all exams (admin)
  async getAllExams() {
    return this.getAllAdminExams();
  }

  // Alias for getting exam by ID (admin)
  async getExamById(examId) {
    return this.getAdminExamById(examId);
  }

  // Alias for updating exam (admin)
  async updateExam(examId, examData) {
    return this.updateAdminExam(examId, examData);
  }

  // Alias for deleting exam (admin)
  async deleteExam(examId) {
    return this.deleteAdminExam(examId);
  }
}

export default new ExamService();
