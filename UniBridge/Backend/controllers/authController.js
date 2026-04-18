import User from '../models/User.js';
import { createNotification } from '../utils/notificationHelper.js';
import { sendVerificationOTPEmail } from '../config/email.js';
import { generateToken } from '../config/jwt.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, address, role = 'student', companyInfo } = req.body;

    // Prevent admin registration - only existing admins can create new admins
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin registration is not allowed. Contact system administrator.',
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

    // Determine approval status based on role
    const isApproved = role === 'student' ? true : false; // Students auto-approved, employers need approval
    const approvalStatus = role === 'student' ? 'approved' : 'pending';

    // Create user (without saving yet)
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      role,
      isApproved,
      approvalStatus,
      companyInfo: role === 'employer' ? companyInfo : undefined,
    });

    // Generate OTP
    const otp = user.generateOTP();
    
    // Save user with OTP
    await user.save();

    // Send OTP email
    try {
      await sendVerificationOTPEmail(email, otp, firstName);
      console.log('✅ Verification OTP email sent to:', email);
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError.message);
      // Continue registration even if email fails - OTP is logged for development
    }

    // Log OTP for development/testing
    console.log('=== OTP VERIFICATION ===');
    console.log('OTP for', email, ':', otp);
    console.log('OTP expires in 10 minutes');
    console.log('=========================');

    // If employer registration, notify admins (optional - can be implemented later)
    if (role === 'employer') {
      console.log('=== EMPLOYER REGISTRATION ===');
      console.log('New employer registration requires approval:', email);
      console.log('Company:', companyInfo?.companyName);
      console.log('=============================');
    }

    // Generate auth token (user can login but account is not verified)
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      message: role === 'employer' 
        ? 'Account created successfully. Please check your email for OTP. Your account will be activated after admin approval.'
        : 'Account created successfully. Please check your email for the OTP.',
      data: {
        user: user.getPublicProfile(),
      },
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

    // Check for user (include 2FA fields)
    const user = await User.findOne({ email }).select('+password +twoFactorAuth.enabled');

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

    // Check if employer is approved
    if (user.role === 'employer' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        error: 'Your employer account is pending admin approval. Please wait for approval before logging in.',
        approvalStatus: user.approvalStatus,
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorAuth.enabled) {
      // Create login notification
      await createNotification(
        user._id,
        'Login Attempt',
        `A login attempt was made to your account at ${new Date().toLocaleString()}. Complete 2FA verification to access your account.`,
        'general'
      );

      // Return userId so frontend can verify 2FA
      return res.status(200).json({
        success: true,
        requires2FA: true,
        userId: user._id,
        message: '2FA verification required',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    }

    // Create login notification
    await createNotification(
      user._id,
      'Login Successful',
      `Welcome back, ${user.firstName}! You successfully logged in at ${new Date().toLocaleString()}.`,
      'general'
    );

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
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
    console.log('Forgot password request received:', req.body);
    const { email } = req.body;
    
    if (!email) {
      console.log('No email provided');
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address',
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({
        success: false,
        error: 'No user found with that email address',
      });
    }

    console.log('Generating reset token for user:', user.email);
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log('Reset token generated:', resetToken);
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    console.log('Hashed token:', user.resetPasswordToken);
    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    console.log('Token expiry set:', user.resetPasswordExpire);

    await user.save({ validateBeforeSave: false });
    console.log('User saved successfully');

    // In a real application, you would send an email here
    // For now, we'll return the token in the response
    // In production, use nodemailer or similar service
    
    res.status(200).json({
      success: true,
      message: 'Password reset token generated. In production, this would be sent via email.',
      resetToken, // Remove this in production - only for development/testing
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    console.error('Error stack:', error.stack);
    
    // Send error response directly
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
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

export {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyOTP,
};