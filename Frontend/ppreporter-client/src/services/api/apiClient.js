import axios from 'axios';

// Define the base API URL
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create a base axios instance
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for adding the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem('token');
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
