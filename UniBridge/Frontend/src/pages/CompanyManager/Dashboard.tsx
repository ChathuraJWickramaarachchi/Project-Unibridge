import { useState, useEffect } from "react";
import { jobService } from "@/services/jobService";
import { departmentService } from "@/services/departmentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Building2,
  Users,
  TrendingUp,
  Calendar,
  ArrowRight,
  GraduationCap,
  Clock,
  MapPin,
  Plus,
  Loader2,
} from "lucide-react";

interface Stats {
  totalJobs: number;
  internships: number;
  permanentJobs: number;
  totalApplicants: number;
  activeJobs: number;
  expiredJobs: number;
}

interface RecentJob {
  _id: string;
  title: string;
  type: string;
  departmentId: { name: string };
  applicantCount: number;
  daysRemaining: number;
  isExpired: boolean;
  createdAt: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    internships: 0,
    permanentJobs: 0,
    totalApplicants: 0,
    activeJobs: 0,
    expiredJobs: 0,
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [jobStatsRes, jobsRes, deptRes] = await Promise.all([
        jobService.getJobStats(),
        jobService.getJobs({ limit: 5 }),
        departmentService.getDepartments(),
      ]);

      if (jobStatsRes.success) {
        const byType = jobStatsRes.data.byType;
        setStats({
          totalJobs: byType.reduce((acc: number, item: any) => acc + item.count, 0),
          internships: byType.find((item: any) => item._id === "Internship")?.count || 0,
          permanentJobs: byType.find((item: any) => item._id === "Permanent")?.count || 0,
          totalApplicants: jobStatsRes.data.totalApplicants,
          activeJobs: byType.reduce((acc: number, item: any) => acc + item.active, 0),
          expiredJobs:
            byType.reduce((acc: number, item: any) => acc + item.count, 0) -
            byType.reduce((acc: number, item: any) => acc + item.active, 0),
        });
      }

      if (jobsRes.success) {
        setRecentJobs(jobsRes.data.slice(0, 5));
      }

      if (deptRes.success) {
        setDepartmentCount(deptRes.data.length);
      }
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your company.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/company/departments")}>
            <Building2 className="w-4 h-4 mr-2" />
            Departments
          </Button>
          <Button onClick={() => navigate("/company/jobs")}>
            <Plus className="w-4 h-4 mr-2" />
            Post Job
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Jobs Posted
            </CardTitle>
            <Briefcase className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeJobs} active, {stats.expiredJobs} expired
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applicants
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalApplicants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all job postings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departments
            </CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{departmentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active departments
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
            <div className="text-3xl font-bold">{stats.internships}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.permanentJobs} permanent jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Job Postings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your latest job listings and their performance
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/company/jobs")}>
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No jobs posted yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate("/company/jobs")}
                >
                  Post Your First Job
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div
                    key={job._id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate("/company/jobs")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {job.type === "Internship" ? (
                          <GraduationCap className="w-5 h-5 text-primary" />
                        ) : (
                          <Briefcase className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{job.departmentId?.name}</span>
                          <span>•</span>
                          <Badge
                            variant={job.isExpired ? "destructive" : "secondary"}
                            className="text-[10px]"
                          >
                            {job.isExpired ? "Expired" : `${job.daysRemaining} days left`}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{job.applicantCount}</div>
                        <div className="text-xs text-muted-foreground">applicants</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your company profile
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/company/departments")}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Manage Departments
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/company/jobs")}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Post New Job
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/company/applicants")}
            >
              <Users className="w-4 h-4 mr-2" />
              View Applicants
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/company/settings")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Profile Settings
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Pro Tips for Better Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Feature your most important jobs to get more visibility
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Keep job descriptions clear and include specific requirements
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Respond to applicants quickly for better engagement
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
