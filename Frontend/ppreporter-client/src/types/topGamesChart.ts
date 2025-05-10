/**
 * Types for TopGamesChart component
 */

/**
 * Game data interface
 */
export interface GameData {
  /**
   * Game name
   */
  gameName: string;
  
  /**
   * Game provider
   */
  provider: string;
  
  /**
   * Game revenue
   */
  revenue: number | string;
  
  /**
   * Number of players
   */
  players?: number;
  
  /**
   * Number of bets
   */
  bets?: number;
  
  /**
   * Game category
   */
  category?: string;
  
  /**
   * Game ID
   */
  id?: string | number;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Formatted game data for chart
 */
export interface FormattedGameData {
  /**
   * Shortened game name for display
   */
  name: string;
  
  /**
   * Full game name
   */
  fullName: string;
  
  /**
   * Game provider
   */
  provider: string;
  
  /**
   * Game revenue
   */
  revenue: number;
  
  /**
   * Number of players
   */
  players?: number;
  
  /**
   * Number of bets
   */
  bets?: number;
}

/**
 * TopGamesChart component props interface
 */
export interface TopGamesChartProps {
  /**
   * Array of game data
   */
  data: GameData[];
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Chart height
   */
  height?: number;
  
  /**
   * Maximum number of games to display
   */
  maxItems?: number;
  
  /**
   * Whether to show the legend
   */
  showLegend?: boolean;
}

export default TopGamesChartProps;
