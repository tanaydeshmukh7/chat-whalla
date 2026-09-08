import { useState, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import { getInitials, formatPhone } from '../../utils/formatters';
import '../../styles/contacts.css';

const AVATAR_BASE = 'http://localhost:5000';

const ProfileSection = () => {
  const { user, updateProfile, uploadAvatar, logout } = useAuthStore();
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const fileRef = useRef();

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${AVATAR_BASE}${avatarPath}`;
  };

  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  const handleSave = async () => {
    if (!editingField) return;

    try {
      await updateProfile({ [editingField]: editValue.trim() });
      setEditingField(null);
      setEditValue('');
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await uploadAvatar(file);
      } catch (err) {
        console.error('Failed to upload avatar:', err);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="profile-panel">
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrapper">
          {user?.avatar ? (
            <img
              src={getAvatarUrl(user.avatar)}
              alt="Profile"
              className="avatar avatar-xl"
            />
          ) : (
            <div className="avatar avatar-xl avatar-placeholder">
              {getInitials(user?.name)}
            </div>
          )}
          <div
            className="profile-avatar-edit"
            onClick={() => fileRef.current?.click()}
          >
            📷
          </div>
          <input
            type="file"
            ref={fileRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
            id="profile-avatar-upload"
          />
        </div>

        <div className="profile-name-display">{user?.name || 'Unknown'}</div>
        <div className="profile-phone-display">
          {formatPhone(user?.phone)}
        </div>
      </div>

      <div className="profile-fields">
        {/* Name Field */}
        <div className="profile-field">
          <div className="profile-field-label">Your Name</div>
          <div className="profile-field-value">
            {editingField === 'name' ? (
              <input
                type="text"
                className="profile-field-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                autoFocus
                maxLength={50}
              />
            ) : (
              <>
                <span>{user?.name || 'Not set'}</span>
                <button
                  className="profile-edit-btn"
                  onClick={() => handleEdit('name', user?.name)}
                >
                  ✏️
                </button>
              </>
            )}
          </div>
        </div>

        {/* About Field */}
        <div className="profile-field">
          <div className="profile-field-label">About</div>
          <div className="profile-field-value">
            {editingField === 'about' ? (
              <input
                type="text"
                className="profile-field-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                autoFocus
                maxLength={140}
              />
            ) : (
              <>
                <span>{user?.about || 'Not set'}</span>
                <button
                  className="profile-edit-btn"
                  onClick={() => handleEdit('about', user?.about)}
                >
                  ✏️
                </button>
              </>
            )}
          </div>
        </div>

        {/* Phone Field (read-only) */}
        <div className="profile-field">
          <div className="profile-field-label">Phone</div>
          <div className="profile-field-value">
            <span>{formatPhone(user?.phone)}</span>
          </div>
        </div>
      </div>

      <button className="profile-logout" onClick={handleLogout} id="logout-btn">
        🚪 Log out
      </button>
    </div>
  );
};

export default ProfileSection;
