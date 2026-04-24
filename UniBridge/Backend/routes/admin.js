import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  verifyUser,
} from '../controllers/adminController.js';
import {
  getPendingEmployers,
  approveEmployer,
  rejectEmployer,
} from '../controllers/adminEmployerController.js';
import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam
} from '../controllers/examTestController.js';
import {
  addQuestion,
  getQuestionsByExam,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} from '../controllers/questionController.js';
import {
  getAllResults,
  getResultsByExam,
  getResultDetails,
  getResultsStatistics
} from '../controllers/resultsController.js';
import {
  getExamResultsStatistics,
  getAllExamResults,
  getExamResultsByExam
} from '../controllers/examResultsController.js';
import { protect, authorize } from '../middleware/auth.js';
import { getAllPaymentsForAdmin } from '../controllers/paymentController.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Dashboard statistics
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/verify', verifyUser);

// Employer approval management
router.get('/employers/pending', getPendingEmployers);
router.put('/employers/:id/approve', approveEmployer);
router.put('/employers/:id/reject', rejectEmployer);

// Exam Management
router.post('/exams', createExam);
router.get('/exams', getAllExams);
router.get('/exams/:id', getExamById);
router.put('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);

// Question Management
router.post('/questions', addQuestion);
router.get('/questions', getAllQuestions);
router.get('/questions/:examId', getQuestionsByExam);
router.get('/questions/single/:id', getQuestionById);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Exam Results Management (from exam_results collection)
router.get('/exam-results/stats', getExamResultsStatistics);
router.get('/exam-results/exam/:examName', getExamResultsByExam);
router.get('/exam-results', getAllExamResults);

// Admin Payment Routes
// Note: Payment data is managed through /api/payments routes
// This endpoint provides admin-specific payment analytics
router.get('/payments', getAllPaymentsForAdmin);

export default router;