import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import mockDataService from '../../mockData';

// Constants
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Initialize mock data flag in localStorage
// This ensures the flag is set when the application starts
localStorage.setItem('USE_MOCK_DATA_FOR_UI_TESTING', 'true');
console.log('Mock data mode is enabled for UI testing');

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add a mock data interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // Add debugger statement for request interceptor
    debugger;
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);

    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Check if we should use mock data
    const useMockData = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';
    console.log('Using mock data?', useMockData);

    // If mock data is enabled, add a custom header to mark this request for mocking
    if (useMockData && config.headers) {
      config.headers['X-Use-Mock-Data'] = 'true';
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Add debugger statement for request error
    debugger;
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a mock data response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Just return the response if it's already resolved
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    // Add debugger statement for response error
    debugger;
    console.error('API Response Error:', error.response?.status, error.config?.url, error.response?.data);

    // Check if we should use mock data
    const useMockData = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';

    // If mock data is enabled and we have a request config
    if (useMockData && error.config && error.config.headers && error.config.headers['X-Use-Mock-Data'] === 'true') {
      console.log('Using mock data for failed request:', error.config.url);

      try {
        // Extract the endpoint from the URL
        const url = error.config.url || '';
        const method = error.config.method || 'get';
        const data = error.config.data ? JSON.parse(error.config.data) : {};

        // Get mock data for this endpoint
        const mockData = mockDataService.getMockData(url, method === 'get' ? error.config.params : data);

        // Simulate API delay
        await mockDataService.simulateApiDelay();

        if (mockData) {
          console.log('Mock data response:', mockData);

          // Return a mock response
          return Promise.resolve({
            data: mockData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config,
          });
        }
      } catch (mockError) {
        console.error('Error generating mock data:', mockError);
      }
    }

    // If we couldn't generate mock data or mock data is disabled, reject with the original error
    return Promise.reject(error);
  }
);

// Handle token refresh on 401 errors
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Add debugger statement for successful response
    debugger;
    console.log('API Response:', response.status, response.config.url, response.data);

    // Check if we should use mock data for successful responses too
    const useMockData = localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';
    if (useMockData && response.config.headers && response.config.headers['X-Use-Mock-Data'] === 'true') {
      console.log('Using mock data for successful request:', response.config.url);

      try {
        // Extract the endpoint from the URL
        const url = response.config.url || '';
        const method = response.config.method || 'get';
        const data = response.config.data ? JSON.parse(response.config.data) : {};

        // Get mock data for this endpoint
        const mockData = mockDataService.getMockData(url, method === 'get' ? response.config.params : data);

        if (mockData) {
          console.log('Mock data response (overriding success):', mockData);

          // Override the response with mock data
          response.data = mockData;
        }
      } catch (mockError) {
        console.error('Error generating mock data for successful response:', mockError);
      }
    }

    return response;
  },
  async (error: AxiosError): Promise<any> => {
    // This interceptor is for token refresh, not for mock data
    // The mock data interceptor is already handling errors
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
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Call token refresh endpoint
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

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
        // Refresh failed, force logout
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('user_info');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        ...error,
        response: {
          data: {
            message: 'Network error. Please check your connection and try again.',
          },
        },
      });
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;
