const Exam = require('../models/Exam');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Application = require('../models/Application');

// @desc    Create a new exam schedule
// @route   POST /api/exams
// @access  Private (Company only)
const createExam = async (req, res) => {
  try {
    console.log('=== CREATE EXAM REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User from JWT:', req.user);
    
    const { jobId, studentIds, examDate, examTime, examType, location, instructions } = req.body;

    // Validate required fields
    if (!jobId || !examDate || !examTime || !examType || !location?.type) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields',
        details: { jobId, examDate, examTime, examType, location }
      });
    }

    // Check if user exists
    if (!req.user || !req.user.id) {
      console.log('No authenticated user found');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify company owns the job
    console.log('Finding job:', jobId);
    const job = await Job.findById(jobId);
    if (!job) {
      console.log('Job not found:', jobId);
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    console.log('Job found, checking ownership...');
    console.log('Job created by:', job.createdBy);
    console.log('Job company ID:', job.companyId);
    console.log('User ID:', req.user.id);

    // Check if user created this job OR owns the company
    const jobOwnerId = job.createdBy ? job.createdBy.toString() : null;
    const jobCompanyId = job.companyId ? job.companyId.toString() : null;
    const currentUserId = req.user.id.toString();

    if (jobOwnerId !== currentUserId && jobCompanyId !== currentUserId) {
      console.log('Authorization failed - user does not own this job');
      console.log('Job owner:', jobOwnerId);
      console.log('Company ID:', jobCompanyId);
      console.log('Current user:', currentUserId);
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to create exam for this job' 
      });
    }

    // Validate students if provided
    let validStudentIds = [];
    if (studentIds && studentIds.length > 0) {
      const students = await User.find({ 
        _id: { $in: studentIds },
        role: 'student'
      });
      validStudentIds = students.map(s => s._id);
      
      if (validStudentIds.length !== studentIds.length) {
        console.log('Some student IDs were invalid');
      }
    }

    // Create exam
    console.log('Creating exam with data:', {
      jobId,
      companyId: req.user.id,
      examDate,
      examTime,
      examType,
      location
    });

    const exam = await Exam.create({
      jobId,
      companyId: req.user.id,
      studentIds: validStudentIds,
      examDate,
      examTime,
      examType,
      location,
      instructions: instructions || '',
      status: 'Scheduled'
    });

    console.log('Exam created successfully:', exam._id);

    // ── Send notifications to all applicants of this job ──────────────────
    try {
      // Get all approved applicants for this job
      const applications = await Application.find({ jobId })
        .select('studentId')
        .lean();

      // Merge with explicitly listed studentIds (if any)
      const allStudentIds = [
        ...new Set([
          ...applications.map(a => a.studentId.toString()),
          ...validStudentIds.map(id => id.toString()),
        ]),
      ];

      const examDateFormatted = new Date(examDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      const locationText = location.type === 'Physical'
        ? `Physical — ${location.address}`
        : 'Online';

      await Promise.allSettled(
        allStudentIds.map(studentId =>
          Notification.create({
            userId: studentId,
            title: `📅 Exam Scheduled: ${job.title}`,
            message: `A ${examType} exam has been scheduled for the "${job.title}" position on ${examDateFormatted} at ${examTime}. Location: ${locationText}.${instructions ? ' Instructions: ' + instructions : ''}`,
            type: 'exam',
            relatedId: exam._id,
            isRead: false,
          })
        )
      );
      console.log(`Exam notifications sent to ${allStudentIds.length} student(s)`);
    } catch (notifErr) {
      // Non-critical — log but don't fail the request
      console.error('Failed to send exam notifications:', notifErr.message);
    }
    // ──────────────────────────────────────────────────────────────────────

    // Populate job details
    const populatedExam = await Exam.findById(exam._id)
      .populate('jobId', 'title type')
      .populate('companyId', 'firstName lastName email company');

    res.status(201).json({
      success: true,
      data: populatedExam
    });
  } catch (error) {
    console.error('=== CREATE EXAM ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    let errorMessage = 'Server error creating exam';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + error.message;
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid ID format';
    } else if (error.code === 11000) {
      errorMessage = 'Duplicate entry';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: error.message,
      errorType: error.name
    });
  }
};

