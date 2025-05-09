// filepath: c:\dev\PPrePorter\Frontend\ppreporter-client\src\services\api\dailyActionsService.js
import ApiService from './apiService';
import { API_ENDPOINTS } from '../../config/constants';

/**
 * Service for Daily Actions Report API integration
 * Extends the base ApiService class
 */
class DailyActionsService extends ApiService {
  /**
   * Get daily actions report data based on filters
   * @param {Object} filters - Report filters
   * @returns {Promise<Object>} - Report data
   */
  async getData(filters) {
    return this.post(API_ENDPOINTS.DAILY_ACTIONS.GET_DATA, filters);
  }

  /**
   * Get daily actions report data with comprehensive filtering
   * @param {Object} filters - Comprehensive filter parameters
   * @returns {Promise<Object>} - Filtered report data
   */
  async getFilteredData(filters) {
    return this.post(API_ENDPOINTS.DAILY_ACTIONS.FILTER, filters);
  }

  /**
   * Get metadata for daily actions report (brands, countries, etc.)
   * @returns {Promise<Object>} - Metadata
   */
  async getMetadata() {
    return this.get(API_ENDPOINTS.DAILY_ACTIONS.GET_METADATA);
  }

  /**
   * Execute a natural language query against daily actions data
   * @param {string} query - Natural language query
   * @returns {Promise<Object>} - Report data
   */
  async executeNLQuery(query) {
    return this.post(API_ENDPOINTS.DAILY_ACTIONS.NL_QUERY, { query });
  }

  /**
   * Export daily actions report in specified format
   * @param {Object} filters - Report filters
   * @param {string} format - Export format (csv, xlsx, pdf)
   * @returns {Promise<Blob>} - Report file as blob
   */
  async exportReport(filters, format) {
    return this.post(
      API_ENDPOINTS.DAILY_ACTIONS.EXPORT,
      { filters, format },
      { responseType: 'blob' }
    );
  }

  /**
   * Export filtered daily actions report
   * @param {Object} filters - Comprehensive filter parameters
   * @param {string} format - Export format (csv, xlsx, pdf)
   * @returns {Promise<Blob>} - Report file as blob
   */
  async exportFilteredReport(filters, format = 'csv') {
    return this.post(
      `${API_ENDPOINTS.DAILY_ACTIONS.FILTER}/export`,
      { ...filters, format },
      { responseType: 'blob' }
    );
  }

  /**
   * Save report configuration
   * @param {Object} config - Configuration to save
   * @returns {Promise<Object>} - Saved configuration
   */
  async saveConfiguration(config) {
    return this.post(API_ENDPOINTS.DAILY_ACTIONS.SAVE_CONFIG, config);
  }

  /**
   * Get saved report configurations
   * @returns {Promise<Array>} - List of saved configurations
   */
  async getSavedConfigurations() {
    return this.get(API_ENDPOINTS.DAILY_ACTIONS.GET_CONFIGS);
  }

  /**
   * Perform drill-down on report data
   * @param {Object} filters - Base report filters
   * @param {Object} item - Item to drill down on
   * @returns {Promise<Object>} - Detailed data
   */
  async performDrillDown(filters, item) {
    return this.post(API_ENDPOINTS.DAILY_ACTIONS.DRILL_DOWN, {
      filters,
      drillDownItem: item
    });
  }
}

// Export a singleton instance
export default new DailyActionsService();