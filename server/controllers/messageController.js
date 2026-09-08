const Message = require('../models/Message');
const Chat = require('../models/Chat');

/**
 * Get messages for a chat (paginated, newest last)
 * GET /api/messages/:chatId?page=1&limit=50
 */
const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.userId,
    });

    if (!chat) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalMessages = await Message.countDocuments({ chat: chatId });

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name phone avatar')
      .sort({ createdAt: 1 })
      .skip(Math.max(0, totalMessages - page * limit))
      .limit(limit);

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total: totalMessages,
        hasMore: totalMessages > page * limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message
 * POST /api/messages
 */
const sendMessage = async (req, res, next) => {
  try {
    const { chatId, content, type = 'text' } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ message: 'Chat ID and content are required' });
    }

    // Verify user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.userId,
    });

    if (!chat) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = await Message.create({
      chat: chatId,
      sender: req.userId,
      content,
      type,
      status: 'sent',
      readBy: [req.userId],
    });

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name phone avatar'
    );

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark messages as seen
 * PUT /api/messages/seen/:chatId
 */
const markAsSeen = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    // Update all unseen messages from other users
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.userId },
        readBy: { $ne: req.userId },
      },
      {
        $push: { readBy: req.userId },
        $set: { status: 'seen' },
      }
    );

    res.json({ message: 'Messages marked as seen' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, sendMessage, markAsSeen };
