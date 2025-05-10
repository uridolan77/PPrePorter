import apiClient from './api/apiClient';
import config from '../config/appConfig';
import tokenService from './tokenService';

/**
 * User registration service
 * @param {Object} userData - User registration data
 * @returns {Promise} - API response
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.message || { message: 'Registration failed' };
  }
};

/**
 * User login service
 * @param {Object} credentials - User login credentials
 * @returns {Promise} - API response with user data and token
 */
export const login = async (credentials) => {  try {
    // Make sure we're sending the right format to the API
    const loginData = {
      username: credentials.username || credentials.email, // Support both username and email
      password: credentials.password
    };

    const response = await apiClient.post('/auth/login', loginData);
    // Store token and user data
    if (response.data.token) {
      // Store tokens using tokenService
      tokenService.setTokens({
        accessToken: response.data.token,
        refreshToken: response.data.refreshToken
      });

      // Create user object from response data
      const user = {
        username: response.data.username,
        fullName: response.data.fullName,
        email: response.data.email,
        role: response.data.role,
        permissions: response.data.permissions
      };

      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  } catch (error){
    throw error.message || { message: 'Login failed' };
  }
};

/**
 * OAuth login with Google
 * @returns {Promise} - Redirect URL for Google OAuth
 */
export const loginWithGoogle = async () => {
  window.location.href = `${apiClient.client.defaults.baseURL}/auth/google`;
};

/**
 * OAuth login with Microsoft
 * @returns {Promise} - Redirect URL for Microsoft OAuth
 */
export const loginWithMicrosoft = async () => {
  window.location.href = `${apiClient.client.defaults.baseURL}/auth/microsoft`;
};

/**
 * Log out user and clear storage
 */
export const logout = () => {
  // Remove tokens using tokenService
  tokenService.removeTokens();
  localStorage.removeItem('user');
};

/**
 * Get current authenticated user
 * @returns {Object|null} - User data or null if not authenticated
 */
export const getCurrentUser = () => {
  // First try to get from localStorage
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }

  // If not in localStorage, try to extract from token
  return tokenService.getUserFromToken();
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  // Check if token exists and is not expired
  return !!tokenService.getAccessToken() && !tokenService.isTokenExpired();
};

/**
 * Refresh the user's token
 * @returns {Promise} - API response with new token
 */
export const refreshToken = async () => {
  try {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/auth/refresh-token', { refreshToken });

    if (response.data.token) {
      // Store new tokens
      tokenService.setTokens({
        accessToken: response.data.token,
        refreshToken: response.data.refreshToken || refreshToken // Keep old refresh token if new one not provided
      });

      // Update user data if provided
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }

    return response.data;
  } catch (error) {
    // If refresh fails, clear tokens to force re-login
    tokenService.removeTokens();
    throw error.message || { message: 'Token refresh failed' };
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} - API response
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.message || { message: 'Password reset request failed' };
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise} - API response
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.message || { message: 'Password reset failed' };
  }
};

export default {
  register,
  login,
  logout,
  loginWithGoogle,
  loginWithMicrosoft,
  getCurrentUser,
  isAuthenticated,
  refreshToken,
  requestPasswordReset,
  resetPassword,
};
