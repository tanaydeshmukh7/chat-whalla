const bcrypt = require('bcryptjs');
const { OTP, OTPRateLimit } = require('../models/OTP');

// ---- Configuration ----
const OTP_CONFIG = {
  length: 6,                       // 6-digit OTP
  expiryMinutes: 5,                // OTP valid for 5 minutes
  cooldownSeconds: 30,             // Min gap between OTP sends
  maxSendsPerWindow: 5,            // Max OTPs in a 15-min window
  windowMinutes: 15,               // Rate limit window
  maxVerifyAttempts: 5,            // Max wrong attempts per OTP
  blockDurationMinutes: 30,        // Block phone after exceeding limits
};

/**
 * Generate a random 6-digit OTP code
 */
const generateOTPCode = () => {
  return Math.floor(
    Math.pow(10, OTP_CONFIG.length - 1) +
    Math.random() * (Math.pow(10, OTP_CONFIG.length) - Math.pow(10, OTP_CONFIG.length - 1))
  ).toString();
};

/**
 * Check rate limits before sending OTP
 * Returns { allowed: bool, message: string, waitSeconds: number }
 */
const checkRateLimit = async (phone) => {
  let rateLimit = await OTPRateLimit.findOne({ phone });

  if (!rateLimit) {
    return { allowed: true };
  }

  // Check if blocked
  if (rateLimit.blockedUntil && rateLimit.blockedUntil > new Date()) {
    const waitSeconds = Math.ceil((rateLimit.blockedUntil - new Date()) / 1000);
    return {
      allowed: false,
      message: `Too many OTP requests. Try again in ${Math.ceil(waitSeconds / 60)} minute(s).`,
      waitSeconds,
    };
  }

  // Check cooldown (30 seconds between sends)
  const timeSinceLastSend = (Date.now() - rateLimit.lastSentAt) / 1000;
  if (timeSinceLastSend < OTP_CONFIG.cooldownSeconds) {
    const waitSeconds = Math.ceil(OTP_CONFIG.cooldownSeconds - timeSinceLastSend);
    return {
      allowed: false,
      message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
      waitSeconds,
    };
  }

  // Check window limit (max 5 sends per 15 minutes)
  const windowElapsed = (Date.now() - rateLimit.windowStart) / 1000 / 60;
  if (windowElapsed < OTP_CONFIG.windowMinutes) {
    if (rateLimit.sendCount >= OTP_CONFIG.maxSendsPerWindow) {
      // Block the phone for 30 minutes
      rateLimit.blockedUntil = new Date(
        Date.now() + OTP_CONFIG.blockDurationMinutes * 60 * 1000
      );
      await rateLimit.save();
      return {
        allowed: false,
        message: `Too many OTP requests. Blocked for ${OTP_CONFIG.blockDurationMinutes} minutes.`,
        waitSeconds: OTP_CONFIG.blockDurationMinutes * 60,
      };
    }
  } else {
    // Window expired, reset counters
    rateLimit.sendCount = 0;
    rateLimit.windowStart = new Date();
  }

  return { allowed: true };
};

/**
 * Update rate limit counters after sending OTP
 */
const updateRateLimit = async (phone) => {
  await OTPRateLimit.findOneAndUpdate(
    { phone },
    {
      $inc: { sendCount: 1 },
      $set: { lastSentAt: new Date() },
      $setOnInsert: { windowStart: new Date() },
    },
    { upsert: true, new: true }
  );
};

/**
 * Create and store an OTP for a phone number
 * In production, this would also send an SMS via Twilio/Firebase
 */
const sendOTP = async (phone) => {
  // Check rate limits
  const rateCheck = await checkRateLimit(phone);
  if (!rateCheck.allowed) {
    const error = new Error(rateCheck.message);
    error.status = 429;
    error.waitSeconds = rateCheck.waitSeconds;
    throw error;
  }

  // Delete any existing OTPs for this phone
  await OTP.deleteMany({ phone });

  const code = generateOTPCode();
  const hashedCode = await bcrypt.hash(code, 10);

  const otp = await OTP.create({
    phone,
    code: hashedCode,
    expiresAt: new Date(Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000),
  });

  // Update rate limit counters
  await updateRateLimit(phone);

  // -------- SIMULATED SMS --------
  // In production, replace this with:
  //   await twilio.messages.create({ to: phone, body: `Your Chaat Whalla OTP: ${code}` })
  // OR:
  //   await admin.auth().createUser({ phoneNumber: phone }) for Firebase
  console.log(`\n📱 ===== OTP for ${phone}: ${code} =====\n`);
  // --------------------------------

  return { otp, code };
};

/**
 * Verify an OTP code against the stored hash
 * - Bypass code '123456' always works in development
 * - Tracks failed attempts and invalidates after max attempts
 */
const verifyOTP = async (phone, code) => {
  // Dev bypass
  if (process.env.NODE_ENV === 'development' && code === '123456') {
    await OTP.deleteMany({ phone });
    return true;
  }

  const otp = await OTP.findOne({
    phone,
    expiresAt: { $gt: new Date() },
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otp) {
    return false;
  }

  // Check if max attempts exceeded
  if (otp.attempts >= otp.maxAttempts) {
    await OTP.deleteMany({ phone });
    const error = new Error(
      'Too many wrong attempts. Please request a new OTP.'
    );
    error.status = 429;
    throw error;
  }

  const isValid = await bcrypt.compare(code, otp.code);

  if (isValid) {
    otp.verified = true;
    await otp.save();
    // Clean up used OTPs
    await OTP.deleteMany({ phone });
    // Clear rate limit on successful verify
    await OTPRateLimit.deleteMany({ phone });
  } else {
    // Increment failed attempts
    otp.attempts += 1;
    await otp.save();

    if (otp.attempts >= otp.maxAttempts) {
      await OTP.deleteMany({ phone });
      const error = new Error(
        'Too many wrong attempts. Please request a new OTP.'
      );
      error.status = 429;
      throw error;
    }

    return false;
  }

  return isValid;
};

module.exports = { sendOTP, verifyOTP, OTP_CONFIG };
