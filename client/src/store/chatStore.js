import { create } from 'zustand';
import api from '../utils/api';

const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  isLoadingChats: false,
  isLoadingMessages: false,
  typingUsers: {}, // { chatId: [userId, ...] }
  unreadCounts: {},

  fetchChats: async () => {
    set({ isLoadingChats: true });
    try {
      const { data } = await api.get('/chats');
      set({ chats: data.chats, isLoadingChats: false });
    } catch (error) {
      set({ isLoadingChats: false });
      throw error;
    }
  },

  setActiveChat: (chat) => {
    set({ activeChat: chat, messages: [] });
  },

  createChat: async (userId) => {
    const { data } = await api.post('/chats', { userId });
    const { chats } = get();
    const exists = chats.find((c) => c._id === data.chat._id);
    if (!exists) {
      set({ chats: [data.chat, ...chats] });
    }
    set({ activeChat: data.chat });
    return data.chat;
  },

  fetchMessages: async (chatId) => {
    set({ isLoadingMessages: true });
    try {
      const { data } = await api.get(`/messages/${chatId}`);
      set({ messages: data.messages, isLoadingMessages: false });

      // Mark messages as seen
      await api.put(`/messages/seen/${chatId}`);
    } catch (error) {
      set({ isLoadingMessages: false });
      throw error;
    }
  },

  addMessage: (message) => {
    const { messages, chats, activeChat } = get();

    // Add to current messages if in the same chat
    if (activeChat && message.chat === activeChat._id) {
      const exists = messages.find((m) => m._id === message._id);
      if (!exists) {
        set({ messages: [...messages, message] });
      }
    }

    // Update chat list with last message
    const updatedChats = chats.map((chat) => {
      if (chat._id === message.chat) {
        return {
          ...chat,
          lastMessage: message,
          updatedAt: message.createdAt,
        };
      }
      return chat;
    });

    // Sort by most recent
    updatedChats.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    set({ chats: updatedChats });
  },

  updateMessageStatus: (data) => {
    const { messages } = get();
    const { messageId, messageIds, status } = data;

    const idsToUpdate = messageIds || (messageId ? [messageId] : []);

    const updatedMessages = messages.map((msg) => {
      if (idsToUpdate.includes(msg._id)) {
        return { ...msg, status };
      }
      return msg;
    });

    set({ messages: updatedMessages });
  },

  setTyping: (chatId, userId, isTyping) => {
    const { typingUsers } = get();
    const chatTyping = new Set(typingUsers[chatId] || []);

    if (isTyping) {
      chatTyping.add(userId);
    } else {
      chatTyping.delete(userId);
    }

    set({
      typingUsers: {
        ...typingUsers,
        [chatId]: Array.from(chatTyping),
      },
    });
  },

  updateUserStatus: (userId, isOnline, lastSeen) => {
    const { chats, activeChat } = get();

    // Update in chat list
    const updatedChats = chats.map((chat) => ({
      ...chat,
      participants: chat.participants.map((p) =>
        p._id === userId ? { ...p, isOnline, lastSeen } : p
      ),
    }));

    // Update active chat
    let updatedActiveChat = activeChat;
    if (activeChat) {
      updatedActiveChat = {
        ...activeChat,
        participants: activeChat.participants.map((p) =>
          p._id === userId ? { ...p, isOnline, lastSeen } : p
        ),
      };
    }

    set({ chats: updatedChats, activeChat: updatedActiveChat });
  },
}));

export default useChatStore;
