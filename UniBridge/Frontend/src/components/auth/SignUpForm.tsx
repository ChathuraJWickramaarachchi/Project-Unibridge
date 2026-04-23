import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from "@/lib/validation";
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface TouchedFields {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
}

const SignUpForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const navigate = useNavigate();
  const { register } = useAuth();

  const validateField = (name: string, value: string) => {
    let error: string | undefined;
    
    switch (name) {
      case 'firstName':
        const firstNameVal = validateName(value.trim(), "First name");
        error = firstNameVal.isValid ? undefined : firstNameVal.error;
        break;
      case 'lastName':
        const lastNameVal = validateName(value.trim(), "Last name");
        error = lastNameVal.isValid ? undefined : lastNameVal.error;
        break;
      case 'email':
        const emailVal = validateEmail(value.trim());
        error = emailVal.isValid ? undefined : emailVal.error;
        break;
      case 'password':
        const passwordVal = validatePassword(value);
        error = passwordVal.isValid ? undefined : passwordVal.error;
        break;
      case 'confirmPassword':
        const confirmVal = validateConfirmPassword(password, value);
        error = confirmVal.isValid ? undefined : confirmVal.error;
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
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    
    // Validate all fields
    const firstNameError = validateField('firstName', firstName);
    const lastNameError = validateField('lastName', lastName);
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    const confirmPasswordError = validateField('confirmPassword', confirmPassword);
    
    // Check if any validation failed
    if (firstNameError || lastNameError || emailError || passwordError || confirmPasswordError) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role: "student"
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to verify your account."
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create account",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => handleBlur('firstName', firstName)}
                className={touched.firstName && errors.firstName ? "border-red-500 focus-visible:ring-red-500" : touched.firstName && !errors.firstName && firstName ? "border-green-500" : ""}
                required
              />
              {touched.firstName && errors.firstName && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.firstName}
                </p>
              )}
              {touched.firstName && !errors.firstName && firstName && (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Valid
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => handleBlur('lastName', lastName)}
                className={touched.lastName && errors.lastName ? "border-red-500 focus-visible:ring-red-500" : touched.lastName && !errors.lastName && lastName ? "border-green-500" : ""}
                required
              />
              {touched.lastName && errors.lastName && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.lastName}
                </p>
              )}
              {touched.lastName && !errors.lastName && lastName && (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Valid
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@university.edu"
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
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((level) => {
                    const passwordValidation = validatePassword(password);
                    const strength = passwordValidation.strength || 0;
                    return (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= strength
                            ? strength <= 1 ? "bg-red-500" : strength === 2 ? "bg-orange-500" : strength === 3 ? "bg-yellow-500" : "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    );
                  })}
                </div>
                <p className={`text-xs ${getPasswordStrengthColor(validatePassword(password).strength || 0)}`}>
                  Password strength: {getPasswordStrengthLabel(validatePassword(password).strength || 0)}
                </p>
              </div>
            )}
            {touched.password && errors.password && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {errors.password}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword', confirmPassword)}
                className={touched.confirmPassword && errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500 pr-10" : touched.confirmPassword && !errors.confirmPassword && confirmPassword ? "border-green-500 pr-10" : "pr-10"}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {errors.confirmPassword}
              </p>
            )}
            {touched.confirmPassword && !errors.confirmPassword && confirmPassword && (
              <p className="text-xs text-green-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Passwords match
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/auth" className="underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignUpForm;