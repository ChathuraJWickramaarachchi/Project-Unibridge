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

  // Download SEB configuration file for an exam
  async downloadSEBConfig(examId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'You must be signed in to download the SEB configuration.' };
      }

      const response = await axios.get(`${API_URL}/${examId}/seb-config`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
        withCredentials: true,
      });

      const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam_${examId}.seb`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error downloading SEB config:', error);
      
      let errorMessage = 'Failed to download SEB configuration';
      
      if (error?.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing blob error response:', e);
        }
      } else {
        errorMessage = error?.response?.data?.error || error?.response?.data?.message || error.message || errorMessage;
      }
      
      if (error?.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1500);
      }
      
      return { success: false, message: errorMessage };
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

  // ==================== NEW RESULTS ENDPOINTS (from Result model) ====================

  // Get all results
  async getAllNewResults(examId, studentId) {
    try {
      let url = '/api/results';
      const params = new URLSearchParams();
      if (examId) params.append('examId', examId);
      if (studentId) params.append('studentId', studentId);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await axios.get(url, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching results:', error);
      throw error.response?.data || { success: false, message: 'Failed to fetch results' };
    }
  }

  // Get results statistics (new)
  async getNewResultsStatistics() {
    try {
      const response = await axios.get('/api/results/stats/summary', this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching results statistics:', error);
      throw error.response?.data || { success: false, message: 'Failed to fetch statistics' };
    }
  }

  // Get results by exam (new)
  async getNewResultsByExam(examId) {
    try {
      const response = await axios.get(`/api/results/exam/${examId}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching results by exam:', error);
      throw error.response?.data || { success: false, message: 'Failed to fetch exam results' };
    }
  }

  // Get exam results statistics (from exam_results collection)
  async getExamResultsStatistics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/exam-results/stats`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching exam results statistics:', error);
      throw error.response?.data || { success: false, message: 'Failed to fetch statistics' };
    }
  }

  // Get all exam results (from exam_results collection)
  async getAllExamResults(examName, studentEmail) {
    try {
      let url = `${API_BASE_URL}/admin/exam-results`;
      const params = new URLSearchParams();
      if (examName) params.append('examName', examName);
      if (studentEmail) params.append('studentEmail', studentEmail);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await axios.get(url, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching exam results:', error);
      throw error.response?.data || { success: false, message: 'Failed to fetch exam results' };
    }
  }

  // Get exam results by exam name (from exam_results collection)
  async getExamResultsByExam(examName) {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/exam-results/exam/${encodeURIComponent(examName)}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching exam results by exam:', error);
      throw error.response?.data || { success: false, message: 'Failed to fetch exam results' };
    }
  }

  // Get single result (new)
  async getNewResultById(resultId) {
    try {
      const response = await axios.get(`/api/results/${resultId}`, this.getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching result:', error);
      throw error.response?.data || { success: false, message: 'Failed to fetch result' };
    }
  }

}

export default new ExamService();
