import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import LoginForm from '../../components/auth/LoginForm';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Login page component
 */
const LoginPage = () => {
  const { login, loginWithGoogle, loginWithMicrosoft } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  /**
   * Handle login form submission
   * @param {Object} formData - Login form data
   */
  const handleLogin = async (formData) => {
    setLoading(true);
    setError('');

    try {
      await login({
        username: formData.username,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      // Navigate to the page user tried to visit or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth login
   */
  const handleGoogleLogin = () => {
    try {
      loginWithGoogle();
    } catch (err) {
      setError('Google login failed. Please try again.');
    }
  };

  /**
   * Handle Microsoft OAuth login
   */
  const handleMicrosoftLogin = () => {
    try {
      loginWithMicrosoft();
    } catch (err) {
      setError('Microsoft login failed. Please try again.');
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
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
          </Alert>
        )}

        <LoginForm
          onSubmit={handleLogin}
          onGoogleLogin={handleGoogleLogin}
          onMicrosoftLogin={handleMicrosoftLogin}
          logoUrl="/logo.png"
          error={error}
          loading={loading}
          showSocialLogin={true}
          showForgotPassword={true}
          showRegister={true}
          registerLink="/register"
          forgotPasswordLink="/forgot-password"
        />

        {/* Terms & Support Section */}
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 2,
            textAlign: 'center',
            backgroundColor: 'transparent'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            By using our services, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Need help? <a href="/support">Contact Support</a>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
