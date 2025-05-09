import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import RegisterForm from '../../components/auth/RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Registration page component
 */
const RegisterPage = () => {
  const { register, loginWithGoogle, loginWithMicrosoft } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  /**
   * Handle registration form submission
   * @param {Object} formData - Registration form data
   */
  const handleRegister = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      
      // Navigate to login page upon successful registration
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in with your new account.' 
        } 
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth registration
   */
  const handleGoogleRegister = () => {
    try {
      loginWithGoogle();
    } catch (err) {
      setError('Google sign up failed. Please try again.');
    }
  };

  /**
   * Handle Microsoft OAuth registration
   */
  const handleMicrosoftRegister = () => {
    try {
      loginWithMicrosoft();
    } catch (err) {
      setError('Microsoft sign up failed. Please try again.');
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
