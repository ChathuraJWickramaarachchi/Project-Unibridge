import ExamTest from '../models/ExamTest.js';
import Question from '../models/Question.js';

// @desc    Create a new exam
// @route   POST /api/admin/exams
// @access  Private/Admin
const createExam = async (req, res) => {
  try {
    const { title, description, timeLimit, passingScore } = req.body;

    // Validate required fields
    if (!title || !timeLimit || passingScore === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, timeLimit, and passingScore'
      });
    }

    // Create exam
    const exam = await ExamTest.create({
      title,
      description,
      timeLimit,
      passingScore
    });

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating exam',
      error: error.message
    });
  }
};

import ApplicantExam from '../models/ApplicantExam.js';

// @desc    Submit exam results (public)
// @route   POST /api/exams/public/:id/submit
// @access  Public
const submitExamResults = async (req, res) => {
  try {
    const { applicantEmail, answers, duration } = req.body;
    const examId = req.params.id;

    // Validate exam exists
    const exam = await ExamTest.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    if (exam.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Exam not available'
      });
    }

    // Get all questions for this exam
    const questions = await Question.find({ examId });
    
    // Calculate results
    let totalScore = 0;
    let totalMarks = 0;
    const processedAnswers = [];

    questions.forEach((question, index) => {
      const userAnswer = answers[index] !== undefined ? answers[index] : -1;
      const isCorrect = userAnswer === question.correctAnswer;
      const marksObtained = isCorrect ? question.marks : 0;
      
      totalScore += marksObtained;
      totalMarks += question.marks;
      
      processedAnswers.push({
        questionId: question._id,
        selectedAnswer: userAnswer,
        isCorrect,
        marksObtained
      });
    });

    const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
    const passFail = percentage >= exam.passingScore ? 'pass' : 'fail';

    // Create or update applicant exam record
    const applicantExam = await ApplicantExam.findOneAndUpdate(
      { examId, applicantEmail },
      {
        answers: processedAnswers,
        score: totalScore,
        totalMarks,
        percentage,
        passFail,
        duration,
        status: 'evaluated',
        endedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Exam results submitted successfully',
      data: {
        score: totalScore,
        totalMarks,
        percentage,
        passFail,
        examTitle: exam.title
      }
    });
  } catch (error) {
    console.error('Error submitting exam results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit exam results'
    });
  }
};

// @desc    Get all exam results (admin)
// @route   GET /api/admin/results
// @access  Private/Admin
const getAllResults = async (req, res) => {
  try {
    const results = await ApplicantExam.find()
      .populate('examId', 'title description')
      .sort({ createdAt: -1 });

    const formattedResults = results.map(result => ({
      _id: result._id,
      applicantEmail: result.applicantEmail,
      examName: result.examId?.title || 'Unknown Exam',
      examId: result.examId?._id,
      score: result.score,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      passFail: result.passFail,
      duration: result.duration,
      startedAt: result.startedAt,
      endedAt: result.endedAt,
      status: result.status,
      createdAt: result.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults
    });
  } catch (error) {
    console.error('Error fetching all results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results'
    });
  }
};

// @desc    Get results by exam ID (admin)
// @route   GET /api/admin/results/:examId
// @access  Private/Admin
const getResultsByExam = async (req, res) => {
  try {
    const results = await ApplicantExam.find({ examId: req.params.examId })
      .populate('examId', 'title description')
      .sort({ createdAt: -1 });

    const formattedResults = results.map(result => ({
      _id: result._id,
      applicantEmail: result.applicantEmail,
      examName: result.examId?.title || 'Unknown Exam',
      examId: result.examId?._id,
      score: result.score,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      passFail: result.passFail,
      duration: result.duration,
      startedAt: result.startedAt,
      endedAt: result.endedAt,
      status: result.status,
      createdAt: result.createdAt
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
      message: 'Failed to fetch exam results'
    });
  }
};

// @desc    Get results statistics (admin)
// @route   GET /api/admin/results/stats
// @access  Private/Admin
const getResultsStatistics = async (req, res) => {
  try {
    const results = await ApplicantExam.find({ status: 'evaluated' });
    
    const totalAttempts = results.length;
    const passedAttempts = results.filter(r => r.passFail === 'pass').length;
    const failedAttempts = totalAttempts - passedAttempts;
    
    const passPercentage = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
    
    const scores = results.map(r => r.percentage);
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const averagePercentage = averageScore;
    
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalAttempts,
        passedAttempts,
        failedAttempts,
        passPercentage,
        averageScore,
        averagePercentage,
        maxScore,
        minScore
      }
    });
  } catch (error) {
    console.error('Error fetching results statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results statistics'
    });
  }
};

// @desc    Get all exams (public)
// @route   GET /api/exams/public
// @access  Public
const getAllPublicExams = async (req, res) => {
  try {
    const exams = await ExamTest.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams.map(exam => ({
        ...exam.toObject(),
        questionCount: exam.questionCount || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching public exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams'
    });
  }
};

// @desc    Get exam by ID (public)
// @route   GET /api/exams/public/:id
// @access  Public
const getPublicExamById = async (req, res) => {
  try {
    const exam = await ExamTest.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    if (exam.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Exam not available'
      });
    }
    
    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error fetching public exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam'
    });
  }
};

