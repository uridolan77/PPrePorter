// filepath: c:\dev\PPrePorter\Frontend\ppreporter-client\src\config\constants.js
/**
 * Application constants
 */

/**
 * API configuration
 */
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7075/api';
export const API_TIMEOUT = 60000; // 60 seconds

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  DAILY_ACTIONS: {
    GET_DATA: '/reports/daily-actions/data',
    GET_METADATA: '/reports/daily-actions/metadata',
    GET_SUMMARY: '/reports/daily-actions/summary',
    FILTER: '/reports/daily-actions/filter',
    NL_QUERY: '/reports/daily-actions/query',
    EXPORT: '/reports/daily-actions/export',
    SAVE_CONFIG: '/reports/configurations/save',
    GET_CONFIGS: '/reports/configurations',
    DRILL_DOWN: '/reports/daily-actions/drill-down'
  },
  PLAYERS: {
    GET_DATA: '/reports/players/data',
    GET_METADATA: '/reports/players/metadata',
    GET_DETAILS: '/reports/players/details',
    GET_ACTIVITY: '/reports/players/activity',
    GET_TRANSACTIONS: '/reports/players/transactions',
    EXPORT: '/reports/players/export',
    SAVE_CONFIG: '/reports/configurations/save',
    GET_CONFIGS: '/reports/configurations'
  }
};

/**
 * Export formats supported by the application
 */
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json'
};

/**
 * Authentication constants
 */
export const AUTH = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_INFO_KEY: 'user_info'
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

/**
 * Date format constants
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM D, YYYY',
  API: 'YYYY-MM-DD',
  DATETIME_DISPLAY: 'MMM D, YYYY h:mm A',
  DATETIME_API: 'YYYY-MM-DDTHH:mm:ss'
};

/**
 * Report types
 */
export const REPORT_TYPES = {
  DAILY_ACTIONS: 'daily-actions',
  PLAYER_ACTIVITY: 'player-activity',
  REVENUE: 'revenue',
  PROMOTIONAL: 'promotional',
  COMPLIANCE: 'compliance'
};

/**
 * Features flags and settings
 */
export const FEATURES = {
  NATURAL_LANGUAGE_QUERY: true,
  AI_INSIGHTS: true,
  EXPORT_SCHEDULING: true,
  DATA_ALERTS: true
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  API_ENDPOINTS,
  EXPORT_FORMATS,
  AUTH,
  PAGINATION,
  DATE_FORMATS,
  REPORT_TYPES,
  FEATURES
};