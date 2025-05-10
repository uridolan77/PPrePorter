/**
 * Types for games
 */

/**
 * Game interface
 */
export interface Game {
  /**
   * Game ID
   */
  id: string;
  
  /**
   * Game name
   */
  name: string;
  
  /**
   * Game provider
   */
  provider: string;
  
  /**
   * Game category
   */
  category: string;
  
  /**
   * Game description
   */
  description?: string;
  
  /**
   * Game thumbnail URL
   */
  thumbnailUrl?: string;
  
  /**
   * Game release date
   */
  releaseDate?: string;
  
  /**
   * Game popularity score
   */
  popularityScore?: number;
  
  /**
   * Game RTP (Return to Player) percentage
   */
  rtp?: number;
  
  /**
   * Game volatility
   */
  volatility?: 'low' | 'medium' | 'high';
  
  /**
   * Game status
   */
  status?: 'active' | 'inactive' | 'maintenance';
  
  /**
   * Game features
   */
  features?: string[];
  
  /**
   * Game tags
   */
  tags?: string[];
  
  /**
   * Game creation date
   */
  createdAt?: string;
  
  /**
   * Game last update date
   */
  updatedAt?: string;
}

/**
 * Game performance metrics interface
 */
export interface GamePerformance {
  /**
   * Game ID
   */
  gameId: string;
  
  /**
   * Total revenue
   */
  revenue: number;
  
  /**
   * Number of unique players
   */
  uniquePlayers: number;
  
  /**
   * Number of sessions
   */
  sessions: number;
  
  /**
   * Average session duration in minutes
   */
  avgSessionDuration: number;
  
  /**
   * Average bet amount
   */
  avgBet: number;
  
  /**
   * Average win amount
   */
  avgWin: number;
  
  /**
   * Total bets count
   */
  betsCount: number;
  
  /**
   * Total wins count
   */
  winsCount: number;
  
  /**
   * Win rate percentage
   */
  winRate: number;
  
  /**
   * Hold percentage
   */
  holdPercentage: number;
  
  /**
   * Time period
   */
  period?: {
    /**
     * Start date
     */
    startDate: string;
    
    /**
     * End date
     */
    endDate: string;
  };
}

/**
 * Game category interface
 */
export interface GameCategory {
  /**
   * Category ID
   */
  id: string;
  
  /**
   * Category name
   */
  name: string;
  
  /**
   * Category description
   */
  description?: string;
  
  /**
   * Number of games in this category
   */
  gamesCount?: number;
}

/**
 * Game provider interface
 */
export interface GameProvider {
  /**
   * Provider ID
   */
  id: string;
  
  /**
   * Provider name
   */
  name: string;
  
  /**
   * Provider description
   */
  description?: string;
  
  /**
   * Provider logo URL
   */
  logoUrl?: string;
  
  /**
   * Number of games from this provider
   */
  gamesCount?: number;
}

/**
 * Player demographics interface
 */
export interface PlayerDemographics {
  /**
   * Age distribution
   */
  ageDistribution: {
    /**
     * Age range
     */
    range: string;
    
    /**
     * Percentage of players in this age range
     */
    percentage: number;
  }[];
  
  /**
   * Gender distribution
   */
  genderDistribution: {
    /**
     * Gender
     */
    gender: string;
    
    /**
     * Percentage of players of this gender
     */
    percentage: number;
  }[];
  
  /**
   * Location distribution
   */
  locationDistribution: {
    /**
     * Location
     */
    location: string;
    
    /**
     * Percentage of players from this location
     */
    percentage: number;
  }[];
  
  /**
   * Device distribution
   */
  deviceDistribution: {
    /**
     * Device type
     */
    device: string;
    
    /**
     * Percentage of players using this device
     */
    percentage: number;
  }[];
}

/**
 * Game session interface
 */
export interface GameSession {
  /**
   * Session ID
   */
  id: string;
  
  /**
   * Game ID
   */
  gameId: string;
  
  /**
   * Player ID
   */
  playerId: string;
  
  /**
   * Session start time
   */
  startTime: string;
  
  /**
   * Session end time
   */
  endTime?: string;
  
  /**
   * Session duration in seconds
   */
  duration: number;
  
  /**
   * Total bets amount
   */
  totalBets: number;
  
  /**
   * Total wins amount
   */
  totalWins: number;
  
  /**
   * Number of bets
   */
  betsCount: number;
  
  /**
   * Number of wins
   */
  winsCount: number;
  
  /**
   * Device type
   */
  device?: string;
  
  /**
   * Browser type
   */
  browser?: string;
  
  /**
   * Operating system
   */
  os?: string;
}

/**
 * Games query parameters interface
 */
export interface GamesQueryParams {
  /**
   * Page number (1-based)
   */
  page?: number;
  
  /**
   * Number of items per page
   */
  limit?: number;
  
  /**
   * Field to sort by
   */
  sortBy?: string;
  
  /**
   * Sort order (asc or desc)
   */
  sortOrder?: 'asc' | 'desc';
  
  /**
   * Search term
   */
  search?: string;
  
  /**
   * Filter by category
   */
  category?: string;
  
  /**
   * Filter by provider
   */
  provider?: string;
  
  /**
   * Filter by status
   */
  status?: 'active' | 'inactive' | 'maintenance';
  
  /**
   * Filter by release date (start)
   */
  releaseDateStart?: string;
  
  /**
   * Filter by release date (end)
   */
  releaseDateEnd?: string;
}

/**
 * Top games query parameters interface
 */
export interface TopGamesQueryParams {
  /**
   * Metric to sort by (revenue, players, sessions)
   */
  metric?: 'revenue' | 'players' | 'sessions' | 'avgBet' | 'winRate';
  
  /**
   * Number of games to return
   */
  limit?: number;
  
  /**
   * Start date (ISO format)
   */
  startDate?: string;
  
  /**
   * End date (ISO format)
   */
  endDate?: string;
  
  /**
   * Filter by category
   */
  category?: string;
  
  /**
   * Filter by provider
   */
  provider?: string;
}

/**
 * Game performance query parameters interface
 */
export interface GamePerformanceQueryParams {
  /**
   * Start date (ISO format)
   */
  startDate?: string;
  
  /**
   * End date (ISO format)
   */
  endDate?: string;
  
  /**
   * Granularity (daily, weekly, monthly)
   */
  granularity?: 'daily' | 'weekly' | 'monthly';
}

export default Game;
