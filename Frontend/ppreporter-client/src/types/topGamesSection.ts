/**
 * Types for TopGamesSection component
 */

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
 * TopGamesSection component props interface
 */
export interface TopGamesSectionProps {
  /**
   * Top games data
   */
  data?: TopGame[];
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Callback when download button is clicked
   */
  onDownload?: () => void;
  
  /**
   * Callback when settings button is clicked
   */
  onSettings?: () => void;
}

export default TopGamesSectionProps;
