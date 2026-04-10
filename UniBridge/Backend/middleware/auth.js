import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken } from '../config/jwt.js';

const protect = async (req, res, next) => {
  console.log('🔒 Auth Check for:', req.method, req.originalUrl);
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized, user not found',
        });
      }

      console.log('✅ Auth Success - User identified:', req.user.email);
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed',
      });
    }
  } else {
    console.warn('🚫 No token provided for:', req.originalUrl);
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token',
    });
  }
};

// ... rest of the file stays the same
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'User not authorized to access this resource',
      });
    }

    next();
  };
};

export {
  protect,
  authorize,
};