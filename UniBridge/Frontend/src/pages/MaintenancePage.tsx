import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wrench, Clock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const MaintenancePage = () => {
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    fetchMaintenanceInfo();
    
    // Update countdown every minute
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchMaintenanceInfo = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/maintenance/check`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data.isMaintenanceMode && data.data.maintenance) {
          setMaintenance(data.data.maintenance);
        }
      }
    } catch (error) {
      console.error("Error fetching maintenance info:", error);
    }
  };

  const updateCountdown = () => {
    if (!maintenance) return;

    const endTime = new Date(maintenance.estimatedCompletion);
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining("Maintenance should be completed soon. Please refresh the page.");
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setTimeRemaining(`${hours}h ${minutes}m`);
  };

  useEffect(() => {
    updateCountdown();
  }, [maintenance]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Wrench className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              System Maintenance
            </h1>
            <p className="text-white/90">We're making UniBridge better for you</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {maintenance && (
              <>
                <div className="bg-muted/50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-2">{maintenance.title}</h2>
                  <p className="text-muted-foreground">{maintenance.description}</p>
                </div>

                {/* Countdown */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Estimated Time Remaining
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 text-center">
                    {timeRemaining}
                  </p>
                </div>
              </>
            )}

            {!maintenance && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                      System Under Maintenance
                    </h3>
                    <p className="text-yellow-800 dark:text-yellow-200">
                      Our system is currently undergoing scheduled maintenance. 
                      We're working to bring everything back online as soon as possible.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* What to do */}
            <div className="space-y-3">
              <h3 className="font-semibold">What can you do?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  <span>Check back later - we're working fast!</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  <span>Refresh the page to check if maintenance is complete</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  <span>Contact support if you have urgent questions</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" />
                <span>
                  Need help? Contact us at{" "}
                  <a href="mailto:support@unibridge.com" className="text-primary underline">
                    support@unibridge.com
                  </a>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleRefresh} className="flex-1">
                Refresh Page
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="flex-1">
                Try Home Page
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-muted/30 px-8 py-4 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} UniBridge. We apologize for any inconvenience.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
