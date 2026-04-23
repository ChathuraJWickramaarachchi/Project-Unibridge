import User from '../models/User.js';

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    let filter = {};
    
    // Filter by role if specified
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    // Filter by verification status
    if (req.query.isVerified !== undefined) {
      filter.isVerified = req.query.isVerified === 'true';
    }
    
    // Search by name or email
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role, isVerified, profile } = req.body;
    
    // Validate required fields if provided
    if (firstName !== undefined) {
      if (!firstName || firstName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'First name must be at least 2 characters long',
        });
      }
      if (firstName.trim().length > 50) {
        return res.status(400).json({
          success: false,
          error: 'First name cannot exceed 50 characters',
        });
      }
    }
    
    if (lastName !== undefined) {
      if (!lastName || lastName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Last name must be at least 2 characters long',
        });
      }
      if (lastName.trim().length > 50) {
        return res.status(400).json({
          success: false,
          error: 'Last name cannot exceed 50 characters',
        });
      }
    }
    
    // Validate email format and check for duplicates
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address',
        });
      }
      
      // Check if email is already used by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email is already in use by another user',
        });
      }
    }
    
    // Validate role
    if (role !== undefined) {
      const validRoles = ['admin', 'student', 'employer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role. Must be admin, student, or employer',
        });
      }
    }
    
    // Validate profile fields if provided
    if (profile !== undefined) {
      if (profile.university && profile.university.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'University name cannot exceed 100 characters',
        });
      }
      if (profile.major && profile.major.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Major cannot exceed 100 characters',
        });
      }
      if (profile.year) {
        const yearNum = parseInt(profile.year);
        if (isNaN(yearNum) || yearNum < 1 || yearNum > 10) {
          return res.status(400).json({
            success: false,
            error: 'Year must be between 1 and 10',
          });
        }
      }
      if (profile.bio && profile.bio.length > 500) {
        return res.status(400).json({
          success: false,
          error: 'Bio cannot exceed 500 characters',
        });
      }
    }
    
    // Build update object
    const updateFields = {};
    
    if (firstName !== undefined) updateFields.firstName = firstName.trim();
    if (lastName !== undefined) updateFields.lastName = lastName.trim();
    if (email !== undefined) updateFields.email = email.toLowerCase().trim();
    if (role !== undefined) updateFields.role = role;
    if (isVerified !== undefined) updateFields.isVerified = isVerified;
    if (profile !== undefined) updateFields.profile = profile;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true,
        select: '-password',
      }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', '),
      });
    }
    
    // Handle duplicate key error (email)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email is already in use',
      });
    }
    
    next(error);
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own account',
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics (admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalEmployers,
        totalAdmins,
        verifiedUsers,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user (admin only)
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified },
      {
        new: true,
        runValidators: true,
        select: '-password',
      }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: `User ${req.body.isVerified ? 'verified' : 'unverified'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  verifyUser,
};