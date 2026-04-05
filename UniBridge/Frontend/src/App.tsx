import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import OnboardingAnimation from "@/components/OnboardingAnimation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import Feedback from "./pages/Feedback";
import Companies from "./pages/Companies";
import Exam from "./pages/Exam";
import ExamList from "./pages/ExamList";
import CVBuilder from "./pages/CVBuilder";
import Payment from "./pages/Payment";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
// Admin Pages
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminUsers from "./pages/Admin/Users";
import AdminUserDetail from "./pages/Admin/UserDetail";
import AdminEmployers from "./pages/Admin/Employers";
import AdminAnalytics from "./pages/Admin/Analytics";
import AdminSettings from "./pages/Admin/Settings";
import AdminFeedback from "./pages/Admin/Feedback";
import CreateExam from "./pages/Admin/CreateExam";
import AddQuestions from "./pages/Admin/AddQuestions";
import ViewExams from "./pages/Admin/ViewExams";
import ViewQuestions from "./pages/Admin/ViewQuestions";
import ViewResults from "./pages/Admin/ViewResults";
import AdminLayout from "./components/Admin/AdminLayout";
// Company Manager Pages
import CompanyManagerLayout from "./components/CompanyManager/CompanyManagerLayout";
import CompanyDashboard from "./pages/CompanyManager/Dashboard";
import CompanyDepartments from "./pages/CompanyManager/Departments";
import CompanyJobs from "./pages/CompanyManager/Jobs";
import CompanyApplicants from "./pages/CompanyManager/Applicants";
import CompanySettings from "./pages/CompanyManager/Settings";
import CompanyExam from "./pages/CompanyManager/Exam";
// Student Pages
import StudentExamSchedule from "./pages/StudentExamSchedule";
// Public Pages
import PublicJobs from "./pages/PublicJobs";
// Password Reset
import ResetPasswordForm from "./components/auth/ResetPasswordForm";
import VerifyEmail from "./pages/VerifyEmail";

const queryClient = new QueryClient();

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check localStorage on initial render
    return !localStorage.getItem("hasSeenOnboarding");
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <OnboardingAnimation onComplete={handleOnboardingComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/contact" element={<Layout><ContactUs /></Layout>} />
              <Route path="/feedback" element={<Layout><Feedback /></Layout>} />
              <Route path="/auth" element={<Layout showFooter={false}><Auth /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/profile/:section" element={<Layout><Profile /></Layout>} />
              
              {/* Public Jobs Page - accessible to everyone */}
              <Route path="/jobs" element={<Layout><PublicJobs /></Layout>} />
              <Route path="/careers" element={<Layout><PublicJobs /></Layout>} />
              
              {/* Protected Routes - Only accessible after login */}
              <Route path="/companies" element={<ProtectedRoute><Layout><Companies /></Layout></ProtectedRoute>} />
              <Route path="/exams" element={<ProtectedRoute><StudentExamSchedule /></ProtectedRoute>} />
              <Route path="/exam-list" element={<ProtectedRoute><Layout><ExamList /></Layout></ProtectedRoute>} />
              <Route path="/exam/:examId" element={<ProtectedRoute><Layout><Exam /></Layout></ProtectedRoute>} />
              <Route path="/cv-builder" element={<ProtectedRoute><Layout><CVBuilder /></Layout></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Layout><Payment /></Layout></ProtectedRoute>} />
              <Route path="/feedback" element={<ProtectedRoute><Layout><Feedback /></Layout></ProtectedRoute>} />
              
              {/* Company Manager Routes */}
              <Route path="/company/dashboard" element={<CompanyManagerLayout><CompanyDashboard /></CompanyManagerLayout>} />
              <Route path="/company/departments" element={<CompanyManagerLayout><CompanyDepartments /></CompanyManagerLayout>} />
              <Route path="/company/jobs" element={<CompanyManagerLayout><CompanyJobs /></CompanyManagerLayout>} />
              <Route path="/company/applicants" element={<CompanyManagerLayout><CompanyApplicants /></CompanyManagerLayout>} />
              <Route path="/company/exam" element={<CompanyManagerLayout><CompanyExam /></CompanyManagerLayout>} />
              <Route path="/company/settings" element={<CompanyManagerLayout><CompanySettings /></CompanyManagerLayout>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
              <Route path="/admin/users/:id" element={<AdminLayout><AdminUserDetail /></AdminLayout>} />
              <Route path="/admin/employers" element={<AdminLayout><AdminEmployers /></AdminLayout>} />
              <Route path="/admin/feedback" element={<AdminLayout><AdminFeedback /></AdminLayout>} />
              <Route path="/admin/analytics" element={<AdminLayout><AdminAnalytics /></AdminLayout>} />
              <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
              
              {/* Exam Management Routes */}
              <Route path="/admin/exams/create" element={<AdminLayout><CreateExam /></AdminLayout>} />
              <Route path="/admin/exams/questions/add" element={<AdminLayout><AddQuestions /></AdminLayout>} />
              <Route path="/admin/exams/view" element={<AdminLayout><ViewExams /></AdminLayout>} />
              <Route path="/admin/exams/questions/view" element={<AdminLayout><ViewQuestions /></AdminLayout>} />
              <Route path="/admin/exams/results" element={<AdminLayout><ViewResults /></AdminLayout>} />
              
              {/* Password Reset Route */}
              <Route path="/reset-password/:token" element={<Layout showFooter={false}><ResetPasswordForm /></Layout>} />
              
              {/* Email Verification Route */}
              <Route path="/verify-email/:token" element={<Layout showFooter={false}><VerifyEmail /></Layout>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
