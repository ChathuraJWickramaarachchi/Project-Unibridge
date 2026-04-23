import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { validateEmail, validatePassword } from "@/lib/validation";
import PasswordResetDialog from "./PasswordResetDialog";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

interface FieldErrors {
  email?: string;
  password?: string;
}

interface TouchedFields {
  email: boolean;
  password: boolean;
}

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    password: false,
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateField = (name: string, value: string) => {
    let error: string | undefined;
    
    switch (name) {
      case 'email':
        const emailVal = validateEmail(value.trim());
        error = emailVal.isValid ? undefined : emailVal.error;
        break;
      case 'password':
        const passwordVal = validatePassword(value);
        error = passwordVal.isValid ? undefined : passwordVal.error;
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });
    
    // Validate all fields
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    
    // Check if any validation failed
    if (emailError || passwordError) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const result = await login(email.trim(), password);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Signed in successfully!"
        });
        
        // Check if user is a pending employer
        const user = result.data?.user;
        const isPendingEmployer = user?.role === 'employer' && user?.isApproved === false;
        
        if (isPendingEmployer) {
          navigate("/pending-approval");
        } else {
          navigate("/");
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to sign in",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email', email)}
              className={touched.email && errors.email ? "border-red-500 focus-visible:ring-red-500" : touched.email && !errors.email && email ? "border-green-500" : ""}
              required
            />
            {touched.email && errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
            {touched.email && !errors.email && email && (
              <p className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Valid email
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password', password)}
                className={touched.password && errors.password ? "border-red-500 focus-visible:ring-red-500 pr-10" : touched.password && !errors.password && password ? "border-green-500 pr-10" : "pr-10"}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {errors.password}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/auth" className="underline">
              Sign up
            </Link>
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <div className="text-center">
            <Button 
              type="button"
              variant="ghost" 
              className="p-0 h-auto text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
              onClick={() => setShowResetDialog(true)}
            >
              Forgot your password?
            </Button>
          </div>
        </CardFooter>
      </form>
      <PasswordResetDialog 
        open={showResetDialog} 
        onOpenChange={setShowResetDialog} 
      />
    </Card>
  );
};

export default SignInForm;