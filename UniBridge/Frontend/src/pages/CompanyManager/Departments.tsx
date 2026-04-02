import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Monitor,
  Code2,
  CheckCircle,
  Users,
  Network,
  Briefcase,
  GraduationCap,
  Loader2,
} from "lucide-react";

const departmentOptions = [
  { value: "IT", label: "IT", icon: Monitor },
  { value: "Software Engineering", label: "Software Engineering", icon: Code2 },
  { value: "Quality Assurance", label: "Quality Assurance", icon: CheckCircle },
  { value: "Human Resources", label: "Human Resources", icon: Users },
  { value: "Networking", label: "Networking", icon: Network },
];

const departmentColors: Record<string, string> = {
  IT: "bg-blue-500/10 text-blue-600 border-blue-200",
  "Software Engineering": "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  "Quality Assurance": "bg-amber-500/10 text-amber-600 border-amber-200",
  "Human Resources": "bg-pink-500/10 text-pink-600 border-pink-200",
  Networking: "bg-violet-500/10 text-violet-600 border-violet-200",
};

interface Department {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  internshipCount: number;
  jobCount: number;
  totalPositions: number;
  createdAt: string;
}

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async () => {
    try {
      const response = await departmentService.createDepartment(formData);
      if (response.success) {
        toast.success("Department created successfully");
        setIsAddDialogOpen(false);
        setFormData({ name: "", description: "", isActive: true });
        fetchDepartments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create department");
    }
  };

  const handleUpdate = async () => {
    if (!selectedDepartment) return;
    try {
      const response = await departmentService.updateDepartment(selectedDepartment._id, {
        description: formData.description,
        isActive: formData.isActive,
      });
      if (response.success) {
        toast.success("Department updated successfully");
        setIsEditDialogOpen(false);
        setSelectedDepartment(null);
        fetchDepartments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update department");
    }
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;
    try {
      const response = await departmentService.deleteDepartment(selectedDepartment._id);
      if (response.success) {
        toast.success("Department deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedDepartment(null);
        fetchDepartments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete department");
    }
  };

  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      isActive: department.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const getDepartmentIcon = (iconName: string) => {
    switch (iconName) {
      case "Monitor":
        return <Monitor className="w-5 h-5" />;
      case "Code2":
        return <Code2 className="w-5 h-5" />;
      case "CheckCircle":
        return <CheckCircle className="w-5 h-5" />;
      case "Users":
        return <Users className="w-5 h-5" />;
      case "Network":
        return <Network className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  const stats = {
    total: departments.length,
    active: departments.filter((d) => d.isActive).length,
    totalInternships: departments.reduce((acc, d) => acc + (d.internshipCount || 0), 0),
    totalJobs: departments.reduce((acc, d) => acc + (d.jobCount || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Department Management</h2>
          <p className="text-muted-foreground">
            Manage your company departments and track job postings
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new department to your organization. Each department can have up to 10 internships and 10 permanent positions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Select
                  value={formData.name}
                  onValueChange={(value) =>
                    setFormData({ ...formData, name: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        <div className="flex items-center gap-2">
                          <dept.icon className="w-4 h-4" />
                          {dept.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter department description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.name || !formData.description}>
                Create Department
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Departments
            </CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Internship Programs
            </CardTitle>
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInternships}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Job Vacancies
            </CardTitle>
            <Briefcase className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              Permanent positions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Positions
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalInternships + stats.totalJobs}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined opportunities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : departments.length === 0 ? (
        <Card className="p-8 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Departments Yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first department
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((department) => (
            <Card
              key={department._id}
              className={`group hover:shadow-lg transition-all duration-300 ${
                !department.isActive ? "opacity-75" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        departmentColors[department.name]?.split(" ")[0] ||
                        "bg-primary/10"
                      }`}
                    >
                      <span
                        className={
                          departmentColors[department.name]?.split(" ")[1] ||
                          "text-primary"
                        }
                      >
                        {getDepartmentIcon(department.icon)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{department.name}</CardTitle>
                      <Badge
                        variant={department.isActive ? "default" : "secondary"}
                        className="text-[10px] mt-1"
                      >
                        {department.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(department)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(department)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {department.description}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/50 rounded-lg p-2 text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {department.internshipCount || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Internships</div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2 text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {department.jobCount || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Jobs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department details and status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input value={formData.name} disabled className="bg-muted" />
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
              <Label htmlFor="active-status">Active Status</Label>
              <Switch
                id="active-status"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
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
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedDepartment?.name}</strong>?
              This action cannot be undone. You can only delete departments that have no active jobs.
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

export default Departments;
