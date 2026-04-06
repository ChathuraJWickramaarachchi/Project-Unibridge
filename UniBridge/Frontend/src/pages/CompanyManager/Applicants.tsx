import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users, Search, Filter, RefreshCw, Mail, Eye, Briefcase,
  GraduationCap, Loader2, Phone, FileText, CheckCircle2,
  XCircle, Clock, Star, ChevronDown, ExternalLink,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const BACKEND_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5001";

interface Application {
  _id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  university: string;
  coverLetter?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  status: "Pending" | "Shortlisted" | "Rejected" | "Accepted";
  appliedDate: string;
  jobId?: {
    _id: string;
    title: string;
    type: string;
    location: string;
    departmentId?: { name: string };
  };
}

const STATUS_CFG: Record<string, { color: string; icon: React.ReactNode }> = {
  Pending:     { color: "bg-amber-100 text-amber-700 border-amber-200",  icon: <Clock className="w-3 h-3" /> },
  Shortlisted: { color: "bg-blue-100 text-blue-700 border-blue-200",     icon: <Star className="w-3 h-3" /> },
  Accepted:    { color: "bg-green-100 text-green-700 border-green-200",  icon: <CheckCircle2 className="w-3 h-3" /> },
  Rejected:    { color: "bg-red-100 text-red-700 border-red-200",        icon: <XCircle className="w-3 h-3" /> },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.Pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
      {cfg.icon}{status}
    </span>
  );
};

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const Applicants = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const jobsRes = await axios.get(`${API_URL}/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobs = jobsRes.data.data || [];
      const results = await Promise.all(
        jobs.map((job: any) =>
          axios
            .get(`${API_URL}/applications/job/${job._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((r) => (r.data.data || []).map((a: any) => ({ ...a, jobId: a.jobId || job })))
            .catch(() => [])
        )
      );
      setApplications(results.flat());
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const updateStatus = async (appId: string, status: string) => {
    try {
      setUpdatingId(appId);
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/applications/${appId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications((prev) =>
        prev.map((a) => a._id === appId ? { ...a, status: status as Application["status"] } : a)
      );
      if (selectedApp?._id === appId) {
        setSelectedApp((prev) => prev ? { ...prev, status: status as Application["status"] } : prev);
      }
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const uniqueJobs = useMemo(() => {
    const map = new Map<string, string>();
    applications.forEach((a) => { if (a.jobId?._id) map.set(a.jobId._id, a.jobId.title); });
    return Array.from(map.entries());
  }, [applications]);

  const filtered = useMemo(() =>
    applications.filter((a) => {
      const q = searchQuery.toLowerCase();
      return (
        (!q || a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) ||
          a.university?.toLowerCase().includes(q) || a.jobId?.title?.toLowerCase().includes(q)) &&
        (statusFilter === "all" || a.status.toLowerCase() === statusFilter.toLowerCase()) &&
        (jobFilter === "all" || a.jobId?._id === jobFilter)
      );
    }), [applications, searchQuery, statusFilter, jobFilter]);

  const stats = {
    total:       applications.length,
    pending:     applications.filter((a) => a.status === "Pending").length,
    shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    accepted:    applications.filter((a) => a.status === "Accepted").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Applicants</h2>
          <p className="text-muted-foreground">Manage and review job applications</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchApplications} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Applicants", value: stats.total,       icon: <Users className="w-4 h-4" />,        color: "text-primary" },
          { label: "Pending Review",   value: stats.pending,     icon: <Clock className="w-4 h-4" />,        color: "text-amber-500" },
          { label: "Shortlisted",      value: stats.shortlisted, icon: <Star className="w-4 h-4" />,         color: "text-blue-500" },
          { label: "Accepted",         value: stats.accepted,    icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <span className={s.color}>{s.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, university or job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        {uniqueJobs.length > 0 && (
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-[200px]">
              <Briefcase className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {uniqueJobs.map(([id, title]) => (
                <SelectItem key={id} value={id}>{title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {!loading && (
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {applications.length} applications
        </p>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {applications.length === 0 ? "No Applicants Yet" : "No Results Found"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            {applications.length === 0
              ? "When students apply to your job postings, they will appear here."
              : "Try adjusting your search or filters."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <Card
              key={app._id}
              className="hover:shadow-md transition-shadow cursor-pointer border-border/60"
              onClick={() => { setSelectedApp(app); setDetailOpen(true); }}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold text-sm">{getInitials(app.fullName)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-foreground">{app.fullName}</h4>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />{app.email}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />{app.university}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Job info */}
                  {app.jobId && (
                    <div className="hidden lg:flex flex-col gap-0.5 min-w-[160px]">
                      <span className="text-sm font-medium text-foreground truncate">{app.jobId.title}</span>
                      <span className="text-xs text-muted-foreground">{app.jobId.type} · {app.jobId.location}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(app.appliedDate)}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={app.status}
                      onValueChange={(v) => updateStatus(app._id, v)}
                      disabled={updatingId === app._id}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        {updatingId === app._id
                          ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          : <ChevronDown className="w-3 h-3 mr-1" />}
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="Accepted">Accepted</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); setSelectedApp(app); setDetailOpen(true); }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[92vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-lg">{getInitials(selectedApp.fullName)}</span>
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedApp.fullName}</DialogTitle>
                    <DialogDescription className="flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3" />{selectedApp.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedApp.status} />
                  <span className="text-xs text-muted-foreground">Applied {formatDate(selectedApp.appliedDate)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Contact</p>
                      <p className="text-sm font-medium">{selectedApp.contactNumber || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40">
                    <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">University</p>
                      <p className="text-sm font-medium">{selectedApp.university || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Applied For */}
                {selectedApp.jobId ? (
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Applied For</p>
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">{selectedApp.jobId.title || "Unknown Position"}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedApp.jobId.type || "—"}
                          {selectedApp.jobId.location && ` · ${selectedApp.jobId.location}`}
                          {selectedApp.jobId.departmentId?.name && ` · ${selectedApp.jobId.departmentId.name}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-border bg-muted/40">
                    <p className="text-xs text-muted-foreground">Job information not available</p>
                  </div>
                )}

                {selectedApp.coverLetter && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Cover Letter</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 rounded-lg p-3">
                      {selectedApp.coverLetter}
                    </p>
                  </div>
                )}

                {selectedApp.resumeUrl && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{selectedApp.resumeFileName || "Resume.pdf"}</p>
                        <p className="text-xs text-muted-foreground">PDF Document</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => window.open(`${BACKEND_BASE}${selectedApp.resumeUrl}`, "_blank")}
                    >
                      <ExternalLink className="w-3 h-3" /> View CV
                    </Button>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-sm font-semibold mb-3">Update Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Pending", "Shortlisted", "Accepted", "Rejected"] as const).map((s) => (
                      <Button
                        key={s}
                        variant={selectedApp.status === s ? "default" : "outline"}
                        size="sm"
                        className={`gap-1.5 ${s === "Rejected" && selectedApp.status !== "Rejected" ? "text-red-600 border-red-200 hover:bg-red-50" : ""}`}
                        disabled={updatingId === selectedApp._id}
                        onClick={() => updateStatus(selectedApp._id, s)}
                      >
                        {updatingId === selectedApp._id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : STATUS_CFG[s].icon}
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applicants;
