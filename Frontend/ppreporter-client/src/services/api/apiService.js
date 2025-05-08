// filepath: c:\dev\PPrePorter\Frontend\ppreporter-client\src\services\api\apiService.js
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../../config/constants';
import errorHandler, { handleApiError } from './errorHandler';

/**
 * Base API service with common configuration and error handling
 * All specific API services should extend this base service
 */
class ApiService {
  /**
   * Create a new ApiService instance
   * @param {string} baseUrl - Base URL for the API endpoints
   * @param {number} timeout - Request timeout in milliseconds
   */
  constructor(baseUrl = API_BASE_URL, timeout = API_TIMEOUT) {
    this.client = axios.create({
      baseURL: `${baseUrl}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout,
    });

    // Set up request interceptors
    this.setupInterceptors();
  }

  /**
   * Configure request and response interceptors
   */
  setupInterceptors() {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token to requests
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Transform error using our error handler utility
        const apiError = handleApiError(error);
        
        // Handle authentication errors (401)
        if (apiError.status === 401) {
          errorHandler.handleAuthError(apiError);
        }
        
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Perform a GET request
   * @param {string} url - Endpoint URL
   * @param {Object} params - URL parameters
   * @param {Object} config - Additional Axios config
   * @returns {Promise<any>} Response data
   */
  async get(url, params = {}, config = {}) {
    try {
      const response = await this.client.get(url, { params, ...config });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a POST request
   * @param {string} url - Endpoint URL
   * @param {Object} data - Request body data
   * @param {Object} config - Additional Axios config
   * @returns {Promise<any>} Response data
   */
  async post(url, data = {}, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a PUT request
   * @param {string} url - Endpoint URL
   * @param {Object} data - Request body data
   * @param {Object} config - Additional Axios config
   * @returns {Promise<any>} Response data
   */
  async put(url, data = {}, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a PATCH request
   * @param {string} url - Endpoint URL
   * @param {Object} data - Request body data
   * @param {Object} config - Additional Axios config
   * @returns {Promise<any>} Response data
   */
  async patch(url, data = {}, config = {}) {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a DELETE request
   * @param {string} url - Endpoint URL
   * @param {Object} config - Additional Axios config
   * @returns {Promise<any>} Response data
   */
  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download a file
   * @param {string} url - Endpoint URL
   * @param {Object} params - URL parameters or POST data
   * @param {string} method - HTTP method (GET or POST)
   * @returns {Promise<Blob>} File blob
   */
  async downloadFile(url, params = {}, method = 'GET') {
    try {
      const config = {
        responseType: 'blob',
      };

      let response;
      if (method.toUpperCase() === 'GET') {
        response = await this.client.get(url, { params, ...config });
      } else {
        response = await this.client.post(url, params, config);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default ApiService;