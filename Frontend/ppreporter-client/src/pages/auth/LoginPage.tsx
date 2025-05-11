import React, { useState } from 'react';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  Collapse
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
  const handleLogin = async (formData: LoginCredentials): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with credentials:', { username: formData.username, rememberMe: formData.rememberMe });

      // Call the login function from useAuth hook
      const result = await login({
        username: formData.username,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      console.log('Login successful, user:', result);

      // Navigate to the page user tried to visit or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const error = err as Error;
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth login
   */
  const handleGoogleLogin = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      // Navigate to the page user tried to visit or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Google login error:', err);
      const error = err as Error;
      setError(error.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Microsoft OAuth login
   */
  const handleMicrosoftLogin = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      await loginWithMicrosoft();
      // Navigate to the page user tried to visit or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Microsoft login error:', err);
      const error = err as Error;
      setError(error.message || 'Microsoft login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if mock data is enabled
  const mockEnabled = isMockDataEnabled();

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 2 // Reduced padding from 4 to 2
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            width: '100%',
            mb: 2, // Reduced from 6 to 2 to bring form closer to logo
            display: 'flex',
            justifyContent: 'center',
            userSelect: 'none', // Make unselectable
          }}
        >
          <img
            src="/assets/preplogo.png"
            alt="PPrePorter Logo"
            style={{
              height: 500, // Increased from 400 to 500
              width: 'auto',
              pointerEvents: 'none', // Prevent cursor changes on click
            }}
            onError={(e) => {
              console.error('Failed to load logo from /assets/preplogo.png');
              (e.target as HTMLImageElement).src = '/logo.png'; // Fallback to default logo
            }}
            draggable="false" // Prevent dragging
          />
        </Box>

        {/* Mock Data Toggle - Hidden behind icon */}
        <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
          <MockDataToggle showDetails={false} collapsed={true} />
        </Box>

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
        <Box
          sx={{
            mt: 2, // Reduced from 4 to 2
            p: 1, // Reduced from 2 to 1
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            By using our services, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>.
            {' '}Need help? <a href="/support">Contact Support</a>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
