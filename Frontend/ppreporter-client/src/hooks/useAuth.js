import { useSelector, useDispatch } from 'react-redux';
import {
  login as loginAction,
  logout as logoutAction,
  register as registerAction,
  resetPassword as resetPasswordAction,
  forgotPassword as forgotPasswordAction,
  refreshToken as refreshTokenAction,
  selectAuth
} from '../store/slices/authSlice';

/**
 * Custom hook for authentication
 * Provides a unified interface for authentication operations
 * using Redux as the single source of truth
 *
 * @returns {Object} Authentication methods and state
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);

  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @returns {Promise} - Login result
   */
  const login = async (credentials) => {
    try {
      const resultAction = await dispatch(loginAction(credentials));
      if (loginAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Register user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Registration result
   */
  const register = async (userData) => {
    try {
      const resultAction = await dispatch(registerAction(userData));
      if (registerAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   * @returns {Promise} - Logout result
   */
  const logout = async () => {
    try {
      const resultAction = await dispatch(logoutAction());
      if (logoutAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload || 'Logout failed');
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Reset password
   * @param {Object} resetData - Reset password data
   * @returns {Promise} - Reset password result
   */
  const resetPassword = async (resetData) => {
    try {
      const resultAction = await dispatch(resetPasswordAction(resetData));
      if (resetPasswordAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload || 'Password reset failed');
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Forgot password
   * @param {string} email - User email
   * @returns {Promise} - Forgot password result
   */
  const forgotPassword = async (email) => {
    try {
      const resultAction = await dispatch(forgotPasswordAction(email));
      if (forgotPasswordAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload || 'Forgot password request failed');
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Refresh authentication token
   * @returns {Promise} - Refresh token result
   */
  const refreshToken = async () => {
    try {
      const resultAction = await dispatch(refreshTokenAction());
      if (refreshTokenAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload || 'Token refresh failed');
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  const isAuthenticated = () => {
    return !!auth.user && auth.isAuthenticated;
  };

  return {
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    login,
    register,
    logout,
    resetPassword,
    forgotPassword,
    refreshToken,
    isAuthenticated
  };
};

export default useAuth;
