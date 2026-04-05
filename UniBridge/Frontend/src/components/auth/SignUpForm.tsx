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
} from "@/lib/validation";

const SignUpForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    const firstNameValidation = validateName(firstName.trim(), "First name");
    const lastNameValidation = validateName(lastName.trim(), "Last name");
    const emailValidation = validateEmail(email.trim());
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
    
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
    
    if (!confirmPasswordValidation.isValid) {
      toast({
        title: "Validation Error",
        description: confirmPasswordValidation.error,
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
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              onBlur={(e) => {
                const validation = validateConfirmPassword(password, e.target.value);
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