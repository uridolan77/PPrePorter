import ApiService from './apiService';
import { API_ENDPOINTS } from '../../config/constants';
import {
  Player,
  PlayerActivity,
  PlayerTransaction,
  PlayerReportFilters,
  PlayerMetadata,
  PlayerReportConfiguration,
  ExportFormat
} from '../../types/players';
import { ApiResponse } from '../../types/api';
import { AxiosRequestConfig } from 'axios';

// Define the PLAYERS endpoints structure with fallback handling
let PLAYERS_ENDPOINTS: any;

// Check which structure we have
// Use type assertion to avoid TypeScript errors
if ((API_ENDPOINTS as any).PLAYERS) {
  // Using the JavaScript structure
  PLAYERS_ENDPOINTS = (API_ENDPOINTS as any).PLAYERS;
} else if (API_ENDPOINTS.REPORTS && API_ENDPOINTS.REPORTS.PLAYER_ACTIVITY) {
  // Using the TypeScript structure
  PLAYERS_ENDPOINTS = {
    GET_DATA: `${API_ENDPOINTS.REPORTS.PLAYER_ACTIVITY}/data`,
    GET_METADATA: `${API_ENDPOINTS.REPORTS.PLAYER_ACTIVITY}/metadata`,
    GET_DETAILS: `${API_ENDPOINTS.REPORTS.PLAYER_ACTIVITY}/details`,
    GET_ACTIVITY: `${API_ENDPOINTS.REPORTS.PLAYER_ACTIVITY}/activity`,
    GET_TRANSACTIONS: `${API_ENDPOINTS.REPORTS.PLAYER_ACTIVITY}/transactions`,
    EXPORT: `${API_ENDPOINTS.REPORTS.PLAYER_ACTIVITY}/export`,
    SAVE_CONFIG: `${API_ENDPOINTS.REPORTS.PLAYER_ACTIVITY}/config/save`,
    GET_CONFIGS: `${API_ENDPOINTS.REPORTS.PLAYER_ACTIVITY}/config/list`
  };
} else {
  // Fallback to hardcoded endpoints if neither structure is available
  PLAYERS_ENDPOINTS = {
    GET_DATA: '/reports/players/data',
    GET_METADATA: '/reports/players/metadata',
    GET_DETAILS: '/reports/players/details',
    GET_ACTIVITY: '/reports/players/activity',
    GET_TRANSACTIONS: '/reports/players/transactions',
    EXPORT: '/reports/players/export',
    SAVE_CONFIG: '/reports/configurations/save',
    GET_CONFIGS: '/reports/configurations'
  };
}

/**
 * Service for Players Report API integration
 * Extends the base ApiService class
 */
class PlayersService extends ApiService {
  /**
   * Get players report data based on filters
   * @param filters - Report filters
   * @returns Promise with report data
   */
  async getData(filters: PlayerReportFilters): Promise<ApiResponse<Player[]>> {
    return this.post<ApiResponse<Player[]>>(PLAYERS_ENDPOINTS.GET_DATA, filters);
  }

  /**
   * Get metadata for players report (countries, statuses, etc.)
   * @returns Promise with metadata
   */
  async getMetadata(): Promise<PlayerMetadata> {
    return this.get<PlayerMetadata>(PLAYERS_ENDPOINTS.GET_METADATA);
  }

  /**
   * Get detailed information for a specific player
   * @param playerId - Player ID
   * @returns Promise with player details
   */
  async getPlayerDetails(playerId: string): Promise<Player> {
    return this.get<Player>(`${PLAYERS_ENDPOINTS.GET_DETAILS}/${playerId}`);
  }

  /**
   * Get activity history for a specific player
   * @param playerId - Player ID
   * @param filters - Activity filters
   * @returns Promise with player activity data
   */
  async getPlayerActivity(playerId: string, filters: Record<string, any> = {}): Promise<ApiResponse<PlayerActivity[]>> {
    return this.post<ApiResponse<PlayerActivity[]>>(`${PLAYERS_ENDPOINTS.GET_ACTIVITY}/${playerId}`, filters);
  }

  /**
   * Get transaction history for a specific player
   * @param playerId - Player ID
   * @param filters - Transaction filters
   * @returns Promise with player transaction data
   */
  async getPlayerTransactions(playerId: string, filters: Record<string, any> = {}): Promise<ApiResponse<PlayerTransaction[]>> {
    return this.post<ApiResponse<PlayerTransaction[]>>(`${PLAYERS_ENDPOINTS.GET_TRANSACTIONS}/${playerId}`, filters);
  }

  /**
   * Export players report in specified format
   * @param filters - Report filters
   * @param format - Export format (csv, xlsx, pdf)
   * @returns Promise with report file as blob
   */
  async exportReport(filters: PlayerReportFilters, format: ExportFormat): Promise<Blob> {
    const config: AxiosRequestConfig = { responseType: 'blob' };
    return this.post<Blob>(
      PLAYERS_ENDPOINTS.EXPORT,
      { filters, format },
      config
    );
  }

  /**
   * Save report configuration
   * @param config - Configuration to save
   * @returns Promise with saved configuration
   */
  async saveConfiguration(config: PlayerReportConfiguration): Promise<PlayerReportConfiguration> {
    return this.post<PlayerReportConfiguration>(PLAYERS_ENDPOINTS.SAVE_CONFIG, config);
  }

  /**
   * Get saved report configurations
   * @returns Promise with list of saved configurations
   */
  async getSavedConfigurations(): Promise<PlayerReportConfiguration[]> {
    return this.get<PlayerReportConfiguration[]>(PLAYERS_ENDPOINTS.GET_CONFIGS);
  }
}

// Export a singleton instance
export default new PlayersService();
