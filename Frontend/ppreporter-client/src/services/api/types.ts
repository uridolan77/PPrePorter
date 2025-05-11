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
  countryIds?: string[];
  groupBy?: number | string;
  format?: 'csv' | 'xlsx' | 'pdf';

  // Pagination parameters
  page?: number;
  pageSize?: number;

  // Sorting parameters
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';

  // Advanced filters - Date filters
  registrationDate?: string;
  firstDepositDate?: string;
  lastDepositDate?: string;
  lastLoginDate?: string;

  // Advanced filters - String filters
  trackers?: string;
  promotionCode?: string;
  playerIds?: string[];
  search?: string;

  // Advanced filters - Array filters
  playModes?: string[];
  platforms?: string[];
  statuses?: string[];
  genders?: string[];
  currencies?: string[];
  providerIds?: string[];
  categoryIds?: string[];
  features?: string[];
  tags?: string[];

  // Advanced filters - Boolean filters
  smsEnabled?: boolean;
  mailEnabled?: boolean;
  phoneEnabled?: boolean;
  postEnabled?: boolean;
  bonusEnabled?: boolean;

  // Advanced filters - Numeric filters
  minRtp?: number;
  maxRtp?: number;
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
