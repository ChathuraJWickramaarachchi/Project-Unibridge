const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendOTPEmail, sendVerificationOTPEmail } = require('../config/email');
// In production, you would use nodemailer or similar service
// For now, we'll log the verification link to console

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, address, role = 'student' } = req.body;

    // Only allow student and employer roles for public registration
    // Admin accounts must be created through admin panel or database seeding
    const allowedRoles = ['student', 'employer'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address',
      });
    }

    // Validate phone number (7-15 digits)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const cleanedPhone = phone ? phone.replace(/[\s\-\(\)\+]/g, '') : '';
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid phone number (only numbers, spaces, dashes, and parentheses allowed)',
      });
    }
    if (cleanedPhone.length < 7 || cleanedPhone.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Phone number must be between 7 and 15 digits',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Set approval status based on role
    const isApproved = userRole === 'student' ? true : false;
    const approvalStatus = userRole === 'student' ? 'approved' : 'pending';

    // Create user (without saving yet)
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      role: userRole,
      isApproved,
      approvalStatus,
    });

    // Generate OTP
    const otp = user.generateOTP();
    
    // Save user with OTP
    await user.save();

    // If employer registered, notify all admins
    if (userRole === 'employer') {
      try {
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
          await Notification.create({
            userId: admin._id,
            title: 'New Employer Registration',
            message: `A new employer (${user.firstName} ${user.lastName}) has registered and is pending approval.`,
            type: 'admin',
            isRead: false,
          });
        }
        console.log('✓ Admin notifications sent for employer registration');
      } catch (notifError) {
        console.error('Failed to send admin notifications:', notifError.message);
      }
    }

    // Send OTP via email for account verification
    console.log('Sending account verification OTP email to:', email);
    let emailSent = false;
    try {
      await sendVerificationOTPEmail(email, otp, firstName);
      console.log('✓ Account verification OTP email sent successfully');
      emailSent = true;
    } catch (emailError) {
      console.error('❌ Failed to send verification OTP email:', emailError.message);
      console.error('Email error details:', emailError);
      // Continue even if email fails - OTP is still logged for development
    }

    // Log OTP for development/testing
    console.log('\n========================================');
    console.log('🔑 REGISTRATION OTP');
    console.log('Email:', email);
    console.log('Role:', userRole);
    console.log('Approval Status:', approvalStatus);
    console.log('OTP:', otp);
    console.log('Expires in: 10 minutes');
    console.log('Email Sent:', emailSent ? 'Yes ✓' : 'No ✗ (Check console)');
    console.log('========================================\n');

    // Generate auth token (user can login but account is not verified)
    const token = generateToken(user._id);

    // Custom message based on role
    let successMessage;
    if (userRole === 'employer') {
      successMessage = emailSent 
        ? 'Account created successfully! Please check your email for verification OTP. Your account is pending admin approval.'
        : 'Account created successfully! OTP generated (check backend console). Your account is pending admin approval.';
    } else {
      successMessage = emailSent 
        ? 'Account created successfully! Please check your email for the verification OTP.'
        : 'Account created successfully! OTP generated (check backend console for development).';
    }

    res.status(201).json({
      success: true,
      token,
      message: successMessage,
      data: {
        user: user.getPublicProfile(),
      },
      // Include OTP in development mode for testing
      ...(process.env.NODE_ENV === 'development' && { debug: { otp } }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if employer account is approved
    if (user.role === 'employer' && !user.isApproved) {
      if (user.approvalStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          error: 'Your employer account has been rejected. Please contact admin for more information.',
          approvalStatus: 'rejected',
        });
      }
      return res.status(403).json({
        success: false,
        error: 'Your employer account is pending admin approval. Please wait for approval before logging in.',
        approvalStatus: 'pending',
      });
    }

    // Auto-verify user if not already verified
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
      console.log('User account auto-verified:', email);
    }
    
    // Check if user has 2FA enabled (only for admin users)
    if (user.role === 'admin' && user.twoFactorAuth && user.twoFactorAuth.enabled) {
      return res.status(200).json({
        success: true,
        requires2FA: true,
        userId: user._id,
        message: '2FA verification required',
      });
    }
    
    // Create welcome back notification
    await Notification.create({
      userId: user._id,
      title: 'Welcome Back!',
      message: `Hi ${user.firstName}! You've successfully logged in to UniBridge.`,
      type: 'general',
      isRead: false,
    });
    
    // Generate authentication token
    const { generateToken, generateRefreshToken } = require('../config/jwt');
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      requiresOTP: false,
      requires2FA: false,
      message: 'Login successful!',
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current password and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters',
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    console.log('=== FORGOT PASSWORD REQUEST ===');
    console.log('Request body:', req.body);
    const { email } = req.body;
    
    if (!email) {
      console.log('ERROR: No email provided');
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address',
      });
    }

    console.log('Searching for user with email:', email);
    // Check if user exists
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('ERROR: User not found for email:', email);
      return res.status(404).json({
        success: false,
        error: 'No user found with that email address',
      });
    }

    console.log('Generating OTP for user:', user.email, 'ID:', user._id);
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('OTP generated:', otp);
    
    // Hash OTP and store in resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    console.log('Hashed OTP stored');
    // Set expire - 10 minutes
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    console.log('OTP expiry set to:', new Date(user.resetPasswordExpire).toISOString());

    console.log('Attempting to save user with OTP...');
    
    // Use updateOne instead of save to bypass all validation
    const updateResult = await User.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: user.resetPasswordToken,
          resetPasswordExpire: user.resetPasswordExpire
        }
      }
    );
    
    console.log('Update result:', updateResult);
    console.log('✓ User updated successfully with OTP');

    // Send OTP via email
    console.log('Sending OTP email to:', email);
    let emailSent = false;
    try {
      await sendOTPEmail(email, otp);
      console.log('✓ OTP email sent successfully');
      emailSent = true;
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError.message);
      console.error('Email error details:', emailError);
      // Even if email fails, we still return success for security
      // (don't reveal if email exists or not)
    }

    console.log('Sending success response');
    
    // In development mode, also log the OTP prominently for testing
    if (process.env.NODE_ENV === 'development' || !emailSent) {
      console.log('\n========================================');
      console.log('🔑 OTP FOR TESTING (Development Mode)');
      console.log('Email:', email);
      console.log('OTP:', otp);
      console.log('Expires in: 10 minutes');
      console.log('========================================\n');
    }
    
    res.status(200).json({
      success: true,
      message: emailSent 
        ? 'An OTP has been sent to your email address. Please check your inbox.'
        : 'OTP generated! Check the backend console for the OTP code (Development mode).',
      // Only include OTP in development mode for testing
      ...(process.env.NODE_ENV === 'development' && { debug: { otp } }),
    });
  } catch (error) {
    console.error('=== ERROR IN FORGOT PASSWORD ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    // Send error response directly
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc    Reset password with OTP
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    console.log('=== RESET PASSWORD REQUEST ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide the OTP',
      });
    }

    // Hash the provided OTP to compare with stored hash
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    console.log('Searching for user with matching OTP...');
    const user = await User.findOne({
      resetPasswordToken: hashedOTP,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log('ERROR: Invalid or expired OTP');
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
    }

    console.log('OTP verified for user:', user.email);
    
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log('✓ Password updated successfully');

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('=== ERROR IN RESET PASSWORD ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
};

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOTP = async (req, res) => {
  try {
    console.log('=== VERIFY RESET OTP REQUEST ===');
    console.log('Request body:', req.body);
    
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, OTP, and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found with that email address',
      });
    }

    // Hash the provided OTP to compare with stored hash
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    console.log('Verifying OTP for user:', user.email);
    
    // Check if OTP matches and is not expired
    if (user.resetPasswordToken !== hashedOTP || user.resetPasswordExpire <= Date.now()) {
      console.log('ERROR: Invalid or expired OTP');
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
    }

    console.log('OTP verified successfully');
    
    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log('✓ Password updated successfully');

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('=== ERROR IN VERIFY RESET OTP ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and OTP',
      });
    }

    // Find user with this email and OTP
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
    }

    // Update user to verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Account verified successfully! You can now access all features.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify login OTP
