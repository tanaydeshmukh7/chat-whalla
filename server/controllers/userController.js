const User = require('../models/User');
const path = require('path');

/**
 * Get current user profile
 * GET /api/users/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PUT /api/users/me
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (about !== undefined) updates.about = about;

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    }).select('-__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile avatar
 * POST /api/users/me/avatar
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-__v');

    res.json({ user, avatarUrl });
  } catch (error) {
    next(error);
  }
};

/**
 * Search user by phone number
 * GET /api/users/search?phone=...
 */
const searchByPhone = async (req, res, next) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const user = await User.findOne({ phone }).select(
      'name phone avatar about isOnline lastSeen'
    );

    if (!user) {
      return res.json({ found: false, message: 'User not registered on Chaat Whalla' });
    }

    res.json({ found: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, updateMe, uploadAvatar, searchByPhone };
