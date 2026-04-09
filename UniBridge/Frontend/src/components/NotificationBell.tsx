import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Bell, CheckCheck, Trash2, Briefcase, Star, Info, Calendar, Clock, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import examService from "@/services/examService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "application" | "status_update" | "exam" | "general";
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifIcon({ type }: { type: string }) {
  if (type === "application") return <Briefcase className="w-4 h-4 text-primary" />;
  if (type === "status_update") return <Star className="w-4 h-4 text-amber-500" />;
  if (type === "exam") return <Calendar className="w-4 h-4 text-purple-500" />;
  return <Info className="w-4 h-4 text-blue-500" />;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/notifications/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // silent fail
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/notifications/read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const removed = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (removed && !removed.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    
    if (notif.type === "exam" && notif.relatedId) {
      try {
        const res = await examService.getExamById(notif.relatedId);
        if (res.success) {
          setSelectedExam(res.data);
          setIsExamDialogOpen(true);
          setOpen(false);
        }
      } catch (err) {
        toast.error("Failed to load exam details.");
      }
    }
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 h-9 w-9"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground px-2"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Bell className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground">No notifications yet</p>
              </div>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`group flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors cursor-pointer
                  ${notif.isRead ? "hover:bg-accent/40" : "bg-primary/5 hover:bg-primary/10"}`}
              >
                {/* Icon */}
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${notif.isRead ? "bg-muted" : "bg-primary/10"}`}>
                  <NotifIcon type={notif.type} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${notif.isRead ? "text-foreground/80" : "font-semibold text-foreground"}`}>
                      {notif.title}
                    </p>
                    <button
                      onClick={(e) => deleteNotif(notif._id, e)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0 mt-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">{timeAgo(notif.createdAt)}</span>
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Exam Schedule Details
          </DialogTitle>
        </DialogHeader>
        
        {selectedExam && (
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4" /> Position
              </h4>
              <p className="font-medium text-lg">{selectedExam.jobId?.title || "N/A"}</p>
              <p className="text-sm text-muted-foreground">
                {selectedExam.companyId?.company || `${selectedExam.companyId?.firstName} ${selectedExam.companyId?.lastName}`}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-y border-border py-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" /> Date
                </h4>
                <p className="font-medium">
                  {new Date(selectedExam.examDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4" /> Time
                </h4>
                <p className="font-medium">{selectedExam.examTime}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" /> Location
              </h4>
              <p className="font-medium">{selectedExam.location?.type}</p>
              {selectedExam.location?.address && (
                <p className="text-sm text-muted-foreground mt-1">{selectedExam.location.address}</p>
              )}
            </div>

            {selectedExam.instructions && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4" /> Instructions
                </h4>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md border border-border">
                  {selectedExam.instructions}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
