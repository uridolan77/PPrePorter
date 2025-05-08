// filepath: c:\dev\PPrePorter\Frontend\ppreporter-client\src\services\api\errorHandler.js
/**
 * API Error Handling Utility
 * 
 * Provides consistent error handling, logging, and transformation for API errors
 */

/**
 * Standard error structure to normalize API errors
 */
export class ApiError extends Error {
  constructor(message, status, code, details = null) {
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
  getUserMessage() {
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
 * Handle and standardize errors from API responses
 */
export const handleApiError = (error) => {
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
 */
export const getErrorDisplayDetails = (error) => {
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
 */
export const formatErrorForState = (error) => {
  const apiError = handleApiError(error);
  
  return {
    message: apiError.getUserMessage(),
    status: apiError.status,
    code: apiError.code,
    timestamp: apiError.timestamp
  };
};

/**
 * Handle auth errors specifically (401, 403)
 * @returns {boolean} - Whether the error was an auth error and has been handled
 */
export const handleAuthError = (error, logout) => {
  const apiError = handleApiError(error);
  
  if (apiError.status === 401) {
    // Session expired, redirect to login
    if (logout && typeof logout === 'function') {
      logout();
    } else {
      // Fallback if logout function not provided
      localStorage.removeItem('auth_token');
      window.location.href = '/login?session=expired';
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