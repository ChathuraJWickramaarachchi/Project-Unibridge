const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Job = require('../models/Job');
const path = require('path');

// POST /api/applications
exports.submitApplication = async (req, res) => {
  try {
    const { jobId, fullName, email, contactNumber, university, coverLetter } = req.body;
    const studentId = req.user.id;

    if (!jobId || !fullName || !email || !contactNumber || !university) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    }

    // Fetch job to get companyId
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (new Date() > new Date(job.deadline)) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    // Check for duplicate application
    const existing = await Application.findOne({ studentId, jobId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    // Handle CV upload
    let resumeUrl = null;
    let resumeFileName = null;
    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
      resumeFileName = req.file.originalname;
    }

    const application = await Application.create({
      studentId,
      jobId,
      companyId: job.companyId,
      fullName,
      email,
      contactNumber,
      university,
      coverLetter: coverLetter || '',
      resumeUrl,
      resumeFileName,
      status: 'Pending',
    });

    // Add student to job applicants list
    if (!job.applicants.includes(studentId)) {
      job.applicants.push(studentId);
      await job.save();
    }

    // Create notification for the student
    await Notification.create({
      userId: studentId,
      title: 'Application Submitted',
      message: `You successfully applied for "${job.title}". We'll notify you about updates.`,
      type: 'application',
      relatedId: application._id,
      isRead: false,
    });

    const populated = await Application.findById(application._id)
      .populate('jobId', 'title type location')
      .populate('companyId', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }
    res.status(500).json({ success: false, message: 'Error submitting application', error: error.message });
  }
};

// GET /api/applications/student/:id
exports.getStudentApplications = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Only allow the student themselves or admin
    if (req.user.id !== studentId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const applications = await Application.find({ studentId })
      .populate('jobId', 'title type location deadline departmentId')
      .populate('companyId', 'firstName lastName email')
      .sort({ appliedDate: -1 });

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching applications', error: error.message });
  }
};

// GET /api/applications/my  (logged-in student)
exports.getMyApplications = async (req, res) => {
  try {
    const studentId = req.user.id;

    const applications = await Application.find({ studentId })
      .populate('jobId', 'title type location deadline departmentId salary')
      .populate('companyId', 'firstName lastName email')
      .sort({ appliedDate: -1 });

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching applications', error: error.message });
  }
};

// GET /api/applications/job/:jobId  (employer/admin only)
exports.getJobApplications = async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('studentId', 'firstName lastName email profile')
      .populate('jobId', 'title type location salary departmentId')
      .sort({ appliedDate: -1 });

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching applications', error: error.message });
  }
};

// PUT /api/applications/:id/status  (employer/admin only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Shortlisted', 'Rejected', 'Accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('jobId', 'title');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Notify the student of status change
    const statusMessages = {
      Shortlisted: `Great news! You've been shortlisted for "${application.jobId.title}".`,
      Accepted: `Congratulations! Your application for "${application.jobId.title}" has been accepted!`,
      Rejected: `Your application for "${application.jobId.title}" was not selected this time.`,
    };

    if (statusMessages[status]) {
      await Notification.create({
        userId: application.studentId,
        title: `Application ${status}`,
        message: statusMessages[status],
        type: 'status_update',
        relatedId: application._id,
        isRead: false,
      });
    }

    res.status(200).json({ success: true, message: 'Status updated', data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating status', error: error.message });
  }
};
