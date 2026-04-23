import Maintenance from '../models/Maintenance.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken } from '../config/jwt.js';

// Middleware to check if maintenance mode is active
const checkMaintenanceMode = async (req, res, next) => {
  try {
    console.log('\n=== MAINTENANCE MIDDLEWARE CALLED ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    
    // Check if there's an active maintenance mode
    const maintenance = await Maintenance.findOne({
      isMaintenanceMode: true,
      status: 'active',
    });

    if (!maintenance) {
      console.log('✅ No maintenance mode active - allowing access\n');
      return next();
    }

    console.log('🔧 Maintenance mode is ACTIVE:', maintenance.title);
    console.log('📋 Affected users:', maintenance.affectedUsers);
    
    // Try to get user from token to check if admin
    let user = null;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = verifyToken(token);
        user = await User.findById(decoded.id).select('-password');
        req.user = user; // Set req.user for downstream middleware
        console.log('👤 User found:', user.email, 'Role:', user.role);
      } catch (error) {
        // Token invalid, user will be blocked
        console.log('❌ Invalid token during maintenance mode:', error.message);
      }
    } else {
      console.log('⚠️ No token provided');
    }

    // IMPORTANT: Always allow admin users to access regardless of affectedUsers setting
    if (user && user.role === 'admin') {
      req.maintenanceMode = true;
      req.maintenanceInfo = maintenance;
      console.log('✅ ADMIN ACCESS GRANTED - Admin bypass during maintenance mode');
      console.log('   Admin user details:', {
        id: user._id,
        email: user.email,
        role: user.role,
        roleType: typeof user.role
      });
      console.log('=== END MAINTENANCE CHECK ===\n');
      return next();
    }

    // DEBUG: Log what we're checking
    console.log('🔍 Debug check:', {
      userRole: user?.role,
      affectedUsers: maintenance.affectedUsers,
      includesAll: maintenance.affectedUsers.includes('all'),
      includesRole: maintenance.affectedUsers.includes(user?.role),
      userType: typeof user?.role
    });

    // Check if this user's role is affected by maintenance
    const isUserAffected = maintenance.affectedUsers.includes('all') || 
                          maintenance.affectedUsers.includes(user?.role);
    
    if (!isUserAffected) {
      // User's role is not affected, allow access
      console.log(`✅ User role '${user?.role}' not affected by maintenance - Access granted`);
      console.log('=== END MAINTENANCE CHECK ===\n');
      return next();
    }

    // Block affected non-admin users
    console.log(`🚫 User blocked during maintenance mode: ${user?.email || 'unauthenticated'} (Role: ${user?.role || 'none'})`);
    console.log('=== END MAINTENANCE CHECK ===\n');
    return res.status(503).json({
      success: false,
      error: 'System Maintenance',
      message: maintenance.title,
      description: maintenance.description,
      estimatedCompletion: maintenance.scheduledEndTime,
      maintenanceId: maintenance._id,
    });
  } catch (error) {
    // If there's an error checking maintenance, allow access
    console.error('❌ Error checking maintenance mode:', error);
    console.error('Stack:', error.stack);
    console.log('=== END MAINTENANCE CHECK (ERROR) ===\n');
    next();
  }
};

// Middleware to check if user can access admin maintenance features
const requireAdminForMaintenance = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.',
    });
  }
};

export {
  checkMaintenanceMode,
  requireAdminForMaintenance,
};
