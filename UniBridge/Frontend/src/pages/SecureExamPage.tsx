import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Shield } from "lucide-react";
import examService from "@/services/examService";
import { useAuth } from "@/contexts/AuthContext";
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

const SecureExamPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingExam, setStartingExam] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSubmittedRef = useRef(false);

  // Fetch exam data on mount using authenticated endpoint
  useEffect(() => {
    if (!examId) {
      toast.error("No exam ID provided");
      return;
    }

    const fetchExamData = async () => {
      try {
        setLoading(true);
        const examResponse = await examService.getSecureExamById(examId);

        if (!examResponse.success) {
          toast.error("Failed to load exam details");
          return;
        }

        const exam = examResponse.data;
        setExamData(exam);
        setTimeLeft(exam.timeLimit * 60);
      } catch (error) {
        console.error("Error fetching exam data:", error);
        toast.error("Failed to load exam. Please check your authentication.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId]);

  // Lockdown measures — active for the entire page lifecycle in SEB mode
  useEffect(() => {
    // Prevent context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.warning("Right-click is disabled during the exam");
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) {
        const blockedKeys = [
          "c", "v", "x", "a", "s", "p", "u", "i", "j", "w",
          "t", "n", "r", "f", "h", "g", "o", "l", "q", "z",
        ];
        if (
          blockedKeys.includes(e.key.toLowerCase()) ||
          e.key.startsWith("F")
        ) {
          e.preventDefault();
          toast.warning("Keyboard shortcuts are disabled during the exam");
          return false;
        }
      }
      if (e.key === "F12" || e.key === "F11") {
        e.preventDefault();
        return false;
      }
      if (e.key === "PrintScreen") {
        e.preventDefault();
        toast.warning("Screenshots are not allowed during the exam");
        return false;
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.warning("Copying is disabled during the exam");
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.warning("Pasting is disabled during the exam");
    };
    const handleDragStart = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => e.preventDefault();

    // Tab-switch detection
    const handleVisibilityChange = () => {
      if (document.hidden && examStarted && !examCompleted) {
        toast.error(
          "Warning: Switching away from the exam is not allowed! Your activity is being monitored."
        );
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("drop", handleDrop);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("drop", handleDrop);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [examStarted, examCompleted]);

  // Submit results using authenticated endpoint
  const submitResults = useCallback(async () => {
    if (!examId || !examData || hasSubmittedRef.current) return;

    // Mark as submitted immediately to prevent any re-entry
    hasSubmittedRef.current = true;

    try {
      setSubmitting(true);
      const duration = Math.round((Date.now() - startTimeRef.current) / 60000);

      const answersArray = questions.map((question) =>
        selectedAnswers[question._id] !== undefined
          ? selectedAnswers[question._id]
          : -1
      );

      const resultData = {
        answers: answersArray,
        duration,
      };

      const response = await examService.submitSecureExamResults(examId, resultData);

      if (response.success) {
        toast.success("Exam results submitted successfully!");
      } else {
        toast.error("Failed to submit exam results");
        hasSubmittedRef.current = false; // Allow retry on failure
      }
    } catch (error) {
      console.error("Error submitting results:", error);
      toast.error("Failed to submit exam results");
      hasSubmittedRef.current = false; // Allow retry on failure
    } finally {
      setSubmitting(false);
    }
  }, [examId, examData, questions, selectedAnswers]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const calculateScore = () => {
    return questions.filter(
      (q) => selectedAnswers[q._id] === q.correctAnswer
    ).length;
  };

  const startExam = async () => {
    if (!examId || !examData) {
      toast.error("Exam data is not ready.");
      return;
    }

    try {
      setStartingExam(true);
      setLoading(true);

      const questionsResponse = await examService.getSecureQuestionsByExam(examId);

      if (!questionsResponse.success || !questionsResponse.data) {
        toast.error("Failed to load exam questions.");
        return;
      }

      setQuestions(questionsResponse.data);
      setExamStarted(true);
      startTimeRef.current = Date.now();

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setExamCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Unable to start exam. Please try again.");
    } finally {
      setStartingExam(false);
      setLoading(false);
    }
  };

  // Auto-submit when exam completes (time runs out or user clicks submit)
  useEffect(() => {
    if (examCompleted && !hasSubmittedRef.current) {
      submitResults();
    }
  }, [examCompleted, submitResults]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  // ─── Loading ───
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading exam...</p>
        </div>
      </div>
    );
  }

  // ─── No exam data ───
  if (!examData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md mx-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Exam Not Found</h2>
          <p className="text-slate-400">
            The requested exam could not be loaded. Please contact your exam
            administrator.
          </p>
        </div>
      </div>
    );
  }

  // ─── Pre-start screen ───
  if (!examStarted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {examData.title}
            </h1>
            <p className="text-slate-400">{examData.description}</p>
            {user && (
              <p className="text-blue-400 text-sm mt-2">
                Logged in as: {user.email}
              </p>
            )}
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300">
                {examData.questionCount || 0} questions
              </span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300">
                {examData.timeLimit} minutes time limit
              </span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <span className="text-slate-300">
                Pass mark: {examData.passingScore}%
              </span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
              <Shield className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 text-sm">
                This is a secured exam. Navigation is restricted and your
                activity is monitored.
              </span>
            </div>
          </div>

          <button
            onClick={startExam}
            disabled={startingExam}
            className="w-full py-4 rounded-xl font-semibold text-lg text-white bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {startingExam ? "Preparing Exam..." : "Start Exam"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Exam completed ───
  if (examCompleted) {
    const score = calculateScore();
    const percentage =
      questions.length > 0
        ? Math.round((score / questions.length) * 100)
        : 0;
    const passed = percentage >= (examData?.passingScore || 70);

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl text-center">
          <div className="mb-6">
            {passed ? (
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            )}
            <h2 className="text-3xl font-bold text-white mb-2">
              {passed ? "Congratulations!" : "Exam Completed"}
            </h2>
            <p className="text-slate-400">
              {passed
                ? `You've passed the ${examData?.title} exam.`
                : "Your answers have been submitted."}
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 mb-6">
            <div className="text-4xl font-bold text-white mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-2xl font-semibold text-blue-400 mb-3">
              {percentage}%
            </div>
            <div
              className={`text-lg font-medium ${
                passed ? "text-green-400" : "text-red-400"
              }`}
            >
              {passed ? "PASSED" : "COMPLETED"}
            </div>
          </div>

          <button
            onClick={() => {
              // Use full-page navigation (not React Router) so SEB detects the quitURL
              window.location.href = "/secure-exam-completed";
            }}
            className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all"
          >
            Finish & Exit Secure Browser
          </button>
        </div>
      </div>
    );
  }

  // ─── Active exam ───
  const question = questions[currentQuestion];
  const isTimeWarning = timeLeft <= 300; // 5 minutes warning

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-900">
      {/* Exam header bar */}
      <div className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-400" />
          <h1 className="text-lg font-semibold text-white truncate max-w-xs">
            {examData.title}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              isTimeWarning
                ? "bg-red-500/10 border border-red-500/20"
                : "bg-slate-700/50"
            }`}
          >
            <Clock
              className={`w-4 h-4 ${
                isTimeWarning ? "text-red-400" : "text-slate-400"
              }`}
            />
            <span
              className={`font-mono text-sm font-medium ${
                isTimeWarning ? "text-red-400" : "text-white"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="text-slate-400 text-sm">
            <span className="text-white font-medium">
              {currentQuestion + 1}
            </span>{" "}
            / {questions.length}
          </div>

          <div className="text-slate-500 text-xs">
            {answeredCount}/{questions.length} answered
          </div>
        </div>
      </div>

      {/* Question grid navigator */}
      <div className="bg-slate-800/40 border-b border-slate-700/30 px-6 py-2 flex-shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {questions.map((q, idx) => (
            <button
              key={q._id}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-8 h-8 flex-shrink-0 rounded-lg text-xs font-medium transition-all ${
                idx === currentQuestion
                  ? "bg-blue-600 text-white"
                  : selectedAnswers[q._id] !== undefined
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <div className="flex items-start gap-3 mb-6">
              <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-semibold">
                {currentQuestion + 1}
              </span>
              <h2 className="text-lg font-medium text-white leading-relaxed">
                {question?.text}
              </h2>
            </div>

            <div className="space-y-3 mb-8">
              {question?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(question._id, index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedAnswers[question?._id] === index
                      ? "border-blue-500 bg-blue-500/10 text-blue-300"
                      : "border-slate-600/50 hover:border-slate-500/50 hover:bg-slate-700/30 text-slate-300"
                  }`}
                >
                  <span className="font-medium text-sm opacity-60 mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() =>
                  setCurrentQuestion((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestion === 0}
                className="px-6 py-2.5 rounded-xl font-medium text-sm text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `You have answered ${answeredCount} out of ${questions.length} questions. Submit the exam?`
                      )
                    ) {
                      if (timerRef.current) clearInterval(timerRef.current);
                      setExamCompleted(true);
                    }
                  }}
                  disabled={submitting}
                  className="px-8 py-2.5 rounded-xl font-semibold text-sm text-white bg-green-600 hover:bg-green-500 transition-all disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Exam"}
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrentQuestion((prev) =>
                      Math.min(questions.length - 1, prev + 1)
                    )
                  }
                  className="px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all"
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

export default SecureExamPage;
