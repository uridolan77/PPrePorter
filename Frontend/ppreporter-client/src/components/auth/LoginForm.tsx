import React, { useState, ChangeEvent, FormEvent } from 'react';
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
import { CommonProps } from '../../types/common';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
}

interface LoginFormProps extends CommonProps {
  onSubmit?: (data: LoginFormData) => void;
  onGoogleLogin?: () => void;
  onMicrosoftLogin?: () => void;
  error?: string | null;
  loading?: boolean;
  showSocialLogin?: boolean;
  showForgotPassword?: boolean;
  showRegister?: boolean;
  registerLink?: string;
  forgotPasswordLink?: string;
  logoUrl?: string;
}

/**
 * Login form component for user authentication
 */
const LoginForm: React.FC<LoginFormProps> = ({
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
  logoUrl = '/logo.png',
  sx
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, checked, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear validation error when field is edited
    if (formErrors[name as keyof LoginFormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };

  const toggleShowPassword = (): void => {
    setShowPassword(!showPassword);
  };

  const validate = (): LoginFormErrors => {
    const errors: LoginFormErrors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username or email is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Stop propagation to prevent any parent handlers from being called
    e.stopPropagation();

    console.log('Form submit event prevented');

    const errors = validate();

    if (Object.keys(errors).length === 0) {
      if (onSubmit) {
        console.log('Form is valid, calling onSubmit');
        // Call the onSubmit handler with the form data
        // This will be handled by the parent component
        onSubmit(formData);
      }
    } else {
      console.log('Form has errors:', errors);
      setFormErrors(errors);
    }

    // Explicitly return false to ensure the form doesn't submit traditionally
    return;
  };

  const handleGoogleLogin = (): void => {
    if (onGoogleLogin) {
      onGoogleLogin();
    }
  };

  const handleMicrosoftLogin = (): void => {
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
        p: 3, // Reduced padding from 4 to 3
        borderRadius: 2,
        ...sx
      }}
    >
      <Box
        component="form"
        onSubmit={(e) => {
          handleSubmit(e);
          return false; // Explicitly return false to prevent form submission
        }}
        noValidate
        autoComplete="off"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2 /* Reduced gap from 3 to 2 */
        }}
      >
        {/* Logo and Title */}
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          {/* Reduced margin from 2 to 1 */}
          {logoUrl && logoUrl.trim() !== '' && (
            <img
              src={logoUrl}
              alt="Logo"
              style={{ height: 60, width: 'auto', marginBottom: 8 }}
              /* Reduced margin from 16 to 8 */
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {/* Added mb: 0.5 instead of gutterBottom */}
            Sign In
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

        {/* Username/Email Field */}
        <TextField
          label="Username or Email"
          name="username"
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

        {/* Remember Me and Forgot Password */}
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
              color="primary"
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
          color="primary"
          size="large"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>

        {/* Register Link */}
        {showRegister && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to={registerLink}
                color="primary"
                underline="hover"
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
