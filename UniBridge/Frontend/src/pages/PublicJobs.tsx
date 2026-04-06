import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Search, MapPin, DollarSign, Clock, Building2, Briefcase,
  GraduationCap, ArrowRight, Sparkles, CheckCircle2, Loader2,
  LayoutGrid, LayoutList, ChevronLeft, ChevronRight, Filter,
  X, Monitor, Code2, CheckCircle, Users, Network, Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ApplyModal from "@/components/ApplyModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const ITEMS_PER_PAGE = 8;

const DEPARTMENTS = ["All", "IT", "Software Engineering", "Quality Assurance", "Human Resources", "Networking"];
const JOB_TYPES = ["All", "Internship", "Permanent"];

const deptColors: Record<string, string> = {
  IT: "bg-blue-100 text-blue-700 border-blue-200",
  "Software Engineering": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Quality Assurance": "bg-amber-100 text-amber-700 border-amber-200",
  "Human Resources": "bg-pink-100 text-pink-700 border-pink-200",
  Networking: "bg-violet-100 text-violet-700 border-violet-200",
};

const deptGradients: Record<string, string> = {
  IT: "from-blue-500/10 to-cyan-500/10 border-blue-200",
  "Software Engineering": "from-emerald-500/10 to-teal-500/10 border-emerald-200",
  "Quality Assurance": "from-amber-500/10 to-orange-500/10 border-amber-200",
  "Human Resources": "from-pink-500/10 to-rose-500/10 border-pink-200",
  Networking: "from-violet-500/10 to-purple-500/10 border-violet-200",
};

interface Department { _id: string; name: string; icon: string; color: string; }

interface Job {
  _id: string;
  title: string;
  departmentId: Department;
  type: "Internship" | "Permanent";
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary: string;
  location: string;
  deadline: string;
  positions: number;
  isFeatured: boolean;
  daysRemaining: number;
  isExpired: boolean;
  createdAt: string;
  companyId?: { firstName: string; lastName: string; email: string };
}

const DeptBadge = ({ name }: { name: string }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${deptColors[name] || "bg-secondary text-secondary-foreground border-border"}`}>
    {name}
  </span>
);

const TypeBadge = ({ type }: { type: string }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${type === "Internship" ? "bg-sky-100 text-sky-700 border border-sky-200" : "bg-indigo-100 text-indigo-700 border border-indigo-200"}`}>
    {type === "Internship" ? <GraduationCap className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
    {type}
  </span>
);

