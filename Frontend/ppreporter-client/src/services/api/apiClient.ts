import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import mockDataService from '../../mockData';

// Constants
// In development, use relative URLs to leverage the proxy in setupProxy.js
// In production, use the full URL from environment variables
const isProduction = process.env.NODE_ENV === 'production';
const API_URL = isProduction
  ? (process.env.REACT_APP_API_URL || 'https://localhost:7075')
  : ''; // Empty string means use relative URLs that will go through the proxy

// Log the API URL being used
console.log('API URL configured as:', API_URL || 'Using proxy with relative URLs');
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Initialize mock data flag in localStorage if not already set
// This ensures the flag is set when the application starts
if (localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === null) {
  localStorage.setItem('USE_MOCK_DATA_FOR_UI_TESTING', 'true');
  console.log('Mock data mode initialized to enabled');
}

// Log current mock data setting
const mockDataEnabled = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';
console.log(`Mock data mode is currently ${mockDataEnabled ? 'enabled' : 'disabled'}`);

// Force disable mock data for all API calls
const FORCE_REAL_API_CALLS = false; // Set to false to allow mock data toggle to work
if (FORCE_REAL_API_CALLS) {
  console.log('FORCE_REAL_API_CALLS is enabled - all API calls will use the real API regardless of localStorage settings');
} else {
  console.log('FORCE_REAL_API_CALLS is disabled - mock data toggle will work based on localStorage settings');
}

// Function to check API availability without automatically enabling mock data
const checkApiAvailability = async () => {
  try {
    // Use the proxy path for health check in development
    const healthCheckUrl = isProduction ? `${API_URL}/api/health` : '/api/health';
    console.log('Checking API availability at:', healthCheckUrl);

    // Create an AbortController to timeout the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Try to ping the API server with a timeout
    const response = await fetch(healthCheckUrl, {
      method: 'HEAD',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      signal: controller.signal
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    console.log('API health check successful, status:', response.status);
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    console.warn('API is unavailable, but not automatically enabling mock data mode');
    // Don't automatically switch to mock data mode
    // localStorage.setItem('USE_MOCK_DATA_FOR_UI_TESTING', 'true');
    return false;
  }
};

// Check API availability on startup
checkApiAvailability();

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  // In development, use relative URLs to leverage the proxy in package.json
  baseURL: isProduction ? API_URL : '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json; v=1.0', // Add API version to match Swagger
  },
  timeout: 60000, // 60 seconds
  withCredentials: false, // Set to false to avoid CORS preflight issues
});

