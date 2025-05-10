/**
 * Authentication Mock Data
 */
import { LoginCredentials, User } from '../../types/auth';
import { RegistrationData } from '../../types/redux';
import loginMockData from './login';
import registerMockData from './register';
import profileMockData from './profile';

/**
 * Get mock data for authentication endpoints
 * @param endpoint The API endpoint
 * @param params Optional parameters for the request
 * @returns Mock data for the endpoint
 */
const getMockData = (endpoint: string, params?: any): any => {
  // Handle different auth endpoints
  if (endpoint.includes('auth/login')) {
    return handleLogin(params);
  } else if (endpoint.includes('auth/register')) {
    return handleRegister(params);
  } else if (endpoint.includes('auth/logout')) {
    return { success: true, message: 'Logged out successfully' };
  } else if (endpoint.includes('auth/refresh-token')) {
    return loginMockData.refreshTokenResponse;
  } else if (endpoint.includes('auth/forgot-password')) {
    return { success: true, message: 'Password reset email sent' };
  } else if (endpoint.includes('auth/reset-password')) {
    return { success: true, message: 'Password reset successfully' };
  } else if (endpoint.includes('auth/verify-email')) {
    return { success: true, message: 'Email verified successfully' };
  } else if (endpoint.includes('auth/change-password')) {
    return { success: true, message: 'Password changed successfully' };
  } else if (endpoint.includes('auth/profile')) {
    return profileMockData.userProfile;
  } else if (endpoint.includes('auth/google/callback')) {
    return loginMockData.googleResponse;
  } else if (endpoint.includes('auth/microsoft/callback')) {
    return loginMockData.microsoftResponse;
  } else {
    console.warn(`No mock data available for auth endpoint: ${endpoint}`);
    return null;
  }
};

/**
 * Handle login request
 * @param credentials Login credentials
 * @returns Mock login response
 */
const handleLogin = (credentials: LoginCredentials): { user: User; token: string; refreshToken: string } => {
  // Check if credentials match mock data
  if (
    (credentials.username === 'admin' || credentials.email === 'admin@example.com') &&
    credentials.password === 'password'
  ) {
    return loginMockData.successResponse;
  } else if (
    (credentials.username === 'user' || credentials.email === 'user@example.com') &&
    credentials.password === 'password'
  ) {
    return loginMockData.userResponse;
  } else {
    throw new Error('Invalid credentials');
  }
};

/**
 * Handle register request
 * @param userData Registration data
 * @returns Mock register response
 */
const handleRegister = (userData: RegistrationData): { user: User; token: string; refreshToken: string } => {
  // Simulate validation
  if (!userData.email || !userData.password) {
    throw new Error('Email and password are required');
  }

  if (userData.email === 'admin@example.com') {
    throw new Error('Email already in use');
  }

  return registerMockData.successResponse;
};

export default {
  getMockData,
  loginMockData,
  registerMockData,
  profileMockData
};
