import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checking, setChecking] = useState(true);

  console.log('ProtectedRoute - Location:', location.pathname);
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - User Role:', user?.role);
  console.log('ProtectedRoute - User isApproved:', user?.isApproved);
  console.log('ProtectedRoute - Checking:', checking);

  // Check for maintenance mode on mount and periodically
  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/maintenance/check`
        );
        
        if (response.ok) {
          const data = await response.json();
          // If maintenance mode is active and user is not admin
          if (data.data?.isMaintenanceMode && user?.role !== 'admin') {
            setMaintenanceMode(true);
            navigate('/maintenance');
          } else {
            setMaintenanceMode(false);
          }
        }
      } catch (error) {
        console.error('Error checking maintenance mode:', error);
      } finally {
        setChecking(false);
      }
    };

    if (user) {
      checkMaintenanceMode();
      // Check every 2 minutes
      const interval = setInterval(checkMaintenanceMode, 2 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setChecking(false);
    }
  }, [user, navigate]);

  // Show loading state while checking maintenance mode (but user is authenticated)
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (checking) {
    // Show a loading spinner instead of redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is a pending employer
  const isPendingEmployer = user?.role === 'employer' && user?.isApproved === false;

  console.log('ProtectedRoute - isPendingEmployer:', isPendingEmployer);

  // If pending employer, redirect to pending approval page
  // But allow access to pending-approval page itself
  if (isPendingEmployer && location.pathname !== '/pending-approval') {
    return <Navigate to="/pending-approval" replace />;
  }

  // If approved employer or non-employer trying to access pending-approval, redirect to home
  if (!isPendingEmployer && location.pathname === '/pending-approval') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
