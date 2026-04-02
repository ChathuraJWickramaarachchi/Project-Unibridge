const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const {
  submitApplication,
  getStudentApplications,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// All routes require authentication
router.use(protect);

// POST /api/applications  (student submits)
router.post('/', authorize('student'), upload.single('resume'), submitApplication);

// GET /api/applications/my  (student views own)
router.get('/my', getMyApplications);

// GET /api/applications/student/:id  (admin or self)
router.get('/student/:id', getStudentApplications);

// GET /api/applications/job/:jobId  (employer/admin)
router.get('/job/:jobId', authorize('employer', 'admin'), getJobApplications);

// PUT /api/applications/:id/status  (employer/admin)
router.put('/:id/status', authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;
