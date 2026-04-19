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
import { Loader2, TrendingUp, CheckCircle, XCircle, AlertCircle, Eye, Home, ChartBar } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [currentExam, setCurrentExam] = useState("all");
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      const examResponse = await examService.getAllAdminExams();
      if (examResponse.success) {
        setExams(examResponse.data);
      }
      await fetchResults("all");
    } catch (e) {
      console.error('Failed to initialize data:', e);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (examId: string) => {
    try {
      setResultsLoading(true);
      const response = await examService.getAllNewResults(
        examId === "all" ? undefined : examId,
        undefined,
        "all"
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
    fetchResults(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-100 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
          Pass
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 shadow-sm">
        <XCircle className="w-3 h-3" />
        Fail
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Crunching analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 p-4 md:p-6 pb-12 animate-in fade-in duration-700">
      {/* Breadcrumb & Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-2">
        <nav className="flex items-center space-x-2 text-sm text-gray-400 font-medium">
          <span className="hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate('/admin')}>Admin</span>
          <span>/</span>
          <span className="text-gray-600">Results</span>
        </nav>
        <button 
          onClick={() => navigate('/admin')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm"
        >
          <Home className="w-4 h-4" />
          Home
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative group">
        <div className="flex items-start gap-4 mb-1">
          <div className="p-3 bg-blue-50/50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
            <Eye className="w-8 h-8 text-blue-600 group-hover:text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold font-heading text-slate-900 tracking-tight">Exam Results</h1>
            <p className="text-slate-500 font-medium mt-1">Monitor and analyze student exam performance</p>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <CardHeader className="pb-2">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Attempts</p>
            </CardHeader>
            <CardContent>
              <h2 className="text-4xl font-black text-slate-900">{stats.totalAttempts}</h2>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <CardHeader className="pb-2">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Passed</p>
            </CardHeader>
            <CardContent>
              <h2 className="text-4xl font-black text-slate-900">{stats.passedAttempts}</h2>
              <p className="text-xs font-bold text-green-600 mt-1">{stats.passPercentage}% pass rate</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <CardHeader className="pb-2">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Failed</p>
            </CardHeader>
            <CardContent>
              <h2 className="text-4xl font-black text-slate-900">{stats.failedAttempts}</h2>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <CardHeader className="pb-2">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Average Score</p>
            </CardHeader>
            <CardContent>
              <h2 className="text-4xl font-black text-purple-600">{stats.averageScore}%</h2>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-sm hover:translate-y-[-4px] transition-all duration-300">
            <CardHeader className="pb-2">
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Score Range</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500">Max: <span className="text-green-600">{stats.maxScore}%</span></p>
                <p className="text-xs font-bold text-slate-500">Min: <span className="text-red-600">{stats.minScore}%</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Section */}
      <Card className="border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Filter Results</CardTitle>
              <p className="text-sm text-slate-400 font-medium">Select an exam to view specific results or leave blank for all</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select value={currentExam} onValueChange={handleExamChange}>
              <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors focus:ring-blue-500 text-slate-700">
                <SelectValue placeholder="All Exams" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">All Exams</SelectItem>
                {exams.map((exam) => (
                  <SelectItem key={exam._id} value={exam._id} className="cursor-pointer">
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table Listing */}
      <Card className="border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Student Results</CardTitle>
              <p className="text-sm text-slate-400 font-bold mt-1">
                {results.length} result(s) found
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {resultsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-slate-400 animate-pulse">Updating table data...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-32 bg-slate-50/50 rounded-2xl mx-6 mb-6">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Records Found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your filters or wait for students to complete their examinations.</p>
            </div>
          ) : (
            <div className="overflow-x-auto ring-1 ring-slate-100 sm:rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 border-b border-slate-100">
                    <TableHead className="py-5 font-bold text-slate-600 pl-6 uppercase text-[11px] tracking-widest">Student Name</TableHead>
                    <TableHead className="py-5 font-bold text-slate-600 uppercase text-[11px] tracking-widest">Email</TableHead>
                    <TableHead className="py-5 font-bold text-slate-600 uppercase text-[11px] tracking-widest text-center">Exam</TableHead>
                    <TableHead className="py-5 font-bold text-slate-600 uppercase text-[11px] tracking-widest text-right">Correct/Total</TableHead>
                    <TableHead className="py-5 font-bold text-slate-600 uppercase text-[11px] tracking-widest text-right">Score</TableHead>
                    <TableHead className="py-5 font-bold text-slate-600 uppercase text-[11px] tracking-widest text-center">Status</TableHead>
                    <TableHead className="py-5 font-bold text-slate-600 uppercase text-[11px] tracking-widest text-right">Duration (min)</TableHead>
                    <TableHead className="py-5 font-bold text-slate-600 uppercase text-[11px] tracking-widest pr-6">Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result._id} className="group hover:bg-blue-50/30 transition-colors border-b border-slate-50">
                      <TableCell className="py-4 font-bold text-slate-700 pl-6">{result.studentName || 'N/A'}</TableCell>
                      <TableCell className="py-4 text-sm text-slate-400 font-medium lowercase italic">{result.studentEmail}</TableCell>
                      <TableCell className="py-4 font-bold text-slate-600 text-center">{result.examTitle}</TableCell>
                      <TableCell className="py-4 text-right">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-bold ring-1 ring-blue-100">
                          {result.correctAnswers !== undefined ? `${result.correctAnswers}/${result.totalQuestions}` : 'N/A/N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <span className={`font-black text-lg ${getPercentageColor(result.percentage)}`}>
                          {result.percentage}%
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {getStatusBadge(result.status)}
                      </TableCell>
                      <TableCell className="py-4 text-right font-bold text-slate-400 shrink-0">
                        {result.duration !== undefined ? `${result.duration}` : 'N/A'}
                      </TableCell>
                      <TableCell className="py-4 text-xs font-semibold text-slate-400 pr-6">
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
    </div>
  );
};

export default ViewResults;
