import axios from "axios";

// Use Vite proxy path so we don't hardcode the backend port.
// vite.config.ts proxies /api → http://localhost:5001
const API_URL = "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
};

export const applicationService = {
  // Submit a new application (with optional CV file)
  // NOTE: Do NOT set Content-Type manually — axios sets multipart/form-data
  // with the correct boundary automatically when FormData is passed.
  submit: async (formData) => {
    const res = await axios.post(`${API_URL}/applications`, formData, {
      headers: {
        ...getAuthHeaders(),
        // NO Content-Type override — let axios set multipart/form-data + boundary
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
