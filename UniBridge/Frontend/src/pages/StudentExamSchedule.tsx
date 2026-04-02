import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import examService from "@/services/examService";
import { 
  BookOpen, Clock, Calendar, MapPin, FileText, Users, 
  CheckCircle, AlertCircle, Loader2, Building2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Exam {
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
  examDate: string;
  examTime: string;
  examType: 'Aptitude' | 'Technical' | 'Interview';
  location: {
    type: 'Online' | 'Physical';
    address?: string;
  };
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
  instructions?: string;
}

const StudentExamSchedule = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    fetchStudentExams();
  }, []);

  const fetchStudentExams = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const examsRes = await examService.getStudentExams(user.id);
        if (examsRes.success) {
          setExams(examsRes.data);
        }
      }
    } catch (error) {
      console.error('Error fetching student exams:', error);
      toast.error('Failed to load your exam schedule');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Scheduled":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "Ongoing":
        return <Badge className="bg-green-500">Ongoing</Badge>;
      case "Completed":
        return <Badge variant="outline" className="bg-gray-100">Completed</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case "Aptitude":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Technical":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Interview":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isUpcoming = (examDate: string, examTime: string) => {
    const examDateTime = new Date(`${examDate}T${examTime}`);
    return examDateTime > new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingExams = exams.filter(e => e.status === 'Scheduled' && isUpcoming(e.examDate, e.examTime));
  const completedExams = exams.filter(e => e.status === 'Completed' || !isUpcoming(e.examDate, e.examTime));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Exam Schedule</h1>
          <p className="text-muted-foreground">
            View your upcoming and completed exams for internship applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <div className="text-3xl font-bold text-green-600">
                {upcomingExams.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Scheduled exams
              </p>
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
              <div className="text-3xl font-bold">{completedExams.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Finished exams
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Exams */}
        {upcomingExams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              Upcoming Exams
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingExams.map((exam) => (
                <Card key={exam._id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{exam.jobId.title}</h3>
                          <p className="text-sm text-muted-foreground">{exam.jobId.type}</p>
                        </div>
                        {getStatusBadge(exam.status)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {exam.companyId.company || `${exam.companyId.firstName} ${exam.companyId.lastName}`}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Exam Type */}
                    <div className={`p-2 rounded-lg border ${getExamTypeColor(exam.examType)}`}>
                      <div className="flex items-center gap-2">
                        {exam.examType === 'Aptitude' ? (
                          <FileText className="w-4 h-4" />
                        ) : exam.examType === 'Technical' ? (
                          <BookOpen className="w-4 h-4" />
                        ) : (
                          <Users className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{exam.examType} Test</span>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(exam.examDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{exam.examTime}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium">{exam.location.type}</span>
                        {exam.location.address && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {exam.location.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Instructions */}
                    {exam.instructions && (
                      <div className="pt-2 border-t">
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <AlertCircle className="w-3 h-3 mt-0.5" />
                          <span>{exam.instructions}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Exams Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Complete Exam History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Exams Scheduled</h3>
                <p className="text-muted-foreground">
                  You haven't been shortlisted for any exams yet
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="pb-3 pr-4">Job Title</th>
                      <th className="pb-3 pr-4">Company</th>
                      <th className="pb-3 pr-4">Exam Type</th>
                      <th className="pb-3 pr-4">Date & Time</th>
                      <th className="pb-3 pr-4">Location</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {exams.map((exam) => (
                      <tr key={exam._id} className="border-b hover:bg-muted/50">
                        <td className="py-4 pr-4">
                          <div>
                            <div className="font-medium">{exam.jobId.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {exam.jobId.type}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="text-sm">
                            {exam.companyId.company || 
                             `${exam.companyId.firstName} ${exam.companyId.lastName}`}
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant="outline" className={getExamTypeColor(exam.examType)}>
                            {exam.examType}
                          </Badge>
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
                            <span>{exam.location.type}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          {getStatusBadge(exam.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentExamSchedule;