// @desc    Get all exams for a company
// @route   GET /api/exams/company/:companyId
// @access  Private (Company only)
const getCompanyExams = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Check authorization
    if (req.user.role !== 'admin' && req.user.id !== companyId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    const exams = await Exam.find({ companyId })
      .populate('jobId', 'title type department')
      .populate('studentIds', 'firstName lastName email')
      .sort({ examDate: -1, examTime: -1 });

    res.json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    console.error('Get company exams error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching exams',
      error: error.message 
    });
  }
};

// @desc    Get exams for a student
// @route   GET /api/exams/student/:studentId
// @access  Private
const getStudentExams = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check authorization
    if (req.user.role !== 'admin' && req.user.id !== studentId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    const exams = await Exam.find({ studentIds: studentId })
      .populate('jobId', 'title type department')
      .populate('companyId', 'firstName lastName email company')
      .sort({ examDate: 1, examTime: 1 });

    res.json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    console.error('Get student exams error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching exams',
      error: error.message 
    });
  }
};

// @desc    Update an exam
// @route   PUT /api/exams/:id
// @access  Private (Company only)
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }

    // Check if user is the company that created the exam
    if (exam.companyId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this exam' 
      });
    }

    // Prevent updating completed/cancelled exams
    if (exam.status === 'Completed' || exam.status === 'Cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot update ${exam.status} exam` 
      });
    }

    // Update allowed fields
    const allowedFields = ['studentIds', 'examDate', 'examTime', 'examType', 'location', 'instructions', 'status'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        exam[field] = updateData[field];
      }
    });

    await exam.save();

    // ── Notify students of exam update ────────────────────────────────────
    try {
      const updatedStudentIds = exam.studentIds.map(id => id.toString());
      // Also notify any job applicants who weren't explicitly listed
      const applications = await Application.find({ jobId: exam.jobId })
        .select('studentId').lean();
      const allStudentIds = [
        ...new Set([
          ...applications.map(a => a.studentId.toString()),
          ...updatedStudentIds,
        ]),
      ];

      const jobDoc = await Job.findById(exam.jobId).select('title').lean();
      const jobTitle = jobDoc ? jobDoc.title : 'the position';
      const examDateFormatted = new Date(exam.examDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      const locationText = exam.location.type === 'Physical'
        ? `Physical — ${exam.location.address}`
        : 'Online';

      await Promise.allSettled(
        allStudentIds.map(studentId =>
          Notification.create({
            userId: studentId,
            title: `🔄 Exam Updated: ${jobTitle}`,
            message: `The ${exam.examType} exam for "${jobTitle}" has been updated. New schedule: ${examDateFormatted} at ${exam.examTime}. Location: ${locationText}.`,
            type: 'exam',
            relatedId: exam._id,
            isRead: false,
          })
        )
      );
      console.log(`Exam update notifications sent to ${allStudentIds.length} student(s)`);
    } catch (notifErr) {
      console.error('Failed to send exam update notifications:', notifErr.message);
    }
    // ──────────────────────────────────────────────────────────────────────

    const updatedExam = await Exam.findById(exam._id)
      .populate('jobId', 'title type department')
      .populate('studentIds', 'firstName lastName email');

    res.json({
      success: true,
      data: updatedExam
    });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating exam',
      error: error.message 
    });
  }
};

// @desc    Delete an exam
// @route   DELETE /api/exams/:id
// @access  Private (Company only)
const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id);

    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }

    // Check if user is the company that created the exam
    if (exam.companyId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this exam' 
      });
    }

    await exam.deleteOne();

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting exam',
      error: error.message 
    });
  }
};

// @desc    Get single exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findById(id)
      .populate('jobId', 'title type department')
      .populate('companyId', 'firstName lastName email company')
      .populate('studentIds', 'firstName lastName email program year');

    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }

    // Check authorization
    const isCompanyOwner = exam.companyId._id.toString() === req.user.id;
    const isStudent = exam.studentIds.some(student => 
      student._id.toString() === req.user.id
    );
    const isApplicant = await Application.exists({
      jobId: exam.jobId._id || exam.jobId,
      studentId: req.user.id
    });

    if (!isCompanyOwner && !isStudent && !isApplicant && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this exam' 
      });
    }

    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Get exam by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching exam',
      error: error.message 
    });
  }
};

export {
  createExam,
  getCompanyExams,
  getStudentExams,
  updateExam,
  deleteExam,
  getExamById
};
