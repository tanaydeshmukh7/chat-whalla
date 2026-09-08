import useContactStore from '../../store/contactStore';
import { getInitials } from '../../utils/formatters';
import '../../styles/contacts.css';

const AVATAR_BASE = 'http://localhost:5000';

const ContactList = ({ onStartChat }) => {
  const { contacts, isLoading } = useContactStore();

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${AVATAR_BASE}${avatarPath}`;
  };

  if (isLoading) {
    return (
      <div className="flex-center" style={{ padding: 40 }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="contact-list">
      <div className="contact-list-header">
        Contacts on Chaat Whalla · {contacts.length}
      </div>

      {contacts.length === 0 ? (
        <div className="chat-list-empty" style={{ padding: '40px 20px' }}>
          <div className="empty-icon">📇</div>
          <h3>No contacts yet</h3>
          <p>Add a contact above using their phone number</p>
        </div>
      ) : (
        contacts.map((contact) => {
          const user = contact.contact;
          return (
            <div
              key={contact._id}
              className="contact-item"
              onClick={() => onStartChat(user._id)}
            >
              <div className="contact-item-avatar">
                {user?.avatar ? (
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={contact.savedName}
                    className="avatar"
                  />
                ) : (
                  <div className="avatar avatar-placeholder">
                    {getInitials(contact.savedName)}
                  </div>
                )}
                <div
                  className={`status-dot ${user?.isOnline ? 'online' : 'offline'}`}
                ></div>
              </div>

              <div className="contact-item-info">
                <div className="contact-item-name">{contact.savedName}</div>
                <div className="contact-item-about">
                  {user?.about || user?.phone}
                </div>
              </div>

              <div className="contact-item-actions">
                <button className="contact-msg-btn" title="Start chat">
                  💬
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ContactList;
