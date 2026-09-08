const { verifyAccessToken } = require('../utils/tokenService');

/**
 * JWT authentication middleware
 * Extracts and verifies the access token from cookies
 */
const auth = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', expired: true });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
