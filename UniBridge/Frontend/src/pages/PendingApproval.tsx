import { motion } from "framer-motion";
import { Clock, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PendingApproval = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 md:p-12">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Clock className="w-12 h-12 text-amber-600 dark:text-amber-400" />
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Account Pending Approval
          </h1>

          {/* User Info */}
          {user && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Registered as:</p>
              <p className="font-semibold text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          )}

          {/* Status Message */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  Your employer account is under review
                </h3>
                <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
                  Thank you for registering as an employer on UniBridge! Our admin team is currently 
                  reviewing your application. This process typically takes 24-48 hours.
                </p>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-foreground">What happens next?</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email Notification</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email notification once your account is approved
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Account Activation</p>
                  <p className="text-sm text-muted-foreground">
                    Once approved, you can login and start posting opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Need help?</strong> If you have any questions or concerns about your application, 
              please contact our support team at <a href="mailto:support@unibridge.com" className="underline font-medium">support@unibridge.com</a>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1"
            >
              Back to Login
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © {new Date().getFullYear()} UniBridge. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default PendingApproval;
