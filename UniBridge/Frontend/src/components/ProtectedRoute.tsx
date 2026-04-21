import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is a pending employer
  const isPendingEmployer = user.role === 'employer' && user.isApproved === false;

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
