import express from 'express';
import Result from '../models/Result.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @desc    Get all results with population
 * @route   GET /api/results
 * @access  Private/Admin
 * @query   examId (optional) - filter by exam
 * @query   studentId (optional) - filter by student
 */
const getAllResults = async (req, res) => {
  try {
    const { examId, studentId } = req.query;
    
    // Build filter object
    const filter = {};
    if (examId) filter.examId = examId;
    if (studentId) filter.studentId = studentId;

    const results = await Result.find(filter)
      .populate('studentId', 'firstName lastName email')
      .populate('examId', 'title')
      .sort({ submittedAt: -1 })
      .lean();

    // Format response
    const formattedResults = results.map(result => ({
      _id: result._id,
      studentName: `${result.studentId?.firstName || ''} ${result.studentId?.lastName || ''}`.trim(),
      studentEmail: result.studentId?.email,
      examTitle: result.examId?.title,
      score: result.score,
      status: result.status,
      percentage: result.percentage,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      duration: result.duration,
      submittedAt: result.submittedAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
      error: error.message
    });
  }
};

/**
 * @desc    Get results by exam
 * @route   GET /api/results/exam/:examId
 * @access  Private/Admin
 */
const getResultsByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const results = await Result.find({ examId })
      .populate('studentId', 'firstName lastName email')
      .populate('examId', 'title')
      .sort({ submittedAt: -1 })
      .lean();

    const formattedResults = results.map(result => ({
      _id: result._id,
      studentName: `${result.studentId?.firstName || ''} ${result.studentId?.lastName || ''}`.trim(),
      studentEmail: result.studentId?.email,
      examTitle: result.examId?.title,
      score: result.score,
      status: result.status,
      percentage: result.percentage,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      duration: result.duration,
      submittedAt: result.submittedAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults
    });
  } catch (error) {
    console.error('Error fetching results by exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results'
    });
  }
};

/**
 * @desc    Get results by student
 * @route   GET /api/results/student/:studentId
 * @access  Private
 */
const getResultsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const results = await Result.find({ studentId })
      .populate('studentId', 'firstName lastName email')
      .populate('examId', 'title')
      .sort({ submittedAt: -1 })
      .lean();

    const formattedResults = results.map(result => ({
      _id: result._id,
      studentName: `${result.studentId?.firstName || ''} ${result.studentId?.lastName || ''}`.trim(),
      studentEmail: result.studentId?.email,
      examTitle: result.examId?.title,
      score: result.score,
      status: result.status,
      percentage: result.percentage,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      duration: result.duration,
      submittedAt: result.submittedAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults
    });
  } catch (error) {
    console.error('Error fetching results by student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results'
    });
  }
};

/**
 * @desc    Get single result
 * @route   GET /api/results/:id
 * @access  Private
 */
const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('studentId', 'firstName lastName email phone')
      .populate('examId', 'title description timeLimit passingScore');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch result'
    });
  }
};

/**
 * @desc    Get results statistics
 * @route   GET /api/results/stats/summary
 * @access  Private/Admin
 */
const getResultsStatistics = async (req, res) => {
  try {
    const results = await Result.find().lean();
    
    const totalAttempts = results.length;
    const passedAttempts = results.filter(r => r.status === 'PASS').length;
    const failedAttempts = results.filter(r => r.status === 'FAIL').length;
    
    const passPercentage = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
    
    const percentages = results.map(r => r.percentage);
    const averageScore = percentages.length > 0 ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length) : 0;
    
    const maxScore = percentages.length > 0 ? Math.max(...percentages) : 0;
    const minScore = percentages.length > 0 ? Math.min(...percentages) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        passedAttempts,
        failedAttempts,
        passPercentage,
        averageScore,
        maxScore,
        minScore
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// Routes
router.get('/stats/summary', getResultsStatistics);
router.get('/exam/:examId', getResultsByExam);
router.get('/student/:studentId', getResultsByStudent);
router.get('/:id', getResultById);
router.get('/', getAllResults);

export default router;
