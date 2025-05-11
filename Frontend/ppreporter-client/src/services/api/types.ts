/**
 * Common types for API services
 */

/**
 * Report filters for daily actions and other reports
 */
export interface ReportFilters {
  startDate: string;
  endDate: string;
  whiteLabelIds?: number[];
  groupBy?: number | string;
  format?: 'csv' | 'xlsx' | 'pdf';
  // Add other filter properties as needed
}

/**
 * API response format
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Sorting parameters
 */
export interface SortingParams {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}
