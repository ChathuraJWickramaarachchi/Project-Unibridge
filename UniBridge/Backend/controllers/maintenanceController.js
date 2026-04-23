import Maintenance from '../models/Maintenance.js';
import User from '../models/User.js';
import { sendMaintenanceNotification } from '../config/email.js';

// Helper function to send emails (used internally)
const sendEmailsHelper = async (maintenance) => {
  // Get users to notify
  const userFilter = { isVerified: true };
  if (!maintenance.affectedUsers.includes('all')) {
    userFilter.role = { $in: maintenance.affectedUsers };
  }

  const users = await User.find(userFilter).select('email firstName');

  // Send emails
  let sentCount = 0;
  for (const user of users) {
    try {
      await sendMaintenanceNotification(
        user.email,
        user.firstName,
        maintenance
      );
      sentCount++;
    } catch (error) {
      console.error(`Failed to send email to ${user.email}:`, error);
    }
  }

  // Update maintenance record
  maintenance.emailSent = true;
  maintenance.emailSentAt = new Date();
  await maintenance.save();

  return {
    totalUsers: users.length,
    emailsSent: sentCount,
  };
};

// @desc    Create maintenance notification
// @route   POST /api/maintenance
// @access  Private (Admin only)
const createMaintenance = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      severity,
      scheduledStartTime,
      scheduledEndTime,
      affectedUsers,
      sendEmailNow,
    } = req.body;

    // Validate dates
    const startTime = new Date(scheduledStartTime);
    const endTime = new Date(scheduledEndTime);

    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time',
      });
    }

    if (startTime < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Start time cannot be in the past',
      });
    }

    // Create maintenance record
    const maintenance = await Maintenance.create({
      title,
      description,
      type: type || 'scheduled',
      severity: severity || 'medium',
      scheduledStartTime: startTime,
      scheduledEndTime: endTime,
      affectedUsers: affectedUsers || ['all'],
      createdBy: req.user.id,
    });

    // Send email notification if requested
    if (sendEmailNow) {
      try {
        const emailResult = await sendEmailsHelper(maintenance);
        console.log(`✅ Maintenance emails sent: ${emailResult.emailsSent}/${emailResult.totalUsers}`);
      } catch (error) {
        console.error('Error sending maintenance emails:', error);
        // Don't fail the request if emails fail
      }
    }

    res.status(201).json({
      success: true,
      data: maintenance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all maintenance notifications
// @route   GET /api/maintenance
// @access  Private (Admin only)
const getAllMaintenance = async (req, res, next) => {
  try {
    const { status, type } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const maintenance = await Maintenance.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ scheduledStartTime: -1 });

    res.status(200).json({
      success: true,
      count: maintenance.length,
      data: maintenance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active maintenance
// @route   GET /api/maintenance/active
// @access  Public
const getActiveMaintenance = async (req, res, next) => {
  try {
    const now = new Date();

    const activeMaintenance = await Maintenance.findOne({
      status: { $in: ['scheduled', 'active'] },
      scheduledStartTime: { $lte: now },
      scheduledEndTime: { $gte: now },
    }).sort({ severity: -1, scheduledStartTime: 1 });

    res.status(200).json({
      success: true,
      data: activeMaintenance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming maintenance
// @route   GET /api/maintenance/upcoming
// @access  Public
const getUpcomingMaintenance = async (req, res, next) => {
  try {
    const now = new Date();

    const upcomingMaintenance = await Maintenance.find({
      status: 'scheduled',
      scheduledStartTime: { $gt: now },
    })
      .sort({ scheduledStartTime: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: upcomingMaintenance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate maintenance mode
// @route   PUT /api/maintenance/:id/activate
// @access  Private (Admin only)
const activateMaintenanceMode = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance not found',
      });
    }

    // Deactivate any other active maintenance modes
    await Maintenance.updateMany(
      { _id: { $ne: maintenance._id }, isMaintenanceMode: true },
      { isMaintenanceMode: false, status: 'completed', completedAt: new Date() }
    );

    await maintenance.activateMaintenanceMode();

    res.status(200).json({
      success: true,
      message: 'Maintenance mode activated',
      data: maintenance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate maintenance mode
// @route   PUT /api/maintenance/:id/deactivate
// @access  Private (Admin only)
const deactivateMaintenanceMode = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance not found',
      });
    }

    await maintenance.deactivateMaintenanceMode();

    res.status(200).json({
      success: true,
      message: 'Maintenance mode deactivated',
      data: maintenance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel maintenance
// @route   PUT /api/maintenance/:id/cancel
// @access  Private (Admin only)
const cancelMaintenance = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance not found',
      });
    }

    await maintenance.cancel(reason || 'Cancelled by admin');

    res.status(200).json({
      success: true,
      message: 'Maintenance cancelled',
      data: maintenance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send maintenance email notifications
// @route   POST /api/maintenance/:id/send-emails
// @access  Private (Admin only)
const sendMaintenanceEmails = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: 'Maintenance not found',
      });
    }

    if (maintenance.emailSent) {
      return res.status(400).json({
        success: false,
        error: 'Emails already sent for this maintenance',
      });
    }

    // Use helper function to send emails
    const emailResult = await sendEmailsHelper(maintenance);

    res.status(200).json({
      success: true,
      message: `Emails sent to ${emailResult.emailsSent} users`,
      data: emailResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats
// @access  Private (Admin only)
const getMaintenanceStats = async (req, res, next) => {
  try {
    const now = new Date();

    const stats = {
      total: await Maintenance.countDocuments(),
      scheduled: await Maintenance.countDocuments({ status: 'scheduled' }),
      active: await Maintenance.countDocuments({ status: 'active' }),
      completed: await Maintenance.countDocuments({ status: 'completed' }),
      cancelled: await Maintenance.countDocuments({ status: 'cancelled' }),
      maintenanceModeActive: await Maintenance.countDocuments({ isMaintenanceMode: true }),
      upcoming24h: await Maintenance.countDocuments({
        status: 'scheduled',
        scheduledStartTime: { $gte: now, $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
      }),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if maintenance mode is active (middleware helper)
// @route   GET /api/maintenance/check
// @access  Public
const checkMaintenanceMode = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findOne({
      isMaintenanceMode: true,
      status: 'active',
    });

    res.status(200).json({
      success: true,
      data: {
        isMaintenanceMode: !!maintenance,
        maintenance: maintenance ? {
          id: maintenance._id,
          title: maintenance.title,
          description: maintenance.description,
          estimatedCompletion: maintenance.scheduledEndTime,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  createMaintenance,
  getAllMaintenance,
  getActiveMaintenance,
  getUpcomingMaintenance,
  activateMaintenanceMode,
  deactivateMaintenanceMode,
  cancelMaintenance,
  sendMaintenanceEmails,
  getMaintenanceStats,
  checkMaintenanceMode,
};
