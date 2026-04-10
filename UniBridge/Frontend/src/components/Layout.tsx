import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const Layout = ({ children, showFooter = true }: LayoutProps) => {
  const location = useLocation();
  const isSafeExamRoute = location.pathname.startsWith("/exam/") && new URLSearchParams(location.search).get("lockdown") === "true";
  const isExamCompletedRoute = location.pathname === "/exam-completed";
  const hideChrome = isSafeExamRoute || isExamCompletedRoute;

  return (
    <div className="min-h-screen flex flex-col">
      {!hideChrome && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!hideChrome && showFooter && <Footer />}
    </div>
  );
};

export default Layout;