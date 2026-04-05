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

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    const emailValidation = validateEmail(email.trim());
    const passwordValidation = validatePassword(password);
    
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
    
    setLoading(true);

    try {
      const result = await login(email.trim(), password);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Signed in successfully!"
        });
        navigate("/");
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
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