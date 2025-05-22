import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import {
  Container,
  Typography,
  Alert
} from '@mui/material';
import LoginForm from '../../components/auth/LoginForm';
import MockDataToggle from '../../components/common/MockDataToggle';
import { useAuth } from '../../hooks/useAuth';
import { LoginCredentials } from '../../types/auth';
import { isMockDataEnabled } from '../../utils/mockDataToggle';

// Type definitions
interface LocationState {
  from?: {
    pathname: string;
  };
}

/**
 * Login page component
 */
const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, loginWithMicrosoft } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation() as Location & { state: LocationState };

  // Get the redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  /**
   * Handle login form submission
   * @param formData - Login form data
   */
  const handleLogin = useCallback(async (formData: LoginCredentials): Promise<void> => {
    setLoading(true);
    setError('');

    console.log('LoginPage.handleLogin called with:', {
      username: formData.username,
      passwordProvided: !!formData.password,
      rememberMe: formData.rememberMe
    });

    // Validate credentials before proceeding
    if (!formData.username || formData.username.trim() === '') {
      setError('Username is required');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      // Create a clean credentials object to ensure all required fields are present
      const credentials: LoginCredentials = {
        username: formData.username.trim(),
        password: formData.password,
        rememberMe: !!formData.rememberMe
      };

      console.log('Calling login with validated credentials:', {
        username: credentials.username,
        passwordLength: credentials.password ? credentials.password.length : 0,
        rememberMe: credentials.rememberMe
      });

      // Call the login function from useAuth hook
      const result = await login(credentials);

      console.log('Login successful, navigating to:', from);
      // Navigate to the page user tried to visit or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const error = err as Error;
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }, [login, navigate, from]);

  /**
   * Handle Google OAuth login
   */
  const handleGoogleLogin = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      // Navigate to the page user tried to visit or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loginWithGoogle, navigate, from]);

  /**
   * Handle Microsoft OAuth login
   */
  const handleMicrosoftLogin = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      await loginWithMicrosoft();
      // Navigate to the page user tried to visit or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Microsoft login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loginWithMicrosoft, navigate, from]);

  // Check if mock data is enabled
  const mockEnabled = isMockDataEnabled();

  /**
   * Handle logo loading error
   * @param e - The error event
   */
  const handleLogoError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = '/logo.png'; // Fallback to default logo
  }, []);

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 2
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: '100%',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          <img
            src="/assets/preplogo.png"
            alt="PPrePorter Logo"
            style={{
              height: 500,
              width: 'auto',
              pointerEvents: 'none',
            }}
            onError={handleLogoError}
            draggable="false"
          />
        </div>

        {/* Mock Data Toggle - Hidden behind icon */}
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <MockDataToggle showDetails={false} collapsed={true} />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              width: '100%',
              mb: 3
            }}
          >
            {error}
            {mockEnabled && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Tip:</strong> You're currently in mock data mode. Toggle it off above to connect to the real API.
              </Typography>
            )}
          </Alert>
        )}

        <LoginForm
          onSubmit={handleLogin}
          onGoogleLogin={handleGoogleLogin}
          onMicrosoftLogin={handleMicrosoftLogin}
          logoUrl="" // We're showing the logo above the form
          error={error}
          loading={loading}
          showSocialLogin={true}
          showForgotPassword={true}
          showRegister={true}
          registerLink="/register"
          forgotPasswordLink="/forgot-password"
        />

        {/* Terms & Support Section */}
        <div
          style={{
            marginTop: 16,
            padding: 8,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            By using our services, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>.
            {' '}Need help? <a href="/support">Contact Support</a>
          </Typography>
        </div>
      </div>
    </Container>
  );
};

export default LoginPage;
