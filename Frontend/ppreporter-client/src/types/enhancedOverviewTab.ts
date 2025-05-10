/**
 * Types for EnhancedOverviewTab component
 */

/**
 * Stat value with change interface
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
  revenue: StatValue;
  
  /**
   * Players stats
   */
  players: StatValue;
  
  /**
   * Games stats
   */
  games: StatValue;
  
  /**
   * Engagement stats
   */
  engagement: StatValue;
}

/**
 * Revenue by day data point interface
 */
export interface RevenueByDayDataPoint {
  /**
   * Date string
   */
  date: string;
  
  /**
   * Revenue value
   */
  value: number;
}

/**
 * Player by game data point interface
 */
export interface PlayersByGameDataPoint {
  /**
   * Game name
   */
  name: string;
  
  /**
   * Number of players
   */
  players: number;
}

/**
 * Dashboard charts interface
 */
export interface DashboardCharts {
  /**
   * Revenue by day data
   */
  revenueByDay: RevenueByDayDataPoint[];
  
  /**
   * Players by game data
   */
  playersByGame: PlayersByGameDataPoint[];
}

/**
 * Transaction interface
 */
export interface Transaction {
  /**
   * Transaction ID
   */
  id: string;
  
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
 * Top game interface
 */
export interface TopGame {
  /**
   * Game ID
   */
  id: string;
  
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
}

/**
 * Dashboard data interface
 */
export interface DashboardData {
  /**
   * Dashboard stats
   */
  stats?: {
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
  };
  
  /**
   * Dashboard charts
   */
  charts?: {
    /**
     * Revenue by day data
     */
    revenueByDay?: RevenueByDayDataPoint[];
    
    /**
     * Players by game data
     */
    playersByGame?: PlayersByGameDataPoint[];
  };
  
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
 * EnhancedOverviewTab component props interface
 */
export interface EnhancedOverviewTabProps {
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

export default EnhancedOverviewTabProps;
