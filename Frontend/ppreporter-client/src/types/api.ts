/**
 * API types for TypeScript components
 */

/**
 * API response structure
 */
export interface ApiResponse<T> {
  /**
   * Response data
   */
  data: T;
  
  /**
   * Response status
   */
  status: number;
  
  /**
   * Response message
   */
  message?: string;
  
  /**
   * Response metadata
   */
  meta?: {
    /**
     * Total count of items
     */
    totalCount?: number;
    
    /**
     * Page number
     */
    page?: number;
    
    /**
     * Page size
     */
    pageSize?: number;
    
    /**
     * Total pages
     */
    totalPages?: number;
    
    /**
     * Additional metadata
     */
    [key: string]: any;
  };
  
  /**
   * Response errors
   */
  errors?: ApiError[];
}

/**
 * API error structure
 */
export interface ApiError {
  /**
   * Error code
   */
  code: string;
  
  /**
   * Error message
   */
  message: string;
  
  /**
   * Error field
   */
  field?: string;
  
  /**
   * Error details
   */
  details?: any;
}

/**
 * API pagination parameters
 */
export interface PaginationParams {
  /**
   * Page number
   */
  page?: number;
  
  /**
   * Page size
   */
  pageSize?: number;
  
  /**
   * Sort field
   */
  sortBy?: string;
  
  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc';
}

/**
 * API filter parameters
 */
export interface FilterParams {
  /**
   * Search query
   */
  search?: string;
  
  /**
   * Filter by field
   */
  [key: string]: any;
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  /**
   * Request headers
   */
  headers?: Record<string, string>;
  
  /**
   * Request parameters
   */
  params?: Record<string, any>;
  
  /**
   * Request body
   */
  body?: any;
  
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;
  
  /**
   * Whether to include credentials
   */
  withCredentials?: boolean;
  
  /**
   * Response type
   */
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  
  /**
   * Whether to handle errors automatically
   */
  handleErrors?: boolean;
}

/**
 * API authentication token
 */
export interface AuthToken {
  /**
   * Access token
   */
  accessToken: string;
  
  /**
   * Refresh token
   */
  refreshToken?: string;
  
  /**
   * Token type
   */
  tokenType: string;
  
  /**
   * Expiration time in seconds
   */
  expiresIn: number;
  
  /**
   * Expiration date
   */
  expiresAt?: Date;
}

export default ApiResponse;
