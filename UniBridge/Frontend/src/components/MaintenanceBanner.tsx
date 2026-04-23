import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, X, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const MaintenanceBanner = () => {
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchActiveMaintenance();
    // Check every 5 minutes for new maintenance
    const interval = setInterval(fetchActiveMaintenance, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveMaintenance = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/maintenance/active`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setMaintenance(data.data);
          setDismissed(false);
        }
      }
    } catch (error) {
      console.error("Error fetching maintenance:", error);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleViewDetails = () => {
    navigate("/maintenance-info");
  };

  const getBannerColor = (severity) => {
    const colors = {
      low: "bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-100",
      medium: "bg-yellow-100 border-yellow-300 text-yellow-900 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-100",
      high: "bg-orange-100 border-orange-300 text-orange-900 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-100",
      critical: "bg-red-100 border-red-300 text-red-900 dark:bg-red-900/30 dark:border-red-700 dark:text-red-100",
    };
    return colors[severity] || colors.medium;
  };

  if (!maintenance || dismissed) {
    return null;
  }

  const startTime = new Date(maintenance.scheduledStartTime);
  const endTime = new Date(maintenance.scheduledEndTime);
  const now = new Date();
  
  const timeUntilStart = startTime.getTime() - now.getTime();
  const isCurrentlyActive = timeUntilStart <= 0 && now.getTime() <= endTime.getTime();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`border-b ${getBannerColor(maintenance.severity)}`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
              
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">{maintenance.title}</p>
                <p className="text-xs opacity-90 line-clamp-1">{maintenance.description}</p>
                
                <div className="flex items-center gap-4 mt-1 text-xs opacity-75">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {startTime.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {startTime.toLocaleTimeString()} - {endTime.toLocaleTimeString()}
                  </span>
                  {isCurrentlyActive && (
                    <span className="font-bold text-red-600 dark:text-red-400 animate-pulse">
                      🔴 ACTIVE NOW
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewDetails}
                className="text-xs"
              >
                View Details
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MaintenanceBanner;
