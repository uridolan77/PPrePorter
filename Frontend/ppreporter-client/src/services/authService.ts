import axios from 'axios';
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

    // Ensure credentials object has required properties
    if (!credentials || !credentials.username || !credentials.password) {
      console.error('Invalid credentials object:', credentials);
      throw new Error('Invalid login credentials. Username and password are required.');
    }

    // Create a proper credentials object to ensure it's not empty
    const loginPayload = {
      username: credentials.username,
      password: credentials.password,
      rememberMe: credentials.rememberMe || false
    };

    // Double check that the payload has valid values
    if (!loginPayload.username || loginPayload.username.trim() === '') {
      throw new Error('Username is required');
    }

    if (!loginPayload.password || loginPayload.password.trim() === '') {
      throw new Error('Password is required');
    }

    console.log('Login payload:', {
      username: loginPayload.username,
      passwordLength: loginPayload.password ? loginPayload.password.length : 0,
      rememberMe: loginPayload.rememberMe
    });

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
      const mockData = mockDataService.getMockData('auth/login', loginPayload);

      if (mockData) {
        console.log('Using mock login data:', mockData);
        // Create a proper response object with headers to prevent "Cannot read properties of undefined (reading 'headers')" error
        response = {
          data: mockData,
          headers: {},
          status: 200,
          statusText: 'OK',
          config: {}
        };
      } else {
        throw new Error('No mock data available for login');
      }
    } else {
      try {
        // Stringify the payload to ensure it's sent correctly
        const stringifiedPayload = JSON.stringify(loginPayload);
        console.log('Stringified login payload:', stringifiedPayload);

        // Make the actual API call with the login payload
        // Note: apiClient.baseURL is already set to '/api' in development
        response = await apiClient.post<AuthResponse>('auth/login', loginPayload, {
          headers: {
            'Content-Type': 'application/json; v=1.0',
            'Accept': 'text/plain; v=1.0'
          }
        });

        console.log('Login request payload sent:', loginPayload);
        console.log('API call successful:', response);
      } catch (apiError) {
        console.error('API call error:', apiError);

        // Log more details about the error
        if (axios.isAxiosError(apiError)) {
          console.error('API error details:', {
            request: apiError.request,
            response: apiError.response,
            config: apiError.config
          });
        }

        throw apiError;
      }
    }

    console.log('Login response received:', response.data);

    // Ensure response has all required properties to prevent "Cannot read properties of undefined" errors
    if (response && typeof response === 'object') {
      // Use type assertion to handle both AxiosResponse and mock response
      const responseObj = response as any;

      // Add headers if missing
      if (!responseObj.headers) {
        responseObj.headers = {};
        console.log('Added empty headers object to response');
      }

      // Add other properties if missing
      if (!responseObj.status) {
        responseObj.status = 200;
      }

      if (!responseObj.statusText) {
        responseObj.statusText = 'OK';
      }

      if (!responseObj.config) {
        responseObj.config = {};
      }

      console.log('Ensured response has all required properties:', {
        hasHeaders: !!responseObj.headers,
        hasStatus: !!responseObj.status,
        hasStatusText: !!responseObj.statusText,
        hasConfig: !!responseObj.config
      });
    }

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

    // Set authorization header for future requests - safely
    try {
      // Ensure all properties exist before setting the header
      if (apiClient && apiClient.defaults) {
        // Use type assertion to avoid TypeScript errors
        if (!apiClient.defaults.headers) {
          apiClient.defaults.headers = {} as any;
        }
        if (!apiClient.defaults.headers.common) {
          apiClient.defaults.headers.common = {} as any;
        }
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set successfully');
      } else {
        console.warn('Could not set Authorization header - apiClient.defaults is undefined');
      }
    } catch (headerError) {
      console.error('Error setting Authorization header:', headerError);
      // Continue execution even if setting the header fails
    }

    return user;
  } catch (error) {
    console.error('Login error:', error);

    // Provide more detailed error information
    if (axios.isAxiosError(error)) {
      const axiosError = error as any;
      console.error('API error details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers
      });

      // Create a more user-friendly error message
      const errorMessage = axiosError.response?.data?.message ||
                          axiosError.response?.statusText ||
                          axiosError.message ||
                          'Login failed. Please check your credentials.';

      throw new Error(errorMessage);
    }

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
    // Check if we should use mock data
    const useMockData = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';
    console.log('Using mock data for register?', useMockData);

    let response;

    if (useMockData) {
      // Import mock data dynamically to avoid circular dependencies
      const mockDataModule = await import('../mockData');
      const mockDataService = mockDataModule.default;

      // Simulate API delay
      await mockDataService.simulateApiDelay();

      // Get mock register data
      const mockData = mockDataService.getMockData('auth/register', userData);

      if (mockData) {
        console.log('Using mock register data:', mockData);
        // Create a proper response object with headers
        response = {
          data: mockData,
          headers: {},
          status: 200,
          statusText: 'OK',
          config: {}
        };
      } else {
        throw new Error('No mock data available for register');
      }
    } else {
      response = await apiClient.post<AuthResponse>('auth/register', userData);
    }

    // Ensure response has all required properties
    if (response && typeof response === 'object') {
      const responseObj = response as any;
      if (!responseObj.headers) {
        responseObj.headers = {};
      }
    }

    const { token, refreshToken, user } = response.data;

    // Store tokens and user data
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken || '');
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Set authorization header for future requests - safely
    try {
      // Ensure all properties exist before setting the header
      if (apiClient && apiClient.defaults) {
        // Use type assertion to avoid TypeScript errors
        if (!apiClient.defaults.headers) {
          apiClient.defaults.headers = {} as any;
        }
        if (!apiClient.defaults.headers.common) {
          apiClient.defaults.headers.common = {} as any;
        }
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set successfully');
      } else {
        console.warn('Could not set Authorization header - apiClient.defaults is undefined');
      }
    } catch (headerError) {
      console.error('Error setting Authorization header:', headerError);
      // Continue execution even if setting the header fails
    }

    return user;
  } catch (error) {
    console.error('Register error:', error);
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
    await apiClient.post('auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage and headers regardless of server response
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Safely remove the Authorization header
    try {
      if (apiClient && apiClient.defaults && apiClient.defaults.headers && apiClient.defaults.headers.common) {
        delete apiClient.defaults.headers.common['Authorization'];
        console.log('Authorization header removed successfully');
      } else {
        console.warn('Could not remove Authorization header - one or more properties are undefined');
      }
    } catch (headerError) {
      console.error('Error removing Authorization header:', headerError);
      // Continue execution even if removing the header fails
    }
  }
};

