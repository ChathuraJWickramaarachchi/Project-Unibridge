import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import examService from "@/services/examService";
import { toast } from "sonner";

interface Question {
  _id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

interface ExamData {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  totalMarks: number;
  status: string;
  questionCount: number;
}

const Exam = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes default
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Check if running in Safe Exam Browser
  const isRunningInSEB = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isLockdownMode = urlParams.get('lockdown') === 'true';
    
    // Check for SEB-specific indicators
    const sebIndicators = [
      navigator.userAgent.includes('SEB'),
      document.querySelector('meta[name="seb"]') !== null,
      window.location.hostname.includes('seb'),
      isLockdownMode
    ];
    
    return sebIndicators.some(indicator => indicator);
  };

  // Fetch exam data and questions
  useEffect(() => {
    if (!examId) {
      toast.error("No exam ID provided");
      navigate("/exam-list");
      return;
    }

    // Check if running in SEB before loading exam
    if (!isRunningInSEB()) {
      toast.error("This exam requires Safe Exam Browser for security");
      navigate(`/download-seb/${examId}`);
      return;
    }

    const fetchExamData = async () => {
      try {
        setLoading(true);
        console.log("Fetching public exam data for examId:", examId);
        
        // Fetch exam details
        const examResponse = await examService.getPublicExamById(examId);
        console.log("Exam response:", examResponse);
        
        if (!examResponse.success) {
          console.log("Exam fetch failed:", examResponse);
          toast.error("Failed to load exam details");
          navigate("/exam-list");
          return;
        }

        const exam = examResponse.data;
        console.log("Exam data:", exam);
        setExamData(exam);
        setTimeLeft(exam.timeLimit * 60); // Convert minutes to seconds

        // Fetch exam questions
        const questionsResponse = await examService.getPublicQuestionsByExam(examId);
        console.log("Questions response:", questionsResponse);
        
        if (questionsResponse.success && questionsResponse.data) {
          setQuestions(questionsResponse.data);
          console.log("Questions loaded:", questionsResponse.data);
        } else {
          console.log("No questions found:", questionsResponse);
          toast.error("No questions found for this exam");
          navigate("/exam-list");
          return;
        }
      } catch (error) {
        console.error("Error fetching exam data:", error);
        toast.error("Failed to load exam");
        navigate("/exam-list");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId, navigate]);

  // Additional lockdown measures when exam starts
  useEffect(() => {
    if (examStarted && isRunningInSEB()) {
      // Prevent context menu (right-click)
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        toast.warning("Right-click is disabled during the exam");
      };

      // Prevent keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, F12, etc.
        if (e.ctrlKey || e.altKey || e.metaKey) {
          if (['c', 'v', 'x', 'a', 's', 'p', 'u', 'i', 'j', 'w', 't', 'n', 'r', 'f', 'h', 'g', 'o', 'l', 'q', 'z'].includes(e.key.toLowerCase()) ||
              e.key === 'F12' || e.key === 'F11' || e.key.startsWith('F')) {
            e.preventDefault();
            toast.warning("Keyboard shortcuts are disabled during the exam");
            return false;
          }
        }

        // Prevent F12 (dev tools)
        if (e.key === 'F12') {
          e.preventDefault();
          toast.warning("Developer tools are disabled during the exam");
          return false;
        }

        // Prevent Print Screen
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          toast.warning("Screenshots are not allowed during the exam");
          return false;
        }
      };

      // Prevent copy/paste
      const handleCopy = (e: ClipboardEvent) => {
        e.preventDefault();
        toast.warning("Copying is disabled during the exam");
      };

      const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();
        toast.warning("Pasting is disabled during the exam");
      };

      // Prevent drag and drop
      const handleDragStart = (e: DragEvent) => {
        e.preventDefault();
      };

      const handleDrop = (e: DragEvent) => {
        e.preventDefault();
      };

      // Prevent window blur (switching tabs/applications)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          toast.error("Switching tabs or applications is not allowed during the exam!");
          // Could auto-submit or warn
        }
      };

      // Add event listeners
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('copy', handleCopy);
      document.addEventListener('paste', handlePaste);
      document.addEventListener('dragstart', handleDragStart);
      document.addEventListener('drop', handleDrop);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup function
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('paste', handlePaste);
        document.removeEventListener('dragstart', handleDragStart);
        document.removeEventListener('drop', handleDrop);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [examStarted]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const calculateScore = () => {
    return questions.filter(q => selectedAnswers[q._id] === q.correctAnswer).length;
  };

  const startExam = () => {
    setExamStarted(true);
    const startTime = Date.now();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setExamCompleted(true);
          submitResults(startTime);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const submitResults = async (startTime: number) => {
    if (!examId || !examData) return;
    
    try {
      setSubmitting(true);
      
      // Calculate duration in minutes
      const duration = Math.round((Date.now() - startTime) / 60000);
      
      // Prepare answers array in the correct order
      const answersArray = questions.map(question => 
        selectedAnswers[question._id] !== undefined ? selectedAnswers[question._id] : -1
      );
      
      // Get user email - you can modify this to get from auth context or prompt user
      const userEmail = localStorage.getItem('userEmail') || prompt('Please enter your email:') || 'student@example.com';
      
      const resultData = {
        applicantEmail: userEmail,
        answers: answersArray,
        duration: duration
      };
      
      console.log("Submitting results:", resultData);
      
      const response = await examService.submitExamResults(examId, resultData);
      
      if (response.success) {
        console.log("Results submitted successfully:", response.data);
        toast.success("Exam results submitted successfully!");
        
        // Store user email for future use
        localStorage.setItem('userEmail', userEmail);
      } else {
        console.error("Failed to submit results:", response);
        toast.error("Failed to submit exam results");
      }
    } catch (error) {
      console.error("Error submitting results:", error);
      toast.error("Failed to submit exam results");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  // No exam data state
  if (!examData || questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Exam Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested exam could not be loaded.</p>
          <button
            onClick={() => navigate("/exam-list")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="bg-card rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-xl">
          <div className="text-center mb-8">
            <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              {examData.title}
            </h1>
            <p className="text-muted-foreground">
              {examData.description}
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground">{questions.length} questions</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-foreground">{examData.timeLimit} minutes time limit</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-foreground">Pass mark: {examData.passingScore}%</span>
            </div>
          </div>
          
          <button
            onClick={startExam}
            className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (examCompleted) {
    const score = calculateScore();
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const passed = percentage >= (examData?.passingScore || 70);
    
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="bg-card rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-xl text-center">
          <div className="mb-6">
            {passed ? (
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-3xl font-heading font-bold text-foreground mb-2">
              {passed ? "Congratulations!" : "Exam Completed"}
            </h2>
            <p className="text-muted-foreground">
              {passed 
                ? `You've passed the ${examData?.title}!` 
                : "Review the material and try again"}
            </p>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-6 mb-6">
            <div className="text-4xl font-bold text-foreground mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-2xl font-semibold text-primary mb-4">
              {percentage}%
            </div>
            <div className={`text-lg font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? "PASSED" : "FAILED"}
            </div>
          </div>
          
          <div className="space-y-3 text-left max-w-lg mx-auto">
            <h3 className="font-semibold text-foreground mb-3">Review Answers:</h3>
            {questions.map((q) => (
              <div key={q._id} className="p-3 bg-muted/30 rounded-lg">
                <p className="font-medium text-foreground mb-2">{q.text}</p>
                <div className="text-sm">
                  <span className="text-muted-foreground">Your answer: </span>
                  <span className={selectedAnswers[q._id] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}>
                    {selectedAnswers[q._id] !== undefined ? q.options[selectedAnswers[q._id]] : 'Not answered'}
                  </span>
                </div>
                {selectedAnswers[q._id] !== q.correctAnswer && (
                  <div className="text-sm text-green-600">
                    <span>Correct answer: </span>
                    <span>{q.options[q.correctAnswer]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Exam Header */}
      <div className="bg-card border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {examData.title}
            </h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <div className="text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {questions[currentQuestion]?.text}
            </h2>
            
            <div className="space-y-4 mb-8">
              {questions[currentQuestion]?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(questions[currentQuestion]._id, index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswers[questions[currentQuestion]?._id] === index
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + index)}. </span>
                  {option}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-2 bg-muted text-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80 transition-colors"
              >
                Previous
              </button>
              
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={() => {
                    const startTime = Date.now() - (examData?.timeLimit * 60 - timeLeft) * 1000;
                    setExamCompleted(true);
                    submitResults(startTime);
                  }}
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam;