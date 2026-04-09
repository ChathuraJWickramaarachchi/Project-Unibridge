import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import examService from "@/services/examService";
import { jobService } from "@/services/jobService";
import { 
  BookOpen, Clock, Calendar, MapPin, FileText, Plus, X, Trash2, Edit, 
  Users, CheckCircle, AlertCircle, Loader2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ExamSchedule {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    type: string;
    department?: string;
  };
  companyId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
  studentIds: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  examDate: string;
  examTime: string;
  examType: 'Aptitude' | 'Technical' | 'Interview';
  location: {
    type: 'Online' | 'Physical';
    address?: string;
  };
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
  instructions?: string;
  createdAt: string;
}

interface Job {
  _id: string;
  title: string;
  type: string;
  departmentId?: {
    _id: string;
    name: string;
  };
}

const CompanyExam = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  
  // Form state for new/edit exam
  const [formData, setFormData] = useState({
    jobId: "",
    studentIds: [] as string[],
    examDate: "",
    examTime: "",
    examType: "Aptitude" as 'Aptitude' | 'Technical' | 'Interview',
    locationType: "Online" as 'Online' | 'Physical',
    locationAddress: "",
    instructions: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchExamsAndJobs();
  }, []);

  const fetchExamsAndJobs = async () => {
    try {
      setLoading(true);
      console.log('Fetching exams and jobs for user:', user?.id);
      
      // Fetch exams for this company
      if (user?.id) {
        console.log('Fetching company exams...');
        const examsRes = await examService.getCompanyExams(user.id);
        console.log('Exams response:', examsRes);
        if (examsRes.success) {
          setExams(examsRes.data);
          console.log('Set exams:', examsRes.data.length);
        }
      }

      // Fetch jobs for dropdown
      console.log('Fetching jobs...');
      const jobsRes = await jobService.getJobs({ limit: 100 });
      console.log('Jobs response:', jobsRes);
      if (jobsRes.success) {
        setJobs(jobsRes.data);
        console.log('Set jobs:', jobsRes.data.length);
      } else {
        toast.warning('No jobs found. Please create a job first.');
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load exams or jobs. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Inline validation
    const errors: Record<string, string> = {};
    if (!formData.jobId) errors.jobId = "Please select a job posting";
    if (!formData.examDate) errors.examDate = "Exam date is required";
    if (!formData.examTime) errors.examTime = "Exam time is required";
    if (formData.locationType === 'Physical' && !formData.locationAddress.trim()) {
      errors.locationAddress = "Location address is required for physical exams";
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const examData = {
        jobId: formData.jobId,
        studentIds: formData.studentIds,
        examDate: formData.examDate,
        examTime: formData.examTime,
        examType: formData.examType,
        location: {
          type: formData.locationType,
          address: formData.locationType === 'Physical' ? formData.locationAddress : undefined
        },
        instructions: formData.instructions
      };

      console.log('Sending to API:', examData);

      let response;
      if (editingExam) {
        console.log('Updating exam:', editingExam._id);
        response = await examService.updateExam(editingExam._id, examData);
      } else {
        console.log('Creating new exam');
        response = await examService.createExam(examData);
      }
      
      console.log('API Response:', response);
      
      if (response.success) {
        toast.success(editingExam ? 'Exam updated successfully!' : 'Exam created successfully!');
        if (editingExam) {
          setExams(exams.map(exam => exam._id === editingExam._id ? response.data : exam));
        } else {
          setExams([response.data, ...exams]);
        }
        resetForm();
        setEditingExam(null);
        setIsDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Error saving exam:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.message || 'Failed to save exam');
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      const response = await examService.deleteExam(examId);
      
      if (response.success) {
        toast.success('Exam deleted successfully!');
        setExams(exams.filter(exam => exam._id !== examId));
      }
    } catch (error: any) {
      console.error('Error deleting exam:', error);
      toast.error(error.message || 'Failed to delete exam');
    }
  };

  const resetForm = () => {
    setFormData({
      jobId: "",
      studentIds: [],
      examDate: "",
      examTime: "",
      examType: "Aptitude",
      locationType: "Online",
      locationAddress: "",
      instructions: ""
    });
    setFormErrors({});
  };

  const openEditDialog = (exam: ExamSchedule) => {
    setEditingExam(exam);
    setFormData({
      jobId: exam.jobId._id,
      studentIds: exam.studentIds?.map(s => s._id) || [],
      examDate: exam.examDate,
      examTime: exam.examTime,
      examType: exam.examType,
      locationType: exam.location.type,
      locationAddress: exam.location.address || "",
      instructions: exam.instructions || ""
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    console.log('Opening create dialog...');
    setEditingExam(null);
    resetForm();
    setIsDialogOpen(true);
    setTimeout(() => {
      console.log('Dialog should be open now, isDialogOpen:', isDialogOpen);
    }, 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "Ongoing":
        return <Badge className="bg-blue-500">Ongoing</Badge>;
      case "Completed":
        return <Badge variant="outline">Completed</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getExamTypeIcon = (type: string) => {
    switch (type) {
      case "Aptitude":
        return <FileText className="w-4 h-4 text-purple-600" />;
      case "Technical":
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case "Interview":
        return <Users className="w-4 h-4 text-green-600" />;
      default:
        return <FileText className="w-4 h-4" />;
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
          <h2 className="text-2xl font-bold text-foreground">Exam Scheduling</h2>
          <p className="text-muted-foreground">
            Create and manage exam schedules for your job postings
          </p>
        </div>
        <Button onClick={() => {
          console.log('Schedule Exam button clicked');
          openCreateDialog();
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Exam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Exams
            </CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{exams.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All scheduled exams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming
            </CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {exams.filter(e => e.status === 'Scheduled').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ongoing
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {exams.filter(e => e.status === 'Ongoing').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {exams.filter(e => e.status === 'Completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Exam Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Exams Scheduled</h3>
              <p className="text-muted-foreground mb-4">
                Create your first exam schedule to get started
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Exam
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="pb-3 pr-4">Job Title</th>
                    <th className="pb-3 pr-4">Exam Type</th>
                    <th className="pb-3 pr-4">Date & Time</th>
                    <th className="pb-3 pr-4">Location</th>
                    <th className="pb-3 pr-4">Students</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {exams.map((exam) => (
                    <React.Fragment key={exam._id}>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-4 pr-4">
                          <div>
                            <div className="font-medium">{exam.jobId.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {exam.jobId.type}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            {getExamTypeIcon(exam.examType)}
                            <Badge variant="outline">{exam.examType}</Badge>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div>{new Date(exam.examDate).toLocaleDateString()}</div>
                              <div className="text-xs text-muted-foreground">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {exam.examTime}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div>{exam.location.type}</div>
                              {exam.location.address && (
                                <div className="text-xs text-muted-foreground">
                                  {exam.location.address}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{exam.studentIds?.length || 0}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          {getStatusBadge(exam.status)}
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(exam)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExam(exam._id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {exam.instructions && (
                        <tr className="border-b bg-muted/30">
                          <td colSpan={7} className="py-2 px-4">
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <FileText className="w-3 h-3 mt-0.5" />
                              <strong>Instructions:</strong> {exam.instructions}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Exam Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        console.log('Dialog state changed to:', open);
        setIsDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {editingExam ? 'Edit Exam Schedule' : 'Schedule New Exam'}
            </DialogTitle>
            <DialogDescription>
              {editingExam 
                ? 'Update the exam details below' 
                : 'Fill in the exam details to schedule a new exam'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Job Selection */}
            <div className="grid gap-2">
              <Label htmlFor="job">Select Job Posting <span className="text-destructive">*</span></Label>
              <Select
                value={formData.jobId}
                onValueChange={(value) => {
                  setFormData({ ...formData, jobId: value });
                  setFormErrors((prev) => ({ ...prev, jobId: "" }));
                }}
              >
                <SelectTrigger className={formErrors.jobId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Choose a job posting" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job._id} value={job._id}>
                      {job.title} ({job.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.jobId && <p className="text-xs text-destructive">{formErrors.jobId}</p>}
            </div>

            {/* Exam Type */}
            <div className="grid gap-2">
              <Label htmlFor="exam-type">Exam Type *</Label>
              <Select
                value={formData.examType}
                onValueChange={(value: any) => setFormData({ ...formData, examType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aptitude">Aptitude Test</SelectItem>
                  <SelectItem value="Technical">Technical Assessment</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="exam-date">Exam Date <span className="text-destructive">*</span></Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={formData.examDate}
                  className={formErrors.examDate ? "border-destructive focus-visible:ring-destructive" : ""}
                  onChange={(e) => {
                    setFormData({ ...formData, examDate: e.target.value });
                    if (e.target.value) setFormErrors((prev) => ({ ...prev, examDate: "" }));
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formErrors.examDate && <p className="text-xs text-destructive">{formErrors.examDate}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exam-time">Exam Time <span className="text-destructive">*</span></Label>
                <Input
                  id="exam-time"
                  type="time"
                  value={formData.examTime}
                  className={formErrors.examTime ? "border-destructive focus-visible:ring-destructive" : ""}
                  onChange={(e) => {
                    setFormData({ ...formData, examTime: e.target.value });
                    if (e.target.value) setFormErrors((prev) => ({ ...prev, examTime: "" }));
                  }}
                />
                {formErrors.examTime && <p className="text-xs text-destructive">{formErrors.examTime}</p>}
              </div>
            </div>

            {/* Location Type */}
            <div className="grid gap-2">
              <Label htmlFor="location-type">Location Type *</Label>
              <Select
                value={formData.locationType}
                onValueChange={(value: any) => setFormData({ ...formData, locationType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Physical">Physical (In-Person)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Address (if Physical) */}
            {formData.locationType === 'Physical' && (
              <div className="grid gap-2">
                <Label htmlFor="location-address">Location Address <span className="text-destructive">*</span></Label>
                <Textarea
                  id="location-address"
                  placeholder="Enter full address including room number"
                  value={formData.locationAddress}
                  className={formErrors.locationAddress ? "border-destructive focus-visible:ring-destructive" : ""}
                  onChange={(e) => {
                    setFormData({ ...formData, locationAddress: e.target.value });
                    if (e.target.value.trim()) setFormErrors((prev) => ({ ...prev, locationAddress: "" }));
                  }}
                  rows={2}
                />
                {formErrors.locationAddress && <p className="text-xs text-destructive">{formErrors.locationAddress}</p>}
              </div>
            )}

            {/* Instructions */}
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                placeholder="Any special instructions for candidates..."
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={3}
              />
            </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                console.log('Cancel clicked');
                setIsDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                console.log('Submit button clicked, formData:', formData);
                handleSubmit();
              }}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {editingExam ? 'Update Exam' : 'Schedule Exam'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default CompanyExam;
