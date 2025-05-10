/**
 * API configuration
 */
export const API_BASE_URL: string = process.env.REACT_APP_API_URL || 'https://localhost:7075/api';
export const API_TIMEOUT: number = 30000; // 30 seconds

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile'
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    PLAYER_REGISTRATIONS: '/dashboard/player-registrations',
    RECENT_TRANSACTIONS: '/dashboard/recent-transactions',
    TOP_GAMES: '/dashboard/top-games',
    CASINO_REVENUE: '/dashboard/casino-revenue',
    PLAYER_JOURNEY: '/dashboard/player-journey',
    KPI: '/dashboard/kpi',
    PREFERENCES: '/dashboard/preferences',
    QUERY: '/dashboard/query'
  },
  REPORTS: {
    DAILY_ACTIONS: '/reports/daily-actions',
    PLAYER_ACTIVITY: '/reports/player-activity',
    REVENUE: '/reports/revenue',
    PROMOTIONAL: '/reports/promotional',
    COMPLIANCE: '/reports/compliance',
    EXPORT: '/reports/export',
    SCHEDULE: '/reports/schedule'
  },
  NATURAL_LANGUAGE: {
    QUERY: '/natural-language/query',
    HISTORY: '/natural-language/history',
    SUGGESTIONS: '/natural-language/suggestions'
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
  USE_MOCK_DATA_FOR_UI_TESTING: true // Set to true to use mock data instead of API calls
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
