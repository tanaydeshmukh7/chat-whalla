const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

// Track connected users: userId -> Set of socketIds
const onlineUsers = new Map();

const initializeSocket = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie
          ?.split('; ')
          .find((c) => c.startsWith('accessToken='))
          ?.split('=')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`🟢 User connected: ${userId} (socket: ${socket.id})`);

    // Track this socket
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Mark user as online
    await User.findByIdAndUpdate(userId, { isOnline: true });

    // Notify others that this user is online
    socket.broadcast.emit('user:status', {
      userId,
      isOnline: true,
      lastSeen: new Date(),
    });

    // Join all chat rooms this user is part of
    const userChats = await Chat.find({ participants: userId });
    userChats.forEach((chat) => {
      socket.join(`chat:${chat._id}`);
    });

    // ---- Event Handlers ----

    // Join a specific chat room
    socket.on('chat:join', ({ chatId }) => {
      socket.join(`chat:${chatId}`);
    });

    // Leave a chat room
    socket.on('chat:leave', ({ chatId }) => {
      socket.leave(`chat:${chatId}`);
    });

    // Send a message in real-time
    socket.on('message:send', async (data) => {
      try {
        const { chatId, content, type = 'text' } = data;

        // Create message in DB
        const message = await Message.create({
          chat: chatId,
          sender: userId,
          content,
          type,
          status: 'sent',
          readBy: [userId],
        });

        // Update chat with last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          updatedAt: new Date(),
        });

        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'name phone avatar'
        );

        // Emit to all users in the chat room
        io.to(`chat:${chatId}`).emit('message:received', populatedMessage);

        // Check if recipient is in the chat room and mark as delivered
        const chat = await Chat.findById(chatId);
        const recipientId = chat.participants.find(
          (p) => p.toString() !== userId
        );

        if (recipientId && onlineUsers.has(recipientId.toString())) {
          message.status = 'delivered';
          await message.save();
          io.to(`chat:${chatId}`).emit('message:status', {
            messageId: message._id,
            status: 'delivered',
          });
        }
      } catch (error) {
        console.error('Socket message:send error:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as seen
    socket.on('message:seen', async ({ chatId, messageIds }) => {
      try {
        if (messageIds && messageIds.length > 0) {
          await Message.updateMany(
            {
              _id: { $in: messageIds },
              sender: { $ne: userId },
            },
            {
              $addToSet: { readBy: userId },
              $set: { status: 'seen' },
            }
          );

          // Notify sender that messages were seen
          socket.to(`chat:${chatId}`).emit('message:status', {
            messageIds,
            status: 'seen',
            seenBy: userId,
          });
        }
      } catch (error) {
        console.error('Socket message:seen error:', error.message);
      }
    });

    // Typing indicators
    socket.on('typing:start', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:update', {
        chatId,
        userId,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:update', {
        chatId,
        userId,
        isTyping: false,
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`🔴 User disconnected: ${userId} (socket: ${socket.id})`);

      // Remove this socket from tracking
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          // All tabs/connections closed — mark offline
          const lastSeen = new Date();
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen,
          });

          socket.broadcast.emit('user:status', {
            userId,
            isOnline: false,
            lastSeen,
          });
        }
      }
    });
  });
};

module.exports = { initializeSocket, onlineUsers };
