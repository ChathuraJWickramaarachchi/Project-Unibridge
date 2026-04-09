import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface SecureExamLayoutProps {
  children: ReactNode;
}

/**
 * A lockdown layout for SEB exam mode.
 * - No Navbar, no Footer
 * - Blocks browser back/forward navigation
 * - Restricts React Router navigation to secure-exam paths only
 */
const SecureExamLayout = ({ children }: SecureExamLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Block browser back/forward buttons by pushing state and catching popstate
    const blockNavigation = () => {
      window.history.pushState(null, "", window.location.href);
    };

    // Push an initial state entry
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", blockNavigation);

    return () => {
      window.removeEventListener("popstate", blockNavigation);
    };
  }, []);

  // Guard: if somehow the user navigates away from secure-exam paths, redirect back
  useEffect(() => {
    const path = location.pathname;
    const isAllowed =
      path.startsWith("/secure-exam") ||
      path.startsWith("/secure-exam-login") ||
      path === "/secure-exam-completed";

    if (!isAllowed) {
      navigate(-1); // go back to previous allowed page
    }
  }, [location.pathname, navigate]);

  return (
    <div
      className="fixed inset-0 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
      style={{ zIndex: 9999 }}
    >
      {children}
    </div>
  );
};

export default SecureExamLayout;
