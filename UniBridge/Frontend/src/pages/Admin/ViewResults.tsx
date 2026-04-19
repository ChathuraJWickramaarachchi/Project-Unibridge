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
import { Loader2, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Result {
  _id: string;
  studentName: string;
  studentEmail: string;
  examTitle: string;
  score: number;
  status: string;
  percentage: number;
  section: string;
  correctAnswers: number;
  totalQuestions: number;
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
  const [currentExam, setCurrentExam] = useState("all");
  const [currentSection, setCurrentSection] = useState("all");
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      // Load exams for the dropdown
      const examResponse = await examService.getAllAdminExams();
      if (examResponse.success) {
        setExams(examResponse.data);
      }
      
      // Load initial results and stats
      await fetchResults("all", "all");
    } catch (e) {
      console.error('Failed to initialize data:', e);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (examId: string, section: string) => {
    try {
      setResultsLoading(true);
      const response = await examService.getAllNewResults(
        examId === "all" ? undefined : examId,
        undefined,
        section === "all" ? undefined : section
      );

      if (response.success) {
        setResults(response.data);
        if (response.statistics) {
          setStats(response.statistics);
        }
      } else {
        setError(response.message || "Failed to fetch results");
      }
    } catch (err: any) {
      console.error('Error fetching results:', err);
      setError(err.message || "An error occurred");
    } finally {
      setResultsLoading(false);
    }
  };

  const handleExamChange = (value: string) => {
    setCurrentExam(value);
    fetchResults(value, currentSection);
  };

  const handleSectionChange = (value: string) => {
    setCurrentSection(value);
    fetchResults(currentExam, value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    const s = String(status).toUpperCase();
    if (s === 'PASS') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" /> PASS
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3" /> FAIL
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">Exam Results Analytics</h1>
          <p className="text-gray-500">Monitor student performance and exam statistics</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filter by Exam</label>
              <Select value={currentExam} onValueChange={handleExamChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Exam" />
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filter by Section</label>
              <Select value={currentSection} onValueChange={handleSectionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  <SelectItem value="IT">IT (Information Technology)</SelectItem>
                  <SelectItem value="SE">SE (Software Engineering)</SelectItem>
                  <SelectItem value="QA">QA (Quality Assurance)</SelectItem>
                  <SelectItem value="CS">CS (Computer Science)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white hover:shadow-md transition">
            <CardHeader className="pb-2">
              <CardDescription>Total Attempts</CardDescription>
              <CardTitle className="text-3xl">{stats.totalAttempts}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white hover:shadow-md transition">
            <CardHeader className="pb-2">
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600">{stats.averageScore}%</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white hover:shadow-md transition">
            <CardHeader className="pb-2">
              <CardDescription>Highest Score</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600">{stats.maxScore}%</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white hover:shadow-md transition">
            <CardHeader className="pb-2">
              <CardDescription>Lowest Score</CardDescription>
              <CardTitle className="text-3xl font-bold text-red-600">{stats.minScore}%</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Detailed Results</CardTitle>
            <p className="text-sm text-gray-500">
              {results.length} result(s) found
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {resultsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No results found</p>
              <p className="text-gray-400 text-sm mt-1">Try changing filters or wait for new submissions</p>
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
                          {result.correctAnswers ?? 'N/A'}/{result.totalQuestions ?? 'N/A'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Average Correct Answers</p>
                <p className="text-2xl font-bold">
                  {results.some(r => r.correctAnswers !== undefined) 
                    ? (results.reduce((sum, r) => sum + (r.correctAnswers || 0), 0) / results.filter(r => r.correctAnswers !== undefined).length).toFixed(1) 
                    : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Pass Rate</p>
                <p className="text-2xl font-bold">
                  {stats ? stats.passPercentage : 0}% 
                  <span className="text-sm text-gray-500 font-normal ml-2">
                    ({stats?.passedAttempts} out of {results.length})
                  </span>
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
