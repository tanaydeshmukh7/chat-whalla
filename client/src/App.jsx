import { useState, useEffect } from 'react';
import useAuthStore from './store/authStore';
import { SocketProvider } from './context/SocketContext';
import LoginScreen from './components/Auth/LoginScreen';
import OTPScreen from './components/Auth/OTPScreen';
import SignupScreen from './components/Auth/SignupScreen';
import AppLayout from './components/Layout/AppLayout';

const App = () => {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [authStep, setAuthStep] = useState('login'); // 'login' | 'otp' | 'signup'
  const [otpPhone, setOtpPhone] = useState('');
  const [devOtp, setDevOtp] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          gap: 20,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          💬
        </div>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Loading Chaat Whalla...
        </p>
      </div>
    );
  }

  // Not authenticated — show auth flow
  if (!isAuthenticated) {
    if (authStep === 'login') {
      return (
        <LoginScreen
          onOTPSent={(phone, otp) => {
            setOtpPhone(phone);
            setDevOtp(otp || '');
            setAuthStep('otp');
          }}
        />
      );
    }

    if (authStep === 'otp') {
      return (
        <OTPScreen
          phone={otpPhone}
          devOtp={devOtp}
          onVerified={(data) => {
            if (data.isNewUser || !data.user?.isProfileComplete) {
              setAuthStep('signup');
            }
            // If existing user with complete profile, auth store is already set
          }}
          onBack={() => setAuthStep('login')}
        />
      );
    }

    if (authStep === 'signup') {
      return <SignupScreen onComplete={() => {}} />;
    }
  }

  // Authenticated but profile incomplete
  if (isAuthenticated && user && !user.isProfileComplete) {
    return <SignupScreen onComplete={() => {}} />;
  }

  // Authenticated — show main app
  return (
    <SocketProvider>
      <AppLayout />
    </SocketProvider>
  );
};

export default App;
