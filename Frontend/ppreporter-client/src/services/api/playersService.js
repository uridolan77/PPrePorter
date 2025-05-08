// filepath: c:\dev\PPrePorter\Frontend\ppreporter-client\src\services\api\playersService.js
import ApiService from './apiService';
import { API_ENDPOINTS } from '../../config/constants';

/**
 * Service for Players Report API integration
 * Extends the base ApiService class
 */
class PlayersService extends ApiService {
  /**
   * Get players report data based on filters
   * @param {Object} filters - Report filters
   * @returns {Promise<Object>} - Report data
   */
  async getData(filters) {
    return this.post(API_ENDPOINTS.PLAYERS.GET_DATA, filters);
  }

  /**
   * Get metadata for players report (countries, statuses, etc.)
   * @returns {Promise<Object>} - Metadata
   */
  async getMetadata() {
    return this.get(API_ENDPOINTS.PLAYERS.GET_METADATA);
  }

  /**
   * Get detailed information for a specific player
   * @param {string} playerId - Player ID
   * @returns {Promise<Object>} - Player details
   */
  async getPlayerDetails(playerId) {
    return this.get(`${API_ENDPOINTS.PLAYERS.GET_DETAILS}/${playerId}`);
  }

  /**
   * Get activity history for a specific player
   * @param {string} playerId - Player ID
   * @param {Object} filters - Activity filters
   * @returns {Promise<Object>} - Player activity data
   */
  async getPlayerActivity(playerId, filters = {}) {
    return this.post(`${API_ENDPOINTS.PLAYERS.GET_ACTIVITY}/${playerId}`, filters);
  }

  /**
   * Get transaction history for a specific player
   * @param {string} playerId - Player ID
   * @param {Object} filters - Transaction filters
   * @returns {Promise<Object>} - Player transaction data
   */
  async getPlayerTransactions(playerId, filters = {}) {
    return this.post(`${API_ENDPOINTS.PLAYERS.GET_TRANSACTIONS}/${playerId}`, filters);
  }

  /**
   * Export players report in specified format
   * @param {Object} filters - Report filters
   * @param {string} format - Export format (csv, xlsx, pdf)
   * @returns {Promise<Blob>} - Report file as blob
   */
  async exportReport(filters, format) {
    return this.post(
      API_ENDPOINTS.PLAYERS.EXPORT,
      { filters, format },
      { responseType: 'blob' }
    );
  }

  /**
   * Save report configuration
   * @param {Object} config - Configuration to save
   * @returns {Promise<Object>} - Saved configuration
   */
  async saveConfiguration(config) {
    return this.post(API_ENDPOINTS.PLAYERS.SAVE_CONFIG, config);
  }

  /**
   * Get saved report configurations
   * @returns {Promise<Array>} - List of saved configurations
   */
  async getSavedConfigurations() {
    return this.get(API_ENDPOINTS.PLAYERS.GET_CONFIGS);
  }
}

// Export a singleton instance
export default new PlayersService();