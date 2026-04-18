import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, Shield, Bell, Database, Palette, Mail, 
  Save, RotateCcw, Key, Users, Globe
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import twoFactorService from "@/services/twoFactorService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminSettings = () => {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    siteName: "UniBridge Admin",
    siteDescription: "University internship and career platform",
    adminEmail: "admin@unibridge.com",
    notifications: {
      userRegistrations: true,
      employerApplications: true,
      systemAlerts: true,
      weeklyReports: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordRequirements: {
        minLength: 8,
        requireNumbers: true,
        requireSpecialChars: true
      }
    },
    appearance: {
      theme: "light",
      primaryColor: "#3b82f6",
      dateFormat: "MM/DD/YYYY"
    }
  });

  // Load 2FA status on mount
  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    try {
      const response = await twoFactorService.get2FAStatus();
      if (response.success) {
        setIs2FAEnabled(response.data.enabled);
        setSettings({
          ...settings,
          security: {
            ...settings.security,
            twoFactorAuth: response.data.enabled
          }
        });
      }
    } catch (error) {
      console.error("Failed to load 2FA status:", error);
    }
  };

  if (role !== "admin") {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page",
      variant: "destructive",
    });
    navigate("/");
    return null;
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to default values?")) {
      // Reset to default settings
      toast({
        title: "Success",
        description: "Settings reset to default values",
      });
    }
  };

  const handle2FAToggle = async (checked: boolean) => {
    if (checked) {
      // Enable 2FA
      await setup2FA();
    } else {
      // Disable 2FA
      if (window.confirm("Are you sure you want to disable Two-Factor Authentication?")) {
        await disable2FA();
      }
    }
  };

  const setup2FA = async () => {
    try {
      setLoading2FA(true);
      const response = await twoFactorService.setup2FA();
      
      if (response.success) {
        setQrCodeUrl(response.data.qrCodeUrl);
        setSecretKey(response.data.secret);
        setVerificationToken("");
        setShow2FADialog(true);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to setup 2FA",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to setup 2FA",
        variant: "destructive",
      });
    } finally {
      setLoading2FA(false);
    }
  };

  const verifyAndEnable2FA = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading2FA(true);
      const response = await twoFactorService.verify2FA(verificationToken);
      
      if (response.success) {
        setIs2FAEnabled(true);
        setSettings({
          ...settings,
          security: {
            ...settings.security,
            twoFactorAuth: true
          }
        });
        setBackupCodes(response.data.backupCodes || []);
        setShowBackupCodes(true);
        setShow2FADialog(false);
        
        toast({
          title: "Success",
          description: "2FA enabled successfully! Save your backup codes.",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Invalid verification code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify 2FA",
        variant: "destructive",
      });
    } finally {
      setLoading2FA(false);
    }
  };

  const disable2FA = async () => {
    try {
      setLoading2FA(true);
      // For disabling, we need to prompt for a verification code
      const token = prompt("Enter your 2FA code or a backup code to disable:");
      
      if (!token) {
        setLoading2FA(false);
        return;
      }

      const response = await twoFactorService.disable2FA(token);
      
      if (response.success) {
        setIs2FAEnabled(false);
        setSettings({
          ...settings,
          security: {
            ...settings.security,
            twoFactorAuth: false
          }
        });
        
        toast({
          title: "Success",
          description: "2FA disabled successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to disable 2FA",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      });
    } finally {
      setLoading2FA(false);
    }
  };

  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Backup code copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Configure platform settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Email and alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>User Registrations</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new users register</p>
                </div>
                <Switch
                  checked={settings.notifications.userRegistrations}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings, 
                      notifications: {...settings.notifications, userRegistrations: checked}
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Employer Applications</Label>
                  <p className="text-sm text-muted-foreground">Notifications for new employer applications</p>
                </div>
                <Switch
                  checked={settings.notifications.employerApplications}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings, 
                      notifications: {...settings.notifications, employerApplications: checked}
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">Critical system notifications</p>
                </div>
                <Switch
                  checked={settings.notifications.systemAlerts}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings, 
                      notifications: {...settings.notifications, systemAlerts: checked}
                    })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly analytics summary</p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={(checked) => 
                    setSettings({
                      ...settings, 
                      notifications: {...settings.notifications, weeklyReports: checked}
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>Platform security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <Switch
                  checked={is2FAEnabled}
                  onCheckedChange={handle2FAToggle}
                  disabled={loading2FA}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => 
                    setSettings({
                      ...settings, 
                      security: {...settings.security, sessionTimeout: parseInt(e.target.value)}
                    })
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label>Password Requirements</Label>
                <div className="space-y-2 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Minimum Length: {settings.security.passwordRequirements.minLength}</span>
                    <Input
                      type="number"
                      className="w-20"
                      value={settings.security.passwordRequirements.minLength}
                      onChange={(e) => 
                        setSettings({
                          ...settings, 
                          security: {
                            ...settings.security, 
                            passwordRequirements: {
                              ...settings.security.passwordRequirements,
                              minLength: parseInt(e.target.value)
                            }
                          }
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require Numbers</span>
                    <Switch
                      checked={settings.security.passwordRequirements.requireNumbers}
                      onCheckedChange={(checked) => 
                        setSettings({
                          ...settings, 
                          security: {
                            ...settings.security, 
                            passwordRequirements: {
                              ...settings.security.passwordRequirements,
                              requireNumbers: checked
                            }
                          }
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require Special Characters</span>
                    <Switch
                      checked={settings.security.passwordRequirements.requireSpecialChars}
                      onCheckedChange={(checked) => 
                        setSettings({
                          ...settings, 
                          security: {
                            ...settings.security, 
                            passwordRequirements: {
                              ...settings.security.passwordRequirements,
                              requireSpecialChars: checked
                            }
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Admin Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Admin Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Admin</Label>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <p className="font-medium capitalize">{user?.role}</p>
              </div>
              <Button variant="outline" className="w-full">
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <select 
                  id="theme"
                  value={settings.appearance.theme}
                  onChange={(e) => 
                    setSettings({
                      ...settings, 
                      appearance: {...settings.appearance, theme: e.target.value}
                    })
                  }
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <select 
                  id="dateFormat"
                  value={settings.appearance.dateFormat}
                  onChange={(e) => 
                    setSettings({
                      ...settings, 
                      appearance: {...settings.appearance, dateFormat: e.target.value}
                    })
                  }
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button 
                className="w-full" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* QR Code */}
            <div className="flex justify-center p-4 bg-white rounded-lg">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
              )}
            </div>

            {/* Secret Key */}
            <div className="space-y-2">
              <Label>Secret Key (for manual entry)</Label>
              <div className="flex gap-2">
                <Input 
                  value={secretKey} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(secretKey);
                    toast({ title: "Copied", description: "Secret key copied" });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* Verification Code Input */}
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                placeholder="Enter 6-digit code"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            {/* Verify Button */}
            <Button 
              className="w-full" 
              onClick={verifyAndEnable2FA}
              disabled={loading2FA || verificationToken.length !== 6}
            >
              {loading2FA ? "Verifying..." : "Verify & Enable 2FA"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Your Backup Codes</DialogTitle>
            <DialogDescription>
              Store these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                  onClick={() => copyBackupCode(code)}
                >
                  <code className="text-sm font-mono">{code}</code>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join('\n'));
                  toast({ title: "Copied", description: "All backup codes copied" });
                }}
              >
                Copy All Codes
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowBackupCodes(false)}
              >
                I've Saved My Backup Codes
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Click on any code to copy it individually
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;