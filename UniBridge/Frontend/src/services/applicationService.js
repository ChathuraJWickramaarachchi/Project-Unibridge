import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const applicationService = {
  // Submit a new application (with optional CV file)
  submit: async (formData) => {
    const res = await axios.post(`${API_URL}/applications`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // Get my own applications (student)
  getMyApplications: async () => {
    const res = await axios.get(`${API_URL}/applications/my`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Get applications by student ID (admin / self)
  getByStudent: async (studentId) => {
    const res = await axios.get(`${API_URL}/applications/student/${studentId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Get applications for a job (employer / admin)
  getByJob: async (jobId) => {
    const res = await axios.get(`${API_URL}/applications/job/${jobId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  // Update application status (employer / admin)
  updateStatus: async (applicationId, status) => {
    const res = await axios.put(
      `${API_URL}/applications/${applicationId}/status`,
      { status },
      { headers: getAuthHeaders() }
    );
    return res.data;
  },
};