// @desc    Get questions by exam ID (public)
// @route   GET /api/exams/public/:id/questions
// @access  Public
const getPublicQuestionsByExam = async (req, res) => {
  try {
    const exam = await ExamTest.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    if (exam.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Exam not available'
      });
    }

    const questions = await Question.find({ examId: req.params.id })
      .sort({ createdAt: 1 })
      .select('-__v');
    
    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Error fetching public questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions'
    });
  }
};

// @desc    Get all exams
// @route   GET /api/admin/exams
// @access  Private/Admin
const getAllExams = async (req, res) => {
  try {
    const exams = await ExamTest.find().sort({ createdAt: -1 });

    // Fetch question count for each exam
    const examsWithCount = await Promise.all(
      exams.map(async (exam) => {
        const questionCount = await Question.countDocuments({ examId: exam._id });
        return {
          ...exam.toObject(),
          questionCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: examsWithCount.length,
      data: examsWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exams',
      error: error.message
    });
  }
};

// @desc    Get exam by ID
// @route   GET /api/admin/exams/:id
// @access  Private/Admin
const getExamById = async (req, res) => {
  try {
    const exam = await ExamTest.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    const questionCount = await Question.countDocuments({ examId: exam._id });

    res.status(200).json({
      success: true,
      data: {
        ...exam.toObject(),
        questionCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exam',
      error: error.message
    });
  }
};

// @desc    Update exam
// @route   PUT /api/admin/exams/:id
// @access  Private/Admin
const updateExam = async (req, res) => {
  try {
    const { title, description, timeLimit, passingScore, status } = req.body;

    let exam = await ExamTest.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Update fields
    if (title) exam.title = title;
    if (description) exam.description = description;
    if (timeLimit) exam.timeLimit = timeLimit;
    if (passingScore !== undefined) exam.passingScore = passingScore;
    if (status) exam.status = status;

    exam = await exam.save();

    res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      data: exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating exam',
      error: error.message
    });
  }
};

// @desc    Delete exam
// @route   DELETE /api/admin/exams/:id
// @access  Private/Admin
const deleteExam = async (req, res) => {
  try {
    const exam = await ExamTest.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Also delete associated questions
    await Question.deleteMany({ examId: exam._id });

    res.status(200).json({
      success: true,
      message: 'Exam and associated questions deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting exam',
      error: error.message
    });
  }
};

// @desc    Generate SEB configuration for exam
// @route   GET /api/exams/:id/seb-config
// @access  Public (but requires authentication for security)
const generateSEBConfig = async (req, res) => {
  try {
    const { id: examId } = req.params;

    // Verify exam exists and is active
    const exam = await ExamTest.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    if (exam.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Exam not available'
      });
    }

    // Get frontend URL from environment or default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Generate unique exam session key
    const examSessionKey = generateExamSessionKey(examId);

    // Create SEB configuration
    const sebConfig = {
      startURL: `${frontendUrl}/exam/${examId}?lockdown=true&session=${examSessionKey}`,
      browserViewMode: 1, // Fullscreen mode
      showTaskBar: false,
      showReloadButton: false,
      showTime: true,
      allowPreferencesWindow: false,
      allowQuit: false,
      allowOpenLinks: false,
      allowPrint: false,
      allowCopy: false,
      allowPaste: false,
      allowRightMouse: false,
      URLFilter: [
        {
          action: 'allow',
          active: true,
          expression: `${frontendUrl}/exam/${examId}`,
          regex: false
        }
      ],
      quitURL: `${frontendUrl}/exam-completed`,
      examKey: examSessionKey
    };

    // Generate XML content for .seb file
    const sebXML = generateSEBXML(sebConfig);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/seb');
    res.setHeader('Content-Disposition', `attachment; filename="exam_${examId}.seb"`);

    res.send(sebXML);
  } catch (error) {
    console.error('Error generating SEB config:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating SEB configuration'
    });
  }
};

// Helper function to generate unique exam session key
function generateExamSessionKey(examId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${examId}_${timestamp}_${random}`;
}

// Helper function to generate SEB XML configuration
function generateSEBXML(config) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<SEBConfig xmlns="http://safeexambrowser.org/namespace/sebconfig">
  <startURL>${config.startURL}</startURL>
  <browserViewMode>${config.browserViewMode}</browserViewMode>
  <showTaskBar>${config.showTaskBar}</showTaskBar>
  <showReloadButton>${config.showReloadButton}</showReloadButton>
  <showTime>${config.showTime}</showTime>
  <allowPreferencesWindow>${config.allowPreferencesWindow}</allowPreferencesWindow>
  <allowQuit>${config.allowQuit}</allowQuit>
  <allowOpenLinks>${config.allowOpenLinks}</allowOpenLinks>
  <allowPrint>${config.allowPrint}</allowPrint>
  <allowCopy>${config.allowCopy}</allowCopy>
  <allowPaste>${config.allowPaste}</allowPaste>
  <allowRightMouse>${config.allowRightMouse}</allowRightMouse>
  <URLFilter>
    <action>${config.URLFilter[0].action}</action>
    <active>${config.URLFilter[0].active}</active>
    <expression>${config.URLFilter[0].expression}</expression>
    <regex>${config.URLFilter[0].regex}</regex>
  </URLFilter>
  <quitURL>${config.quitURL}</quitURL>
  <examKey>${config.examKey}</examKey>
</SEBConfig>`;
}

export {
  createExam,
  submitExamResults,
  getAllResults,
  getResultsByExam,
  getResultsStatistics,
  getAllPublicExams,
  getPublicExamById,
  getPublicQuestionsByExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  generateSEBConfig
};
