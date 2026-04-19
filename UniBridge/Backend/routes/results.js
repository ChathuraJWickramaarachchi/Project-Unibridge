import express from 'express';
import ExamResult from '../models/ExamResult.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @desc    Get all results with statistics
 * @route   GET /api/results
 * @access  Private/Admin
 * @query   examId (optional) - filter by exam
 * @query   section (optional) - filter by section
 */
const getAllResults = async (req, res) => {
  try {
    const { examId, section } = req.query;
    
    console.log('GET /api/results - Query params:', { examId, section });
    
    // Build filter object for ExamResult model
    const filter = {};
    if (examId && examId !== 'all') filter.examId = examId;
    if (section && section !== 'all') filter.section = section;

    const results = await ExamResult.find(filter)
      .sort({ submittedAt: -1 })
      .lean();

    console.log(`Found ${results.length} results in exam_results collection`);

    // Calculate Statistics
    const totalAttempts = results.length;
    const passedAttempts = results.filter(r => r.status === 'PASS' || r.result === 'PASS').length;
    const failedAttempts = results.filter(r => r.status === 'FAIL' || r.result === 'FAIL').length;
    
    const percentages = results.map(r => r.percentage || 0);
    const averageScore = percentages.length > 0 
      ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length) 
      : 0;
    
    const maxScore = percentages.length > 0 ? Math.max(...percentages) : 0;
    const minScore = percentages.length > 0 ? Math.min(...percentages) : 0;

    // Formatting Duration is NO LONGER NEEDED but we keep it in formattedResults for potential table use if not hidden
    // Formatting for Frontend
    const formattedResults = results.map(result => ({
      _id: result._id,
      studentName: result.studentName,
      studentEmail: result.studentEmail,
      examTitle: result.examName,
      score: result.score,
      status: result.status || result.result,
      percentage: result.percentage,
      section: result.section,
      correctAnswers: result.correctAnswers || 0,
      totalQuestions: result.totalQuestions || 0,
      duration: result.duration || 0,
      submittedAt: result.submittedAt,
      createdAt: result.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults,
      statistics: {
        totalAttempts,
        passedAttempts,
        failedAttempts,
        averageScore,
        maxScore,
        minScore,
        passPercentage: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0
      }
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

// Route mapping
router.get('/', getAllResults);

export default router;
