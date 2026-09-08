const User = require('../models/User');
const { sendOTP, verifyOTP, OTP_CONFIG } = require('../utils/otpService');
const { setAuthCookies, clearAuthCookies, verifyRefreshToken } = require('../utils/tokenService');

/**
 * Send OTP to a phone number
 * POST /api/auth/send-otp
 */
const sendOTPHandler = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Validate phone format (basic check)
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    const result = await sendOTP(phone);

    const response = {
      message: 'OTP sent successfully',
      phone,
      expiresInSeconds: OTP_CONFIG.expiryMinutes * 60,
      cooldownSeconds: OTP_CONFIG.cooldownSeconds,
    };

    // In dev mode, send the OTP code back so the user can see it on-screen
    if (process.env.NODE_ENV === 'development') {
      response.devOtp = result.code;
    }

    res.json(response);
  } catch (error) {
    // Rate limit error
    if (error.status === 429) {
      return res.status(429).json({
        message: error.message,
        waitSeconds: error.waitSeconds || 30,
      });
    }
    next(error);
  }
};

/**
 * Verify OTP and authenticate user
 * POST /api/auth/verify-otp
 */
const verifyOTPHandler = async (req, res, next) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ message: 'Phone and OTP code are required' });
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'OTP must be a 6-digit number' });
    }

    const isValid = await verifyOTP(phone, code);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please try again.' });
    }

    // Find or create user
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      user = await User.create({ phone });
      isNewUser = true;
    }

    // Set auth cookies
    const tokens = setAuthCookies(res, user._id.toString());

    res.json({
      message: 'OTP verified successfully',
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
        about: user.about,
        isProfileComplete: user.isProfileComplete,
      },
      isNewUser,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    // Max attempts exceeded
    if (error.status === 429) {
      return res.status(429).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Complete signup (set name, avatar)
 * POST /api/auth/signup
 */
const signupHandler = async (req, res, next) => {
  try {
    const { name, about } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name,
        about: about || "Hey there! I'm using Chaat Whalla",
        isProfileComplete: true,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile completed',
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
        about: user.about,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const tokens = setAuthCookies(res, user._id.toString());

    res.json({
      message: 'Token refreshed',
      user: {
        _id: user._id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
        about: user.about,
        isProfileComplete: user.isProfileComplete,
      },
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logoutHandler = async (req, res) => {
  clearAuthCookies(res);

  if (req.userId) {
    await User.findByIdAndUpdate(req.userId, {
      isOnline: false,
      lastSeen: new Date(),
    });
  }

  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  sendOTPHandler,
  verifyOTPHandler,
  signupHandler,
  refreshHandler,
  logoutHandler,
};
