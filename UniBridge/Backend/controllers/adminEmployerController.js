import User from '../models/User.js';
import { createNotification } from '../utils/notificationHelper.js';

// @desc    Get all pending employer approvals
// @route   GET /api/admin/employers/pending
// @access  Private/Admin
const getPendingEmployers = async (req, res, next) => {
  try {
    const employers = await User.find({
      role: 'employer',
      approvalStatus: 'pending',
    }).select('-password');

    res.status(200).json({
      success: true,
      count: employers.length,
      data: employers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve employer
// @route   PUT /api/admin/employers/:id/approve
// @access  Private/Admin
const approveEmployer = async (req, res, next) => {
  try {
    const employer = await User.findById(req.params.id);

    if (!employer) {
      return res.status(404).json({
        success: false,
        error: 'Employer not found',
      });
    }

    if (employer.role !== 'employer') {
      return res.status(400).json({
        success: false,
        error: 'User is not an employer',
      });
    }

    employer.isApproved = true;
    employer.approvalStatus = 'approved';
    await employer.save();

    // Send notification to employer
    await createNotification(
      employer._id,
      'Account Approved',
      `Congratulations! Your employer account has been approved. You can now log in and start posting opportunities.`,
      'general'
    );

    res.status(200).json({
      success: true,
      message: 'Employer approved successfully',
      data: employer.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject employer
// @route   PUT /api/admin/employers/:id/reject
// @access  Private/Admin
const rejectEmployer = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const employer = await User.findById(req.params.id);

    if (!employer) {
      return res.status(404).json({
        success: false,
        error: 'Employer not found',
      });
    }

    if (employer.role !== 'employer') {
      return res.status(400).json({
        success: false,
        error: 'User is not an employer',
      });
    }

    employer.isApproved = false;
    employer.approvalStatus = 'rejected';
    await employer.save();

    // Send notification to employer
    await createNotification(
      employer._id,
      'Account Rejected',
      `Your employer account has been rejected. Reason: ${reason || 'Please contact support for more information.'}`,
      'general'
    );

    res.status(200).json({
      success: true,
      message: 'Employer rejected successfully',
      data: employer.getPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

export {
  getPendingEmployers,
  approveEmployer,
  rejectEmployer,
};
