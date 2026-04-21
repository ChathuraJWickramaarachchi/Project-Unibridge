import jwt from 'jsonwebtoken';

// @desc    Google Auth Callback Handler
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      console.error('❌ Google callback: No user found in request');
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth?error=google_auth_failed`;
      return res.redirect(errorUrl);
    }

    console.log('🎯 Google callback successful for user:', user.email);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    // Redirect to frontend with token
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:8080';
    const redirectUrl = `${frontendURL}/auth/callback?token=${token}`;
    
    console.log('↩️  Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Google callback error:', error);
    const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth?error=google_auth_failed`;
    res.redirect(errorUrl);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await req.user;
    res.status(200).json({
      success: true,
      data: user.getPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
