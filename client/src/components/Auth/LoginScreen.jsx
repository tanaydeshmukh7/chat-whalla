import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import '../../styles/auth.css';

const LoginScreen = ({ onOTPSent }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendOTP, setPhone: storePhone } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const fullPhone = `+91${phone.replace(/\D/g, '')}`;

    if (phone.replace(/\D/g, '').length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const data = await sendOTP(fullPhone);
      storePhone(fullPhone);
      onOTPSent(fullPhone, data.devOtp);
    } catch (err) {
      const errData = err.response?.data;
      if (err.response?.status === 429) {
        setError(`⏳ ${errData?.message || 'Too many requests. Please wait.'}`);
      } else {
        setError(errData?.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <h1>Chaat Whalla</h1>
          <p>Connect with friends, instantly</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Phone Number</label>
            <div className="phone-input-group">
              <input
                type="text"
                className="form-input country-code"
                value="+91"
                readOnly
                id="country-code"
              />
              <input
                type="tel"
                className="form-input phone-input"
                placeholder="Enter your mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                autoFocus
                id="phone-input"
              />
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading || phone.replace(/\D/g, '').length !== 10}
            id="send-otp-btn"
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm"></div>
                Sending...
              </>
            ) : (
              <>Send OTP →</>
            )}
          </button>

          <div className="dev-notice">
            🧪 Dev Mode: Use OTP <strong>123456</strong> to bypass verification
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
