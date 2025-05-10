import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../../config/constants';
import errorHandler, { handleApiError } from './errorHandler';

/**
 * Base API service with common configuration and error handling
 * All specific API services should extend this base service
 */
class ApiService {
  /**
   * Axios client instance
   */
  protected client: AxiosInstance;

  /**
   * Create a new ApiService instance
   * @param baseUrl - Base URL for the API endpoints
   * @param timeout - Request timeout in milliseconds
   */
  constructor(baseUrl: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    // Don't add '/api' again if it's already in the baseUrl
    const finalBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

    this.client = axios.create({
      baseURL: finalBaseUrl,
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
  protected setupInterceptors(): void {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token to requests
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
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
   * @param url - Endpoint URL
   * @param params - URL parameters
   * @param config - Additional Axios config
   * @returns Response data
   */
  async get<T = any>(url: string, params: Record<string, any> = {}, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await this.client.get<T>(url, { params, ...config });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a POST request
   * @param url - Endpoint URL
   * @param data - Request body data
   * @param config - Additional Axios config
   * @returns Response data
   */
  async post<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a PUT request
   * @param url - Endpoint URL
   * @param data - Request body data
   * @param config - Additional Axios config
   * @returns Response data
   */
  async put<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a PATCH request
   * @param url - Endpoint URL
   * @param data - Request body data
   * @param config - Additional Axios config
   * @returns Response data
   */
  async patch<T = any>(url: string, data: any = {}, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a DELETE request
   * @param url - Endpoint URL
   * @param config - Additional Axios config
   * @returns Response data
   */
  async delete<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download a file
   * @param url - Endpoint URL
   * @param params - URL parameters or POST data
   * @param method - HTTP method (GET or POST)
   * @returns File blob
   */
  async downloadFile(url: string, params: Record<string, any> = {}, method: string = 'GET'): Promise<Blob> {
    try {
      const config: AxiosRequestConfig = {
        responseType: 'blob',
      };

      let response: AxiosResponse<Blob>;
      if (method.toUpperCase() === 'GET') {
        response = await this.client.get<Blob>(url, { params, ...config });
      } else {
        response = await this.client.post<Blob>(url, params, config);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default ApiService;
