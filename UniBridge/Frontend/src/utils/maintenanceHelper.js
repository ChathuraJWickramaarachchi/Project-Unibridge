import { useNavigate } from "react-router-dom";

// Helper to handle API responses and check for maintenance mode
export const handleApiResponse = async (response, navigate) => {
  // Check if response is 503 - Service Unavailable (Maintenance Mode)
  if (response.status === 503) {
    try {
      const data = await response.json();
      console.log('🔧 Maintenance mode detected:', data);
      
      // Redirect to maintenance page
      if (navigate) {
        navigate('/maintenance');
      } else {
        window.location.href = '/maintenance';
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing maintenance response:', error);
    }
  }

  // For other status codes, check if response is ok
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Request failed');
  }

  return await response.json();
};

// Custom hook for handling maintenance mode in components
export const useMaintenanceCheck = () => {
  const navigate = useNavigate();

  const checkResponse = async (response) => {
    return await handleApiResponse(response, navigate);
  };

  return { checkResponse };
};

// Wrapper for fetch that automatically handles maintenance mode
export const fetchWithMaintenanceCheck = async (url, options = {}, navigate = null) => {
  const response = await fetch(url, options);
  return await handleApiResponse(response, navigate);
};
