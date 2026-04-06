const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createJob,
  getJobs,
  getPublicJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobStats,
  applyForJob
} = require('../controllers/jobController');

router.get('/public', getPublicJobs);
router.get('/public/:id', getJobById);

router.use(protect);

router
  .route('/')
  .get(authorize('employer', 'admin'), getJobs)
  .post(authorize('employer', 'admin'), createJob);

router.get('/stats', authorize('employer', 'admin'), getJobStats);

router.post('/:id/apply', authorize('student'), applyForJob);

router
  .route('/:id')
  .get(authorize('employer', 'admin'), getJobById)
  .put(authorize('employer', 'admin'), updateJob)
  .delete(authorize('employer', 'admin'), deleteJob);

module.exports = router;
