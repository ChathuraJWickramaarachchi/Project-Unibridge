import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock } from "lucide-react";
import {
  validatePassword,
  validateConfirmPassword,
  validateCurrentPassword,
} from "@/lib/validation";

const Settings = () => {
  const { user, updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    const currentPasswordValidation = validateCurrentPassword(currentPassword);
    const newPasswordValidation = validatePassword(newPassword);
    const confirmNewPasswordValidation = validateConfirmPassword(newPassword, confirmNewPassword);
    
    if (!currentPasswordValidation.isValid) {
      toast({
        title: "Validation Error",
        description: currentPasswordValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    if (!newPasswordValidation.isValid) {
      toast({
        title: "Validation Error",
        description: newPasswordValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    if (!confirmNewPasswordValidation.isValid) {
      toast({
        title: "Validation Error",
        description: confirmNewPasswordValidation.error,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await updatePassword(currentPassword, newPassword);

      if (response.success) {
        toast({
          title: "Success",
          description: "Password updated successfully"
        });
        // Reset form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update password",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter your current password"
                  onBlur={(e) => {
                    const validation = validateCurrentPassword(e.target.value);
                    if (!validation.isValid && e.target.value) {
                      toast({
                        title: "Validation Error",
                        description: validation.error,
                        variant: "destructive"
                      });
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter your new password"
                  onBlur={(e) => {
                    const validation = validatePassword(e.target.value);
                    if (!validation.isValid && e.target.value) {
                      toast({
                        title: "Validation Error",
                        description: validation.error,
                        variant: "destructive"
                      });
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  placeholder="Confirm your new password"
                  onBlur={(e) => {
                    const validation = validateConfirmPassword(newPassword, e.target.value);
                    if (!validation.isValid && e.target.value) {
                      toast({
                        title: "Validation Error",
                        description: validation.error,
                        variant: "destructive"
                      });
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input value={user?.email || ""} disabled className="mt-1 bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <Label>Account Type</Label>
              <Input value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || ""} disabled className="mt-1 bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;