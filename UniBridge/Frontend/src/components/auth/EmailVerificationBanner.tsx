import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const EmailVerificationBanner = () => {
  const { user } = useAuth();

  const handleResendVerification = () => {
    // In a real implementation, this would call an API to resend verification email
    toast({
      title: "Verification Email Sent",
      description: "Please check your email for the verification link.",
    });
  };

  if (!user || user.isVerified) return null;

  return (
    <Alert variant="destructive" className="mb-6 border-destructive/30">
      <AlertCircle className="h-4 w-4" />
      <div>
        <AlertTitle className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Verification Required
        </AlertTitle>
        <AlertDescription className="mt-2">
          Please verify your email address to access all features. 
          Check your inbox for a verification email.
        </AlertDescription>
        <div className="mt-3 flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleResendVerification}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            Resend Verification Email
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default EmailVerificationBanner;