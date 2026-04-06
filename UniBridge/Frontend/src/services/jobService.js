import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const jobService = {
  getJobs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/jobs?${queryString}`, getAuthHeader());
    return response.data;
  },

  getPublicJobs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/jobs/public?${queryString}`);
    return response.data;
  },

  getJobById: async (id) => {
    const response = await axios.get(`${API_URL}/jobs/public/${id}`);
    return response.data;
  },

  getJobStats: async () => {
    const response = await axios.get(`${API_URL}/jobs/stats`, getAuthHeader());
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await axios.post(`${API_URL}/jobs`, jobData, getAuthHeader());
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await axios.put(`${API_URL}/jobs/${id}`, jobData, getAuthHeader());
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await axios.delete(`${API_URL}/jobs/${id}`, getAuthHeader());
    return response.data;
  },

  applyForJob: async (id) => {
    const response = await axios.post(`${API_URL}/jobs/${id}/apply`, {}, getAuthHeader());
    return response.data;
  },
};
