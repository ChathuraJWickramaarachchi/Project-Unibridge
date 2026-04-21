import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Share2, Calendar, User, Building, Edit, Trash2, Archive, Copy, Eye, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const ViewResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedExam, setSelectedExam] = useState('');
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchResults();
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/exams', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Extract unique exam names from results or fetch from exams endpoint
        const uniqueExams = [...new Set(results.map(r => r.examName).filter(Boolean))];
        setExams(uniqueExams.map((examName, index) => ({
          id: index.toString(),
          name: examName
        })));
      }
    } catch (err) {
      console.error('Failed to fetch exams:', err);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      console.log('Fetching results from /api/results...');
      
      // Get authentication token
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      // Fetch from actual Exam_results API with authentication
      const response = await fetch('/api/results', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      
      // Map ExamResult fields to the expected format
      const mappedResults = (data.data || []).map(result => ({
        id: result._id,
        title: result.examTitle || result.examName || 'Unknown Exam',
        description: `Exam result for ${result.studentName}`,
        studentName: result.studentName,
        studentEmail: result.studentEmail,
        examName: result.examTitle || result.examName,
        status: result.status?.toLowerCase() || result.result?.toLowerCase() || 'unknown',
        priority: 'normal', // Default priority since not in ExamResult model
        createdAt: result.createdAt,
        updatedAt: result.updatedAt || result.submittedAt,
        submittedAt: result.submittedAt,
        score: result.score,
        percentage: result.percentage,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        section: result.section,
        duration: result.duration,
        company: { 
          name: 'Exam Results', 
          industry: 'Education', 
          location: 'Online', 
          email: result.studentEmail 
        },
        assignedUser: { 
          name: result.studentName, 
          email: result.studentEmail, 
          role: 'Student' 
        },
        data: { 
          score: result.score, 
          totalQuestions: result.totalQuestions, 
          correctAnswers: result.correctAnswers,
          percentage: result.percentage
        },
        metrics: { 
          passRate: result.status === 'PASS' || result.result === 'PASS' ? 100 : 0, 
          averageScore: result.percentage,
          totalParticipants: 1
        }
      }));
      
      console.log('Mapped results:', mappedResults);
      setResults(mappedResults);
      
      // Extract unique exam names from results
      const uniqueExamNames = [...new Set(mappedResults.map(r => r.examName).filter(Boolean))];
      setExams(uniqueExamNames.map((examName, index) => ({
        id: index.toString(),
        name: examName
      })));
    } catch (err) {
      console.error('Error in fetchResults:', err);
      setError(err.message);
      toast.error(`Failed to load results: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/company/dashboard');
  };

  const handleViewResult = (resultId) => {
    navigate(`/company/results/${resultId}`);
  };

  const handleExport = async (resultId) => {
    try {
      const response = await fetch(`/api/results/${resultId}/export`);
      if (!response.ok) {
        throw new Error('Failed to export result');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `result-${resultId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Result exported successfully');
    } catch (err) {
      toast.error('Failed to export result');
    }
  };

  const handleShare = async (resultId) => {
    try {
      const response = await fetch(`/api/results/${resultId}/share`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }
      const data = await response.json();
      navigator.clipboard.writeText(data.shareUrl);
      toast.success('Share link copied to clipboard');
    } catch (err) {
      toast.error('Failed to generate share link');
    }
  };

  const handleEdit = (resultId) => {
    navigate(`/company/results/${resultId}/edit`);
  };

  const handleDelete = async (resultId) => {
    if (window.confirm('Are you sure you want to delete this result? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/results/${resultId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete result');
        }
        toast.success('Result deleted successfully');
        setResults(results.filter(r => r.id !== resultId));
      } catch (err) {
        toast.error('Failed to delete result');
      }
    }
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = result.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.examName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    const matchesExam = !selectedExam || result.examName === exams.find(e => e.id === selectedExam)?.name;
    return matchesSearch && matchesStatus && matchesExam;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={handleBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchResults()}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Results</CardTitle>
          <p className="text-sm text-gray-600">Select an exam to view specific results or leave blank for all</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Exams</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Results ({filteredResults.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No results found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Exam Name</TableHead> 
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{result.studentName || 'Unknown'}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {result.studentEmail || 'No email'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{result.examName || 'Unknown Exam'}</p>
                          {result.section && (
                            <p className="text-sm text-gray-500">Section: {result.section}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <p className="font-medium">{result.percentage || 0}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{result.submittedAt ? formatDate(result.submittedAt) : 'N/A'}</span>
                        </div>
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

export default ViewResult;
