import { useState, useEffect } from "react";
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
import { Loader2, Eye, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Result {
  _id: string;
  studentName: string;
  studentEmail: string;
  examTitle: string;
  score: number;
  status: 'PASS' | 'FAIL';
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  duration: number;
  submittedAt: string;
  createdAt: string;
}

interface Statistics {
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  passPercentage: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
}

const ViewResults = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [selectedExam, setSelectedExam] = useState("all");
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ViewResults component mounted');
    initializeData();
  }, []);

  useEffect(() => {
    console.log('Loading state changed:', loading);
  }, [loading]);

  const initializeData = async () => {
    console.log('initializeData started');
    try {
      console.log('Loading exams...');
      await loadExams();
      console.log('Exams loaded successfully');
    } catch (e) {
      console.error('Failed to load exams:', e);
    }

    try {
      console.log('Loading stats...');
      await loadStats();
      console.log('Stats loaded successfully');
    } catch (e) {
      console.error('Failed to load stats:', e);
    }

    try {
      console.log('Loading results...');
      await loadAllResults();
      console.log('Results loaded successfully');
    } catch (e) {
      console.error('Failed to load results:', e);
    }
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAllAdminExams();
      console.log('getAllAdminExams response:', response);
      if (response.success) {
        setExams(response.data);
      } else {
        console.warn('getAllAdminExams returned success:false');
      }
    } catch (error: any) {
      console.error('Error loading exams:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load exams",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await examService.getExamResultsStatistics();
      console.log('getExamResultsStatistics response:', response);
      if (response.success) {
        setStats(response.data);
      } else {
        console.warn('getExamResultsStatistics returned success:false');
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadAllResults = async () => {
    try {
      setResultsLoading(true);
      setError(null);
      const response = await examService.getAllExamResults();
      console.log('getAllExamResults response:', response);

      if (response.success) {
        // Transform the data to match the expected interface
        const transformedResults = response.data.map((result: any) => ({
          _id: result._id,
          studentName: result.studentName,
          studentEmail: result.studentEmail,
          examTitle: result.examName,
          score: result.score,
          status: result.result,
          percentage: result.percentage,
          correctAnswers: 0, // Not available in exam_results
          totalQuestions: 0, // Not available in exam_results
          duration: 0, // Not available in exam_results
          submittedAt: result.submittedAt,
          createdAt: result.createdAt
        }));
        setResults(transformedResults);
      } else {
        console.warn('getAllExamResults returned success:false');
      }
    } catch (error: any) {
      console.error('Error loading results:', error);
      setError(error.message || 'Failed to load results');
      toast({
        title: "Error",
        description: error.message || "Failed to load results",
        variant: "destructive"
      });
    } finally {
      setResultsLoading(false);
    }
  };

  const handleExamChange = async (examId: string) => {
    console.log('handleExamChange called with:', examId);
    setSelectedExam(examId);

    if (!examId || examId === "all") {
      console.log('Loading all results');
      await loadAllResults();
      return;
    }

    try {
      setResultsLoading(true);
      setError(null);

      // Find the exam name from the selected exam ID
      const selectedExamData = exams.find(exam => exam._id === examId);
      if (!selectedExamData) {
        console.error('Selected exam not found');
        return;
      }

      const response = await examService.getExamResultsByExam(selectedExamData.title);
      console.log('getExamResultsByExam response:', response);

      if (response.success) {
        // Transform the data to match the expected interface
        const transformedResults = response.data.map((result: any) => ({
          _id: result._id,
          studentName: result.studentName,
          studentEmail: result.studentEmail,
          examTitle: result.examName,
          score: result.score,
          status: result.result,
          percentage: result.percentage,
          correctAnswers: 0, // Not available in exam_results
          totalQuestions: 0, // Not available in exam_results
          duration: 0, // Not available in exam_results
          submittedAt: result.submittedAt,
          createdAt: result.createdAt
        }));
        setResults(transformedResults);
      }
    } catch (error: any) {
      console.error('Error loading exam results:', error);
      setError(error.message || 'Failed to load results');
      toast({
        title: "Error",
        description: error.message || "Failed to load results",
        variant: "destructive"
      });
    } finally {
      setResultsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: 'PASS' | 'FAIL') => {
    if (status === 'PASS') {
      return (
        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Pass
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          <XCircle className="w-4 h-4" />
          Fail
        </span>
      );
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Eye className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-4xl font-bold">Exam Results</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze student exam performance</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalAttempts}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.passedAttempts}</div>
              <p className="text-xs text-gray-500 mt-1">{stats.passPercentage}% pass rate</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.failedAttempts}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.averageScore}%</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Score Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p>Max: <span className="font-bold text-green-600">{stats.maxScore}%</span></p>
                <p>Min: <span className="font-bold text-red-600">{stats.minScore}%</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Filter Results
          </CardTitle>
          <CardDescription>Select an exam to view specific results or leave blank for all</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedExam} onValueChange={handleExamChange}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="All exams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exams</SelectItem>
              {exams.map((exam) => (
                <SelectItem key={exam._id} value={exam._id}>
                  {exam.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
          <CardDescription>
            {results.length} result(s) found
            {selectedExam && selectedExam !== "all" && " for selected exam"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {resultsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No results found</p>
              <p className="text-gray-400 text-sm mt-1">Results will appear once students submit exams</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Student Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Exam</TableHead>
                    <TableHead className="text-right font-semibold">Correct/Total</TableHead>
                    <TableHead className="text-right font-semibold">Score</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Duration (min)</TableHead>
                    <TableHead className="font-semibold">Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result._id} className="hover:bg-gray-50 transition">
                      <TableCell className="font-medium">{result.studentName || 'N/A'}</TableCell>
                      <TableCell className="text-sm text-gray-600">{result.studentEmail}</TableCell>
                      <TableCell className="font-medium">{result.examTitle}</TableCell>
                      <TableCell className="text-right">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                          {result.correctAnswers || 'N/A'}/{result.totalQuestions || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold text-lg ${getPercentageColor(result.percentage)}`}>
                          {result.percentage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(result.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {result.duration ? result.duration : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(result.submittedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Average Correct Answers</p>
                <p className="text-2xl font-bold">
                  {results.some(r => r.correctAnswers) ? (results.reduce((sum, r) => sum + (r.correctAnswers || 0), 0) / results.filter(r => r.correctAnswers).length).toFixed(1) : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Average Time Taken</p>
                <p className="text-2xl font-bold">
                  {results.some(r => r.duration) ? (results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.filter(r => r.duration).length).toFixed(0) + ' min' : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Pass Rate</p>
                <p className="text-2xl font-bold">
                  {(results.filter(r => r.status === 'PASS').length / results.length * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ViewResults;
