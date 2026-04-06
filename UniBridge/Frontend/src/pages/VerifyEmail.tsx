import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import AuthService from "@/services/authService";

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    } else {
      setVerificationStatus("error");
      setMessage("Invalid verification link");
    }
  }, [token]);

  const verifyEmailToken = async (verificationToken: string) => {
    try {
      const response = await AuthService.verifyEmail(verificationToken);
      
      if (response.success) {
        setVerificationStatus("success");
        setMessage(response.message || "Email verified successfully!");
        toast({
          title: "Success",
          description: "Your email has been verified successfully!",
        });
      } else {
        setVerificationStatus("error");
        setMessage(response.error || "Failed to verify email");
      }
    } catch (error: any) {
      setVerificationStatus("error");
      setMessage(error.message || "An error occurred during verification");
      toast({
        title: "Error",
        description: error.message || "Verification failed",
        variant: "destructive",
      });
    }
  };

  const handleRedirect = () => {
    if (verificationStatus === "success") {
      navigate("/auth");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {verificationStatus === "pending" && (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            {verificationStatus === "success" && (
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            )}
            {verificationStatus === "error" && (
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {verificationStatus === "pending" && "Verifying Email"}
            {verificationStatus === "success" && "Email Verified!"}
            {verificationStatus === "error" && "Verification Failed"}
          </CardTitle>
          
          <CardDescription className="mt-2">
            {verificationStatus === "pending" && "Please wait while we verify your email address..."}
            {verificationStatus === "success" && "Your email has been successfully verified. You can now access all features."}
            {verificationStatus === "error" && "We couldn't verify your email. The link may be invalid or expired."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-muted-foreground">{message}</p>
          
          {verificationStatus === "success" && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Mail className="w-5 h-5" />
                <span className="font-medium">Email successfully verified</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                You can now access all UniBridge features with your verified account.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handleRedirect} 
            className="w-full"
            variant={verificationStatus === "success" ? "default" : "outline"}
          >
            {verificationStatus === "success" ? "Continue to Login" : "Back to Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;