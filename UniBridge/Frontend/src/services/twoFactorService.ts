import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class TwoFactorService {
  // Get auth token from localStorage
  getAuthToken() {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  }

  // Setup 2FA - generate secret and QR code
  async setup2FA() {
    try {
      const response = await axios.post(
        `${API_URL}/2fa/setup`,
        {},
        {
          headers: {
            Authorization: this.getAuthToken(),
          },
        }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to setup 2FA',
      };
    }
  }

  // Verify and enable 2FA
  async verify2FA(token: string) {
    try {
      const response = await axios.post(
        `${API_URL}/2fa/verify`,
        { token },
        {
          headers: {
            Authorization: this.getAuthToken(),
          },
        }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to verify 2FA',
      };
    }
  }

  // Disable 2FA
  async disable2FA(token: string) {
    try {
      const response = await axios.post(
        `${API_URL}/2fa/disable`,
        { token },
        {
          headers: {
            Authorization: this.getAuthToken(),
          },
        }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to disable 2FA',
      };
    }
  }

  // Verify 2FA during login
  async verify2FALogin(token: string, userId: string) {
    try {
      const response = await axios.post(
        `${API_URL}/2fa/login-verify`,
        { token, userId }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to verify 2FA',
      };
    }
  }

  // Get 2FA status
  async get2FAStatus() {
    try {
      const response = await axios.get(
        `${API_URL}/2fa/status`,
        {
          headers: {
            Authorization: this.getAuthToken(),
          },
        }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get 2FA status',
      };
    }
  }

  // Regenerate backup codes
  async regenerateBackupCodes(token: string) {
    try {
      const response = await axios.post(
        `${API_URL}/2fa/backup-codes`,
        { token },
        {
          headers: {
            Authorization: this.getAuthToken(),
          },
        }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to regenerate backup codes',
      };
    }
  }
}

export default new TwoFactorService();
