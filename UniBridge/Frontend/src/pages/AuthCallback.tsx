import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    console.log('AuthCallback - Token:', token ? 'Present' : 'Missing');
    console.log('AuthCallback - Error:', error);

    if (error) {
      toast({
        title: "Authentication Failed",
        description: "Google sign-in failed. Please try again.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (token) {
      console.log('AuthCallback - Processing token...');
      // Store token in localStorage
      localStorage.setItem("token", token);
      
      // Fetch user data
      const fetchUser = async () => {
        try {
          console.log('AuthCallback - Fetching user data...');
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log('AuthCallback - Response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('AuthCallback - Full response:', JSON.stringify(data, null, 2));
            
            // The user data is nested in data.data.user
            const user = data.data?.user || data.data;
            
            console.log('AuthCallback - Extracted user:', user);
            console.log('AuthCallback - authProvider:', user?.authProvider);
            console.log('AuthCallback - role:', user?.role);
            console.log('AuthCallback - phone:', user?.phone);
            
            if (data.success && user) {
              setUser(user);
              
              // Check if this is a new Google user who needs to select a role
              const isNewGoogleUser = user?.authProvider === 'google' && 
                                     user?.role === 'student' && 
                                     (!user?.phone || user?.phone === '+1-000-000-0000' || user?.phone === 'To be updated');
              
              console.log('AuthCallback - Is new Google user?', isNewGoogleUser);
              
              if (isNewGoogleUser) {
                console.log('AuthCallback - New Google user, redirecting to role selection');
                toast({
                  title: "Welcome!",
                  description: "Please select your account type to continue.",
                });
                navigate("/role-selection");
              } else {
                console.log('AuthCallback - Existing user, redirecting to home');
                toast({
                  title: "Welcome!",
                  description: "Successfully signed in with Google.",
                });
                console.log('AuthCallback - Redirecting to home');
                navigate("/");
              }
            } else {
              throw new Error(data.error || "Failed to fetch user data");
            }
          } else {
            throw new Error("Failed to fetch user data");
          }
        } catch (error) {
          console.error("Auth callback error:", error);
          toast({
            title: "Error",
            description: "Failed to complete authentication. Please try again.",
            variant: "destructive",
          });
          navigate("/auth");
        }
      };

      fetchUser();
    } else {
      console.log('AuthCallback - No token found, redirecting to auth');
      navigate("/auth");
    }
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Completing Sign In...</h2>
        <p className="text-muted-foreground">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
