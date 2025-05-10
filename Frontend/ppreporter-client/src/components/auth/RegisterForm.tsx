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
  Grid,
  Checkbox,
  FormControlLabel,
  FormHelperText
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { CommonProps } from '../../types/common';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

interface RegisterFormProps extends CommonProps {
  onSubmit?: (data: RegisterFormData) => void;
  onGoogleRegister?: () => void;
  onMicrosoftRegister?: () => void;
  error?: string | null;
  loading?: boolean;
  showSocialLogin?: boolean;
  loginLink?: string;
  logoUrl?: string;
}

/**
 * Registration form component for new user sign-up
 */
const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onGoogleRegister,
  onMicrosoftRegister,
  error,
  loading = false,
  showSocialLogin = true,
  loginLink = '/login',
  logoUrl = '/logo.png',
  sx
}) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, checked, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear validation error when field is edited
    if (formErrors[name as keyof RegisterFormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };
  
  const toggleShowPassword = (): void => {
    setShowPassword(!showPassword);
  };
  
  const toggleShowConfirmPassword = (): void => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const validate = (): RegisterFormErrors => {
    const errors: RegisterFormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    return errors;
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
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
  
  const handleGoogleRegister = (): void => {
    if (onGoogleRegister) {
      onGoogleRegister();
    }
  };
  
  const handleMicrosoftRegister = (): void => {
    if (onMicrosoftRegister) {
      onMicrosoftRegister();
    }
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        maxWidth: 600, 
        width: '100%', 
        p: 4, 
        borderRadius: 2,
        ...sx
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
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Create an Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the form below to create your account
          </Typography>
        </Box>
        
        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Name Fields */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              disabled={loading}
              required
            />
          </Grid>
        </Grid>
        
        {/* Email Field */}
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.email}
          helperText={formErrors.email}
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
          helperText={formErrors.password || 'Password must be at least 8 characters long'}
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
        
        {/* Confirm Password Field */}
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.confirmPassword}
          helperText={formErrors.confirmPassword}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={toggleShowConfirmPassword}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          disabled={loading}
          required
        />
        
        {/* Terms and Conditions */}
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                color="primary"
                disabled={loading}
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link href="#" underline="hover" color="primary">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" underline="hover" color="primary">
                  Privacy Policy
                </Link>
              </Typography>
            }
          />
          {formErrors.agreeToTerms && (
            <FormHelperText error>{formErrors.agreeToTerms}</FormHelperText>
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
          {loading ? <CircularProgress size={24} /> : 'Create Account'}
        </Button>
        
        {/* Login Link */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link 
              component={RouterLink} 
              to={loginLink}
              color="primary"
              underline="hover"
            >
              Sign in
            </Link>
          </Typography>
        </Box>
        
        {/* Social Registration Options */}
        {showSocialLogin && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                or sign up with
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleRegister}
                disabled={loading}
              >
                Google
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<MicrosoftIcon />}
                onClick={handleMicrosoftRegister}
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

export default RegisterForm;
