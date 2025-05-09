import apiClient from './api/apiClient';
import {
  User,
  LoginCredentials,
  RegistrationData,
  PasswordResetRequest,
  PasswordResetConfirmation,
  AuthResponse
} from '../types/auth';

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_info';

/**
 * Login user with credentials
 * @param {LoginCredentials} credentials - User credentials
 * @returns {Promise<User>} User data
 */
const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    console.log('Attempting login with credentials:', { username: credentials.username, rememberMe: credentials.rememberMe });

    // Check if we should use mock data
    const useMockData = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';
    console.log('Using mock data for login?', useMockData);

    let response;

    if (useMockData) {
      // Import mock data dynamically to avoid circular dependencies
      const mockDataModule = await import('../mockData');
      const mockDataService = mockDataModule.default;

      // Simulate API delay
      await mockDataService.simulateApiDelay();

      // Get mock login data
      const mockData = mockDataService.getMockData('/auth/login', credentials);

      if (mockData) {
        console.log('Using mock login data:', mockData);
        response = { data: mockData };
      } else {
        throw new Error('No mock data available for login');
      }
    } else {
      try {
        // Make the actual API call with explicit headers to match Swagger
        response = await apiClient.post<AuthResponse>('/auth/login', credentials, {
          headers: {
            'Content-Type': 'application/json; v=1.0',
            'Accept': 'text/plain; v=1.0'
          }
        });
        console.log('API call successful:', response);
      } catch (apiError) {
        console.error('API call error:', apiError);
        throw apiError;
      }
    }

    console.log('Login response received:', response.data);

    // Extract data from response
    const { token, refreshToken, username, fullName, role, permissions } = response.data;

    // Create user object from response data
    const user: User = {
      id: '1', // Assuming ID is 1 for admin user
      username: username,
      email: `${username}@example.com`, // Add email property to satisfy TypeScript
      fullName: fullName,
      role: role,
      permissions: permissions,
      active: true
    };

    console.log('Created user object:', user);

    // Store tokens and user data
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken || '');
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Set authorization header for future requests
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @param {RegistrationData} userData - User registration data
 * @returns {Promise<User>} User data
 */
const register = async (userData: RegistrationData): Promise<User> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    const { token, refreshToken, user } = response.data;

    // Store tokens and user data
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken || '');
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Set authorization header for future requests
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint to invalidate token on server
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage and headers regardless of server response
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

/**
 * Refresh authentication token
 * @returns {Promise<User>} User data
 */
const refreshToken = async (): Promise<User> => {
  try {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    const { token, newRefreshToken, user } = response.data;

    // Update tokens and user data
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Update authorization header
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return user;
  } catch (error) {
    // If refresh fails, clear storage and force re-login
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete apiClient.defaults.headers.common['Authorization'];

    throw error;
  }
};

/**
 * Get current user from local storage
 * @returns {User|null} User data or null if not logged in
 */
const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;

    // Parse the JSON safely
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    // If there's an error parsing the JSON, clear the invalid data
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
const isAuthenticated = (): boolean => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = getCurrentUser();
    return !!token && !!user;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

/**
 * Get authentication token
 * @returns {string|null} Authentication token or null
 */
const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting authentication token:', error);
    return null;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
const forgotPassword = async (email: string): Promise<void> => {
  try {
    const request: PasswordResetRequest = { email };
    await apiClient.post('/auth/forgot-password', request);
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    const request: PasswordResetConfirmation = {
      token,
      password: newPassword,
      confirmPassword: newPassword
    };
    await apiClient.post('/auth/reset-password', request);
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 * @param {Partial<User>} userData - User data to update
 * @returns {Promise<User>} Updated user data
 */
const updateProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await apiClient.put('/auth/profile', userData);
    const updatedUser = response.data;

    // Update user in local storage
    const currentUser = getCurrentUser();
    if (currentUser) {
      const mergedUser = { ...currentUser, ...updatedUser };
      localStorage.setItem(USER_KEY, JSON.stringify(mergedUser));
    }

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

/**
 * Change password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await apiClient.post('/auth/change-password', { currentPassword, newPassword });
  } catch (error) {
    throw error;
  }
};

/**
 * Login with Google
 * @returns {Promise<User>} User data
 */
const loginWithGoogle = async (): Promise<User> => {
  try {
    // This would typically redirect to Google OAuth flow
    // For now, we'll simulate a successful login
    const response = await apiClient.get('/auth/google/callback');
    const { token, refreshToken, user } = response.data;

    // Store tokens and user data
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Set authorization header for future requests
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Login with Microsoft
 * @returns {Promise<User>} User data
 */
const loginWithMicrosoft = async (): Promise<User> => {
  try {
    // This would typically redirect to Microsoft OAuth flow
    // For now, we'll simulate a successful login
    const response = await apiClient.get('/auth/microsoft/callback');
    const { token, refreshToken, user } = response.data;

    // Store tokens and user data
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Set authorization header for future requests
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return user;
  } catch (error) {
    throw error;
  }
};

// Alias for forgotPassword to maintain compatibility
const requestPasswordReset = forgotPassword;

export default {
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,
  isAuthenticated,
  getToken,
  forgotPassword,
  requestPasswordReset, // Add alias
  resetPassword,
  updateProfile,
  changePassword,
  loginWithGoogle,
  loginWithMicrosoft
};
