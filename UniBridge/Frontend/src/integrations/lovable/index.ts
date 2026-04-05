import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface LovableUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

export const useLovableAuth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Extract code from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        try {
          // Exchange code for session using your backend
          const response = await fetch('http://localhost:5001/api/oauth/lovable/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ code }),
          });

          const result = await response.json();
          
          if (result.success) {
            // The OAuth callback returns a complete user object and token
            // We need to store this in localStorage to match the existing auth system
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            
            // Remove the code from the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/');
          } else {
            setError(result.error || 'OAuth authentication failed');
          }
        } catch (err) {
          setError('An error occurred during OAuth authentication');
        }
      }
      
      setLoading(false);
    };

    handleAuthCallback();
  }, [navigate]);

  return { loading, error };
};