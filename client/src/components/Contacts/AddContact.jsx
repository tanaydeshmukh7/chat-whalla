import { useState } from 'react';
import useContactStore from '../../store/contactStore';
import { getInitials } from '../../utils/formatters';
import '../../styles/contacts.css';

const AVATAR_BASE = 'http://localhost:5000';

const AddContact = () => {
  const [phone, setPhone] = useState('');
  const [savedName, setSavedName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { searchByPhone, searchResult, searchLoading, addContact, clearSearch } =
    useContactStore();

  const handleSearch = async () => {
    setError('');
    setSuccess('');

    const fullPhone = `+91${phone.replace(/\D/g, '')}`;

    if (phone.replace(/\D/g, '').length !== 10) {
      setError('Enter a valid 10-digit number');
      return;
    }

    try {
      await searchByPhone(fullPhone);
    } catch (err) {
      setError('Search failed. Try again.');
    }
  };

  const handleAdd = async () => {
    if (!savedName.trim()) {
      setError('Please enter a name for this contact');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhone = `+91${phone.replace(/\D/g, '')}`;
      await addContact(fullPhone, savedName.trim());
      setSuccess('Contact added successfully!');
      setPhone('');
      setSavedName('');
      clearSearch();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${AVATAR_BASE}${avatarPath}`;
  };

  return (
    <div className="add-contact-form">
      <div className="phone-input-group">
        <input
          type="text"
          className="form-input country-code"
          value="+91"
          readOnly
          style={{ width: 70 }}
        />
        <input
          type="tel"
          className="form-input"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
            clearSearch();
            setError('');
            setSuccess('');
          }}
          maxLength={10}
          style={{ flex: 1 }}
          id="add-contact-phone"
        />
        <button
          className="add-contact-btn"
          onClick={handleSearch}
          disabled={searchLoading || phone.replace(/\D/g, '').length !== 10}
          style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}
          id="search-contact-btn"
        >
          {searchLoading ? '...' : '🔍'}
        </button>
      </div>

      {searchResult && searchResult.found && (
        <div className="search-result">
          {searchResult.user.avatar ? (
            <img
              src={getAvatarUrl(searchResult.user.avatar)}
              alt=""
              className="avatar avatar-sm"
            />
          ) : (
            <div className="avatar avatar-sm avatar-placeholder">
              {getInitials(searchResult.user.name)}
            </div>
          )}
          <div className="search-result-info">
            <div className="search-result-name">{searchResult.user.name}</div>
            <div className="search-result-phone">{searchResult.user.phone}</div>
          </div>
        </div>
      )}

      {searchResult && !searchResult.found && (
        <div className="search-not-found">
          ⚠️ {searchResult.message}
        </div>
      )}

      {searchResult?.found && (
        <>
          <input
            type="text"
            className="form-input"
            placeholder="Save contact as..."
            value={savedName}
            onChange={(e) => setSavedName(e.target.value)}
            maxLength={50}
            id="contact-name-input"
          />
          <button
            className="add-contact-btn"
            onClick={handleAdd}
            disabled={loading || !savedName.trim()}
            id="add-contact-confirm-btn"
          >
            {loading ? 'Adding...' : '+ Add Contact'}
          </button>
        </>
      )}

      {error && <div className="auth-error">{error}</div>}
      {success && (
        <div
          style={{
            background: 'rgba(0, 168, 132, 0.1)',
            border: '1px solid rgba(0, 168, 132, 0.3)',
            color: 'var(--accent-primary)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          ✅ {success}
        </div>
      )}
    </div>
  );
};

export default AddContact;
