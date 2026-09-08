const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index — auto-delete expired docs
  },
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 5, // Max wrong attempts before OTP is invalidated
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Rate limiting model — tracks OTP sends per phone
const rateLimitSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
  },
  sendCount: {
    type: Number,
    default: 0,
  },
  lastSentAt: {
    type: Date,
    default: Date.now,
  },
  blockedUntil: {
    type: Date,
    default: null,
  },
  windowStart: {
    type: Date,
    default: Date.now,
  },
});

const OTP = mongoose.model('OTP', otpSchema);
const OTPRateLimit = mongoose.model('OTPRateLimit', rateLimitSchema);

module.exports = { OTP, OTPRateLimit };
