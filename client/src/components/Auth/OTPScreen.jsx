import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import '../../styles/auth.css';

const OTPScreen = ({ phone, devOtp, onVerified, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);
  const { verifyOTP, sendOTP } = useAuthStore();

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5) {
      const code = [...newOtp.slice(0, 5), value.slice(-1)].join('');
      if (code.length === 6) {
        handleVerify(code);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (code) => {
    setError('');
    setLoading(true);

    try {
      const data = await verifyOTP(phone, code);
      onVerified(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const data = await sendOTP(phone);
      setResendTimer(data.cooldownSeconds || 30);
      setError('');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const errData = err.response?.data;
      if (err.response?.status === 429) {
        setError(errData?.message || 'Too many attempts. Please wait.');
        setResendTimer(errData?.waitSeconds || 60);
      } else {
        setError(errData?.message || 'Failed to resend OTP');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="auth-back" onClick={onBack} id="otp-back-btn">
          ← Back
        </button>

        <div className="auth-logo" style={{ marginTop: 16 }}>
          <div className="auth-logo-icon">🔐</div>
          <h1>Verify OTP</h1>
          <p>
            We sent a code to <strong>{phone}</strong>
          </p>
        </div>

        <div className="auth-form">
          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                className={`otp-digit ${digit ? 'filled' : ''}`}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={1}
                id={`otp-digit-${index}`}
              />
            ))}
          </div>

          {error && <div className="auth-error">{error}</div>}

          {loading && (
            <div className="flex-center">
              <div className="spinner"></div>
            </div>
          )}

          <div className="otp-info">
            {resendTimer > 0 ? (
              <span>Resend OTP in {resendTimer}s</span>
            ) : (
              <button
                className="otp-resend"
                onClick={handleResend}
                id="resend-otp-btn"
              >
                Resend OTP
              </button>
            )}
          </div>

          {devOtp && (
            <div className="dev-notice">
              🧪 Your OTP code is: <strong style={{ fontSize: '1.2rem', letterSpacing: 2 }}>{devOtp}</strong>
            </div>
          )}
          <div className="dev-notice" style={{ marginTop: 4 }}>
            💡 Or use bypass code: <strong>123456</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPScreen;
