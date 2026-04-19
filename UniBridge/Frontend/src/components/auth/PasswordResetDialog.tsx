import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import AuthService from "@/services/authService";
import { validateEmail } from "@/lib/validation";
import OTPInput from "./OTPInput";

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PasswordResetDialog = ({ open, onOpenChange }: PasswordResetDialogProps) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"request" | "verify" | "reset" | "success">("request");
  const [resetToken, setResetToken] = useState("");

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailValidation = validateEmail(email);
    
    if (!emailValidation.isValid) {
      toast({
        title: "Validation Error",
        description: emailValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await AuthService.forgotPassword(email);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "OTP sent to your email address",
        });
        setStep("verify");
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await AuthService.verifyResetOTP(email, otp);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "OTP verified successfully",
        });
        setResetToken(response.resetToken);
        setStep("reset");
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to verify OTP",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await AuthService.resetPassword(resetToken, newPassword);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Password reset successfully",
        });
        setStep("success");
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("request");
      setResetToken("");
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    
    try {
      const response = await AuthService.forgotPassword(email);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "New OTP sent to your email",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to resend OTP",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === "request" && "Reset Password"}
            {step === "verify" && "Verify OTP"}
            {step === "reset" && "Set New Password"}
            {step === "success" && "Password Reset Complete"}
          </DialogTitle>
          <DialogDescription>
            {step === "request" && "Enter your email address and we'll send you an OTP to reset your password."}
            {step === "verify" && `Enter the 6-digit OTP sent to ${email}`}
            {step === "reset" && "Enter your new password"}
            {step === "success" && "Your password has been reset successfully"}
          </DialogDescription>
        </DialogHeader>
        
        {step === "request" && (
          <form onSubmit={handleResetRequest}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  onBlur={(e) => {
                    const validation = validateEmail(e.target.value);
                    if (!validation.isValid && e.target.value) {
                      toast({
                        title: "Validation Error",
                        description: validation.error,
                        variant: "destructive"
                      });
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerifyOTP}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>OTP Code</Label>
                <OTPInput
                  length={6}
                  onChange={setOtp}
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleResendOTP} 
                disabled={loading}
              >
                Resend OTP
              </Button>
              <Button type="submit" disabled={loading || otp.length !== 6}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handlePasswordReset}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "success" && (
          <DialogFooter>
            <Button onClick={handleClose}>
              Back to Login
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetDialog;