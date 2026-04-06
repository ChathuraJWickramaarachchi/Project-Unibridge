import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import examService from "@/services/examService";
import { Loader2, Plus, Trash2, CheckCircle, X } from "lucide-react";

interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
  marks: string;
}

const AddQuestions = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", options: ["", "", "", ""], correctAnswer: "", marks: "1" }
  ]);
  const [loading, setLoading] = useState(false);
  const [examsLoading, setExamsLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Load exams on mount
  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setExamsLoading(true);
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
      setExamsLoading(false);
    }
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    if (field.startsWith("option")) {
      const optionIndex = parseInt(field.split("-")[1]);
      newQuestions[index].options[optionIndex] = value;
    } else {
      newQuestions[index] = { ...newQuestions[index], [field]: value };
    }
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], correctAnswer: "", marks: "1" }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Error",
        description: "You must have at least one question",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedExam) {
      toast({
        title: "Error",
        description: "Please select an exam",
        variant: "destructive"
      });
      return;
    }

    // Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || q.options.some(opt => !opt) || !q.correctAnswer) {
        toast({
          title: "Validation Error",
          description: `Question ${i + 1}: Please fill in all fields`,
          variant: "destructive"
        });
        return;
      }
    }

    try {
      setLoading(true);

      // Submit each question
      for (const q of questions) {
        const payload = {
          examId: selectedExam,
          text: q.text,
          options: q.options,
          correctAnswer: parseInt(q.correctAnswer),
          marks: parseInt(q.marks)
        };

        await examService.addQuestion(payload);
      }

      toast({
        title: "Success",
        description: `${questions.length} question(s) added successfully!`
      });
      
      setSuccess(true);
      setQuestions([{ text: "", options: ["", "", "", ""], correctAnswer: "", marks: "1" }]);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (examsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Plus className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Add Questions</h1>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Questions added successfully!</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select Exam</CardTitle>
          <CardDescription>Choose the exam to add questions to</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedExam} onValueChange={setSelectedExam}>
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
        </CardContent>
      </Card>

      {selectedExam && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((question, qIndex) => (
            <Card key={qIndex}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Question Text */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Question Text *</label>
                  <Textarea
                    value={question.text}
                    onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                    placeholder="Enter question text..."
                    maxLength={500}
                    rows={3}
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Options *</label>
                  {[0, 1, 2, 3].map((optIndex) => (
                    <Input
                      key={optIndex}
                      value={question.options[optIndex]}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, `option-${optIndex}`, e.target.value)
                      }
                      placeholder={`Option ${optIndex + 1}`}
                    />
                  ))}
                </div>

                {/* Correct Answer */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Correct Answer *</label>
                    <Select
                      value={question.correctAnswer}
                      onValueChange={(e) =>
                        handleQuestionChange(qIndex, "correctAnswer", e)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Option 1</SelectItem>
                        <SelectItem value="1">Option 2</SelectItem>
                        <SelectItem value="2">Option 3</SelectItem>
                        <SelectItem value="3">Option 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Marks */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Marks *</label>
                    <Input
                      type="number"
                      value={question.marks}
                      onChange={(e) => handleQuestionChange(qIndex, "marks", e.target.value)}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Question Button */}
          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Question
          </Button>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Questions
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddQuestions;
