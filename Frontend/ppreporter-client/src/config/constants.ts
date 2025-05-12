/**
 * API configuration
 */
export const API_BASE_URL: string = process.env.REACT_APP_API_URL || 'https://localhost:7075';
export const API_TIMEOUT: number = 10000; // 10 seconds - reduced from 30 seconds

// Log the API URL being used
console.log('API_BASE_URL configured as:', API_BASE_URL);

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    CHANGE_PASSWORD: '/api/auth/change-password',
    PROFILE: '/api/auth/profile'
  },
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    PLAYER_REGISTRATIONS: '/api/dashboard/player-registrations',
    RECENT_TRANSACTIONS: '/api/dashboard/recent-transactions',
    TOP_GAMES: '/api/dashboard/top-games',
    CASINO_REVENUE: '/api/dashboard/casino-revenue',
    PLAYER_JOURNEY: '/api/dashboard/player-journey',
    KPI: '/api/dashboard/kpi',
    PREFERENCES: '/api/dashboard/preferences',
    QUERY: '/api/dashboard/query'
  },
  REPORTS: {
    DAILY_ACTIONS: '/api/reports/daily-actions',
    DAILY_ACTION_GAMES: '/api/reports/daily-action-games',
    PLAYER_ACTIVITY: '/api/reports/player-activity',
    REVENUE: '/api/reports/revenue',
    PROMOTIONAL: '/api/reports/promotional',
    COMPLIANCE: '/api/reports/compliance',
    EXPORT: '/api/reports/export',
    SCHEDULE: '/api/reports/schedule'
  },
  NATURAL_LANGUAGE: {
    QUERY: '/api/natural-language/query',
    HISTORY: '/api/natural-language/history',
    SUGGESTIONS: '/api/natural-language/suggestions'
  }
};

/**
 * Export formats
 */
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
  JSON: 'json'
};

/**
 * Authentication constants
 */
export const AUTH = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_info',
  TOKEN_EXPIRY: 3600, // 1 hour in seconds
  REFRESH_TOKEN_EXPIRY: 604800, // 7 days in seconds
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    MANAGER: 'manager',
    ANALYST: 'analyst',
    GUEST: 'guest'
  },
  PERMISSIONS: {
    VIEW_DASHBOARD: 'view:dashboard',
    EDIT_DASHBOARD: 'edit:dashboard',
    VIEW_REPORTS: 'view:reports',
    CREATE_REPORTS: 'create:reports',
    EXPORT_DATA: 'export:data',
    MANAGE_USERS: 'manage:users',
    ADMIN_ACCESS: 'admin:access'
  }
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
};

/**
 * Date formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  API: 'yyyy-MM-dd',
  DISPLAY_WITH_TIME: 'dd MMM yyyy HH:mm',
  API_WITH_TIME: 'yyyy-MM-dd\'T\'HH:mm:ss',
  TIME_ONLY: 'HH:mm'
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
  DATA_ALERTS: true,
  USE_MOCK_DATA_FOR_UI_TESTING: false // Set to false to use real API calls instead of mock data
};

// Log the mock data setting
console.log('USE_MOCK_DATA_FOR_UI_TESTING:', FEATURES.USE_MOCK_DATA_FOR_UI_TESTING ? 'ENABLED' : 'DISABLED');

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
