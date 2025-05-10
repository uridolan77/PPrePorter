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
        <Paper
          elevation={3}
          sx={{
            maxWidth: 450,
            width: '100%',
            p: 4,
            borderRadius: 2
          }}
        >
          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src="/email-sent.png"
                alt="Email Sent"
                style={{ height: 100, width: 'auto', marginBottom: 16 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Check your email
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                We've sent password reset instructions to:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 3 }}>
                {email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                If you don't see the email in your inbox, please check your spam folder.
              </Typography>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
              >
                Back to Login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <img
                  src="/logo.png"
                  alt="Logo"
                  style={{ height: 60, width: 'auto', marginBottom: 16 }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Forgot Password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your email and we'll send you instructions to reset your password
                </Typography>
              </Box>

              {/* Error Message */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
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
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  mb: 2
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary" component="span">
                  Remember your password?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    variant="body2"
                    underline="hover"
                    sx={{ fontWeight: 'medium' }}
                  >
                    Back to Login
                  </Link>
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
