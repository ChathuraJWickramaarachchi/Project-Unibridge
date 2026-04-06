const Job = require('../models/Job');
const Department = require('../models/Department');

const MAX_JOBS_PER_TYPE = 10;

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      departmentId,
      type,
      description,
      requirements,
      responsibilities,
      salary,
      location,
      deadline,
      positions,
      isFeatured
    } = req.body;

    const companyId = req.user.id;

    const department = await Department.findOne({ _id: departmentId, companyId });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const existingJobsCount = await Job.countDocuments({
      departmentId,
      type,
      companyId
    });

    if (existingJobsCount >= MAX_JOBS_PER_TYPE) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_JOBS_PER_TYPE} ${type.toLowerCase()} positions allowed per department`
      });
    }

    const job = await Job.create({
      title,
      departmentId,
      type,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      salary: salary || 'Negotiable',
      location,
      deadline: new Date(deadline),
      positions: positions || 1,
      isFeatured: isFeatured || false,
      createdBy: req.user.id,
      companyId
    });

    const populatedJob = await Job.findById(job._id)
      .populate('departmentId', 'name icon color');

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: populatedJob
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const { department, type, search, status } = req.query;
    const companyId = req.user?.id;

    let query = {};
    
    if (companyId && req.user.role === 'company_manager') {
      query.companyId = companyId;
    }

    if (department) {
      query.departmentId = department;
    }

    if (type) {
      query.type = type;
    }

    if (status === 'active') {
      query.isActive = true;
      query.deadline = { $gte: new Date() };
    } else if (status === 'expired') {
      query.deadline = { $lt: new Date() };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('departmentId', 'name icon color')
      .populate('applicants', 'firstName lastName email')
      .sort({ isFeatured: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

exports.getPublicJobs = async (req, res) => {
  try {
    const { department, type, search } = req.query;

    let query = {
      isActive: true
    };

    if (department) {
      query.departmentId = department;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('departmentId', 'name icon color')
      .populate('companyId', 'firstName lastName email')
      .sort({ isFeatured: -1, deadline: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate('departmentId', 'name icon color')
      .populate('companyId', 'firstName lastName email')
      .populate('applicants', 'firstName lastName email profilePicture');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const allowedUpdates = [
      'title', 'description', 'requirements', 'responsibilities',
      'salary', 'location', 'deadline', 'positions', 'isActive', 'isFeatured'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.deadline) {
      updates.deadline = new Date(updates.deadline);
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, companyId },
      updates,
      { new: true, runValidators: true }
    ).populate('departmentId', 'name icon color');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const job = await Job.findOneAndDelete({ _id: id, companyId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
};

exports.getJobStats = async (req, res) => {
  try {
    const companyId = req.user.id;

    const stats = await Job.aggregate([
      { $match: { companyId: new require('mongoose').Types.ObjectId(companyId) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$isActive', true] },
                  { $gte: ['$deadline', new Date()] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const totalApplicants = await Job.aggregate([
      { $match: { companyId: new require('mongoose').Types.ObjectId(companyId) } },
      {
        $group: {
          _id: null,
          totalApplicants: { $sum: { $size: '$applicants' } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byType: stats,
        totalApplicants: totalApplicants[0]?.totalApplicants || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job stats',
      error: error.message
    });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.applicants.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    if (new Date() > new Date(job.deadline)) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    job.applicants.push(userId);
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error applying for job',
      error: error.message
    });
  }
};
