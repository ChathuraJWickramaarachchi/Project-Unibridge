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
      // Store token in localStorage
      localStorage.setItem("token", token);
      
      // Fetch user data
      const fetchUser = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUser(data.data);
              toast({
                title: "Welcome!",
                description: "Successfully signed in with Google.",
              });
              navigate("/");
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
