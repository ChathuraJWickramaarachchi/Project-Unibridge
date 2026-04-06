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
import { validateOTP } from "@/lib/validation";

interface OTPVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onVerificationSuccess: (token: string) => void;
}

const OTPVerificationDialog = ({ 
  open, 
  onOpenChange, 
  email,
  onVerificationSuccess 
}: OTPVerificationDialogProps) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate OTP
    const otpValidation = validateOTP(otp);
    
    if (!otpValidation.isValid) {
      toast({
        title: "Validation Error",
        description: otpValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const response = await AuthService.verifyOTP(email, otp);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Account verified successfully!",
        });
        onVerificationSuccess(response.token);
        onOpenChange(false);
        setOtp("");
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

  const handleResendOTP = async () => {
    setResendLoading(true);
    
    try {
      // In a real implementation, this would call an API to resend OTP
      // For now, we'll just show a success message
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to ${email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setOtp("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify Your Account</DialogTitle>
          <DialogDescription>
            Enter the 6-digit OTP sent to your email address: {email}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleVerifyOTP}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                className="text-center text-2xl tracking-widest"
                onBlur={(e) => {
                  const validation = validateOTP(e.target.value);
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
          
          <DialogFooter className="mt-6 flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading ? "Verifying..." : "Verify Account"}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <Button 
                type="button"
                variant="link" 
                className="p-0 h-auto"
                onClick={handleResendOTP}
                disabled={resendLoading}
              >
                {resendLoading ? "Sending..." : "Resend OTP"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationDialog;