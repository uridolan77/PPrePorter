import apiClient from './api/apiClient';

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
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
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
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get current authenticated user
 * @returns {Object|null} - User data or null if not authenticated
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Refresh the user's token
 * @returns {Promise} - API response with new token
 */
export const refreshToken = async () => {
  try {
    const response = await apiClient.post('/auth/refresh-token');
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
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
