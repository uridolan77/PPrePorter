import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import authService from '../../services/authService';

/**
 * Reset password page component
 */
const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract token from URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenParam = queryParams.get('token');
    
    if (!tokenParam) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    } else {
      setToken(tokenParam);
    }
  }, [location]);
  
  /**
   * Toggle password visibility
   */
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  /**
   * Toggle confirm password visibility
   */
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  /**
   * Validate form inputs
   * @returns {boolean} - Validation result
   */
  const validateForm = () => {
    if (!password) {
      setError('Please enter a new password');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  /**
   * Handle form submission
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle password input change
   * @param {Object} e - Event object
   */
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };
  
  /**
   * Handle confirm password input change
   * @param {Object} e - Event object
   */
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setError('');
  };
  
  /**
   * Navigate to login page
   */
  const goToLogin = () => {
    navigate('/login');
  };
  
  if (!token) {
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Invalid or missing reset token. Please request a new password reset link.'}
        </Alert>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate('/forgot-password')}
        >
          Request New Reset Link
        </Button>
      </Container>
    );
  }
  
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
                src="/check-circle.png" 
                alt="Success" 
                style={{ height: 80, width: 'auto', marginBottom: 16 }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Password Reset Successful
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                Your password has been successfully reset. You can now log in with your new password.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={goToLogin}
                sx={{ py: 1.5 }}
              >
                Go to Login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  style={{ height: 60, width: 'auto', marginBottom: 16 }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Reset Your Password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your new password below
                </Typography>
              </Box>
              
              {/* Error Message */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {/* New Password Field */}
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={handlePasswordChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
                sx={{ mb: 2 }}
              />
              
              {/* Confirm Password Field */}
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
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
                  'Reset Password'
                )}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;
