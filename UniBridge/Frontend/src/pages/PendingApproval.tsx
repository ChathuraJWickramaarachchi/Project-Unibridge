import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PendingApproval = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-3xl font-heading font-bold text-foreground mb-2">
              Account Pending Approval
            </CardTitle>
            <CardDescription className="text-lg">
              Welcome, {user?.firstName} {user?.lastName}!
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Banner */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Your employer account is pending admin approval
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  You'll be able to access all features once your account is approved.
                </p>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">What happens next?</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Admin Review</p>
                  <p className="text-sm text-muted-foreground">
                    Our admin team will review your employer registration details.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Email Notification</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive a notification once your account is approved or if more information is needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Access Granted</p>
                  <p className="text-sm text-muted-foreground">
                    Once approved, you can login and start posting job opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-foreground">Your Account Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Account Type:</span>
                <p className="font-medium">Employer</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium text-amber-600">Pending Approval</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-200">
                  Need help?
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  If you have any questions or need urgent assistance, please contact our support team at 
                  <a href="mailto:support@unibridge.com" className="underline ml-1">support@unibridge.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Back to Login
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="flex-1"
              size="lg"
            >
              Browse Opportunities
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
