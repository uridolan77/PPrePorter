import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import { useAuth } from '../../hooks/useAuth';
import { PasswordResetRequest } from '../../types/auth';

/**
 * Forgot password page component
 */
const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  /**
   * Handle form submission
   * @param e - Form event
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const resetRequest: PasswordResetRequest = { email };
      await forgotPassword(resetRequest);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      const error = err as Error;
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle email input change
   * @param e - Change event
   */
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
    setError('');
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '32px',
        paddingBottom: '32px'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={3}
          style={{
            maxWidth: 450,
            width: '100%',
            padding: '32px',
            borderRadius: '8px'
          }}
        >
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <img
                src="/email-sent.png"
                alt="Email Sent"
                style={{ height: 100, width: 'auto', marginBottom: 16 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <Typography variant="h5" component="h1" gutterBottom style={{ fontWeight: 'bold' }}>
                Check your email
              </Typography>
              <Typography variant="body1" style={{ marginBottom: '24px' }}>
                We've sent password reset instructions to:
              </Typography>
              <Typography variant="body1" style={{ fontWeight: 'bold', marginBottom: '24px' }}>
                {email}
              </Typography>
              <Typography variant="body2" color="text.secondary" style={{ marginBottom: '24px' }}>
                If you don't see the email in your inbox, please check your spam folder.
              </Typography>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                fullWidth
                style={{ marginTop: '16px' }}
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <img
                  src="/logo.png"
                  alt="Logo"
                  style={{ height: 60, width: 'auto', marginBottom: 16 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <Typography variant="h5" component="h1" gutterBottom style={{ fontWeight: 'bold' }}>
                  Forgot Password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your email and we'll send you instructions to reset your password
                </Typography>
              </div>

              {/* Error Message */}
              {error && (
                <Alert severity="error" style={{ marginBottom: '24px' }}>
                  {error}
                </Alert>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={handleEmailChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
                style={{ marginBottom: '24px' }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                style={{
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  marginBottom: '16px'
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Typography variant="body2" color="text.secondary" component="span">
                  Remember your password?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    underline="hover"
                    style={{ fontWeight: 500 }}
                  >
                    Back to Login
                  </Link>
                </Typography>
              </div>
            </form>
          )}
        </Paper>
      </div>
    </Container>
  );
};

export default ForgotPasswordPage;
