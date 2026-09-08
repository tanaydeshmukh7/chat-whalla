import { useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import { useSocket } from '../../context/SocketContext';
import ChatHeader from './ChatHeader';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

const ChatScreen = () => {
  const { user } = useAuthStore();
  const {
    activeChat,
    messages,
    isLoadingMessages,
    fetchMessages,
    typingUsers,
  } = useChatStore();
  const { joinChat, leaveChat, markSeen } = useSocket();
  const messagesEndRef = useRef(null);
  const prevChatRef = useRef(null);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      // Leave previous chat room
      if (prevChatRef.current && prevChatRef.current !== activeChat._id) {
        leaveChat(prevChatRef.current);
      }

      // Join new chat room
      joinChat(activeChat._id);
      fetchMessages(activeChat._id);
      prevChatRef.current = activeChat._id;
    }
  }, [activeChat?._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as seen when viewing
  useEffect(() => {
    if (activeChat && messages.length > 0) {
      const unseenMessages = messages
        .filter((m) => m.sender?._id !== user?._id && m.status !== 'seen')
        .map((m) => m._id);

      if (unseenMessages.length > 0) {
        markSeen(activeChat._id, unseenMessages);
      }
    }
  }, [messages, activeChat?._id]);

  const isTyping =
    activeChat &&
    typingUsers[activeChat._id]?.some((uid) => uid !== user?._id);

  // Group messages by date
  const getDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay && d.getDate() === now.getDate()) return 'Today';
    if (diff < 2 * oneDay) return 'Yesterday';
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (!activeChat) {
    return (
      <div className="chat-area">
        <div className="chat-empty">
          <div className="chat-empty-icon">💬</div>
          <h2>Chaat Whalla Web</h2>
          <p>
            Send and receive messages in real-time. Select a chat from the
            sidebar or add a new contact to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <ChatHeader />

      <div className="chat-messages">
        {isLoadingMessages ? (
          <div className="chat-messages-loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const showDate =
                index === 0 ||
                new Date(msg.createdAt).toDateString() !==
                  new Date(messages[index - 1].createdAt).toDateString();

              return (
                <div key={msg._id}>
                  {showDate && (
                    <div className="date-separator">
                      <span>{getDateLabel(msg.createdAt)}</span>
                    </div>
                  )}
                  <ChatBubble
                    message={msg}
                    isOwn={msg.sender?._id === user?._id}
                  />
                </div>
              );
            })}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput />
    </div>
  );
};

export default ChatScreen;
