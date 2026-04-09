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
import { protect, authorize } from '../middleware/auth.js';

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

// Results Management
router.get('/results/stats/summary', getResultsStatistics);
router.get('/results/:examId/:email', getResultDetails);
router.get('/results/:examId', getResultsByExam);
router.get('/results', getAllResults);

export default router;