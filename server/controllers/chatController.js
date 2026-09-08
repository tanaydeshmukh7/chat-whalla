const Chat = require('../models/Chat');
const User = require('../models/User');
const Contact = require('../models/Contact');

/**
 * Get all chats for the current user (sorted by last activity)
 * GET /api/chats
 */
const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.userId })
      .populate('participants', 'name phone avatar isOnline lastSeen about')
      .populate({
        path: 'lastMessage',
        select: 'content type sender status createdAt',
      })
      .sort({ updatedAt: -1 });

    // Enrich each chat with contact savedName if available
    const contacts = await Contact.find({ owner: req.userId });
    const contactMap = {};
    contacts.forEach((c) => {
      contactMap[c.contact.toString()] = c.savedName;
    });

    const enrichedChats = chats.map((chat) => {
      const chatObj = chat.toObject();
      chatObj.participants = chatObj.participants.map((p) => ({
        ...p,
        savedName: contactMap[p._id.toString()] || null,
      }));
      return chatObj;
    });

    res.json({ chats: enrichedChats });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or get a 1-on-1 chat with another user
 * POST /api/chats
 */
const createChat = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (userId === req.userId) {
      return res.status(400).json({ message: "Can't chat with yourself" });
    }

    // Check if the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if a chat already exists between these two users
    let chat = await Chat.findOne({
      participants: { $all: [req.userId, userId], $size: 2 },
    })
      .populate('participants', 'name phone avatar isOnline lastSeen about')
      .populate({
        path: 'lastMessage',
        select: 'content type sender status createdAt',
      });

    if (chat) {
      return res.json({ chat });
    }

    // Create new chat
    chat = await Chat.create({
      participants: [req.userId, userId],
    });

    chat = await Chat.findById(chat._id)
      .populate('participants', 'name phone avatar isOnline lastSeen about')
      .populate({
        path: 'lastMessage',
        select: 'content type sender status createdAt',
      });

    res.status(201).json({ chat });
  } catch (error) {
    next(error);
  }
};

module.exports = { getChats, createChat };
