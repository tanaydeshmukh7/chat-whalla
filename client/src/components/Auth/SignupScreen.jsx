import { useState, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import '../../styles/auth.css';

const SignupScreen = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const { completeSignup, uploadAvatar } = useAuthStore();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await completeSignup(name.trim(), about.trim());

      if (avatarFile) {
        await uploadAvatar(avatarFile);
      }

      onComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">👤</div>
          <h1>Set Up Profile</h1>
          <p>Tell us about yourself</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="avatar-upload">
            <div
              className="avatar-upload-circle"
              onClick={() => fileRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" />
              ) : (
                <span className="upload-icon">📷</span>
              )}
            </div>
            <input
              type="file"
              ref={fileRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              id="avatar-file-input"
            />
            <span
              className="avatar-upload-label"
              onClick={() => fileRef.current?.click()}
            >
              {avatarPreview ? 'Change photo' : 'Add profile photo'}
            </span>
          </div>

          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoFocus
              id="signup-name"
            />
          </div>

          <div className="form-group">
            <label>About</label>
            <input
              type="text"
              className="form-input"
              placeholder="Hey there! I'm using Chaat Whalla"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              maxLength={140}
              id="signup-about"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading || !name.trim()}
            id="complete-signup-btn"
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm"></div>
                Setting up...
              </>
            ) : (
              <>Get Started 🚀</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupScreen;
