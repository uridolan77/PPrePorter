/**
 * Types for trend analysis components
 */

/**
 * Outlier point interface
 */
export interface OutlierPoint {
  /**
   * Date of the data point
   */
  Date: string;
  
  /**
   * Value of the metric
   */
  Value: number;
  
  /**
   * Whether this is an outlier
   */
  isOutlier?: boolean;
  
  /**
   * Whether this is a forecasted point
   */
  isForecasted?: boolean;
}

/**
 * Pattern interface
 */
export interface Pattern {
  /**
   * Start date of the pattern
   */
  StartDate: string;
  
  /**
   * End date of the pattern
   */
  EndDate: string;
  
  /**
   * Type of pattern (Spike, Dip, Cycle, etc.)
   */
  PatternType: string;
  
  /**
   * Confidence level of the pattern detection
   */
  Confidence: number;
  
  /**
   * Description of the pattern
   */
  Description?: string;
}

/**
 * Seasonality interface
 */
export interface Seasonality {
  /**
   * Type of seasonality (Daily, Weekly, Monthly, etc.)
   */
  Type: string;
  
  /**
   * Strength of the seasonality (0-1)
   */
  Strength: number;
  
  /**
   * Period of the seasonality in days
   */
  PeriodDays: number;
}

/**
 * Trend data interface
 */
export interface TrendData {
  /**
   * Direction of the trend (Increasing, Decreasing, Stable)
   */
  TrendDirection: string;
  
  /**
   * Percentage change over the period
   */
  PercentageChange: number;
  
  /**
   * Whether seasonality was detected
   */
  SeasonalityDetected: boolean;
  
  /**
   * Seasonality details if detected
   */
  Seasonality?: Seasonality;
  
  /**
   * Array of outlier points
   */
  OutlierPoints: OutlierPoint[];
  
  /**
   * Array of identified patterns
   */
  IdentifiedPatterns?: Pattern[];
  
  /**
   * Forecast data if available
   */
  ForecastData?: OutlierPoint[];
}

/**
 * Analysis options interface
 */
export interface AnalysisOptions {
  /**
   * Whether to detect outliers
   */
  detectOutliers: boolean;
  
  /**
   * Whether to include seasonality analysis
   */
  includeSeasonality: boolean;
  
  /**
   * Time window in days
   */
  timeWindowDays: number;
  
  /**
   * Significance threshold for statistical tests
   */
  significanceThreshold: number;
}

/**
 * Dashboard parameters interface
 */
export interface DashboardParams {
  /**
   * Start date for the analysis
   */
  startDate?: string;
  
  /**
   * End date for the analysis
   */
  endDate?: string;
  
  /**
   * Filter by product
   */
  product?: string;
  
  /**
   * Filter by region
   */
  region?: string;
  
  /**
   * Filter by channel
   */
  channel?: string;
  
  /**
   * Filter by segment
   */
  segment?: string;
  
  /**
   * Any additional filters
   */
  [key: string]: any;
}

/**
 * TrendAnalysis component props interface
 */
export interface TrendAnalysisProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Function to close the dialog
   */
  onClose: () => void;
  
  /**
   * Key of the metric to analyze
   */
  metricKey: string;
  
  /**
   * Display name of the metric
   */
  metricName?: string;
  
  /**
   * Type of metric (revenue, registration, etc.)
   */
  metricType?: string;
  
  /**
   * Dashboard parameters for filtering
   */
  dashboardParams?: DashboardParams;
}

export default TrendAnalysisProps;
