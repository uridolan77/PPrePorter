/**
 * Personalization types for TypeScript components
 */

/**
 * Dashboard component interface
 */
export interface DashboardComponent {
  /**
   * Component ID
   */
  id: string;
  
  /**
   * Component name
   */
  name: string;
  
  /**
   * Component icon
   */
  icon: string;
  
  /**
   * Whether the component is included by default
   */
  default: boolean;
}

/**
 * Dashboard metric interface
 */
export interface DashboardMetric {
  /**
   * Metric ID
   */
  id: string;
  
  /**
   * Metric name
   */
  name: string;
  
  /**
   * Metric category
   */
  category: string;
  
  /**
   * Whether the metric is included by default
   */
  default: boolean;
}

/**
 * Dashboard recommendation interface
 */
export interface DashboardRecommendation {
  /**
   * Component ID
   */
  id: string;
  
  /**
   * Recommendation reason
   */
  reason: string;
  
  /**
   * Recommendation confidence
   */
  confidence: number;
}

/**
 * Dashboard filter preset interface
 */
export interface DashboardFilterPreset {
  /**
   * Preset ID
   */
  id: string;
  
  /**
   * Preset name
   */
  name: string;
  
  /**
   * Preset filters
   */
  filters: Record<string, any>;
}

/**
 * Dashboard personalization settings interface
 */
export interface DashboardPersonalizationSettings {
  /**
   * User role
   */
  role: 'executive' | 'analyst' | 'operator';
  
  /**
   * User experience level (1-3)
   */
  experienceLevel: number;
  
  /**
   * Enabled component IDs
   */
  components: string[];
  
  /**
   * Visible metric IDs
   */
  visibleMetrics: string[];
  
  /**
   * Preferred chart types for metrics
   */
  preferredChartTypes: Record<string, string>;
  
  /**
   * Data refresh interval in minutes
   */
  dataRefreshInterval: number;
  
  /**
   * Default date range in days
   */
  defaultDateRange: string;
  
  /**
   * Whether to show insight summary
   */
  showInsightSummary: boolean;
  
  /**
   * Insight level
   */
  insightLevel: 'basic' | 'moderate' | 'advanced';
  
  /**
   * Whether to enable notifications
   */
  enableNotifications: boolean;
  
  /**
   * Whether to enable anomaly alerts
   */
  enableAnomalyAlerts: boolean;
  
  /**
   * Color scheme
   */
  colorScheme: string;
  
  /**
   * Dashboard layout
   */
  dashboardLayout: string;
  
  /**
   * Data filter presets
   */
  dataFilterPresets: DashboardFilterPreset[];
}

/**
 * Snackbar state interface
 */
export interface SnackbarState {
  /**
   * Whether the snackbar is open
   */
  open: boolean;
  
  /**
   * Snackbar message
   */
  message: string;
  
  /**
   * Snackbar severity
   */
  severity: 'success' | 'info' | 'warning' | 'error';
}

/**
 * Dashboard personalization props interface
 */
export interface DashboardPersonalizationProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Close dialog callback
   */
  onClose: () => void;
  
  /**
   * Save settings callback
   */
  onSave: (settings: DashboardPersonalizationSettings) => void;
  
  /**
   * Current settings
   */
  currentSettings?: Partial<DashboardPersonalizationSettings>;
  
  /**
   * Whether the component is loading
   */
  isLoading?: boolean;
}

export default DashboardPersonalizationSettings;
