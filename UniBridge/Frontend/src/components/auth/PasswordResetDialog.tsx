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
import { validateEmail, validateOTP, validatePassword } from "@/lib/validation";

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setFieldErrors({ email: emailValidation.error || "Invalid email" });
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const response = await AuthService.forgotPassword(email);
      if (response.success) {
        toast({ title: "Success", description: "OTP sent to your email" });
        setStep("verify");
      } else {
        toast({ title: "Error", description: response.error || "Failed to send OTP", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValidation = validateOTP(otp);
    if (!otpValidation.isValid) {
      setFieldErrors({ otp: otpValidation.error || "Invalid OTP" });
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const response = await AuthService.verifyForgotPasswordOTP(email, otp);
      if (response.success) {
        toast({ title: "Success", description: "OTP verified successfully" });
        setStep("reset");
      } else {
        setFieldErrors({ otp: response.error || "Invalid OTP" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      errors.newPassword = passwordValidation.error || "";
    }
    
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const response = await AuthService.resetPasswordWithOTP(email, otp, newPassword);
      if (response.success) {
        toast({ title: "Success", description: "Password reset successful" });
        setStep("success");
      } else {
        toast({ title: "Error", description: response.error || "Failed to reset password", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An error occurred", variant: "destructive" });
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
      setFieldErrors({});
    }
  };

  const renderStep = () => {
    switch (step) {
      case "request":
        return (
          <form onSubmit={handleResetRequest}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({});
                  }}
                  required
                  className={fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</Button>
            </DialogFooter>
          </form>
        );
      case "verify":
        return (
          <form onSubmit={handleVerifyOTP}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (fieldErrors.otp) setFieldErrors({});
                  }}
                  required
                  className={`text-center tracking-widest ${fieldErrors.otp ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {fieldErrors.otp && <p className="text-xs text-destructive mt-1 text-center">{fieldErrors.otp}</p>}
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => { setStep("request"); setFieldErrors({}); }} disabled={loading}>Back</Button>
              <Button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</Button>
            </DialogFooter>
          </form>
        );
      case "reset":
        return (
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.newPassword) setFieldErrors(prev => { 
                      const n = {...prev}; delete n.newPassword; return n;
                    });
                  }}
                  required
                  className={fieldErrors.newPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {fieldErrors.newPassword && <p className="text-xs text-destructive mt-1">{fieldErrors.newPassword}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors(prev => { 
                      const n = {...prev}; delete n.confirmPassword; return n;
                    });
                  }}
                  required
                  className={fieldErrors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {fieldErrors.confirmPassword && <p className="text-xs text-destructive mt-1">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => { setStep("verify"); setFieldErrors({}); }} disabled={loading}>Back</Button>
              <Button type="submit" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</Button>
            </DialogFooter>
          </form>
        );
      case "success":
        return (
          <div className="text-center py-4">
            <p className="mb-4">Your password has been reset successfully.</p>
            <Button onClick={handleClose} className="w-full">Back to Login</Button>
          </div>
        );
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
            {step === "success" && "Success!"}
          </DialogTitle>
          <DialogDescription>
            {step === "request" && "Enter your email to receive a password reset OTP."}
            {step === "verify" && `Enter the 6-digit OTP sent to ${email}.`}
            {step === "reset" && "Choose a strong new password for your account."}
            {step === "success" && "You can now sign in with your new password."}
          </DialogDescription>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetDialog;