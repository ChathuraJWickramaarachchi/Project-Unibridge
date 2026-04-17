const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Generate 2FA setup (secret and QR code)
// @route   POST /api/2fa/setup
// @access  Private
const setup2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+twoFactorAuth.secret');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `UniBridge:${user.email}`,
      length: 20,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Temporarily store secret (not enabled yet)
    user.twoFactorAuth.secret = secret.base32;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        secret: secret.base32,
        qrCodeUrl,
        otpAuthUrl: secret.otpauth_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and enable 2FA
// @route   POST /api/2fa/verify
// @access  Private
const verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
      });
    }

    const user = await User.findById(req.user.id).select('+twoFactorAuth.secret +twoFactorAuth.backupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!user.twoFactorAuth.secret) {
      return res.status(400).json({
        success: false,
        error: '2FA setup not initiated. Please setup first.',
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code',
      });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );

    // Enable 2FA
    user.twoFactorAuth.enabled = true;
    user.twoFactorAuth.backupCodes = hashedBackupCodes;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA enabled successfully',
      data: {
        backupCodes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disable 2FA
// @route   POST /api/2fa/disable
// @access  Private
const disable2FA = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
      });
    }

    const user = await User.findById(req.user.id).select('+twoFactorAuth.secret +twoFactorAuth.backupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!user.twoFactorAuth.enabled) {
      return res.status(400).json({
        success: false,
        error: '2FA is not enabled',
      });
    }

    // Check if token is a backup code
    const isBackupCode = await checkBackupCode(user, token);

    if (!isBackupCode) {
      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          error: 'Invalid verification code',
        });
      }
    }

    // Disable 2FA
    user.twoFactorAuth.enabled = false;
    user.twoFactorAuth.secret = undefined;
    user.twoFactorAuth.backupCodes = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 2FA token during login
// @route   POST /api/2fa/login-verify
// @access  Private (requires temp token from login)
const verify2FALogin = async (req, res, next) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Token and userId are required',
      });
    }

    const user = await User.findById(userId).select('+twoFactorAuth.secret +twoFactorAuth.backupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!user.twoFactorAuth.enabled) {
      return res.status(400).json({
        success: false,
        error: '2FA is not enabled for this user',
      });
    }

    let isBackupCodeUsed = false;

    // Check if token is a backup code
    const isBackupCode = await checkBackupCode(user, token);

    if (isBackupCode) {
      isBackupCodeUsed = true;
    } else {
      // Verify TOTP token
      console.log('2FA Verification Debug:', {
        secret: user.twoFactorAuth.secret,
        token,
        encoding: 'base32',
        window: 2
      });
      
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token,
        window: 2,
      });

      console.log('2FA Verification Result:', verified);

      if (!verified) {
        return res.status(400).json({
          success: false,
          error: 'Invalid verification code',
        });
      }
    }

    // Generate JWT tokens
    const { generateToken, generateRefreshToken } = require('../config/jwt');
    const token_data = generateToken(user._id);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      message: '2FA verification successful',
      data: {
        token: token_data,
        refreshToken,
        user: user.getPublicProfile(),
        isBackupCodeUsed,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 2FA status
// @route   GET /api/2fa/status
// @access  Private
const get2FAStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        enabled: user.twoFactorAuth.enabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate backup codes
// @route   POST /api/2fa/backup-codes
// @access  Private
const regenerateBackupCodes = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
      });
    }

    const user = await User.findById(req.user.id).select('+twoFactorAuth.secret +twoFactorAuth.backupCodes');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!user.twoFactorAuth.enabled) {
      return res.status(400).json({
        success: false,
        error: '2FA is not enabled',
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code',
      });
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );

    user.twoFactorAuth.backupCodes = hashedBackupCodes;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Backup codes regenerated successfully',
      data: {
        backupCodes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Generate random backup codes
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

// Helper: Check and consume backup code
async function checkBackupCode(user, token) {
  const hashedInput = crypto.createHash('sha256').update(token).digest('hex');
  
  const codeIndex = user.twoFactorAuth.backupCodes.findIndex(
    code => code === hashedInput
  );

  if (codeIndex !== -1) {
    // Remove used backup code
    user.twoFactorAuth.backupCodes.splice(codeIndex, 1);
    await user.save();
    return true;
  }

  return false;
}

module.exports = {
  setup2FA,
  verify2FA,
  disable2FA,
  verify2FALogin,
  get2FAStatus,
  regenerateBackupCodes,
};
