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

export const departmentService = {
  getDepartments: async () => {
    const response = await axios.get(`${API_URL}/departments`, getAuthHeader());
    return response.data;
  },

  getAllDepartments: async () => {
    const response = await axios.get(`${API_URL}/departments/all`);
    return response.data;
  },

  getDepartmentStats: async () => {
    const response = await axios.get(`${API_URL}/departments/stats`, getAuthHeader());
    return response.data;
  },

  createDepartment: async (departmentData) => {
    const response = await axios.post(`${API_URL}/departments`, departmentData, getAuthHeader());
    return response.data;
  },

  updateDepartment: async (id, departmentData) => {
    const response = await axios.put(`${API_URL}/departments/${id}`, departmentData, getAuthHeader());
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await axios.delete(`${API_URL}/departments/${id}`, getAuthHeader());
    return response.data;
  },
};