// @route   POST /api/auth/verify-login-otp
// @access  Public
const verifyLoginOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and OTP',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Hash the provided OTP to compare with stored hash
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    console.log('Verifying login OTP for user:', user.email);
    
    // Check if OTP matches and is not expired
    if (user.resetPasswordToken !== hashedOTP || user.resetPasswordExpire <= Date.now()) {
      console.log('ERROR: Invalid or expired login OTP');
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP',
      });
    }

    console.log('✓ Login OTP verified successfully');
    
    // Clear the OTP fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Create welcome notification for user
    await Notification.create({
      userId: user._id,
      title: 'Welcome Back!',
      message: `Hi ${user.firstName}! You've successfully logged in to UniBridge.`,
      type: 'general',
      isRead: false,
    });

    // Generate final authentication token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Login verified successfully!',
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error('=== ERROR IN VERIFY LOGIN OTP ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
};

// @desc    Resend OTP for account verification
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Account is already verified',
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP via email
    console.log('Resending account verification OTP to:', email);
    let emailSent = false;
    try {
      await sendVerificationOTPEmail(email, otp, user.firstName);
      console.log('✓ Verification OTP resent successfully');
      emailSent = true;
    } catch (emailError) {
      console.error('❌ Failed to resend verification OTP email:', emailError.message);
    }

    // Log OTP for development
    console.log('\n========================================');
    console.log('🔑 RESENT VERIFICATION OTP');
    console.log('Email:', email);
    console.log('OTP:', otp);
    console.log('Expires in: 10 minutes');
    console.log('========================================\n');

    res.status(200).json({
      success: true,
      message: emailSent 
        ? 'A new OTP has been sent to your email address.'
        : 'OTP generated! Check backend console (Development mode).',
      ...(process.env.NODE_ENV === 'development' && { debug: { otp } }),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetOTP,
  verifyOTP,
  verifyLoginOTP,
  resendOTP,
};