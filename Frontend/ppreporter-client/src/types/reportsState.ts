/**
 * Reports state types for TypeScript components
 */

import { Player, PlayerDetails, DailyAction, ReportConfiguration, ReportMetadata } from './reportsData';

/**
 * Players state
 */
export interface PlayersState {
  /**
   * Players data
   */
  data: Player[] | null;
  
  /**
   * Players metadata
   */
  metadata: ReportMetadata | null;
  
  /**
   * Loading state
   */
  loading: boolean;
  
  /**
   * Error message
   */
  error: string | null;
  
  /**
   * Selected player
   */
  selectedPlayer: Player | null;
  
  /**
   * Player details
   */
  playerDetails: PlayerDetails | null;
}

/**
 * Daily actions state
 */
export interface DailyActionsState {
  /**
   * Daily actions data
   */
  data: DailyAction[] | null;
  
  /**
   * Daily actions metadata
   */
  metadata: ReportMetadata | null;
  
  /**
   * Loading state
   */
  loading: boolean;
  
  /**
   * Error message
   */
  error: string | null;
}

/**
 * Configurations state
 */
export interface ConfigurationsState {
  /**
   * Saved configurations
   */
  saved: ReportConfiguration[];
  
  /**
   * Loading state
   */
  loading: boolean;
  
  /**
   * Error message
   */
  error: string | null;
}

/**
 * Reports state
 */
export interface ReportsState {
  /**
   * Players state
   */
  players: PlayersState;
  
  /**
   * Daily actions state
   */
  dailyActions: DailyActionsState;
  
  /**
   * Configurations state
   */
  configurations: ConfigurationsState;
}

export default ReportsState;
