import React, { useState } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import RegisterForm from '../../components/auth/RegisterForm';
import { useAuth } from '../../hooks/useAuth';
import { RegistrationData } from '../../types/auth';

// Define RegisterFormData interface to match the component's expected props
interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

/**
 * Registration page component
 */
const RegisterPage: React.FC = () => {
  const { register, loginWithGoogle, loginWithMicrosoft } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate: NavigateFunction = useNavigate();

  /**
   * Handle registration form submission
   * @param formData - Registration form data
   */
  const handleRegister = async (formData: RegisterFormData): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      await register({
        username: formData.email.split('@')[0], // Generate username from email
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        acceptTerms: formData.agreeToTerms
      });

      // Navigate to login page upon successful registration
      navigate('/login', {
        state: {
          message: 'Registration successful! Please log in with your new account.'
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      const error = err as Error;
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth registration
   */
  const handleGoogleRegister = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      // Navigate to dashboard upon successful registration
      navigate('/dashboard');
    } catch (err) {
      console.error('Google registration error:', err);
      const error = err as Error;
      setError(error.message || 'Google sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Microsoft OAuth registration
   */
  const handleMicrosoftRegister = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      await loginWithMicrosoft();
      // Navigate to dashboard upon successful registration
      navigate('/dashboard');
    } catch (err) {
      console.error('Microsoft registration error:', err);
      const error = err as Error;
      setError(error.message || 'Microsoft sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
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

        <RegisterForm
          onSubmit={handleRegister}
          onGoogleRegister={handleGoogleRegister}
          onMicrosoftRegister={handleMicrosoftRegister}
          logoUrl="/logo.png"
          error={error}
          loading={loading}
          showSocialLogin={true}
          loginLink="/login"
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
            By creating an account, you agree to our{' '}
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

export default RegisterPage;
