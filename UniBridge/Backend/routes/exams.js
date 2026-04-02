const express = require('express');
const router = express.Router();
const { 
  createExam, 
  getCompanyExams, 
  getStudentExams, 
  updateExam, 
  deleteExam,
  getExamById
} = require('../controllers/examController');
const {
  getAllPublicExams,
  getPublicExamById,
  getPublicQuestionsByExam,
  submitExamResults
} = require('../controllers/examTestController');
const { protect } = require('../middleware/auth');

// Public routes (no authentication required)
// @route   GET /api/exams/public
// @desc    Get all active exams (public access)
router.get('/public', getAllPublicExams);

// @route   GET /api/exams/public/:id
// @desc    Get single exam by ID (public access)
router.get('/public/:id', getPublicExamById);

// @route   GET /api/exams/public/:id/questions
// @desc    Get questions for an exam (public access)
router.get('/public/:id/questions', getPublicQuestionsByExam);

// @route   POST /api/exams/public/:id/submit
// @desc    Submit exam results (public access)
router.post('/public/:id/submit', submitExamResults);

// All routes below are protected
router.use(protect);

// @route   POST /api/exams
// @desc    Create new exam (Company only)
router.post('/', createExam);

// @route   GET /api/exams/company/:companyId
// @desc    Get all exams for a company
router.get('/company/:companyId', getCompanyExams);

// @route   GET /api/exams/student/:studentId
// @desc    Get all exams for a student
router.get('/student/:studentId', getStudentExams);

// @route   GET /api/exams/:id
// @desc    Get single exam by ID
router.get('/:id', getExamById);

// @route   PUT /api/exams/:id
// @desc    Update exam (Company only)
router.put('/:id', updateExam);

// @route   DELETE /api/exams/:id
// @desc    Delete exam (Company only)
router.delete('/:id', deleteExam);

module.exports = router;
