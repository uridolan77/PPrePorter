/**
 * Types for PerformanceTab component
 */

/**
 * Revenue data point interface
 */
export interface RevenueDataPoint {
  /**
   * Day of the week
   */
  day: string;
  
  /**
   * Revenue value
   */
  value: number;
}

/**
 * Player distribution data point interface
 */
export interface PlayerDistributionDataPoint {
  /**
   * Game name
   */
  game: string;
  
  /**
   * Number of players
   */
  value: number;
}

/**
 * KPI data interface
 */
export interface KPIData {
  /**
   * Average session time in minutes
   */
  averageSessionTime: number;
  
  /**
   * Conversion rate percentage
   */
  conversionRate: number;
  
  /**
   * Churn rate percentage
   */
  churnRate: number;
  
  /**
   * Revenue per user
   */
  revenuePerUser: number;
}

/**
 * Chart data interface
 */
export interface ChartData {
  /**
   * Revenue by day data
   */
  revenueByDay?: RevenueDataPoint[];
  
  /**
   * Players by game data
   */
  playersByGame?: PlayerDistributionDataPoint[];
}

/**
 * Dashboard data interface for PerformanceTab
 */
export interface PerformanceDashboardData {
  /**
   * Chart data
   */
  charts?: ChartData;
  
  /**
   * KPI data
   */
  kpis?: KPIData;
}

/**
 * PerformanceTab component props interface
 */
export interface PerformanceTabProps {
  /**
   * Dashboard data
   */
  dashboardData?: PerformanceDashboardData;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Error object
   */
  error?: Error | null;
  
  /**
   * Material-UI theme
   */
  theme?: any;
}

export default PerformanceTabProps;
