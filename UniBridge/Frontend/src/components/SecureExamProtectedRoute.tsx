import { ReactNode } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface SecureExamProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected route specifically for the secure exam flow.
 * Redirects unauthenticated users to /secure-exam-login/:examId
 * instead of the regular /auth page.
 */
const SecureExamProtectedRoute = ({ children }: SecureExamProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const { examId } = useParams<{ examId: string }>();
  const [searchParams] = useSearchParams();

  // Show nothing while auth state loads (prevents flash of login page)
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const lockdown = searchParams.get("lockdown") || "true";
    return (
      <Navigate
        to={`/secure-exam-login/${examId || "unknown"}?lockdown=${lockdown}`}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default SecureExamProtectedRoute;
