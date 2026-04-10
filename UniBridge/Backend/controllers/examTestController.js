import zlib from 'zlib';
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

// ==================== SECURE EXAM ENDPOINTS (Authenticated - SEB) ====================

// @desc    Get exam by ID (authenticated - for SEB secure exam flow)
// @route   GET /api/exams/secure/:id
// @access  Private
const getSecureExamById = async (req, res) => {
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

    const questionCount = await Question.countDocuments({ examId: exam._id });
    
    res.status(200).json({
      success: true,
      data: {
        ...exam.toObject(),
        questionCount
      }
    });
  } catch (error) {
    console.error('Error fetching secure exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam'
    });
  }
};

// @desc    Get questions for exam (authenticated - for SEB secure exam flow)
// @route   GET /api/exams/secure/:id/questions
// @access  Private
const getSecureQuestionsByExam = async (req, res) => {
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
    console.error('Error fetching secure questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions'
    });
  }
};

// @desc    Submit exam results (authenticated - uses req.user.email to prevent impersonation)
// @route   POST /api/exams/secure/:id/submit
// @access  Private
const secureSubmitExamResults = async (req, res) => {
  try {
    const { answers, duration } = req.body;
    const examId = req.params.id;
    // Use the authenticated user's email — prevents impersonation
    const applicantEmail = req.user.email;

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
    console.error('Error submitting secure exam results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit exam results'
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

    // Get frontend URL from environment or from the request origin
    const frontendUrl =
      (process.env.FRONTEND_URL && process.env.FRONTEND_URL.replace(/\/$/, '')) ||
      req.get('origin') ||
      'http://localhost:8080';

    // Generate unique exam session key
    const examSessionKey = generateExamSessionKey(examId);

    const examUrl = `${frontendUrl}/secure-exam/${examId}`;
    const examLoginUrl = `${frontendUrl}/secure-exam-login/${examId}`;
    const examUrlRegex = `^${escapeRegex(examUrl)}(\\?.*)?$`;

    // Create SEB configuration
    const sebConfig = {
      startURL: `${examLoginUrl}?lockdown=true`,
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
          expression: examUrlRegex,
          regex: true
        },
        {
          action: 'allow',
          active: true,
          expression: `^${escapeRegex(examLoginUrl)}(\\?.*)?$`,
          regex: true
        },
        {
          action: 'allow',
          active: true,
          expression: `^${escapeRegex(frontendUrl)}/secure-exam-completed(\\?.*)?$`,
          regex: true
        },
        {
          action: 'allow',
          active: true,
          expression: `^${escapeRegex(frontendUrl)}/api/(auth/login|exams/secure/).*$`,
          regex: true
        }
      ],
      quitURL: `${frontendUrl}/secure-exam-completed`,
      quitURLConfirm: false, // Exit immediately without confirmation when quitURL is reached
      // Legacy quit URL kept for backward compatibility
      // legacyQuitURL: `${frontendUrl}/seb-exam-completed?lockdown=true`,
      examKey: examSessionKey
    };

    // Generate plist XML content for .seb file
    const sebPlist = generateSEBPlist(sebConfig);
    const gzippedSeb = zlib.gzipSync(Buffer.from(sebPlist, 'utf8'));
    const sebBuffer = Buffer.concat([Buffer.from('plnd'), gzippedSeb]);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="exam_${examId}.seb"`);
    res.setHeader('Content-Length', sebBuffer.length);

    res.send(sebBuffer);
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

function escapeXML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function booleanXML(value) {
  return value ? '<true/>' : '<false/>';
}

function generateSEBPlist(config) {
  const filterItems = config.URLFilter.map(filter => {
    return [
      '    <dict>',
      `      <key>action</key><string>${escapeXML(filter.action)}</string>`,
      `      <key>active</key>${booleanXML(filter.active)}`,
      `      <key>expression</key><string>${escapeXML(filter.expression)}</string>`,
      `      <key>regex</key>${booleanXML(filter.regex)}`,
      '    </dict>',
    ].join('\n');
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n` +
    `<plist version="1.0">\n` +
    `<dict>\n` +
    `  <key>startURL</key><string>${escapeXML(config.startURL)}</string>\n` +
    `  <key>quitURL</key><string>${escapeXML(config.quitURL)}</string>\n` +
    `  <key>quitURLConfirm</key>${booleanXML(config.quitURLConfirm)}\n` +
    `  <key>browserViewMode</key><integer>${config.browserViewMode}</integer>\n` +
    `  <key>showTaskBar</key>${booleanXML(config.showTaskBar)}\n` +
    `  <key>showReloadButton</key>${booleanXML(config.showReloadButton)}\n` +
    `  <key>showTime</key>${booleanXML(config.showTime)}\n` +
    `  <key>allowPreferencesWindow</key>${booleanXML(config.allowPreferencesWindow)}\n` +
    `  <key>allowQuit</key>${booleanXML(config.allowQuit)}\n` +
    `  <key>allowOpenLinks</key>${booleanXML(config.allowOpenLinks)}\n` +
    `  <key>allowPrint</key>${booleanXML(config.allowPrint)}\n` +
    `  <key>allowCopy</key>${booleanXML(config.allowCopy)}\n` +
    `  <key>allowPaste</key>${booleanXML(config.allowPaste)}\n` +
    `  <key>allowRightMouse</key>${booleanXML(config.allowRightMouse)}\n` +
    `  <key>URLFilter</key>\n` +
    `  <array>\n` +
    `${filterItems}\n` +
    `  </array>\n` +
    `  <key>browserWindowWebView</key><integer>3</integer>\n` +
    `  <key>URLFilterEnableContentFilter</key><false/>\n` +
    `</dict>\n` +
    `</plist>`;
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
  getSecureExamById,
  getSecureQuestionsByExam,
  secureSubmitExamResults,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  generateSEBConfig
};
