import { useEffect, useState, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import useContactStore from '../../store/contactStore';
import { formatChatListDate } from '../../utils/formatters';
import { getInitials } from '../../utils/formatters';
import ContactList from '../Contacts/ContactList';
import AddContact from '../Contacts/AddContact';
import ProfileSection from '../Profile/ProfileSection';
import '../../styles/sidebar.css';

const AVATAR_BASE = 'http://localhost:5000';

const Sidebar = () => {
  const { user } = useAuthStore();
  const { chats, activeChat, setActiveChat, fetchChats, createChat } = useChatStore();
  const { fetchContacts } = useContactStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePanel, setActivePanel] = useState(null); // 'contacts' | 'profile' | null

  useEffect(() => {
    fetchChats();
    fetchContacts();
  }, []);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      const other = chat.participants.find((p) => p._id !== user?._id);
      const name = other?.savedName || other?.name || '';
      return name.toLowerCase().includes(q);
    });
  }, [chats, searchQuery, user]);

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
  };

  const handleStartChat = async (contactUserId) => {
    await createChat(contactUserId);
    setActivePanel(null);
  };

  const getOtherUser = (chat) => {
    return chat.participants.find((p) => p._id !== user?._id);
  };

  const getDisplayName = (chat) => {
    const other = getOtherUser(chat);
    return other?.savedName || other?.name || other?.phone || 'Unknown';
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${AVATAR_BASE}${avatarPath}`;
  };

  return (
    <div className="sidebar">
      {/* Main Sidebar */}
      <div className="sidebar-header">
        <div className="sidebar-header-left">
          {user?.avatar ? (
            <img
              src={getAvatarUrl(user.avatar)}
              alt="Profile"
              className="avatar"
              onClick={() => setActivePanel('profile')}
            />
          ) : (
            <div
              className="avatar avatar-placeholder"
              onClick={() => setActivePanel('profile')}
            >
              {getInitials(user?.name)}
            </div>
          )}
          <h2>Chats</h2>
        </div>
        <div className="sidebar-header-actions">
          <button
            className={`icon-btn ${activePanel === 'contacts' ? 'active' : ''}`}
            onClick={() => setActivePanel(activePanel === 'contacts' ? null : 'contacts')}
            title="Contacts"
            id="contacts-btn"
          >
            👥
          </button>
          <button
            className="icon-btn"
            onClick={() => setActivePanel('profile')}
            title="Profile"
            id="profile-btn"
          >
            ⚙️
          </button>
        </div>
      </div>

      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="chat-search-input"
          />
        </div>
      </div>

      <div className="chat-list">
        {filteredChats.length === 0 ? (
          <div className="chat-list-empty">
            <div className="empty-icon">💬</div>
            <h3>No conversations yet</h3>
            <p>
              Add contacts and start chatting! Tap the 👥 icon above to get started.
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const other = getOtherUser(chat);
            const isActive = activeChat?._id === chat._id;

            return (
              <div
                key={chat._id}
                className={`chat-item ${isActive ? 'active' : ''}`}
                onClick={() => handleChatSelect(chat)}
              >
                <div className="chat-item-avatar">
                  {other?.avatar ? (
                    <img
                      src={getAvatarUrl(other.avatar)}
                      alt={getDisplayName(chat)}
                      className="avatar"
                    />
                  ) : (
                    <div className="avatar avatar-placeholder">
                      {getInitials(other?.savedName || other?.name)}
                    </div>
                  )}
                  <div
                    className={`status-dot ${other?.isOnline ? 'online' : 'offline'}`}
                  ></div>
                </div>

                <div className="chat-item-content">
                  <div className="chat-item-top">
                    <span className="chat-item-name">{getDisplayName(chat)}</span>
                    <span className="chat-item-time">
                      {formatChatListDate(
                        chat.lastMessage?.createdAt || chat.updatedAt
                      )}
                    </span>
                  </div>
                  <div className="chat-item-bottom">
                    <span className="chat-item-preview">
                      {chat.lastMessage?.sender === user?._id && (
                        <span className="tick" style={{ marginRight: 4 }}>
                          {chat.lastMessage?.status === 'seen' ? '✓✓' : 
                           chat.lastMessage?.status === 'delivered' ? '✓✓' : '✓'}
                        </span>
                      )}
                      {chat.lastMessage?.content || 'Start a conversation'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Contacts Panel */}
      {activePanel === 'contacts' && (
        <div className="slide-panel">
          <div className="slide-panel-header">
            <button
              className="icon-btn"
              onClick={() => setActivePanel(null)}
            >
              ←
            </button>
            <h2>Contacts</h2>
          </div>
          <div className="slide-panel-body">
            <AddContact />
            <ContactList onStartChat={handleStartChat} />
          </div>
        </div>
      )}

      {/* Profile Panel */}
      {activePanel === 'profile' && (
        <div className="slide-panel">
          <div className="slide-panel-header">
            <button
              className="icon-btn"
              onClick={() => setActivePanel(null)}
            >
              ←
            </button>
            <h2>Profile</h2>
          </div>
          <div className="slide-panel-body">
            <ProfileSection />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
