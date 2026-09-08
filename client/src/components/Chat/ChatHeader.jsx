import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import { formatLastSeen, getInitials } from '../../utils/formatters';

const AVATAR_BASE = 'http://localhost:5000';

const ChatHeader = () => {
  const { user } = useAuthStore();
  const { activeChat, typingUsers } = useChatStore();

  if (!activeChat) return null;

  const other = activeChat.participants.find((p) => p._id !== user?._id);
  const displayName = other?.savedName || other?.name || other?.phone || 'Unknown';
  const isTyping = typingUsers[activeChat._id]?.includes(other?._id);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${AVATAR_BASE}${avatarPath}`;
  };

  const getStatusText = () => {
    if (isTyping) return 'typing...';
    if (other?.isOnline) return 'online';
    if (other?.lastSeen) return `last seen ${formatLastSeen(other.lastSeen)}`;
    return '';
  };

  const statusClass = isTyping ? 'typing' : other?.isOnline ? 'online' : '';

  return (
    <div className="chat-header">
      <div className="chat-header-avatar">
        {other?.avatar ? (
          <img
            src={getAvatarUrl(other.avatar)}
            alt={displayName}
            className="avatar"
          />
        ) : (
          <div className="avatar avatar-placeholder">
            {getInitials(displayName)}
          </div>
        )}
        <div
          className={`status-dot ${other?.isOnline ? 'online' : 'offline'}`}
        ></div>
      </div>

      <div className="chat-header-info">
        <div className="chat-header-name">{displayName}</div>
        <div className={`chat-header-status ${statusClass}`}>
          {getStatusText()}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
