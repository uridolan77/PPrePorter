/**
 * Types for StatsSummary component
 */

/**
 * Stat value interface
 */
export interface StatValue {
  /**
   * Current value
   */
  value?: number;
  
  /**
   * Percentage change from previous period
   */
  change?: number;
  
  /**
   * Period label
   */
  period?: string;
}

/**
 * Dashboard stats interface
 */
export interface DashboardStats {
  /**
   * Revenue stats
   */
  revenue?: StatValue;
  
  /**
   * Players stats
   */
  players?: StatValue;
  
  /**
   * New players stats
   */
  newPlayers?: StatValue;
  
  /**
   * Games played stats
   */
  gamesPlayed?: StatValue;
  
  /**
   * Additional stats
   */
  [key: string]: StatValue | undefined;
}

/**
 * KPI data interface
 */
export interface KPIData {
  /**
   * KPI title
   */
  title: string;
  
  /**
   * Formatted value
   */
  value: string;
  
  /**
   * Trend percentage
   */
  trend: number;
  
  /**
   * Trend label
   */
  trendLabel: string;
  
  /**
   * Icon element
   */
  icon: React.ReactNode;
  
  /**
   * Description
   */
  description: string;
}

/**
 * Stats data interface
 */
export interface StatsData {
  /**
   * Revenue KPI data
   */
  revenue: KPIData;
  
  /**
   * Players KPI data
   */
  players: KPIData;
  
  /**
   * New players KPI data
   */
  newPlayers: KPIData;
  
  /**
   * Games played KPI data
   */
  gamesPlayed: KPIData;
  
  /**
   * Additional KPI data
   */
  [key: string]: KPIData;
}

/**
 * StatsSummary component props interface
 */
export interface StatsSummaryProps {
  /**
   * Dashboard stats
   */
  stats?: DashboardStats;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
}

export default StatsSummaryProps;
