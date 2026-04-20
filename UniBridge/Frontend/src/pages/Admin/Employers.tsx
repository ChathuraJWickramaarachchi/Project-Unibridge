import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Building, Users, CheckCircle, XCircle, Eye, Mail, Clock, AlertTriangle } from "lucide-react";
import AdminService from "@/services/adminService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminEmployers = () => {
  const [employers, setEmployers] = useState<any[]>([]);
  const [pendingEmployers, setPendingEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectDialog, setRejectDialog] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    loadEmployers();
    loadPendingEmployers();
  }, [role, navigate, searchTerm, verificationFilter, activeTab]);

  const loadPendingEmployers = async () => {
    try {
      const response = await AdminService.getPendingEmployers();
      if (response?.success) {
        setPendingEmployers(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load pending employers:', error);
    }
  };

  const loadEmployers = async () => {
    try {
      setLoading(true);
      const params: any = {
        role: "employer",
      };

      if (searchTerm) params.search = searchTerm;
      if (verificationFilter !== "all") params.isVerified = verificationFilter === "verified";

      const response = await AdminService.getAllUsers(params);
      if (response?.success) {
        setEmployers(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load employers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmployer = async (employerId: string, isVerified: boolean, employerName: string) => {
    try {
      const response = await AdminService.verifyUser(employerId, !isVerified);
      if (response?.success) {
        toast({
          title: "Success",
          description: `Employer ${!isVerified ? 'verified' : 'unverified'} successfully`,
        });
        loadEmployers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update employer verification",
        variant: "destructive",
      });
    }
  };

  const handleApproveEmployer = async (employerId: string, employerName: string) => {
    try {
      setProcessing(true);
      const response = await AdminService.approveEmployer(employerId);
      if (response?.success) {
        toast({
          title: "Success",
          description: `${employerName}'s account has been approved successfully`,
        });
        loadPendingEmployers();
        loadEmployers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve employer",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectEmployer = async () => {
    if (!selectedEmployer) return;
    
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await AdminService.rejectEmployer(selectedEmployer._id, rejectionReason);
      if (response?.success) {
        toast({
          title: "Success",
          description: `${selectedEmployer.firstName}'s account has been rejected`,
        });
        setRejectDialog(false);
        setSelectedEmployer(null);
        setRejectionReason("");
        loadPendingEmployers();
        loadEmployers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject employer",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (employer: any) => {
    setSelectedEmployer(employer);
    setRejectionReason("");
    setRejectDialog(true);
  };

  if (loading && employers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Employer Management</h1>
        <p className="text-muted-foreground">Manage employer accounts and approve new registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employers</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employers.length}</div>
            <p className="text-xs text-muted-foreground">Registered companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingEmployers.length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting your review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employers.filter(e => e.isVerified).length}
            </div>
            <p className="text-xs text-muted-foreground">Approved accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unverified</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employers.filter(e => !e.isVerified).length}
            </div>
            <p className="text-xs text-muted-foreground">Not yet verified</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Approval ({pendingEmployers.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            All Employers ({employers.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Approval Tab */}
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Pending Employer Approvals
              </CardTitle>
              <CardDescription>
                Review and approve new employer registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pendingEmployers.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground">All caught up!</p>
                  <p className="text-muted-foreground">No pending employer approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingEmployers.map((employer) => (
                    <Card key={employer._id} className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {employer.firstName} {employer.lastName}
                              </h3>
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{employer.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span>{employer.companyInfo?.companyName || 'Not provided'}</span>
                              </div>
                              {employer.companyInfo?.companyWebsite && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Website:</span>
                                  <span>{employer.companyInfo.companyWebsite}</span>
                                </div>
                              )}
                              {employer.companyInfo?.industry && (
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">Industry:</span>
                                  <span>{employer.companyInfo.industry}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Registered: {new Date(employer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRejectDialog(employer)}
                              disabled={processing}
                            >
                              <XCircle className="h-4 w-4 mr-2 text-red-600" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApproveEmployer(employer._id, `${employer.firstName} ${employer.lastName}`)}
                              disabled={processing}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Employers Tab */}
        <TabsContent value="all" className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter Employers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select 
              value={verificationFilter} 
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setVerificationFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employer List</CardTitle>
          <CardDescription>
            {employers.length} employers found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : employers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No employers found matching your criteria</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employers.map((employer) => (
                    <TableRow key={employer._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {employer.profile?.companyName || `${employer.firstName} ${employer.lastName}`}
                          </p>
                          <p className="text-sm text-muted-foreground">{employer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employer.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {employer.isVerified ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(employer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/users/${employer._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerifyEmployer(employer._id, employer.isVerified, employer.firstName)}
                          >
                            {employer.isVerified ? (
                              <XCircle className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Employer Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedEmployer?.firstName} {selectedEmployer?.lastName}'s application.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectEmployer}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? "Processing..." : "Reject Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEmployers;