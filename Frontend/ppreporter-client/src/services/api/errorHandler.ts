import { AxiosError } from 'axios';
import { ApiError as ApiErrorType } from '../../types/api';

/**
 * Standard error structure to normalize API errors
 */
export class ApiError extends Error {
  /**
   * HTTP status code
   */
  status: number;

  /**
   * Error code
   */
  code: string;

  /**
   * Additional error details
   */
  details: any;

  /**
   * Timestamp when the error occurred
   */
  timestamp: string;

  /**
   * Create a new ApiError
   * @param message - Error message
   * @param status - HTTP status code
   * @param code - Error code
   * @param details - Additional error details
   */
  constructor(message: string, status: number, code: string, details: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Returns a user-friendly error message
   */
  getUserMessage(): string {
    if (this.status === 401) {
      return 'Your session has expired. Please log in again.';
    } else if (this.status === 403) {
      return 'You do not have permission to perform this action.';
    } else if (this.status === 404) {
      return 'The requested resource could not be found.';
    } else if (this.status >= 500) {
      return 'A server error occurred. Please try again later.';
    }

    return this.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Error display details interface
 */
export interface ErrorDisplayDetails {
  message: string;
  statusCode: number;
  errorCode: string;
  timestamp: string;
  details?: any;
}

/**
 * Handle and standardize errors from API responses
 * @param error - Error object
 * @returns Standardized ApiError
 */
export const handleApiError = (error: any): ApiError => {
  // Log the error for debugging
  console.error('API Error:', error);

  // Already processed error
  if (error instanceof ApiError) {
    return error;
  }

  // Handle Axios errors
  if (error.response) {
    // Server responded with a status code outside of 2xx range
    const { data, status } = error.response;

    // Extract error details from API response if available
    const message = data?.message || error.message || 'An error occurred';
    const code = data?.code || String(status);
    const details = data?.details || data?.errors || null;

    return new ApiError(message, status, code, details);
  } else if (error.request) {
    // Request was made but no response received (network error)
    return new ApiError(
      'Network error. Please check your connection.',
      0,
      'NETWORK_ERROR'
    );
  } else {
    // Error in setting up the request
    return new ApiError(
      error.message || 'Failed to make request',
      0,
      'REQUEST_SETUP_ERROR'
    );
  }
};

/**
 * Process response errors and format them for UI display
 * @param error - Error object
 * @returns Error display details
 */
export const getErrorDisplayDetails = (error: any): ErrorDisplayDetails => {
  const apiError = handleApiError(error);

  return {
    message: apiError.getUserMessage(),
    statusCode: apiError.status,
    errorCode: apiError.code,
    timestamp: apiError.timestamp,
    details: apiError.details
  };
};

/**
 * Format API error for Redux state
 * @param error - Error object
 * @returns Formatted error for Redux state
 */
export const formatErrorForState = (error: any): ApiErrorType => {
  const apiError = handleApiError(error);

  return {
    message: apiError.getUserMessage(),
    code: apiError.code,
    details: apiError.details
  };
};

/**
 * Handle auth errors specifically (401, 403)
 * @param error - Error object
 * @param logout - Optional logout function
 * @returns Whether the error was an auth error and has been handled
 */
export const handleAuthError = (error: any, logout?: () => void): boolean => {
  const apiError = handleApiError(error);

  if (apiError.status === 401) {
    // Session expired, redirect to login
    if (logout && typeof logout === 'function') {
      logout();
    } else {
      // Fallback if logout function not provided
      localStorage.removeItem('auth_token');
      // Don't use window.location.href as it causes a page refresh
      // Instead, we'll let the auth state handle the redirect
      // The auth state will detect that the token is missing and redirect to login
    }
    return true;
  }

  return false;
};

export default {
  ApiError,
  handleApiError,
  getErrorDisplayDetails,
  formatErrorForState,
  handleAuthError
};
