import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, CheckCircle, Loader2, Play } from "lucide-react";
import examService from "@/services/examService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface Exam {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  totalMarks: number;
  status: string;
  questionCount: number;
  createdAt: string;
}

const ExamList = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      console.log("Fetching public exams...");
      const response = await examService.getAllPublicExams();
      console.log("Response:", response);
      
      if (response.success && response.data) {
        setExams(response.data);
        console.log("Exams loaded:", response.data);
      } else {
        console.log("Failed response:", response);
        toast.error("Failed to load exams");
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to take the exam");
      navigate("/auth");
      return;
    }
    
    // Navigate to SEB download page instead of directly to exam
    navigate(`/download-seb/${examId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Available Exams</h1>
          <p className="text-muted-foreground">
            Test your knowledge with our comprehensive exams
          </p>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Exams Available</h3>
            <p className="text-muted-foreground">
              There are no exams available at the moment. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card key={exam._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{exam.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {exam.description}
                      </p>
                    </div>
                    <Badge className={getStatusColor(exam.status)}>
                      {exam.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>{exam.questionCount} questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{exam.timeLimit} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4" />
                      <span>Pass: {exam.passingScore}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">Total: {exam.totalMarks} marks</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleStartExam(exam._id)}
                    className="w-full mt-4"
                    disabled={exam.status !== 'active'}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {exam.status === 'active' ? 'Start Exam' : 'Unavailable'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;
