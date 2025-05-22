import axios from 'axios';
import config from '../../config/appConfig';

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
    const token = localStorage.getItem(config.auth.tokenKey);
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.refreshTokenKey);
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
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