/**
 * Refresh authentication token
 * @returns {Promise<User>} User data
 */
const refreshToken = async (): Promise<User> => {
  try {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }

    // Check if we should use mock data
    const useMockData = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';
    console.log('Using mock data for token refresh?', useMockData);

    let response;

    if (useMockData) {
      // Import mock data dynamically to avoid circular dependencies
      const mockDataModule = await import('../mockData');
      const mockDataService = mockDataModule.default;

      // Simulate API delay
      await mockDataService.simulateApiDelay();

      // Get mock refresh token data
      const mockData = mockDataService.getMockData('auth/refresh-token', { refreshToken: storedRefreshToken });

      if (mockData) {
        console.log('Using mock refresh token data:', mockData);
        // Create a proper response object with headers
        response = {
          data: mockData,
          headers: {},
          status: 200,
          statusText: 'OK',
          config: {}
        };
      } else {
        throw new Error('No mock data available for token refresh');
      }
    } else {
      response = await apiClient.post('auth/refresh-token', { refreshToken: storedRefreshToken });
    }

    // Ensure response has all required properties
    if (response && typeof response === 'object') {
      const responseObj = response as any;
      if (!responseObj.headers) {
        responseObj.headers = {};
      }
    }

    const { token, newRefreshToken, user } = response.data;

    // Update tokens and user data
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Update authorization header - safely
    try {
      // Ensure all properties exist before setting the header
      if (apiClient && apiClient.defaults) {
        // Use type assertion to avoid TypeScript errors
        if (!apiClient.defaults.headers) {
          apiClient.defaults.headers = {} as any;
        }
        if (!apiClient.defaults.headers.common) {
          apiClient.defaults.headers.common = {} as any;
        }
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set successfully');
      } else {
        console.warn('Could not set Authorization header - apiClient.defaults is undefined');
      }
    } catch (headerError) {
      console.error('Error setting Authorization header:', headerError);
      // Continue execution even if setting the header fails
    }

    return user;
  } catch (error) {
    console.error('Token refresh error:', error);

    // If refresh fails, clear storage and force re-login
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Safely remove the Authorization header
    try {
      if (apiClient && apiClient.defaults && apiClient.defaults.headers && apiClient.defaults.headers.common) {
        delete apiClient.defaults.headers.common['Authorization'];
        console.log('Authorization header removed successfully');
      } else {
        console.warn('Could not remove Authorization header - one or more properties are undefined');
      }
    } catch (headerError) {
      console.error('Error removing Authorization header:', headerError);
      // Continue execution even if removing the header fails
    }

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
    await apiClient.post('auth/forgot-password', request);
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
    await apiClient.post('auth/reset-password', request);
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
    const response = await apiClient.put('auth/profile', userData);
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
    await apiClient.post('auth/change-password', { currentPassword, newPassword });
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
    // Check if we should use mock data
    const useMockData = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';
    console.log('Using mock data for Google login?', useMockData);

    let response;

    if (useMockData) {
      // Import mock data dynamically to avoid circular dependencies
      const mockDataModule = await import('../mockData');
      const mockDataService = mockDataModule.default;

      // Simulate API delay
      await mockDataService.simulateApiDelay();

      // Get mock Google login data
      const mockData = mockDataService.getMockData('auth/google/callback');

      if (mockData) {
        console.log('Using mock Google login data:', mockData);
        // Create a proper response object with headers
        response = {
          data: mockData,
          headers: {},
          status: 200,
          statusText: 'OK',
          config: {}
        };
      } else {
        throw new Error('No mock data available for Google login');
      }
    } else {
      // This would typically redirect to Google OAuth flow
      // For now, we'll simulate a successful login
      response = await apiClient.get('auth/google/callback');
    }

    // Ensure response has all required properties
    if (response && typeof response === 'object') {
      const responseObj = response as any;
      if (!responseObj.headers) {
        responseObj.headers = {};
      }
    }

    const { token, refreshToken, user } = response.data;

    // Store tokens and user data
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Set authorization header for future requests - safely
    try {
      // Ensure all properties exist before setting the header
      if (apiClient && apiClient.defaults) {
        // Use type assertion to avoid TypeScript errors
        if (!apiClient.defaults.headers) {
          apiClient.defaults.headers = {} as any;
        }
        if (!apiClient.defaults.headers.common) {
          apiClient.defaults.headers.common = {} as any;
        }
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set successfully');
      } else {
        console.warn('Could not set Authorization header - apiClient.defaults is undefined');
      }
    } catch (headerError) {
      console.error('Error setting Authorization header:', headerError);
      // Continue execution even if setting the header fails
    }

    return user;
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

/**
 * Login with Microsoft
 * @returns {Promise<User>} User data
 */
const loginWithMicrosoft = async (): Promise<User> => {
  try {
    // Check if we should use mock data
    const useMockData = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';
    console.log('Using mock data for Microsoft login?', useMockData);

    let response;

    if (useMockData) {
      // Import mock data dynamically to avoid circular dependencies
      const mockDataModule = await import('../mockData');
      const mockDataService = mockDataModule.default;

      // Simulate API delay
      await mockDataService.simulateApiDelay();

      // Get mock Microsoft login data
      const mockData = mockDataService.getMockData('auth/microsoft/callback');

      if (mockData) {
        console.log('Using mock Microsoft login data:', mockData);
        // Create a proper response object with headers
        response = {
          data: mockData,
          headers: {},
          status: 200,
          statusText: 'OK',
          config: {}
        };
      } else {
        throw new Error('No mock data available for Microsoft login');
      }
    } else {
      // This would typically redirect to Microsoft OAuth flow
      // For now, we'll simulate a successful login
      response = await apiClient.get('auth/microsoft/callback');
    }

    // Ensure response has all required properties
    if (response && typeof response === 'object') {
      const responseObj = response as any;
      if (!responseObj.headers) {
        responseObj.headers = {};
      }
    }

    const { token, refreshToken, user } = response.data;

    // Store tokens and user data
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Set authorization header for future requests - safely
    try {
      // Ensure all properties exist before setting the header
      if (apiClient && apiClient.defaults) {
        // Use type assertion to avoid TypeScript errors
        if (!apiClient.defaults.headers) {
          apiClient.defaults.headers = {} as any;
        }
        if (!apiClient.defaults.headers.common) {
          apiClient.defaults.headers.common = {} as any;
        }
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set successfully');
      } else {
        console.warn('Could not set Authorization header - apiClient.defaults is undefined');
      }
    } catch (headerError) {
      console.error('Error setting Authorization header:', headerError);
      // Continue execution even if setting the header fails
    }

    return user;
  } catch (error) {
    console.error('Microsoft login error:', error);
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
