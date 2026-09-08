import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { addMessage, updateMessageStatus, setTyping, updateUserStatus } =
    useChatStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');

    const socket = io('http://localhost:5000', {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🟢 Socket connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
      setConnected(false);
    });

    // Listen for incoming messages
    socket.on('message:received', (message) => {
      addMessage(message);
    });

    // Listen for message status updates
    socket.on('message:status', (data) => {
      updateMessageStatus(data);
    });

    // Listen for typing indicators
    socket.on('typing:update', ({ chatId, userId, isTyping }) => {
      setTyping(chatId, userId, isTyping);
    });

    // Listen for user online/offline status
    socket.on('user:status', ({ userId, isOnline, lastSeen }) => {
      updateUserStatus(userId, isOnline, lastSeen);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, user?._id]);

  const sendMessage = (chatId, content, type = 'text') => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message:send', { chatId, content, type });
    }
  };

  const joinChat = (chatId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:join', { chatId });
    }
  };

  const leaveChat = (chatId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:leave', { chatId });
    }
  };

  const markSeen = (chatId, messageIds) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message:seen', { chatId, messageIds });
    }
  };

  const startTyping = (chatId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:start', { chatId });
    }
  };

  const stopTyping = (chatId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:stop', { chatId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        sendMessage,
        joinChat,
        leaveChat,
        markSeen,
        startTyping,
        stopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
