const Feedback = require('../models/Feedback');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
const createFeedback = async (req, res, next) => {
  try {
    const { name, email, subject, message, rating, category } = req.body;

    // Create feedback
    const feedback = await Feedback.create({
      name,
      email,
      subject,
      message,
      rating: rating || 0,
      category: category || 'general',
      user: req.user ? req.user.id : null,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback (admin only)
// @route   GET /api/feedback
// @access  Private/Admin
const getAllFeedback = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by rating
    if (req.query.rating) {
      filter.rating = parseInt(req.query.rating);
    }

    // Search by name, email, or message
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const feedback = await Feedback.find(filter)
      .populate('user', 'firstName lastName email role')
      .populate('adminResponse.respondedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback by ID (admin only)
// @route   GET /api/feedback/:id
// @access  Private/Admin
const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'firstName lastName email role')
      .populate('adminResponse.respondedBy', 'firstName lastName');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found',
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own feedback
// @route   GET /api/feedback/my-feedback
// @access  Private
const getMyFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({
      $or: [
        { user: req.user.id },
        { email: req.user.email },
      ],
    })
      .populate('adminResponse.respondedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update feedback status (admin only)
// @route   PUT /api/feedback/:id/status
// @access  Private/Admin
const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add admin response to feedback (admin only)
// @route   PUT /api/feedback/:id/response
// @access  Private/Admin
const addAdminResponse = async (req, res, next) => {
  try {
    const { message } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        'adminResponse.message': message,
        'adminResponse.respondedBy': req.user.id,
        'adminResponse.respondedAt': new Date(),
        status: 'resolved',
      },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update feedback (admin only)
// @route   PUT /api/feedback/:id
// @access  Private/Admin
const updateFeedback = async (req, res, next) => {
  try {
    const { category, isPublic } = req.body;

    const updateFields = {};
    if (category !== undefined) updateFields.category = category;
    if (isPublic !== undefined) updateFields.isPublic = isPublic;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete feedback (admin only)
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found',
      });
    }

    await feedback.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public feedback
// @route   GET /api/feedback/public
// @access  Public
const getPublicFeedback = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({ isPublic: true, status: 'resolved' })
      .select('name rating message subject category createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments({ isPublic: true, status: 'resolved' });

    res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback statistics (admin only)
// @route   GET /api/feedback/stats
// @access  Private/Admin
const getFeedbackStats = async (req, res, next) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    const pendingFeedback = await Feedback.countDocuments({ status: 'pending' });
    const resolvedFeedback = await Feedback.countDocuments({ status: 'resolved' });
    const inProgressFeedback = await Feedback.countDocuments({ status: 'in-progress' });

    // Average rating
    const ratingStats = await Feedback.aggregate([
      { $match: { rating: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    // Feedback by category
    const categoryStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent feedback
    const recentFeedback = await Feedback.find()
      .select('name email subject status rating createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        total: totalFeedback,
        pending: pendingFeedback,
        resolved: resolvedFeedback,
        inProgress: inProgressFeedback,
        averageRating: ratingStats[0]?.averageRating || 0,
        totalRatings: ratingStats[0]?.totalRatings || 0,
        byCategory: categoryStats,
        recent: recentFeedback,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  getMyFeedback,
  updateFeedbackStatus,
  addAdminResponse,
  updateFeedback,
  deleteFeedback,
  getPublicFeedback,
  getFeedbackStats,
};
