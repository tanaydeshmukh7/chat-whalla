import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import useChatStore from '../../store/chatStore';
import EmojiPicker from 'emoji-picker-react';

const ChatInput = () => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, startTyping, stopTyping } = useSocket();
  const { activeChat } = useChatStore();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !activeChat) return;

    sendMessage(activeChat._id, trimmed);
    setText('');
    setShowEmoji(false);

    // Stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    stopTyping(activeChat._id);

    // Re-focus input
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    if (!activeChat) return;

    startTyping(activeChat._id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(activeChat._id);
    }, 2000);
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    textareaRef.current?.focus();
  };

  return (
    <div className="chat-input-area">
      <button
        className="emoji-btn"
        onClick={() => setShowEmoji(!showEmoji)}
        title="Emoji"
        id="emoji-toggle-btn"
      >
        😊
      </button>

      {showEmoji && (
        <div className="emoji-picker-container">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="dark"
            width={340}
            height={400}
            searchDisabled={false}
            skinTonesDisabled
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="chat-text-input"
        placeholder="Type a message"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleTyping();
        }}
        onKeyDown={handleKeyDown}
        rows={1}
        id="message-input"
      />

      <button
        className="send-btn"
        onClick={handleSend}
        disabled={!text.trim()}
        title="Send"
        id="send-message-btn"
      >
        ➤
      </button>
    </div>
  );
};

export default ChatInput;
