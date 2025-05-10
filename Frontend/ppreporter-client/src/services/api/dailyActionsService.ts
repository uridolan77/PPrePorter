// filepath: c:\dev\PPrePorter\Frontend\ppreporter-client\src\services\api\dailyActionsService.ts
import ApiService from './apiService';
import { API_ENDPOINTS, REPORT_TYPES } from '../../config/constants';

// Types
interface ReportFilters {
  startDate?: string;
  endDate?: string;
  brands?: string[];
  countries?: string[];
  platforms?: string[];
  [key: string]: any;
}

interface ExportOptions {
  filters: ReportFilters;
  format: 'csv' | 'xlsx' | 'pdf';
}

interface ReportConfig {
  id?: string;
  name: string;
  description?: string;
  filters: ReportFilters;
  createdBy?: string;
  createdAt?: string;
  isPublic?: boolean;
}

interface DrillDownRequest {
  filters: ReportFilters;
  drillDownItem: any;
}

// Define API endpoints for daily actions - handle both structures
// Check if we have the new structure (TypeScript) or old structure (JavaScript)
let DAILY_ACTIONS_ENDPOINTS: any;

// Check which structure we have
// Use type assertion to avoid TypeScript errors
if ((API_ENDPOINTS as any).DAILY_ACTIONS) {
  // Using the JavaScript structure
  DAILY_ACTIONS_ENDPOINTS = (API_ENDPOINTS as any).DAILY_ACTIONS;
} else if (API_ENDPOINTS.REPORTS && API_ENDPOINTS.REPORTS.DAILY_ACTIONS) {
  // Using the TypeScript structure
  DAILY_ACTIONS_ENDPOINTS = {
    GET_DATA: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/data`,
    FILTER: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/filter`,
    GET_METADATA: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/metadata`,
    NL_QUERY: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/nl-query`,
    EXPORT: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/export`,
    SAVE_CONFIG: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/config/save`,
    GET_CONFIGS: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/config/list`,
    DRILL_DOWN: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/drill-down`
  };
} else {
  // Fallback to hardcoded endpoints if neither structure is available
  DAILY_ACTIONS_ENDPOINTS = {
    GET_DATA: '/reports/daily-actions/data',
    FILTER: '/reports/daily-actions/filter',
    GET_METADATA: '/reports/daily-actions/metadata',
    GET_SUMMARY: '/reports/daily-actions/summary',
    NL_QUERY: '/reports/daily-actions/query',
    EXPORT: '/reports/daily-actions/export',
    SAVE_CONFIG: '/reports/configurations/save',
    GET_CONFIGS: '/reports/configurations',
    DRILL_DOWN: '/reports/daily-actions/drill-down'
  };
}

/**
 * Service for Daily Actions Report API integration
 * Extends the base ApiService class
 */
class DailyActionsService extends ApiService {
  /**
   * Get daily actions report data based on filters
   * @param {ReportFilters} filters - Report filters
   * @returns {Promise<any>} - Report data
   */
  async getData(filters: ReportFilters): Promise<any> {
    console.log('[DAILY_ACTIONS_SERVICE] getData called with filters:', filters);
    console.log('[DAILY_ACTIONS_SERVICE] Using endpoint:', DAILY_ACTIONS_ENDPOINTS.GET_DATA);
    try {
      // The backend expects query parameters, not a POST body
      const result = await this.get(DAILY_ACTIONS_ENDPOINTS.GET_DATA, filters);
      console.log('[DAILY_ACTIONS_SERVICE] getData result:', result);
      return result;
    } catch (error) {
      console.error('[DAILY_ACTIONS_SERVICE] getData error:', error);
      throw error;
    }
  }

  /**
   * Get daily actions report data with comprehensive filtering
   * @param {ReportFilters} filters - Comprehensive filter parameters
   * @returns {Promise<any>} - Filtered report data
   */
  async getFilteredData(filters: ReportFilters): Promise<any> {
    return this.post(DAILY_ACTIONS_ENDPOINTS.FILTER, filters);
  }

