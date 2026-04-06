const Department = require('../models/Department');
const Job = require('../models/Job');

const departmentIcons = {
  'IT': 'Monitor',
  'Software Engineering': 'Code2',
  'Quality Assurance': 'CheckCircle',
  'Human Resources': 'Users',
  'Networking': 'Network'
};

const departmentColors = {
  'IT': '#3B82F6',
  'Software Engineering': '#10B981',
  'Quality Assurance': '#F59E0B',
  'Human Resources': '#EC4899',
  'Networking': '#8B5CF6'
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const companyId = req.user.id;

    const existingDepartment = await Department.findOne({ name, companyId });
    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department already exists'
      });
    }

    const department = await Department.create({
      name,
      description,
      icon: departmentIcons[name] || 'Building2',
      color: departmentColors[name] || '#3B82F6',
      createdBy: req.user.id,
      companyId
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const companyId = req.user.id;
    
    const departments = await Department.find({ companyId })
      .populate('internshipCount')
      .populate('jobCount')
      .populate('totalPositions')
      .sort({ createdAt: -1 });

    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const internshipCount = await Job.countDocuments({ 
          departmentId: dept._id, 
          type: 'Internship' 
        });
        const jobCount = await Job.countDocuments({ 
          departmentId: dept._id, 
          type: 'Permanent' 
        });
        
        return {
          ...dept.toObject(),
          internshipCount,
          jobCount,
          totalPositions: internshipCount + jobCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: departmentsWithCounts.length,
      data: departmentsWithCounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .select('name icon color')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, isActive } = req.body;
    const companyId = req.user.id;

    const department = await Department.findOneAndUpdate(
      { _id: id, companyId },
      { description, isActive },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.id;

    const jobCount = await Job.countDocuments({ departmentId: id });
    if (jobCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with existing jobs. Please delete all jobs first.'
      });
    }

    const department = await Department.findOneAndDelete({ _id: id, companyId });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting department',
      error: error.message
    });
  }
};

exports.getDepartmentStats = async (req, res) => {
  try {
    const companyId = req.user.id;

    const stats = await Department.aggregate([
      { $match: { companyId: new require('mongoose').Types.ObjectId(companyId) } },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'departmentId',
          as: 'jobs'
        }
      },
      {
        $project: {
          name: 1,
          totalJobs: { $size: '$jobs' },
          internships: {
            $size: {
              $filter: {
                input: '$jobs',
                as: 'job',
                cond: { $eq: ['$$job.type', 'Internship'] }
              }
            }
          },
          permanentJobs: {
            $size: {
              $filter: {
                input: '$jobs',
                as: 'job',
                cond: { $eq: ['$$job.type', 'Permanent'] }
              }
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching department stats',
      error: error.message
    });
  }
};
