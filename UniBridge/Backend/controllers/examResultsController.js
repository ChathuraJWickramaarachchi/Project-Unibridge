import ExamResult from '../models/ExamResult.js';

// @desc    Get exam results statistics from exam_results collection
// @route   GET /api/admin/exam-results/stats
// @access  Private/Admin
const getExamResultsStatistics = async (req, res) => {
  try {
    console.log('GET /api/admin/exam-results/stats');

    const results = await ExamResult.find().lean();

    console.log(`Found ${results.length} results in exam_results collection`);

    const totalAttempts = results.length;
    const passedAttempts = results.filter(r => String(r.result).toUpperCase() === 'PASS').length;
    const failedAttempts = results.filter(r => String(r.result).toUpperCase() === 'FAIL').length;
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
    console.error('Error fetching exam results statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// @desc    Get all exam results from exam_results collection
// @route   GET /api/admin/exam-results
// @access  Private/Admin
const getAllExamResults = async (req, res) => {
  try {
    const { examName, studentEmail, examId } = req.query;

    console.log('GET /api/admin/exam-results - Query params:', { examName, studentEmail, examId });
    console.log('ExamResult model collection name:', ExamResult.collection.name);
    console.log('Mongoose connection readyState:', ExamResult.db.readyState);   
    console.log('Mongoose connection db name:', ExamResult.db.name);

    // Build filter object
    const filter = {};
    if (examId) filter.examId = examId;
    if (examName) filter.examName = new RegExp(`^${escapeRegex(examName)}$`, 'i');
    if (studentEmail) filter.studentEmail = new RegExp(`^${escapeRegex(studentEmail)}$`, 'i');

    const results = await ExamResult.find(filter)
      .sort({ submittedAt: -1 })
      .lean();

    console.log(`Found ${results.length} results in exam_results collection`);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam results',
      error: error.message
    });
  }
};

// @desc    Get exam results by exam name
// @route   GET /api/admin/exam-results/exam/:examName
// @access  Private/Admin
const getExamResultsByExam = async (req, res) => {
  try {
    const { examName } = req.params;

    const results = await ExamResult.find({ examName: new RegExp(`^${escapeRegex(examName)}$`, 'i') })
      .sort({ submittedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: results.length,
      examName,
      data: results
    });
  } catch (error) {
    console.error('Error fetching exam results by exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam results'
    });
  }
};

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export {
  getExamResultsStatistics,
  getAllExamResults,
  getExamResultsByExam
};