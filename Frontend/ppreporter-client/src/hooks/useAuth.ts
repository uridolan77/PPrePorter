import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  login as loginAction,
  logout as logoutAction,
  register as registerAction,
  resetPassword as resetPasswordAction,
  forgotPassword as forgotPasswordAction,
  refreshToken as refreshTokenAction,
  loginWithGoogle as loginWithGoogleAction,
  loginWithMicrosoft as loginWithMicrosoftAction,
  selectAuth
} from '../store/slices/authSlice';
import {
  User,
  LoginCredentials,
  RegistrationData,
  PasswordResetRequest,
  PasswordResetConfirmation
} from '../types/auth';

/**
 * Authentication hook return type
 */
export interface UseAuthReturn {
  /**
   * Current user
   */
  user: User | null;

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * Error message
   */
  error: string | null;

  /**
   * Login user
   */
  login: (credentials: LoginCredentials) => Promise<User>;

  /**
   * Register user
   */
  register: (userData: RegistrationData) => Promise<User>;

  /**
   * Logout user
   */
  logout: () => Promise<null>;

  /**
   * Reset password
   */
  resetPassword: (resetData: PasswordResetConfirmation) => Promise<void>;

  /**
   * Forgot password
   */
  forgotPassword: (email: PasswordResetRequest) => Promise<void>;

  /**
   * Refresh authentication token
   */
  refreshToken: () => Promise<User>;

  /**
   * Login with Google OAuth
   */
  loginWithGoogle: () => Promise<User>;

  /**
   * Login with Microsoft OAuth
   */
  loginWithMicrosoft: () => Promise<User>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => boolean;
}

/**
 * Custom hook for authentication
 * Provides a unified interface for authentication operations
 * using Redux as the single source of truth
 *
 * @returns Authentication methods and state
 */
export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);

  /**
   * Login user
   * @param credentials - User credentials
   * @returns Login result
   */
  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      console.log('useAuth.login called with credentials:', { username: credentials.username, rememberMe: credentials.rememberMe });

      // Dispatch the login action
      const resultAction = await dispatch(loginAction(credentials));
      console.log('Login action result:', resultAction);

      // Check if the action was fulfilled
      if (loginAction.fulfilled.match(resultAction)) {
        console.log('Login successful, user:', resultAction.payload);
        return resultAction.payload;
      } else {
        // Handle rejected action
        console.error('Login action rejected:', resultAction);
        const errorMessage = typeof resultAction.payload === 'string'
          ? resultAction.payload
          : 'Login failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error in useAuth.login:', error);
      throw error;
    }
  };

  /**
   * Register user
   * @param userData - User registration data
   * @returns Registration result
   */
  const register = async (userData: RegistrationData): Promise<User> => {
    try {
      const resultAction = await dispatch(registerAction(userData));
      if (registerAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        const errorMessage = typeof resultAction.payload === 'string'
          ? resultAction.payload
          : 'Registration failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   * @returns Logout result
   */
  const logout = async (): Promise<null> => {
    try {
      const resultAction = await dispatch(logoutAction());
      if (logoutAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        const errorMessage = typeof resultAction.payload === 'string'
          ? resultAction.payload
          : 'Logout failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Reset password
   * @param resetData - Reset password data
   * @returns Reset password result
   */
  const resetPassword = async (resetData: PasswordResetConfirmation): Promise<void> => {
    try {
      const resultAction = await dispatch(resetPasswordAction({
        token: resetData.token,
        newPassword: resetData.password
      }));
      if (resetPasswordAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        const errorMessage = typeof resultAction.payload === 'string'
          ? resultAction.payload
          : 'Password reset failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Forgot password
   * @param email - User email
   * @returns Forgot password result
   */
  const forgotPassword = async (email: PasswordResetRequest): Promise<void> => {
    try {
      const resultAction = await dispatch(forgotPasswordAction(email));
      if (forgotPasswordAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        const errorMessage = typeof resultAction.payload === 'string'
          ? resultAction.payload
          : 'Forgot password request failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Refresh authentication token
   * @returns Refresh token result
   */
  const refreshToken = async (): Promise<User> => {
    try {
      const resultAction = await dispatch(refreshTokenAction());
      if (refreshTokenAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        const errorMessage = typeof resultAction.payload === 'string'
          ? resultAction.payload
          : 'Token refresh failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Login with Google OAuth
   * @returns Google login result
   */
  const loginWithGoogle = async (): Promise<User> => {
    try {
      const resultAction = await dispatch(loginWithGoogleAction());
      if (loginWithGoogleAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        const errorMessage = typeof resultAction.payload === 'string'
          ? resultAction.payload
          : 'Google login failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Login with Microsoft OAuth
   * @returns Microsoft login result
   */
  const loginWithMicrosoft = async (): Promise<User> => {
    try {
      const resultAction = await dispatch(loginWithMicrosoftAction());
      if (loginWithMicrosoftAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        const errorMessage = typeof resultAction.payload === 'string'
          ? resultAction.payload
          : 'Microsoft login failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Check if user is authenticated
   * @returns Authentication status
   */
  const isAuthenticated = (): boolean => {
    return !!auth.user && auth.isAuthenticated;
  };

  return {
    user: auth.user,
    loading: auth.loading,
    error: auth.error ? (typeof auth.error === 'string' ? auth.error : auth.error.message) : null,
    login,
    register,
    logout,
    resetPassword,
    forgotPassword,
    refreshToken,
    loginWithGoogle,
    loginWithMicrosoft,
    isAuthenticated
  };
};

export default useAuth;
