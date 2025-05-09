import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';

/**
 * Login form component for user authentication
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {Function} props.onGoogleLogin - Function to handle Google login
 * @param {Function} props.onMicrosoftLogin - Function to handle Microsoft login
 * @param {string} props.error - Error message to display
 * @param {boolean} props.loading - Whether form is submitting
 * @param {boolean} props.showSocialLogin - Whether to show social login options
 * @param {boolean} props.showForgotPassword - Whether to show forgot password link
 * @param {boolean} props.showRegister - Whether to show register link
 * @param {string} props.registerLink - URL for registration page
 * @param {string} props.forgotPasswordLink - URL for forgot password page
 * @param {string} props.logoUrl - URL for logo image
 */
const LoginForm = ({
  onSubmit,
  onGoogleLogin,
  onMicrosoftLogin,
  error,
  loading = false,
  showSocialLogin = true,
  showForgotPassword = true,
  showRegister = true,
  registerLink = '/register',
  forgotPasswordLink = '/forgot-password',
  logoUrl = '/logo.png'
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, checked } = e.target;

    setFormData({
      ...formData,
      [name]: name === 'rememberMe' ? checked : value
    });

    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validate = () => {
    const errors = {};

    if (!formData.username) {
      errors.username = 'Username is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validate();

    if (Object.keys(errors).length === 0) {
      if (onSubmit) {
        onSubmit(formData);
      }
    } else {
      setFormErrors(errors);
    }
  };

  const handleGoogleLogin = () => {
    if (onGoogleLogin) {
      onGoogleLogin();
    }
  };

  const handleMicrosoftLogin = () => {
    if (onMicrosoftLogin) {
      onMicrosoftLogin();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 450,
        width: '100%',
        p: 4,
        borderRadius: 2
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        {/* Logo and Title */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img
            src={logoUrl}
            alt="Logo"
            style={{ height: 60, width: 'auto', marginBottom: 16 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Sign in to your account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your credentials to access your account
          </Typography>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Username Field */}
        <TextField
          label="Username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.username}
          helperText={formErrors.username}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
          placeholder="Enter your username"
          disabled={loading}
          required
        />

        {/* Password Field */}
        <TextField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.password}
          helperText={formErrors.password}
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
          required
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                color="primary"
                disabled={loading}
              />
            }
            label="Remember me"
          />

          {showForgotPassword && (
            <Link
              component={RouterLink}
              to={forgotPasswordLink}
              variant="body2"
              underline="hover"
            >
              Forgot password?
            </Link>
          )}
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{
            py: 1.5,
            mt: 1
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Sign In'
          )}
        </Button>

        {/* Register Link */}
        {showRegister && (
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary" component="span">
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to={registerLink}
                variant="body2"
                underline="hover"
                sx={{ fontWeight: 'medium' }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        )}

        {/* Social Login Options */}
        {showSocialLogin && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                or continue with
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                Google
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<MicrosoftIcon />}
                onClick={handleMicrosoftLogin}
                disabled={loading}
              >
                Microsoft
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default LoginForm;