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
  // Initialize form data with default values
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false
  });

  // Log initial form data for debugging
  console.log('Initial form data:', formData);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, checked, type } = e.target;

    console.log(`Field '${name}' changed:`, {
      type,
      value: type === 'checkbox' ? checked : value,
      previousValue: formData[name as keyof LoginFormData]
    });

    // Update form data with new value
    const updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };

    // Ensure we're not setting empty values
    if (name === 'username' && value.trim() === '') {
      console.warn('Empty username detected in handleChange');
    }

    if (name === 'password' && value === '') {
      console.warn('Empty password detected in handleChange');
    }

    setFormData(updatedFormData);
    console.log('Updated form data:', {
      ...updatedFormData,
      password: updatedFormData.password ? '********' : ''
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
    console.log('Form data at submission:', formData);

    // Get form values directly from the form element as a backup
    const formElement = e.currentTarget;
    const usernameInput = formElement.querySelector('input[name="username"]') as HTMLInputElement;
    const passwordInput = formElement.querySelector('input[name="password"]') as HTMLInputElement;
    const rememberMeInput = formElement.querySelector('input[name="rememberMe"]') as HTMLInputElement;

    // Use direct form values if available, otherwise use state
    const username = usernameInput?.value || formData.username;
    const password = passwordInput?.value || formData.password;
    const rememberMe = rememberMeInput ? rememberMeInput.checked : formData.rememberMe;

    console.log('Direct form values:', { username, password, rememberMe });

    const errors = validate();

    if (Object.keys(errors).length === 0) {
      if (onSubmit) {
        // Ensure we have a valid credentials object with all required fields
        const validCredentials = {
          username: username.trim(),
          password: password,
          rememberMe: rememberMe
        };

        console.log('Form is valid, calling onSubmit with credentials:', validCredentials);

        // Call the onSubmit handler with the validated form data
        // This will be handled by the parent component
        onSubmit(validCredentials);
      } else {
        console.warn('No onSubmit handler provided to LoginForm');
      }
    } else {
      console.log('Form has validation errors:', errors);
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
          console.log('Form onSubmit triggered with form data:', formData);

          // Log the actual form element values directly
          const formElement = e.currentTarget;
          const usernameInput = formElement.querySelector('input[name="username"]') as HTMLInputElement;
          const passwordInput = formElement.querySelector('input[name="password"]') as HTMLInputElement;
          const rememberMeInput = formElement.querySelector('input[name="rememberMe"]') as HTMLInputElement;

          // Check if form values match state
          const formValues = {
            username: usernameInput?.value || 'not found',
            password: passwordInput?.value || 'not found',
            rememberMe: rememberMeInput?.checked || false
          };

          console.log('Direct form element values:', formValues);
          console.log('State values:', formData);

          // Update form data state with direct values if they don't match
          if (formValues.username !== 'not found' && formValues.username !== formData.username) {
            console.log('Updating username in state to match form element');
            setFormData(prev => ({ ...prev, username: formValues.username }));
          }

          if (formValues.password !== 'not found' && formValues.password !== formData.password) {
            console.log('Updating password in state to match form element');
            setFormData(prev => ({ ...prev, password: formValues.password }));
          }

          handleSubmit(e);
          // Explicitly return false to prevent form submission
          return false;
        }}
        id="login-form"
        name="login-form"
        noValidate
        autoComplete="on"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2 /* Reduced gap from 3 to 2 */
        }}
      >
        {/* Logo and Title */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          {/* Using div instead of Box to avoid TS2590 error */}
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
        </div>

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
          id="username"
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
          inputProps={{
            autoComplete: "username",
            form: "login-form"
          }}
          disabled={loading}
          required
        />

        {/* Password Field */}
        <TextField
          label="Password"
          name="password"
          id="password"
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
          inputProps={{
            autoComplete: "current-password",
            form: "login-form"
          }}
          disabled={loading}
          required
        />

        {/* Remember Me and Forgot Password */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                color="primary"
                disabled={loading}
                inputProps={{
                  form: "login-form"
                }}
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
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
          onClick={(e) => {
            // Additional check to ensure form data is valid before submission
            console.log('Submit button clicked, current form data:', {
              ...formData,
              password: formData.password ? '********' : ''
            });

            // If form data is empty, try to get values directly from form elements
            if (!formData.username || !formData.password) {
              console.warn('Form data is incomplete, attempting to get values directly from form elements');
              const formElement = document.getElementById('login-form') as HTMLFormElement;
              if (formElement) {
                const usernameInput = formElement.querySelector('input[name="username"]') as HTMLInputElement;
                const passwordInput = formElement.querySelector('input[name="password"]') as HTMLInputElement;

                if (usernameInput && !formData.username) {
                  console.log('Setting username from form element:', usernameInput.value);
                  setFormData(prev => ({ ...prev, username: usernameInput.value }));
                }

                if (passwordInput && !formData.password) {
                  console.log('Setting password from form element');
                  setFormData(prev => ({ ...prev, password: passwordInput.value }));
                }
              }
            }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>

        {/* Register Link */}
        {showRegister && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
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
          </div>
        )}

        {/* Social Login Options */}
        {showSocialLogin && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                or continue with
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
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
            </div>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default LoginForm;