  /**
   * Get metadata for daily actions report (brands, countries, etc.)
   * @returns {Promise<any>} - Metadata
   */
  async getMetadata(): Promise<any> {
    console.log('[DAILY_ACTIONS_SERVICE] getMetadata called');
    console.log('[DAILY_ACTIONS_SERVICE] Using endpoint:', DAILY_ACTIONS_ENDPOINTS.GET_METADATA);
    try {
      const result = await this.get(DAILY_ACTIONS_ENDPOINTS.GET_METADATA);
      console.log('[DAILY_ACTIONS_SERVICE] getMetadata result:', result);
      return result;
    } catch (error) {
      console.error('[DAILY_ACTIONS_SERVICE] getMetadata error:', error);
      throw error;
    }
  }

  /**
   * Get summary data for daily actions report
   * @param {ReportFilters} filters - Report filters
   * @returns {Promise<any>} - Summary data
   */
  async getSummaryData(filters: ReportFilters): Promise<any> {
    console.log('[DAILY_ACTIONS_SERVICE] getSummaryData called with filters:', filters);
    console.log('[DAILY_ACTIONS_SERVICE] Using endpoint:', DAILY_ACTIONS_ENDPOINTS.GET_DATA);
    try {
      // Use getData instead since the backend doesn't have a separate summary endpoint
      const result = await this.get(DAILY_ACTIONS_ENDPOINTS.GET_DATA, filters);
      console.log('[DAILY_ACTIONS_SERVICE] getSummaryData result:', result);
      return result;
    } catch (error) {
      console.error('[DAILY_ACTIONS_SERVICE] getSummaryData error:', error);
      throw error;
    }
  }

  /**
   * Execute a natural language query against daily actions data
   * @param {string} query - Natural language query
   * @returns {Promise<any>} - Report data
   */
  async executeNLQuery(query: string): Promise<any> {
    return this.post(DAILY_ACTIONS_ENDPOINTS.NL_QUERY, { query });
  }

  /**
   * Export daily actions report in specified format
   * @param {ReportFilters} filters - Report filters
   * @param {string} format - Export format (csv, xlsx, pdf)
   * @returns {Promise<Blob>} - Report file as blob
   */
  async exportReport(filters: ReportFilters, format: 'csv' | 'xlsx' | 'pdf'): Promise<Blob> {
    return this.post(
      DAILY_ACTIONS_ENDPOINTS.EXPORT,
      { filters, format },
      { responseType: 'blob' }
    );
  }

  /**
   * Export filtered daily actions report
   * @param {ReportFilters} filters - Comprehensive filter parameters
   * @param {string} format - Export format (csv, xlsx, pdf)
   * @returns {Promise<Blob>} - Report file as blob
   */
  async exportFilteredReport(filters: ReportFilters, format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Promise<Blob> {
    return this.post(
      `${DAILY_ACTIONS_ENDPOINTS.FILTER}/export`,
      { ...filters, format },
      { responseType: 'blob' }
    );
  }

  /**
   * Save report configuration
   * @param {ReportConfig} config - Configuration to save
   * @returns {Promise<ReportConfig>} - Saved configuration
   */
  async saveConfiguration(config: ReportConfig): Promise<ReportConfig> {
    return this.post(DAILY_ACTIONS_ENDPOINTS.SAVE_CONFIG, config);
  }

  /**
   * Get saved report configurations
   * @returns {Promise<ReportConfig[]>} - List of saved configurations
   */
  async getSavedConfigurations(): Promise<ReportConfig[]> {
    return this.get(DAILY_ACTIONS_ENDPOINTS.GET_CONFIGS);
  }

  /**
   * Perform drill-down on report data
   * @param {ReportFilters} filters - Base report filters
   * @param {any} item - Item to drill down on
   * @returns {Promise<any>} - Detailed data
   */
  async performDrillDown(filters: ReportFilters, item: any): Promise<any> {
    return this.post(DAILY_ACTIONS_ENDPOINTS.DRILL_DOWN, {
      filters,
      drillDownItem: item
    } as DrillDownRequest);
  }
}

// Export a singleton instance
export default new DailyActionsService();
