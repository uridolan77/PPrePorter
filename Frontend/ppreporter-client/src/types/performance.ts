/**
 * Types for Performance Report
 */

/**
 * Performance data point interface
 */
export interface PerformanceData {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Date of the performance data
   */
  date: string;

  /**
   * Game ID
   */
  gameId?: string;

  /**
   * Game name
   */
  gameName?: string;

  /**
   * Game provider
   */
  gameProvider?: string;

  /**
   * Game category
   */
  gameCategory?: string;

  /**
   * Number of active players
   */
  activePlayers: number;

  /**
   * Number of new players
   */
  newPlayers: number;

  /**
   * Number of sessions
   */
  sessions: number;

  /**
   * Average session duration in minutes
   */
  avgSessionDuration: number;

  /**
   * Number of bets
   */
  bets: number;

  /**
   * Average bet amount
   */
  avgBet: number;

  /**
   * Number of wins
   */
  wins: number;

  /**
   * Average win amount
   */
  avgWin: number;

  /**
   * Win rate (wins/bets)
   */
  winRate: number;

  /**
   * Return to player percentage
   */
  rtp: number;

  /**
   * Hold percentage (1 - RTP)
   */
  holdPercentage: number;

  /**
   * Conversion rate
   */
  conversionRate?: number;

  /**
   * Churn rate
   */
  churnRate?: number;

  /**
   * Revenue per user
   */
  revenuePerUser?: number;

  /**
   * Additional properties
   */
  [key: string]: any;
}

/**
 * Performance summary interface
 */
export interface PerformanceSummary {
  /**
   * Total active players
   */
  totalActivePlayers: number;

  /**
   * Total new players
   */
  totalNewPlayers: number;

  /**
   * Total sessions
   */
  totalSessions: number;

  /**
   * Average session duration
   */
  avgSessionDuration: number;

  /**
   * Total bets
   */
  totalBets: number;

  /**
   * Average bet amount
   */
  avgBet: number;

  /**
   * Total wins
   */
  totalWins: number;

  /**
   * Average win amount
   */
  avgWin: number;

  /**
   * Overall win rate
   */
  overallWinRate: number;

  /**
   * Average RTP
   */
  avgRTP: number;

  /**
   * Average hold percentage
   */
  avgHoldPercentage: number;

  /**
   * Average conversion rate
   */
  avgConversionRate?: number;

  /**
   * Average churn rate
   */
  avgChurnRate?: number;

  /**
   * Average revenue per user
   */
  avgRevenuePerUser?: number;
}

/**
 * Performance report filters interface
 */
export interface PerformanceFilters {
  /**
   * Start date (YYYY-MM-DD)
   */
  startDate: string;

  /**
   * End date (YYYY-MM-DD)
   */
  endDate: string;

  /**
   * Game IDs
   */
  gameIds?: string[];

  /**
   * Game categories
   */
  gameCategories?: string[];

  /**
   * Game providers
   */
  gameProviders?: string[];

  /**
   * Group by option
   */
  groupBy?: 'day' | 'week' | 'month' | 'game' | 'category' | 'provider';

  /**
   * Additional filter properties
   */
  [key: string]: any;
}

/**
 * Performance metadata interface
 */
export interface PerformanceMetadata {
  /**
   * Available games
   */
  games: Array<{
    id: string;
    name: string;
  }>;

  /**
   * Available game categories
   */
  gameCategories: Array<{
    id: string;
    name: string;
  }>;

  /**
   * Available game providers
   */
  gameProviders: Array<{
    id: string;
    name: string;
  }>;
}
