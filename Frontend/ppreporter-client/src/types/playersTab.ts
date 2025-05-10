/**
 * Types for PlayersTab component
 */

/**
 * Player registration data point interface
 */
export interface PlayerRegistrationDataPoint {
  /**
   * Date string
   */
  date: string;
  
  /**
   * Number of registrations
   */
  count: number;
}

/**
 * Player demographics data point interface
 */
export interface PlayerDemographicsDataPoint {
  /**
   * Gender name
   */
  name: string;
  
  /**
   * Percentage value
   */
  value: number;
}

/**
 * Player age data point interface
 */
export interface PlayerAgeDataPoint {
  /**
   * Age range
   */
  age: string;
  
  /**
   * Number of players
   */
  count: number;
}

/**
 * Player interface
 */
export interface Player {
  /**
   * Player ID
   */
  id: number | string;
  
  /**
   * Player name
   */
  name: string;
  
  /**
   * Registration date
   */
  registeredAt: string;
  
  /**
   * Player status
   */
  status: string;
  
  /**
   * Player country
   */
  country: string;
}

/**
 * Dashboard data interface for PlayersTab
 */
export interface PlayersDashboardData {
  /**
   * Player registrations data
   */
  playerRegistrations?: PlayerRegistrationDataPoint[];
  
  /**
   * Recent players data
   */
  recentPlayers?: Player[];
  
  /**
   * Player demographics data
   */
  playerDemographics?: PlayerDemographicsDataPoint[];
  
  /**
   * Player age data
   */
  playerAgeData?: PlayerAgeDataPoint[];
}

/**
 * PlayersTab component props interface
 */
export interface PlayersTabProps {
  /**
   * Dashboard data
   */
  dashboardData?: PlayersDashboardData;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Material-UI theme
   */
  theme?: any;
}

export default PlayersTabProps;
