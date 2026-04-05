import { useState, useEffect } from "react";
import { jobService } from "@/services/jobService";
import { departmentService } from "@/services/departmentService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Briefcase,
  GraduationCap,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Search,
  Filter,
  Loader2,
  Building2,
  Clock,
  Star,
} from "lucide-react";

interface Department {
  _id: string;
  name: string;
  icon: string;
  color: string;
}

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
  isActive: boolean;
  isFeatured: boolean;
  applicantCount: number;
  daysRemaining: number;
  isExpired: boolean;
  createdAt: string;
}

const MAX_JOBS_PER_TYPE = 10;

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    departmentId: "",
    type: "Internship" as "Internship" | "Permanent",
    description: "",
    requirements: [""],
    responsibilities: [""],
    salary: "",
    location: "",
    deadline: "",
    positions: 1,
    isFeatured: false,
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterDepartment !== "all") params.department = filterDepartment;
      if (filterType !== "all") params.type = filterType;
      if (searchQuery) params.search = searchQuery;

      const response = await jobService.getJobs(params);
      if (response.success) {
        setJobs(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error: any) {
      toast.error("Failed to fetch departments");
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchJobs();
  }, [filterDepartment, filterType]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCreate = async () => {
    try {
      const response = await jobService.createJob({
        ...formData,
        requirements: formData.requirements.filter((r) => r.trim() !== ""),
        responsibilities: formData.responsibilities.filter((r) => r.trim() !== ""),
      });
      if (response.success) {
        toast.success("Job created successfully");
        setIsAddDialogOpen(false);
        resetForm();
        fetchJobs();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create job");
    }
  };

  const handleUpdate = async () => {
    if (!selectedJob) return;
    try {
      const response = await jobService.updateJob(selectedJob._id, {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements.filter((r) => r.trim() !== ""),
        responsibilities: formData.responsibilities.filter((r) => r.trim() !== ""),
        salary: formData.salary,
        location: formData.location,
        deadline: formData.deadline,
        positions: formData.positions,
        isFeatured: formData.isFeatured,
      });
      if (response.success) {
        toast.success("Job updated successfully");
        setIsEditDialogOpen(false);
        setSelectedJob(null);
        fetchJobs();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update job");
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    try {
      const response = await jobService.deleteJob(selectedJob._id);
      if (response.success) {
        toast.success("Job deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedJob(null);
        fetchJobs();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete job");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      departmentId: "",
      type: "Internship",
      description: "",
      requirements: [""],
      responsibilities: [""],
      salary: "",
      location: "",
      deadline: "",
      positions: 1,
      isFeatured: false,
    });
  };

  const openEditDialog = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      departmentId: job.departmentId._id,
      type: job.type,
      description: job.description,
      requirements: job.requirements.length > 0 ? job.requirements : [""],
      responsibilities: job.responsibilities?.length > 0 ? job.responsibilities : [""],
      salary: job.salary,
      location: job.location,
      deadline: job.deadline.split("T")[0],
      positions: job.positions,
      isFeatured: job.isFeatured,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const addRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ""] });
  };

  const removeRequirement = (index: number) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const addResponsibility = () => {
    setFormData({
      ...formData,
      responsibilities: [...formData.responsibilities, ""],
    });
  };

  const removeResponsibility = (index: number) => {
    const newResponsibilities = formData.responsibilities.filter((_, i) => i !== index);
    setFormData({ ...formData, responsibilities: newResponsibilities });
  };

  const updateResponsibility = (index: number, value: string) => {
    const newResponsibilities = [...formData.responsibilities];
    newResponsibilities[index] = value;
    setFormData({ ...formData, responsibilities: newResponsibilities });
  };

  const getJobCountsByDepartment = (deptId: string, type: string) => {
    return jobs.filter((j) => j.departmentId._id === deptId && j.type === type).length;
  };

  const stats = {
    total: jobs.length,
    internships: jobs.filter((j) => j.type === "Internship").length,
    permanent: jobs.filter((j) => j.type === "Permanent").length,
    featured: jobs.filter((j) => j.isFeatured).length,
    expired: jobs.filter((j) => j.isExpired).length,
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Job Management</h2>
          <p className="text-muted-foreground">
            Manage internship programs and job vacancies
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Post New Job</DialogTitle>
              <DialogDescription>
                Create a new internship or job posting. Maximum 10 positions per type per department.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Software Engineer Intern"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Job Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "Internship" | "Permanent") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, departmentId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => {
                      const count = getJobCountsByDepartment(dept._id, formData.type);
                      const isFull = count >= MAX_JOBS_PER_TYPE;
                      return (
                        <SelectItem
                          key={dept._id}
                          value={dept._id}
                          disabled={isFull}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{dept.name}</span>
                            <span
                              className={`text-xs ml-2 ${
                                isFull ? "text-destructive" : "text-muted-foreground"
                              }`}
                            >
                              ({count}/{MAX_JOBS_PER_TYPE})
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Colombo, Sri Lanka"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (Optional)</Label>
                  <Input
                    id="salary"
                    placeholder="e.g., Rs. 50,000/month"
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="positions">Number of Positions</Label>
                  <Input
                    id="positions"
                    type="number"
                    min={1}
                    value={formData.positions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        positions: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Requirements</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRequirement}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Requirement ${index + 1}`}
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                      />
                      {formData.requirements.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRequirement(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Responsibilities</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addResponsibility}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.responsibilities.map((resp, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Responsibility ${index + 1}`}
                        value={resp}
                        onChange={(e) => updateResponsibility(index, e.target.value)}
                      />
                      {formData.responsibilities.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeResponsibility(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured Job</Label>
                <Switch
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeatured: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  !formData.title ||
                  !formData.departmentId ||
                  !formData.location ||
                  !formData.deadline ||
                  !formData.description
                }
              >
                Post Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jobs
            </CardTitle>
            <Briefcase className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Internships
            </CardTitle>
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.internships}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Permanent
            </CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.permanent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Featured
            </CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featured}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept._id} value={dept._id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
              <SelectItem value="Permanent">Permanent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="p-8 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filterDepartment !== "all" || filterType !== "all"
              ? "Try adjusting your filters"
              : "Get started by posting your first job"}
          </p>
          {!searchQuery && filterDepartment === "all" && filterType === "all" && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post Job
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <Card
              key={job._id}
              className={`group hover:shadow-lg transition-all duration-300 ${
                job.isFeatured ? "border-primary/50 ring-1 ring-primary/20" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base truncate">{job.title}</CardTitle>
                      {job.isFeatured && (
                        <Badge variant="default" className="text-[10px]">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      <span>{job.departmentId?.name}</span>
                      <span>•</span>
                      <Badge
                        variant={job.type === "Internship" ? "secondary" : "outline"}
                        className="text-[10px]"
                      >
                        {job.type === "Internship" ? (
                          <GraduationCap className="w-3 h-3 mr-1" />
                        ) : (
                          <Briefcase className="w-3 h-3 mr-1" />
                        )}
                        {job.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(job)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(job)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {job.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </span>
                  {job.salary && job.salary !== "Negotiable" && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {job.salary}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {job.positions} position{job.positions > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={job.isExpired ? "destructive" : "outline"}
                      className="text-[10px]"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {job.isExpired
                        ? "Expired"
                        : `${job.daysRemaining} days left`}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {job.applicantCount} applicant
                      {job.applicantCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update job posting details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Job Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-salary">Salary</Label>
                <Input
                  id="edit-salary"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-deadline">Deadline</Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-positions">Positions</Label>
                <Input
                  id="edit-positions"
                  type="number"
                  min={1}
                  value={formData.positions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      positions: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-featured">Featured Job</Label>
              <Switch
                id="edit-featured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedJob?.title}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Jobs;
