import express from 'express';
import { 
  createExam, 
  getCompanyExams, 
  getStudentExams, 
  updateExam, 
  deleteExam,
  getExamById
} from '../controllers/examController.js';
import {
  getAllPublicExams,
  getPublicExamById,
  getPublicQuestionsByExam,
  submitExamResults,
  generateSEBConfig,
  getSecureExamById,
  getSecureQuestionsByExam,
  secureSubmitExamResults
} from '../controllers/examTestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

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

// @route   GET /api/exams/:id/seb-config
// @desc    Generate SEB configuration for exam (requires authentication)
router.get('/:id/seb-config', protect, generateSEBConfig);

// Secure exam routes (authenticated - for SEB secure exam flow)
// @route   GET /api/exams/secure/:id
// @desc    Get exam by ID (authenticated, for SEB)
router.get('/secure/:id', protect, getSecureExamById);

// @route   GET /api/exams/secure/:id/questions
// @desc    Get questions for exam (authenticated, for SEB)
router.get('/secure/:id/questions', protect, getSecureQuestionsByExam);

// @route   POST /api/exams/secure/:id/submit
// @desc    Submit exam results (authenticated, uses req.user.email)
router.post('/secure/:id/submit', protect, secureSubmitExamResults);

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

export default router;
