/**
 * Redux store types for TypeScript components
 */

import { AuthState } from './auth';
import { DashboardPreferences } from './dashboard';

/**
 * Root state of the Redux store
 */
export interface RootState {
  /**
   * Authentication state
   */
  auth: AuthState;
  
  /**
   * Dashboard state
   */
  dashboard: DashboardState;
  
  /**
   * Reports state
   */
  reports: ReportsState;
  
  /**
   * UI state
   */
  ui: UIState;
  
  /**
   * Settings state
   */
  settings: SettingsState;
}

/**
 * Dashboard state
 */
export interface DashboardState {
  /**
   * Dashboard data
   */
  data: any;
  
  /**
   * Dashboard loading state
   */
  loading: boolean;
  
  /**
   * Dashboard error
   */
  error: string | null;
  
  /**
   * Dashboard filters
   */
  filters: {
    /**
     * Date range
     */
    dateRange: [Date | null, Date | null];
    
    /**
     * Selected white labels
     */
    whiteLabels: string[];
    
    /**
     * Selected countries
     */
    countries: string[];
    
    /**
     * Selected game types
     */
    gameTypes: string[];
    
    /**
     * Selected player tiers
     */
    playerTiers: string[];
    
    /**
     * Additional filters
     */
    [key: string]: any;
  };
  
  /**
   * Dashboard preferences
   */
  preferences: DashboardPreferences;
}

/**
 * Reports state
 */
export interface ReportsState {
  /**
   * List of reports
   */
  list: any[];
  
  /**
   * Current report
   */
  current: any | null;
  
  /**
   * Reports loading state
   */
  loading: boolean;
  
  /**
   * Reports error
   */
  error: string | null;
  
  /**
   * Saved report configurations
   */
  savedConfigurations: any[];
}

/**
 * UI state
 */
export interface UIState {
  /**
   * Sidebar open state
   */
  sidebarOpen: boolean;
  
  /**
   * Current theme
   */
  theme: 'light' | 'dark' | 'system';
  
  /**
   * Current language
   */
  language: string;
  
  /**
   * Notifications
   */
  notifications: Notification[];
  
  /**
   * Modal state
   */
  modal: {
    /**
     * Modal open state
     */
    open: boolean;
    
    /**
     * Modal type
     */
    type: string | null;
    
    /**
     * Modal data
     */
    data: any;
  };
}

/**
 * Notification
 */
export interface Notification {
  /**
   * Notification ID
   */
  id: string;
  
  /**
   * Notification type
   */
  type: 'info' | 'success' | 'warning' | 'error';
  
  /**
   * Notification message
   */
  message: string;
  
  /**
   * Notification timestamp
   */
  timestamp: number;
  
  /**
   * Whether the notification has been read
   */
  read: boolean;
}

/**
 * Settings state
 */
export interface SettingsState {
  /**
   * Application settings
   */
  app: {
    /**
     * Default language
     */
    defaultLanguage: string;
    
    /**
     * Default theme
     */
    defaultTheme: 'light' | 'dark' | 'system';
    
    /**
     * Default date format
     */
    dateFormat: string;
    
    /**
     * Default time format
     */
    timeFormat: string;
    
    /**
     * Default currency
     */
    currency: string;
    
    /**
     * Default timezone
     */
    timezone: string;
  };
  
  /**
   * User settings
   */
  user: {
    /**
     * Notification settings
     */
    notifications: {
      /**
       * Email notifications enabled
       */
      email: boolean;
      
      /**
       * Push notifications enabled
       */
      push: boolean;
      
      /**
       * In-app notifications enabled
       */
      inApp: boolean;
    };
    
    /**
     * Privacy settings
     */
    privacy: {
      /**
       * Share usage data
       */
      shareUsageData: boolean;
      
      /**
       * Show online status
       */
      showOnlineStatus: boolean;
    };
  };
}

export default RootState;
