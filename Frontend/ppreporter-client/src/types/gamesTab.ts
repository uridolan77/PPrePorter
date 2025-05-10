/**
 * Types for GamesTab component
 */

/**
 * Game category data point interface
 */
export interface GameCategoryDataPoint {
  /**
   * Category name
   */
  name: string;
  
  /**
   * Category value (percentage)
   */
  value: number;
}

/**
 * Game performance data point interface
 */
export interface GamePerformanceDataPoint {
  /**
   * Metric name
   */
  name: string;
  
  /**
   * Game 1 value
   */
  game1: number;
  
  /**
   * Game 2 value
   */
  game2: number;
  
  /**
   * Game 3 value
   */
  game3: number;
  
  /**
   * Additional game values
   */
  [key: string]: string | number;
}

/**
 * Game list item interface
 */
export interface GameListItem {
  /**
   * Game ID
   */
  id: number | string;
  
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
   * Game rating
   */
  rating: number;
  
  /**
   * Game category
   */
  category: string;
}

/**
 * Featured game interface
 */
export interface FeaturedGame {
  /**
   * Game ID
   */
  id: number | string;
  
  /**
   * Game name
   */
  name: string;
  
  /**
   * Game description
   */
  description: string;
  
  /**
   * Game image URL
   */
  image: string;
  
  /**
   * Game category
   */
  category: string;
  
  /**
   * Game rating
   */
  rating: number;
  
  /**
   * Number of players
   */
  players: number;
}

/**
 * Dashboard data interface for GamesTab
 */
export interface GamesDashboardData {
  /**
   * Top games
   */
  topGames?: GameListItem[];
  
  /**
   * Game category distribution
   */
  gameCategoryData?: GameCategoryDataPoint[];
  
  /**
   * Game performance data
   */
  gamePerformanceData?: GamePerformanceDataPoint[];
  
  /**
   * Featured games
   */
  featuredGames?: FeaturedGame[];
}

/**
 * GamesTab component props interface
 */
export interface GamesTabProps {
  /**
   * Dashboard data
   */
  dashboardData?: GamesDashboardData;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Material-UI theme
   */
  theme?: any;
}

export default GamesTabProps;
