const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  sendOTPHandler,
  verifyOTPHandler,
  signupHandler,
  refreshHandler,
  logoutHandler,
} = require('../controllers/authController');

router.post('/send-otp', sendOTPHandler);
router.post('/verify-otp', verifyOTPHandler);
router.post('/signup', auth, signupHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);

module.exports = router;
