/**
 * Types for OverviewTab component
 */

/**
 * Stat value interface
 */
export interface StatValue {
  /**
   * Current value
   */
  value: number;
  
  /**
   * Percentage change from previous period
   */
  change: number;
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
   * Engagement rate
   */
  engagementRate?: number;
  
  /**
   * Engagement change
   */
  engagementChange?: number;
  
  /**
   * Additional stats
   */
  [key: string]: any;
}

/**
 * Top game interface
 */
export interface TopGame {
  /**
   * Game ID
   */
  id: string | number;
  
  /**
   * Game name
   */
  name: string;
  
  /**
   * Game revenue
   */
  revenue: number;
  
  /**
   * Number of players
   */
  players: number;
  
  /**
   * Game category
   */
  category?: string;
  
  /**
   * Game rating
   */
  rating?: number;
}

/**
 * Transaction interface
 */
export interface Transaction {
  /**
   * Transaction ID
   */
  id: string | number;
  
  /**
   * Player name
   */
  player: string;
  
  /**
   * Transaction amount
   */
  amount: number;
  
  /**
   * Transaction type
   */
  type: string;
  
  /**
   * Transaction status
   */
  status: string;
  
  /**
   * Transaction date
   */
  date: string;
}

/**
 * Dashboard data interface
 */
export interface DashboardData {
  /**
   * Dashboard stats
   */
  stats?: DashboardStats;
  
  /**
   * Top games
   */
  topGames?: TopGame[];
  
  /**
   * Recent transactions
   */
  recentTransactions?: Transaction[];
}

/**
 * OverviewTab component props interface
 */
export interface OverviewTabProps {
  /**
   * Dashboard data
   */
  dashboardData?: DashboardData;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Error object
   */
  error?: Error | null;
}

export default OverviewTabProps;
