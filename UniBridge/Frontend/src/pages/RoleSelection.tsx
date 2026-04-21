import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { GraduationCap, Building2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "employer" | null>(null);

  // If user already has a role set (not default student with placeholder phone), redirect to home
  useEffect(() => {
    if (user) {
      const isSetupComplete = user.authProvider !== 'google' || 
                             user.role !== 'student' || 
                             (user.phone && user.phone !== '+1-000-000-0000');
      
      if (isSetupComplete) {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleRoleSelection = async (role: "student" | "employer") => {
    setSelectedRole(role);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/users/update-role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Update user in context
        setUser(data.data);
        
        toast({
          title: "Role Selected",
          description: role === "student" 
            ? "Welcome! You're registered as a student." 
            : "Your employer account is pending approval.",
        });

        // Redirect based on role
        if (role === "employer") {
          navigate("/pending-approval");
        } else {
          navigate("/");
        }
      } else {
        throw new Error(data.error || "Failed to update role");
      }
    } catch (error: any) {
      console.error("Role selection error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to select role. Please try again.",
        variant: "destructive",
      });
      setSelectedRole(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-2 border-primary/20">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-heading font-bold text-foreground mb-2">
              Choose Your Account Type
            </CardTitle>
            <CardDescription className="text-lg">
              How will you be using UniBridge?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Student Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-6 flex flex-col items-center gap-4 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                  onClick={() => handleRoleSelection("student")}
                  disabled={loading}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-1">Student</h3>
                    <p className="text-sm text-muted-foreground">
                      Take exams, build your CV, and find opportunities
                    </p>
                  </div>
                </Button>
              </motion.div>

              {/* Employer Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-6 flex flex-col items-center gap-4 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                  onClick={() => handleRoleSelection("employer")}
                  disabled={loading}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-1">Employer</h3>
                    <p className="text-sm text-muted-foreground">
                      Post jobs, manage applications, and hire talent
                    </p>
                  </div>
                </Button>
              </motion.div>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Setting up your account...</span>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>
                <strong>Student:</strong> Access exams, build CVs, apply for jobs
              </p>
              <p className="mt-1">
                <strong>Employer:</strong> Create job postings, review applicants, conduct exams
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
