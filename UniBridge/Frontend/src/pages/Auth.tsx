import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  Building, 
  ArrowRight, 
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  Briefcase,
  Rocket,
  Star,
  Shield,
  Phone,
  MapPin
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import PasswordResetDialog from "@/components/auth/PasswordResetDialog";
import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner";
import OTPVerificationDialog from "@/components/auth/OTPVerificationDialog";
import AuthService from "@/services/authService";
import {
  validateEmail,
  validatePassword,
  validateName,
} from "@/lib/validation";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [pendingUserEmail, setPendingUserEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, login, register, setUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });

  const features = [
    { icon: Briefcase, text: "Access to 500+ internships" },
    { icon: Shield, text: "Verified employers only" },
    { icon: Rocket, text: "Career growth tools" },
    { icon: Star, text: "Personalized recommendations" },
  ];

  if (isAuthenticated && user) return <Navigate to="/" replace />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Validate form fields for sign up
      const firstNameValidation = validateName(formData.firstName.trim(), "First name");
      const lastNameValidation = validateName(formData.lastName.trim(), "Last name");
      const emailValidation = validateEmail(formData.email.trim());
      const passwordValidation = validatePassword(formData.password);
      
      if (!firstNameValidation.isValid) {
        toast({
          title: "Validation Error",
          description: firstNameValidation.error,
          variant: "destructive"
        });
        return;
      }
      
      if (!lastNameValidation.isValid) {
        toast({
          title: "Validation Error",
          description: lastNameValidation.error,
          variant: "destructive"
        });
        return;
      }
      
      if (!emailValidation.isValid) {
        toast({
          title: "Validation Error",
          description: emailValidation.error,
          variant: "destructive"
        });
        return;
      }
      
      if (!passwordValidation.isValid) {
        toast({
          title: "Validation Error",
          description: passwordValidation.error,
          variant: "destructive"
        });
        return;
      }

      // Validate confirm password
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Validation Error",
          description: "Passwords do not match",
          variant: "destructive"
        });
        return;
      }

      // Validate phone number
      if (!formData.phone.trim()) {
        toast({
          title: "Validation Error",
          description: "Phone number is required",
          variant: "destructive"
        });
        return;
      }

      // Validate address
      if (!formData.address.trim()) {
        toast({
          title: "Validation Error",
          description: "Address is required",
          variant: "destructive"
        });
        return;
      }

      if (!agreedToTerms) {
        toast({
          title: "Validation Error",
          description: "Please agree to the Terms of Service and Privacy Policy",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Validate form fields for sign in
      const emailValidation = validateEmail(formData.email.trim());
      const passwordValidation = validatePassword(formData.password);
      
      if (!emailValidation.isValid) {
        toast({
          title: "Validation Error",
          description: emailValidation.error,
          variant: "destructive"
        });
        return;
      }
      
      if (!passwordValidation.isValid) {
        toast({
          title: "Validation Error",
          description: passwordValidation.error,
          variant: "destructive"
        });
        return;
      }
    }
    
    setLoading(true);
    
    try {
      let response;
      if (isSignUp) {
        response = await register(formData);
      } else {
        response = await login(formData.email, formData.password);
      }
      
      if (response.success) {
        if (isSignUp) {
          // For signup, show OTP verification dialog
          toast({
            title: "Success",
            description: "Account created successfully! Please check your email for the OTP."
          });
          setPendingUserEmail(formData.email);
          setShowOTPDialog(true);
        } else {
          // For login, redirect to home page
          toast({
            title: "Success",
            description: "Signed in successfully!"
          });
          navigate("/");
        }
      } else {
        toast({
          title: "Error",
          description: response.error || "Authentication failed",
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
    <div className="min-h-screen flex items-center justify-center auth-gradient-bg px-4 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-primary/10 to-accent/10"
          animate={{ 
            scale: [1, 1.3, 1], 
            rotate: [0, 180, 360],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-l from-accent/10 to-primary/10"
          animate={{ 
            scale: [1.3, 1, 1.3], 
            rotate: [0, -180, -360],
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            animate={{
              x: [0, Math.sin(i) * 100, 0],
              y: [0, Math.cos(i) * 100, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10 my-12"
      >
        {/* Email Verification Banner */}
        <EmailVerificationBanner />
        
        {/* Header Section */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 shadow-xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
          >
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          
          <motion.h1 
            className="text-4xl font-heading font-bold text-foreground mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            UniBridge
          </motion.h1>
          
          <motion.p 
            className="text-lg text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {isSignUp 
              ? "Join our community and unlock amazing opportunities" 
              : "Welcome back! Let's continue your journey"
            }
          </motion.p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="auth-card rounded-3xl p-8 md:p-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {isSignUp ? (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                    Create Account
                  </h2>
                  <p className="text-muted-foreground">
                    Start your journey with us today
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        First Name
                      </label>
                      <div className="relative">
                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                          className="pl-12 py-3 auth-input"
                          required
                          onBlur={(e) => {
                            const validation = validateName(e.target.value.trim(), "First name");
                            if (!validation.isValid && e.target.value.trim()) {
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
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Last Name
                      </label>
                      <div className="relative">
                        <Input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                          className="pl-12 py-3 auth-input"
                          required
                          onBlur={(e) => {
                            const validation = validateName(e.target.value.trim(), "Last name");
                            if (!validation.isValid && e.target.value.trim()) {
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
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email Address
                    </label>
                    <div className="relative">
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className="pl-12 py-3 auth-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className="pl-12 pr-12 py-3 auth-input"
                        required
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
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className="pl-12 pr-12 py-3 auth-input"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      Phone Number
                    </label>
                    <div className="relative">
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+94 11 587 469"
                        className="pl-12 py-3 auth-input"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Address
                    </label>
                    <div className="relative">
                      <Input
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                        className="pl-12 py-3 auth-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4 text-primary" />
                      I am a
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, role: "student"})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.role === "student"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 bg-background/50"
                        }`}
                      >
                        <User className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">Student</div>
                        <div className="text-xs text-muted-foreground mt-1">Looking for opportunities</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, role: "employer"})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.role === "employer"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 bg-background/50"
                        }`}
                      >
                        <Building className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">Employer</div>
                        <div className="text-xs text-muted-foreground mt-1">Posting opportunities</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, role: "admin"})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.role === "admin"
                            ? "border-purple-500 bg-purple-500/10 text-purple-600"
                            : "border-border hover:border-purple-500/50 bg-background/50"
                        }`}
                      >
                        <Shield className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">Admin</div>
                        <div className="text-xs text-muted-foreground mt-1">Platform management</div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Terms and Conditions Checkbox */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-3 text-base font-semibold group auth-button" 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Get Started
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="text-center mb-2">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-muted-foreground">
                    Sign in to continue your journey
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email Address
                    </label>
                    <div className="relative">
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className="pl-12 py-3 auth-input"
                        required
                        onBlur={(e) => {
                          const validation = validateEmail(e.target.value.trim());
                          if (!validation.isValid && e.target.value.trim()) {
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
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="pl-12 py-3 auth-input"
                        required
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
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full py-3 text-base font-semibold group auth-button" 
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 animate-spin" />
                        Signing In...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  {/* Google Sign In Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-3 text-base font-semibold group"
                    onClick={() => {
                      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`;
                    }}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                  
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowResetDialog(true)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="mt-8 pt-6 border-t border-border/50 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary font-semibold hover:underline transition-all hover:text-primary/80"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <p>© 2026 UniBridge. All rights reserved.</p>
        </motion.div>
        
        <PasswordResetDialog 
          open={showResetDialog} 
          onOpenChange={setShowResetDialog} 
        />
        
        <OTPVerificationDialog 
          open={showOTPDialog} 
          onOpenChange={setShowOTPDialog} 
          email={pendingUserEmail}
          onVerificationSuccess={(token) => {
            // Store the new token
            localStorage.setItem('token', token);
            // Get user data from the response and set it
            const userData = AuthService.getCurrentUserFromStorage();
            if (userData) {
              setUser(userData);
            }
            toast({
              title: "Success",
              description: "Account verified successfully! You can now access all features."
            });
            navigate("/");
          }}
        />
      </motion.div>
    </div>
  );
};

export default Auth;