const DeadlineBadge = ({ days, expired }: { days: number; expired: boolean }) => (
  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${expired ? "bg-red-100 text-red-600" : days <= 7 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-700"}`}>
    <Clock className="w-3 h-3" />
    {expired ? "Expired" : `${days}d left`}
  </span>
);

export default function PublicJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/jobs/public`);
        if (res.data.success) setJobs(res.data.data);
      } catch {
        toast.error("Failed to fetch jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, deptFilter, typeFilter]);

  const filtered = useMemo(() => jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || job.title.toLowerCase().includes(q) || job.location?.toLowerCase().includes(q) || job.departmentId?.name?.toLowerCase().includes(q);
    const matchDept = deptFilter === "All" || job.departmentId?.name === deptFilter;
    const matchType = typeFilter === "All" || job.type === typeFilter;
    return matchSearch && matchDept && matchType;
  }), [jobs, searchQuery, deptFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const hasFilters = searchQuery || deptFilter !== "All" || typeFilter !== "All";

  const getCompany = (job: Job) =>
    job.companyId ? `${job.companyId.firstName} ${job.companyId.lastName}` : "UniBridge Partner";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const openDetail = (job: Job) => { setSelectedJob(job); setIsDetailOpen(true); };

  const openApply = (job: Job, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) { toast.error("Please sign in to apply for jobs"); return; }
    setSelectedJob(job);
    setIsDetailOpen(false);
    setIsApplyOpen(true);
  };

  const handleApplySuccess = () => {
    if (selectedJob) {
      setAppliedJobIds((prev) => new Set([...prev, selectedJob._id]));
    }
    setIsApplyOpen(false);
    toast.success("Application submitted! Check your notifications.");
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-14 border-b border-border/50 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
            <Sparkles className="w-4 h-4" />
            Find Your Dream Career
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            Discover{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Amazing Opportunities
            </span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Browse internships and permanent positions from top companies, tailored for university students.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search job title, department, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-10 h-12 text-base rounded-xl shadow-md border-border bg-card"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-border/50 py-4">
            {[
              { label: "Total Positions", value: jobs.length },
              { label: "Internships", value: jobs.filter((j) => j.type === "Internship").length },
              { label: "Permanent Jobs", value: jobs.filter((j) => j.type === "Permanent").length },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-4">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTERS & VIEW TOGGLE ── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Left – Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filter:</span>
            </div>

            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[190px] h-9 text-sm">
                <Building2 className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <Briefcase className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setDeptFilter("All"); setTypeFilter("All"); }} className="h-9 text-muted-foreground gap-1">
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>

          {/* Right – Count + View Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
            </span>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 transition-colors ${viewMode === "table" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                title="Table View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <span>Loading opportunities...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-9 h-9 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">No jobs found</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                We couldn't find any matching positions. Try adjusting your search or filters.
              </p>
            </div>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setDeptFilter("All"); setTypeFilter("All"); }}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : viewMode === "table" ? (

          /* ── TABLE VIEW ── */
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold text-foreground min-w-[180px]">Job Title</TableHead>
                    <TableHead className="font-semibold text-foreground">Department</TableHead>
                    <TableHead className="font-semibold text-foreground">Type</TableHead>
                    <TableHead className="font-semibold text-foreground hidden lg:table-cell">Company</TableHead>
                    <TableHead className="font-semibold text-foreground hidden md:table-cell">Location</TableHead>
                    <TableHead className="font-semibold text-foreground hidden xl:table-cell">Salary</TableHead>
                    <TableHead className="font-semibold text-foreground hidden md:table-cell">Deadline</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((job, idx) => (
                    <TableRow
                      key={job._id}
                      className={`hover:bg-accent/40 transition-colors cursor-pointer ${idx % 2 === 0 ? "" : "bg-muted/10"} ${job.isFeatured ? "border-l-2 border-l-primary" : ""}`}
                      onClick={() => openDetail(job)}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm">{job.title}</span>
                          {job.isFeatured && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium mt-0.5">
                              <Sparkles className="w-3 h-3" /> Featured
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell><DeptBadge name={job.departmentId?.name || "—"} /></TableCell>
                      <TableCell><TypeBadge type={job.type} /></TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{getCompany(job)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salary || "Negotiable"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(job.deadline)}
                        </div>
                      </TableCell>
                      <TableCell><DeadlineBadge days={job.daysRemaining ?? 0} expired={job.isExpired} /></TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant={job.isExpired ? "outline" : "default"}
                          disabled={job.isExpired || appliedJobIds.has(job._id)}
                          onClick={(e) => { e.stopPropagation(); appliedJobIds.has(job._id) ? null : (user ? openApply(job, e) : openDetail(job)); }}
                          className="gap-1 h-8 text-xs whitespace-nowrap"
                        >
                          {job.isExpired ? "Closed" : appliedJobIds.has(job._id) ? (
                            <><CheckCircle2 className="w-3 h-3" /> Applied</>
                          ) : user ? (
                            <>Apply <ArrowRight className="w-3 h-3" /></>
                          ) : (
                            <>View <ArrowRight className="w-3 h-3" /></>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        ) : (
          /* ── GRID VIEW ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginated.map((job) => (
              <Card
                key={job._id}
                onClick={() => openDetail(job)}
                className={`group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border bg-gradient-to-br ${deptGradients[job.departmentId?.name] || "from-secondary/20 to-secondary/5 border-border"} ${job.isFeatured ? "ring-1 ring-primary/40" : ""}`}
              >
                <CardContent className="p-5">
                  {job.isFeatured && (
                    <div className="flex items-center gap-1 text-[10px] text-primary font-semibold mb-2">
                      <Sparkles className="w-3 h-3" /> FEATURED
                    </div>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-card shadow-sm flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">{job.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{getCompany(job)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <DeptBadge name={job.departmentId?.name || "—"} />
                    <TypeBadge type={job.type} />
                  </div>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />{job.location}
                    </div>
                    {job.salary && job.salary !== "Negotiable" && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <DollarSign className="w-3 h-3 shrink-0" />{job.salary}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 shrink-0" />Deadline: {formatDate(job.deadline)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <DeadlineBadge days={job.daysRemaining ?? 0} expired={job.isExpired} />
                    <Button
                      size="sm"
                      variant={job.isExpired ? "outline" : "default"}
                      disabled={job.isExpired}
                      className="h-7 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {job.isExpired ? "Closed" : "View"} <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <span className="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} jobs
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-9 px-3"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span key={`dots-${idx}`} className="px-2 py-1 text-sm text-muted-foreground">…</span>
                    ) : (
                      <Button
                        key={p}
                        variant={currentPage === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(p as number)}
                        className="h-9 w-9 p-0"
                      >
                        {p}
                      </Button>
                    )
                  )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-9 px-3"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* ── JOB DETAIL DIALOG ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl leading-tight">{selectedJob.title}</DialogTitle>
                    <DialogDescription className="flex flex-wrap items-center gap-2 mt-1">
                      <span>{getCompany(selectedJob)}</span>
                      <span>•</span>
                      <DeptBadge name={selectedJob.departmentId?.name || "—"} />
                      <TypeBadge type={selectedJob.type} />
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 py-2">
                {/* Meta */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: <MapPin className="w-3.5 h-3.5" />, label: selectedJob.location },
                    { icon: <DollarSign className="w-3.5 h-3.5" />, label: selectedJob.salary || "Negotiable" },
                    { icon: <Calendar className="w-3.5 h-3.5" />, label: `Deadline: ${new Date(selectedJob.deadline).toLocaleDateString()}` },
                    { icon: <Users className="w-3.5 h-3.5" />, label: `${selectedJob.positions} position${selectedJob.positions !== 1 ? "s" : ""}` },
                  ].map((item, i) => (
                    <Badge key={i} variant="outline" className="gap-1.5 font-normal py-1">
                      {item.icon}{item.label}
                    </Badge>
                  ))}
                  <DeadlineBadge days={selectedJob.daysRemaining ?? 0} expired={selectedJob.isExpired} />
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">About the Role</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                {/* Requirements */}
                {selectedJob.requirements?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Requirements</h4>
                    <ul className="space-y-1.5">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Responsibilities */}
                {selectedJob.responsibilities?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Responsibilities</h4>
                    <ul className="space-y-1.5">
                      {selectedJob.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => openApply(selectedJob)}
                  disabled={selectedJob.isExpired || (appliedJobIds.has(selectedJob._id))}
                >
                  {appliedJobIds.has(selectedJob._id) ? (
                    <><CheckCircle2 className="w-4 h-4" /> Applied</>
                  ) : selectedJob.isExpired ? (
                    "Application Closed"
                  ) : !user ? (
                    "Sign In to Apply"
                  ) : (
                    <>Apply Now <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── APPLY MODAL ── */}
      <ApplyModal
        job={selectedJob}
        open={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSuccess={handleApplySuccess}
      />
    </div>
  );
}
