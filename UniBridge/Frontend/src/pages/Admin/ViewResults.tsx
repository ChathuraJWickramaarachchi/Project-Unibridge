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
import { Loader2, Eye, TrendingUp, CheckCircle, XCircle } from "lucide-react";

const ViewResults = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadExams();
    loadStats();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAllAdminExams();
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

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await examService.getResultsStatistics();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleExamChange = async (examId: string) => {
    setSelectedExam(examId);

    if (examId) {
      try {
        setResultsLoading(true);
        const response = await examService.getResultsByExam(examId);
        if (response.success) {
          setResults(response.data);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load results",
          variant: "destructive"
        });
      } finally {
        setResultsLoading(false);
      }
    } else {
      try {
        setResultsLoading(true);
        const response = await examService.getAllResults();
        if (response.success) {
          setResults(response.data);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load results",
          variant: "destructive"
        });
      } finally {
        setResultsLoading(false);
      }
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPassFailBadge = (passFail: string) => {
    if (passFail === 'pass') {
      return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Pass</span>;
    } else {
      return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm flex items-center gap-1"><XCircle className="w-3 h-3" /> Fail</span>;
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
        <h1 className="text-3xl font-bold">View Results</h1>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttempts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.passedAttempts}</div>
              <p className="text-xs text-gray-500">{stats.passPercentage}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedAttempts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}</div>
              <p className="text-xs text-gray-500">{stats.averagePercentage}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Score Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p>Max: <span className="font-bold">{stats.maxScore}</span></p>
                <p>Min: <span className="font-bold">{stats.minScore}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter by Exam */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Results</CardTitle>
          <CardDescription>Select an exam to view results</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedExam} onValueChange={handleExamChange}>
            <SelectTrigger>
              <SelectValue placeholder="All exams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Exams</SelectItem>
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
          <CardTitle>Results</CardTitle>
          <CardDescription>
            {results.length} result(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resultsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No results found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant Email</TableHead>
                    <TableHead>Exam Name</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result._id}>
                      <TableCell className="font-medium">{result.applicantEmail}</TableCell>
                      <TableCell>{result.examName}</TableCell>
                      <TableCell className="text-right">
                        {result.score}/{result.totalMarks}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${
                          result.percentage >= 50 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.percentage}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {getPassFailBadge(result.passFail)}
                      </TableCell>
                      <TableCell>
                        {result.duration ? `${result.duration} min` : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {result.endedAt ? formatDate(result.endedAt) : 'In Progress'}
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
