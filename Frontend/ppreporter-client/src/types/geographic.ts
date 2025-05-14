/**
 * Types for Geographic Report
 */

/**
 * Geographic data point interface
 */
export interface GeographicData {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Country ID
   */
  countryId: string;

  /**
   * Country name
   */
  countryName: string;

  /**
   * Date of the data
   */
  date?: string;

  /**
   * Number of players
   */
  players: number;

  /**
   * Number of new players
   */
  newPlayers?: number;

  /**
   * Revenue amount
   */
  revenue: number;

  /**
   * Gross Gaming Revenue
   */
  ggr?: number;

  /**
   * Net Gaming Revenue
   */
  ngr?: number;

  /**
   * Deposits amount
   */
  deposits: number;

  /**
   * Withdrawals amount
   */
  withdrawals: number;

  /**
   * Net deposits (deposits - withdrawals)
   */
  netDeposits?: number;

  /**
   * Bonus amount
   */
  bonusAmount?: number;

  /**
   * Number of bets
   */
  bets?: number;

  /**
   * Number of wins
   */
  wins?: number;

  /**
   * Win rate
   */
  winRate?: number;

  /**
   * Average bet amount
   */
  avgBet?: number;

  /**
   * Average win amount
   */
  avgWin?: number;

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
 * Geographic summary interface
 */
export interface GeographicSummary {
  /**
   * Total players
   */
  totalPlayers: number;

  /**
   * Total new players
   */
  totalNewPlayers?: number;

  /**
   * Total revenue
   */
  totalRevenue: number;

  /**
   * Total GGR
   */
  totalGGR?: number;

  /**
   * Total NGR
   */
  totalNGR?: number;

  /**
   * Total deposits
   */
  totalDeposits: number;

  /**
   * Total withdrawals
   */
  totalWithdrawals: number;

  /**
   * Total net deposits
   */
  totalNetDeposits?: number;

  /**
   * Total bonus amount
   */
  totalBonusAmount?: number;

  /**
   * Total bets
   */
  totalBets?: number;

  /**
   * Total wins
   */
  totalWins?: number;

  /**
   * Overall win rate
   */
  overallWinRate?: number;

  /**
   * Average bet amount
   */
  avgBet?: number;

  /**
   * Average win amount
   */
  avgWin?: number;

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
 * Geographic report filters interface
 */
export interface GeographicFilters {
  /**
   * Start date (YYYY-MM-DD)
   */
  startDate: string;

  /**
   * End date (YYYY-MM-DD)
   */
  endDate: string;

  /**
   * Country IDs
   */
  countryIds?: string[];

  /**
   * White label IDs
   */
  whiteLabelIds?: string[];

  /**
   * Group by option
   */
  groupBy?: 'day' | 'week' | 'month' | 'country' | 'region' | 'continent';

  /**
   * Additional filter properties
   */
  [key: string]: any;
}

/**
 * Geographic metadata interface
 */
export interface GeographicMetadata {
  /**
   * Available countries
   */
  countries: Array<{
    id: string;
    name: string;
    region?: string;
    continent?: string;
  }>;

  /**
   * Available white labels
   */
  whiteLabels: Array<{
    id: string;
    name: string;
  }>;

  /**
   * Available regions
   */
  regions?: Array<{
    id: string;
    name: string;
  }>;

  /**
   * Available continents
   */
  continents?: Array<{
    id: string;
    name: string;
  }>;
}
