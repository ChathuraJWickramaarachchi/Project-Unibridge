const ApplicantExam = require('../models/ApplicantExam');
const ExamTest = require('../models/ExamTest');

// @desc    Get all applicant exam results
// @route   GET /api/admin/results
// @access  Private/Admin
exports.getAllResults = async (req, res) => {
  try {
    const results = await ApplicantExam.find()
      .populate('examId', 'title timeLimit passingScore')
      .sort({ endedAt: -1 });

    // Format results
    const formattedResults = results.map(result => ({
      _id: result._id,
      applicantEmail: result.applicantEmail,
      examName: result.examId?.title,
      score: result.score,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      passFail: result.passFail,
      status: result.status,
      startedAt: result.startedAt,
      endedAt: result.endedAt,
      duration: result.endedAt ? 
        Math.floor((result.endedAt - result.startedAt) / 60000) : null
    }));

    res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching results',
      error: error.message
    });
  }
};

// @desc    Get results for a specific exam
// @route   GET /api/admin/results/:examId
// @access  Private/Admin
exports.getResultsByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    // Check if exam exists
    const exam = await ExamTest.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    const results = await ApplicantExam.find({ examId })
      .populate('examId', 'title timeLimit passingScore')
      .sort({ endedAt: -1 });

    // Format results
    const formattedResults = results.map(result => ({
      _id: result._id,
      applicantEmail: result.applicantEmail,
      examName: result.examId?.title,
      score: result.score,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      passFail: result.passFail,
      status: result.status,
      startedAt: result.startedAt,
      endedAt: result.endedAt,
      duration: result.endedAt ? 
        Math.floor((result.endedAt - result.startedAt) / 60000) : null
    }));

    res.status(200).json({
      success: true,
      count: formattedResults.length,
      examTitle: exam.title,
      data: formattedResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching results',
      error: error.message
    });
  }
};

// @desc    Get result details for specific applicant
// @route   GET /api/admin/results/:examId/:email
// @access  Private/Admin
exports.getResultDetails = async (req, res) => {
  try {
    const { examId, email } = req.params;

    const result = await ApplicantExam.findOne({ 
      examId, 
      applicantEmail: email 
    })
      .populate('examId', 'title timeLimit passingScore')
      .populate('answers.questionId');

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
    res.status(500).json({
      success: false,
      message: 'Error fetching result details',
      error: error.message
    });
  }
};

// @desc    Get summary statistics for results
// @route   GET /api/admin/results/stats/summary
// @access  Private/Admin
exports.getResultsStatistics = async (req, res) => {
  try {
    const totalAttempts = await ApplicantExam.countDocuments();
    const passedAttempts = await ApplicantExam.countDocuments({ passFail: 'pass' });
    const failedAttempts = await ApplicantExam.countDocuments({ passFail: 'fail' });

    // Calculate average score
    const avgResult = await ApplicantExam.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          averagePercentage: { $avg: '$percentage' },
          maxScore: { $max: '$score' },
          minScore: { $min: '$score' }
        }
      }
    ]);

    const stats = avgResult.length > 0 ? avgResult[0] : {
      averageScore: 0,
      averagePercentage: 0,
      maxScore: 0,
      minScore: 0
    };

    res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        passedAttempts,
        failedAttempts,
        passPercentage: totalAttempts > 0 ? ((passedAttempts / totalAttempts) * 100).toFixed(2) : 0,
        averageScore: stats.averageScore.toFixed(2),
        averagePercentage: stats.averagePercentage.toFixed(2),
        maxScore: stats.maxScore,
        minScore: stats.minScore
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
