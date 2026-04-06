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

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PasswordResetDialog = ({ open, onOpenChange }: PasswordResetDialogProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"request" | "success">("request");

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
          description: "Password reset instructions sent to your email",
        });
        setStep("success");
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to send reset instructions",
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
      setStep("request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === "request" ? "Reset Password" : "Check Your Email"}
          </DialogTitle>
          <DialogDescription>
            {step === "request" 
              ? "Enter your email address and we'll send you instructions to reset your password."
              : "We've sent password reset instructions to your email. Please check your inbox."
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === "request" ? (
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
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
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