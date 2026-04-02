import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import examService from "@/services/examService";
import { Loader2, Trash2, Eye, Filter } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

const ViewQuestions = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAllExams();
      if (response.success) {
        setExams(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load exams",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExamChange = async (examId: string) => {
    setSelectedExam(examId);

    if (examId) {
      try {
        setQuestionsLoading(true);
        const response = await examService.getQuestionsByExam(examId);
        if (response.success) {
          setQuestions(response.data);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load questions",
          variant: "destructive"
        });
      } finally {
        setQuestionsLoading(false);
      }
    } else {
      setQuestions([]);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const response = await examService.deleteQuestion(deleteId);

      if (response.success) {
        toast({
          title: "Success",
          description: "Question deleted successfully"
        });
        if (selectedExam) {
          handleExamChange(selectedExam);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Eye className="w-6 h-6" />
        <h1 className="text-3xl font-bold">View Questions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <Select value={selectedExam} onValueChange={handleExamChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an exam..." />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam._id} value={exam._id}>
                    {exam.title} ({exam.questionCount} questions)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedExam && (
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>
              {questions.length} question(s) in this exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No questions found in this exam</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question._id} className="bg-gray-50">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {/* Question Number and Text */}
                        <div>
                          <h3 className="font-semibold text-base">
                            Q{index + 1}: {question.text}
                          </h3>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {question.marks} marks
                            </span>
                          </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                          {question.options.map((option: string, optIndex: number) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded text-sm ${
                                optIndex === question.correctAnswer
                                  ? "bg-green-100 border border-green-400 text-green-800"
                                  : "bg-white border border-gray-200"
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}) {option}
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 border-t pt-3">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteId(question._id)}
                            disabled={deleting}
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ViewQuestions;