// Add a mock data interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // Log request details with more information
    console.log('API Request:', config.method?.toUpperCase(), config.url);

    // Special handling for auth endpoints to avoid logging sensitive data
    const isAuthEndpoint = config.url?.includes('/auth/');

    if (isAuthEndpoint) {
      if (config.data && typeof config.data === 'object') {
        // Create a sanitized version of the data for logging
        const sanitizedData = { ...config.data };
        if (sanitizedData.password) {
          sanitizedData.password = '********';
        }
        console.log('Request data (sanitized for auth endpoint):', sanitizedData);
      } else {
        console.log('Auth endpoint request with non-object data');
      }
    } else {
      console.log('Request data (before):', config.data);
    }

    // Log request data in a more detailed way
    if (config.method?.toLowerCase() === 'post') {
      if (typeof config.data === 'string') {
        try {
          const parsedData = JSON.parse(config.data);
          // Sanitize password if present
          if (parsedData.password) {
            const sanitizedData = { ...parsedData, password: '********' };
            console.log('Parsed request data (string, sanitized):', sanitizedData);
          } else {
            console.log('Parsed request data (string):', parsedData);
          }
        } catch (e) {
          console.log('Could not parse request data as JSON, raw data length:',
            typeof config.data === 'string' ? config.data.length : 'unknown');
        }
      } else if (typeof config.data === 'object') {
        // Sanitize password if present
        if (config.data && config.data.password) {
          const sanitizedData = { ...config.data, password: '********' };
          console.log('Request data (object, sanitized):', sanitizedData);
        } else {
          console.log('Request data (object):', config.data);
        }
      }
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Check if we should use mock data
    let useMockData = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';

    // Override with FORCE_REAL_API_CALLS if enabled
    if (FORCE_REAL_API_CALLS) {
      useMockData = false;
    }

    console.log('Using mock data?', useMockData);

    // If mock data is enabled, we'll handle it directly here
    if (useMockData) {
      console.log('[API CLIENT] Mock data is enabled for request:', config.method?.toUpperCase(), config.url);

      // Import mock data dynamically to avoid circular dependencies
      try {
        const mockDataModule = await import('../../mockData');
        const mockDataService = mockDataModule.default;

        // Get the URL path without the base URL
        const url = config.url || '';
        const method = config.method || 'get';
        // Ensure we have a proper object for the data
        let data = {};
        if (config.data) {
          if (typeof config.data === 'string') {
            try {
              data = JSON.parse(config.data);
            } catch (e) {
              console.error('Failed to parse request data as JSON:', e);
              data = { rawData: config.data }; // Use as-is if parsing fails
            }
          } else {
            data = config.data; // Use object directly
          }
        }

        console.log('[API CLIENT] Preparing mock data for:', url);
        console.log('[API CLIENT] Method:', method);
        console.log('[API CLIENT] Params:', method.toLowerCase() === 'get' ? config.params : data);

        // Extract the endpoint from the URL
        // In development with proxy, the URL is already relative
        // In production, we need to remove the base URL
        let endpoint = url;
        if (isProduction && API_URL) {
          endpoint = url.replace(API_URL, '');
        }
        // Make sure the endpoint starts with a slash
        if (!endpoint.startsWith('/')) {
          endpoint = '/' + endpoint;
        }
        console.log('[API CLIENT] Extracted endpoint:', endpoint);

        // Add a custom property to the config to store the mock data
        // This will be used in the response interceptor
        (config as any).mockData = {
          url: endpoint, // Use the endpoint without the base URL
          method,
          params: method.toLowerCase() === 'get' ? config.params : data,
          mockDataService
        };

        // Add a custom header to mark this request for mocking
        if (config.headers) {
          config.headers['X-Use-Mock-Data'] = 'true';
        }
      } catch (error) {
        console.error('[API CLIENT] Error setting up mock data:', error);
      }
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a mock data response interceptor
apiClient.interceptors.response.use(
  async (response: AxiosResponse): Promise<AxiosResponse> => {
    // Ensure response has headers property to prevent "Cannot read properties of undefined (reading 'headers')" error
    if (!response.headers) {
      console.log('[API CLIENT RESPONSE] Adding empty headers object to response');
      response.headers = {};
    }

    // Check if we should use mock data
    let useMockData = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';

    // Override with FORCE_REAL_API_CALLS if enabled
    if (FORCE_REAL_API_CALLS) {
      useMockData = false;
    }

    // If mock data is enabled and we have mock data in the config
    if (useMockData && (response.config as any).mockData) {
      console.log('[API CLIENT RESPONSE] Using mock data for successful request:', response.config.url);

      try {
        const mockDataInfo = (response.config as any).mockData;
        console.log('[API CLIENT RESPONSE] Mock data info:', mockDataInfo);

        // Get mock data for this endpoint
        console.log('[API CLIENT RESPONSE] Getting mock data for:', mockDataInfo.url);
        const mockData = mockDataInfo.mockDataService.getMockData(mockDataInfo.url, mockDataInfo.params);

        // Simulate API delay
        await mockDataInfo.mockDataService.simulateApiDelay();

        if (mockData) {
          console.log('[API CLIENT RESPONSE] Mock data response:', mockData);

          // Override the response with mock data
          response.data = mockData;

          // Ensure all required properties exist
          if (!response.headers) {
            response.headers = {};
          }

          if (!response.status) {
            response.status = 200;
          }

          if (!response.statusText) {
            response.statusText = 'OK';
          }

          if (!response.config) {
            response.config = {} as any;
          }

          // Special handling for daily action games endpoint
          if (mockDataInfo.url.includes('reports/daily-action-games')) {
            console.log('[API CLIENT RESPONSE] Special handling for daily action games endpoint');

            // If the mock data doesn't have the expected structure, wrap it
            if (mockData && !mockData.data && !Array.isArray(mockData)) {
              console.log('[API CLIENT RESPONSE] Wrapping mock data in expected structure');
              response.data = {
                data: Array.isArray(mockData) ? mockData : [mockData],
                totalCount: Array.isArray(mockData) ? mockData.length : 1
              };
            } else if (Array.isArray(mockData)) {
              console.log('[API CLIENT RESPONSE] Wrapping array mock data in expected structure');
              response.data = {
                data: mockData,
                totalCount: mockData.length
              };
            }
          }
        } else {
          console.warn('[API CLIENT RESPONSE] No mock data returned for:', mockDataInfo.url);
        }
      } catch (mockError) {
        console.error('[API CLIENT RESPONSE] Error generating mock data for successful response:', mockError);
      }
    }

    // Final check to ensure headers property exists
    if (!response.headers) {
      console.log('[API CLIENT RESPONSE] Adding empty headers object to response (final check)');
      response.headers = {};
    }

    return response;
  },
  async (error: AxiosError): Promise<any> => {
    console.error('[API CLIENT RESPONSE] API Response Error:', error.response?.status, error.config?.url, error.response?.data);

    // Check if we should use mock data
    let useMockData = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';

    // Override with FORCE_REAL_API_CALLS if enabled
    if (FORCE_REAL_API_CALLS) {
      useMockData = false;
    }

    // If mock data is enabled and we have mock data in the config
    if (useMockData && error.config && (error.config as any).mockData) {
      console.log('[API CLIENT RESPONSE] Using mock data for failed request:', error.config.url);

      try {
        const mockDataInfo = (error.config as any).mockData;
        console.log('[API CLIENT RESPONSE] Mock data info for error:', mockDataInfo);

        // Get mock data for this endpoint
        console.log('[API CLIENT RESPONSE] Getting mock data for error:', mockDataInfo.url);
        const mockData = mockDataInfo.mockDataService.getMockData(mockDataInfo.url, mockDataInfo.params);

        // Simulate API delay
        await mockDataInfo.mockDataService.simulateApiDelay();

        if (mockData) {
          console.log('[API CLIENT RESPONSE] Mock data response for error:', mockData);

          // Create a complete mock response with all required properties
          const mockResponse = {
            data: mockData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config || {},
            request: {}, // Add empty request object
          };

          // Log the mock response structure
          console.log('[API CLIENT RESPONSE] Created mock response with structure:', {
            hasData: !!mockResponse.data,
            hasStatus: !!mockResponse.status,
            hasStatusText: !!mockResponse.statusText,
            hasHeaders: !!mockResponse.headers,
            hasConfig: !!mockResponse.config,
            hasRequest: !!mockResponse.request
          });

          return Promise.resolve(mockResponse);
        } else {
          console.warn('[API CLIENT RESPONSE] No mock data returned for error:', mockDataInfo.url);
        }
      } catch (mockError) {
        console.error('[API CLIENT RESPONSE] Error generating mock data for error:', mockError);
      }
    }

    // If error.response exists but doesn't have headers, add them
    if (error.response && !error.response.headers) {
      console.log('[API CLIENT RESPONSE] Adding empty headers object to error response');
      error.response.headers = {};
    }

    // If we couldn't generate mock data or mock data is disabled, reject with the original error
    return Promise.reject(error);
  }
);

// Handle token refresh on 401 errors
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    console.log('API Response:', response.status, response.config.url, response.data);

    // Ensure response has headers property to prevent "Cannot read properties of undefined (reading 'headers')" error
    if (!response.headers) {
      console.log('[API CLIENT TOKEN REFRESH] Adding empty headers object to response');
      response.headers = {};
    }

    // We've already handled mock data in the previous interceptor
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    // Ensure error.response has headers property if it exists
    if (error.response && !error.response.headers) {
      console.log('[API CLIENT TOKEN REFRESH] Adding empty headers object to error response');
      error.response.headers = {};
    }

    // This interceptor is for token refresh, not for mock data
    // The mock data interceptor is already handling errors
    // Only proceed with token refresh if mock data is disabled
    let useMockData = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';

    // Override with FORCE_REAL_API_CALLS if enabled
    if (FORCE_REAL_API_CALLS) {
      useMockData = false;
    }

    if (useMockData) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as any)._retry
    ) {
      (originalRequest as any)._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          // No refresh token, force logout
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem('user_info');
          // Don't use window.location.href as it causes a page refresh
          // Instead, we'll let the auth state handle the redirect
          return Promise.reject(error);
        }

        // Call token refresh endpoint using the proxy in development
        const refreshUrl = isProduction ? `${API_URL}/api/auth/refresh-token` : '/api/auth/refresh-token';
        const response = await axios.post(refreshUrl, {
          refreshToken,
        });

        // Ensure response has headers property
        if (!response.headers) {
          console.log('[API CLIENT TOKEN REFRESH] Adding empty headers object to refresh token response');
          response.headers = {};
        }

        const { token, newRefreshToken } = response.data;

        // Update tokens in storage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

        // Update authorization header
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('[API CLIENT TOKEN REFRESH] Token refresh error:', refreshError);

        // Ensure refreshError.response has headers property if it exists
        if ((refreshError as any).response && !(refreshError as any).response.headers) {
          console.log('[API CLIENT TOKEN REFRESH] Adding empty headers object to refresh error response');
          (refreshError as any).response.headers = {};
        }

        // Refresh failed, force logout
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('user_info');
        // Don't use window.location.href as it causes a page refresh
        // Instead, we'll let the auth state handle the redirect
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);

      // Check if it's likely a CORS error
      if (error.message && (
          error.message.includes('Network Error') ||
          error.message.includes('CORS') ||
          error.message.includes('XMLHttpRequest')
      )) {
        console.error('Possible CORS issue detected. Make sure the API server has proper CORS headers enabled.');

        // If we're in development mode, provide more helpful information
        if (process.env.NODE_ENV === 'development') {
          console.info('CORS Troubleshooting Tips:');
          console.info('1. Ensure the API server has CORS enabled and allows this origin');
          console.info('2. Check if the API server is running and accessible');
          console.info('3. Verify the API URL is correct:', API_URL);
          console.info('4. Try using the setupProxy.js configuration');
          console.info('5. Check browser console for specific CORS errors');
          console.info('6. Ensure the server is properly configured to accept credentials');

          // Don't automatically enable mock data mode
          console.warn('Network error detected, but not automatically enabling mock data mode');
          console.info('You can manually enable mock data mode in the settings if needed');
        }
      }

      return Promise.reject({
        ...error,
        response: {
          data: {
            message: 'Network error. Please check your connection and try again.',
            details: error.message,
            isCorsError: error.message && (
              error.message.includes('Network Error') ||
              error.message.includes('CORS') ||
              error.message.includes('XMLHttpRequest')
            )
          },
        },
      });
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;
