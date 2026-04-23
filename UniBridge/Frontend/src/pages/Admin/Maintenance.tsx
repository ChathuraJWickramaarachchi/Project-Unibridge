import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Send, Power } from "lucide-react";
import { format } from "date-fns";

const MaintenanceManagement = () => {
  const [loading, setLoading] = useState(false);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "scheduled",
    severity: "medium",
    scheduledStartTime: "",
    scheduledEndTime: "",
    affectedUsers: ["all"],
    sendEmailNow: false,
  });

  useEffect(() => {
    fetchMaintenanceList();
    fetchStats();
  }, []);

  const fetchMaintenanceList = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/maintenance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMaintenanceList(data.data);
      }
    } catch (error) {
      console.error("Error fetching maintenance list:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/maintenance/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/maintenance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Maintenance notification created successfully!",
        });
        
        setShowForm(false);
        setFormData({
          title: "",
          description: "",
          type: "scheduled",
          severity: "medium",
          scheduledStartTime: "",
          scheduledEndTime: "",
          affectedUsers: ["all"],
          sendEmailNow: false,
        });
        
        fetchMaintenanceList();
        fetchStats();
      } else {
        throw new Error(data.error || "Failed to create maintenance");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/maintenance/${id}/activate`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Maintenance mode activated!",
        });
        fetchMaintenanceList();
        fetchStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate maintenance mode",
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/maintenance/${id}/deactivate`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Maintenance mode deactivated!",
        });
        fetchMaintenanceList();
        fetchStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate maintenance mode",
        variant: "destructive",
      });
    }
  };

  const handleSendEmails = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/maintenance/${id}/send-emails`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });
        fetchMaintenanceList();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: "bg-blue-500",
      medium: "bg-yellow-500",
      high: "bg-orange-500",
      critical: "bg-red-500",
    };
    return colors[severity] || "bg-gray-500";
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: <Badge variant="outline">📅 Scheduled</Badge>,
      active: <Badge className="bg-green-500">🔴 Active</Badge>,
      completed: <Badge variant="secondary">✅ Completed</Badge>,
      cancelled: <Badge variant="destructive">❌ Cancelled</Badge>,
    };
    return badges[status] || <Badge>Unknown</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Management</h1>
          <p className="text-muted-foreground">Schedule and manage system maintenance</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Schedule Maintenance"}
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Next 24h</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.upcoming24h}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Maintenance Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Maintenance</CardTitle>
            <CardDescription>Create a maintenance notification and optionally send emails</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="System Maintenance"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">📅 Scheduled</SelectItem>
                      <SelectItem value="urgent">⚠️ Urgent</SelectItem>
                      <SelectItem value="emergency">🚨 Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what will happen during maintenance..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.scheduledStartTime}
                    onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.scheduledEndTime}
                    onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => setFormData({ ...formData, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">ℹ️ Low</SelectItem>
                      <SelectItem value="medium">⚠️ Medium</SelectItem>
                      <SelectItem value="high">🔶 High</SelectItem>
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="affectedUsers">Affected Users</Label>
                  <Select
                    value={formData.affectedUsers[0]}
                    onValueChange={(value) => setFormData({ ...formData, affectedUsers: [value] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">👥 All Users</SelectItem>
                      <SelectItem value="student">🎓 Students Only</SelectItem>
                      <SelectItem value="employer">🏢 Employers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendEmailNow"
                  checked={formData.sendEmailNow}
                  onChange={(e) => setFormData({ ...formData, sendEmailNow: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="sendEmailNow">Send email notifications now</Label>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {formData.sendEmailNow ? "Create & Send Emails" : "Create Maintenance"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Maintenance List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Maintenance History</h2>
        {maintenanceList.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No maintenance notifications yet
            </CardContent>
          </Card>
        ) : (
          maintenanceList.map((maintenance) => (
            <Card key={maintenance._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(maintenance.severity)}`} />
                      <CardTitle>{maintenance.title}</CardTitle>
                      {getStatusBadge(maintenance.status)}
                      {maintenance.isMaintenanceMode && (
                        <Badge className="bg-red-600 animate-pulse">🔴 MAINTENANCE MODE</Badge>
                      )}
                    </div>
                    <CardDescription>{maintenance.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start Time</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(maintenance.scheduledStartTime), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Time</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(maintenance.scheduledEndTime), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Severity</p>
                    <p className="font-medium capitalize">{maintenance.severity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Emails Sent</p>
                    <p className="font-medium">{maintenance.emailSent ? "✅ Yes" : "❌ No"}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {maintenance.status === "scheduled" && !maintenance.isMaintenanceMode && (
                    <Button
                      size="sm"
                      onClick={() => handleActivate(maintenance._id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Power className="w-4 h-4 mr-1" />
                      Activate Mode
                    </Button>
                  )}
                  {maintenance.isMaintenanceMode && (
                    <Button
                      size="sm"
                      onClick={() => handleDeactivate(maintenance._id)}
                      variant="destructive"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Deactivate Mode
                    </Button>
                  )}
                  {!maintenance.emailSent && maintenance.status === "scheduled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendEmails(maintenance._id)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Send Emails
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MaintenanceManagement;
