import axios from 'axios';
import config from '../../config/appConfig';
import tokenService from '../tokenService';

// Create a base axios instance
const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.api.timeout,
});

// Request interceptor for adding the auth token
apiClient.interceptors.request.use(
  (reqConfig) => {
    const token = tokenService.getAccessToken();
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let pendingRequests = [];

// Function to process pending requests
const processPendingRequests = (token) => {
  pendingRequests.forEach(callback => callback(token));
  pendingRequests = [];
};

// Response interceptor for handling errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and not a refresh token request
    if (error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes('/auth/refresh-token')) {

      // Check if token is expired and we have a refresh token
      if (tokenService.isTokenExpired() && tokenService.getRefreshToken()) {

        // If we're not already refreshing
        if (!isRefreshing) {
          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Import auth service dynamically to avoid circular dependency
            const authService = await import('../authService');
            const result = await authService.default.refreshToken();

            // If refresh successful, update token and retry pending requests
            if (result && result.token) {
              const newToken = result.token;
              processPendingRequests(newToken);

              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, clear tokens and redirect to login
            tokenService.removeTokens();
            localStorage.removeItem('user');

            // Redirect to login page if not already there
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }

            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          // If we're already refreshing, add this request to pending queue
          return new Promise(resolve => {
            pendingRequests.push(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            });
          });
        }
      } else {
        // If token is expired and we don't have a refresh token, clear storage and redirect
        tokenService.removeTokens();
        localStorage.removeItem('user');

        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // Enhanced error object with better structure
    const errorObj = {
      message: error.response?.data?.message || error.message || 'Unknown error occurred',
      statusCode: error.response?.status,
      data: error.response?.data,
      originalError: error
    };

    return Promise.reject(errorObj);
  }
);

// Wrapper for GET requests
const get = (url, params = {}, config = {}) => {
  return apiClient.get(url, { params, ...config });
};

// Wrapper for POST requests
const post = (url, data = {}, config = {}) => {
  return apiClient.post(url, data, config);
};

// Wrapper for PUT requests
const put = (url, data = {}, config = {}) => {
  return apiClient.put(url, data, config);
};

// Wrapper for PATCH requests
const patch = (url, data = {}, config = {}) => {
  return apiClient.patch(url, data, config);
};

// Wrapper for DELETE requests
const remove = (url, config = {}) => {
  return apiClient.delete(url, config);
};

export default {
  get,
  post,
  put,
  patch,
  delete: remove,
  client: apiClient
};
