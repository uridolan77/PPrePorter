// filepath: c:\dev\PPrePorter\Frontend\ppreporter-client\src\services\api\dailyActionsService.ts
import ApiService from './apiService';
import { API_ENDPOINTS, REPORT_TYPES } from '../../config/constants';
import { ReportFilters } from './types';

// Additional types

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

// GroupBy mapping - maps frontend string values to backend enum values
const GROUP_BY_MAPPING: { [key: string]: number } = {
  'Day': 0,
  'Month': 1,
  'Year': 2,
  'Label': 3,
  'Country': 4,
  'Tracker': 5,
  'Currency': 6,
  'Gender': 7,
  'Platform': 8,
  'Ranking': 9,
  'Player': 10
};

// Define API endpoints for daily actions - handle both structures
// Check if we have the new structure (TypeScript) or old structure (JavaScript)
let DAILY_ACTIONS_ENDPOINTS: any;

// Log API_ENDPOINTS to debug
console.log('[DAILY_ACTIONS_SERVICE] API_ENDPOINTS:', API_ENDPOINTS);
console.log('[DAILY_ACTIONS_SERVICE] API_ENDPOINTS.REPORTS:', API_ENDPOINTS.REPORTS);
console.log('[DAILY_ACTIONS_SERVICE] API_ENDPOINTS.REPORTS.DAILY_ACTIONS:', API_ENDPOINTS.REPORTS?.DAILY_ACTIONS);

// Check which structure we have
// Use type assertion to avoid TypeScript errors
if ((API_ENDPOINTS as any).DAILY_ACTIONS) {
  // Using the JavaScript structure
  DAILY_ACTIONS_ENDPOINTS = (API_ENDPOINTS as any).DAILY_ACTIONS;
  console.log('[DAILY_ACTIONS_SERVICE] Using JavaScript structure:', DAILY_ACTIONS_ENDPOINTS);
} else if (API_ENDPOINTS.REPORTS && API_ENDPOINTS.REPORTS.DAILY_ACTIONS) {
  // Using the TypeScript structure
  DAILY_ACTIONS_ENDPOINTS = {
    GET_DATA: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/data`,
    FILTERED_DATA: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/filtered-data`,
    FILTERED_GROUPED: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/filtered-grouped`,
    FILTER: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/filtered-data`, // Alias for backward compatibility
    GET_METADATA: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/metadata`,
    NL_QUERY: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/nl-query`,
    EXPORT: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/export`,
    SAVE_CONFIG: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/config/save`,
    GET_CONFIGS: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/config/list`,
    DRILL_DOWN: `${API_ENDPOINTS.REPORTS.DAILY_ACTIONS}/drill-down`
  };
  console.log('[DAILY_ACTIONS_SERVICE] Using TypeScript structure:', DAILY_ACTIONS_ENDPOINTS);
} else {
  // Fallback to hardcoded endpoints if neither structure is available
  DAILY_ACTIONS_ENDPOINTS = {
    GET_DATA: '/api/reports/daily-actions/data',
    FILTERED_DATA: '/api/reports/daily-actions/filtered-data',
    FILTERED_GROUPED: '/api/reports/daily-actions/filtered-grouped',
    FILTER: '/api/reports/daily-actions/filtered-data', // Alias for backward compatibility
    GET_METADATA: '/api/reports/daily-actions/metadata',
    GET_SUMMARY: '/api/reports/daily-actions/summary',
    NL_QUERY: '/api/reports/daily-actions/nl-query',
    EXPORT: '/api/reports/daily-actions/export',
    SAVE_CONFIG: '/api/reports/daily-actions/config/save',
    GET_CONFIGS: '/api/reports/daily-actions/config/list',
    DRILL_DOWN: '/api/reports/daily-actions/drill-down'
  };
  console.log('[DAILY_ACTIONS_SERVICE] Using fallback structure:', DAILY_ACTIONS_ENDPOINTS);
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
    try {
      // Always use the filtered-data endpoint with POST for consistent behavior
      console.log('[DAILY_ACTIONS_SERVICE] Using filtered-data endpoint with POST');

      // Create a new filters object with the converted groupBy value
      const backendFilters = {
        ...filters,
        groupBy: typeof filters.groupBy === 'string' ? GROUP_BY_MAPPING[filters.groupBy] || 0 : filters.groupBy
      };

      console.log('[DAILY_ACTIONS_SERVICE] Converted filters for backend:', backendFilters);

      // Always use the filtered-data endpoint, not filter
      // Don't include /api prefix as it's already added by the ApiService
      const endpoint = '/reports/daily-actions/filtered-data';
      console.log('[DAILY_ACTIONS_SERVICE] Using hardcoded endpoint:', endpoint);

      const result = await this.post(endpoint, backendFilters);
      console.log('[DAILY_ACTIONS_SERVICE] filtered-data result:', result);
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
    // Create a new filters object with the converted groupBy value
    const backendFilters = {
      ...filters,
      groupBy: typeof filters.groupBy === 'string' ? GROUP_BY_MAPPING[filters.groupBy] || 0 : filters.groupBy
    };

    console.log('[DAILY_ACTIONS_SERVICE] getFilteredData with converted filters:', backendFilters);

    // Always use the filtered-data endpoint, not filter
    // Don't include /api prefix as it's already added by the ApiService
    const endpoint = '/reports/daily-actions/filtered-data';
    console.log('[DAILY_ACTIONS_SERVICE] getFilteredData using hardcoded endpoint:', endpoint);

    return this.post(endpoint, backendFilters);
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
    // Create a new filters object with the converted groupBy value
    const backendFilters = {
      ...filters,
      groupBy: typeof filters.groupBy === 'string' ? GROUP_BY_MAPPING[filters.groupBy] || 0 : filters.groupBy
    };

    console.log('[DAILY_ACTIONS_SERVICE] exportReport with converted filters:', backendFilters);

    return this.post(
      DAILY_ACTIONS_ENDPOINTS.EXPORT,
      { filters: backendFilters, format },
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
    // Create a new filters object with the converted groupBy value
    const backendFilters = {
      ...filters,
      groupBy: typeof filters.groupBy === 'string' ? GROUP_BY_MAPPING[filters.groupBy] || 0 : filters.groupBy,
      format
    };

    console.log('[DAILY_ACTIONS_SERVICE] exportFilteredReport with converted filters:', backendFilters);

    // Use the export endpoint with the filtered-grouped data
    // First get the grouped data
    try {
      // Use the filtered-grouped endpoint to get the data first
      console.log('[DAILY_ACTIONS_SERVICE] Getting grouped data for export');
      const groupedData = await this.getGroupedData(filters);

      // Then use the export endpoint to export it
      console.log('[DAILY_ACTIONS_SERVICE] Exporting grouped data');
      return this.post(
        DAILY_ACTIONS_ENDPOINTS.EXPORT,
        {
          ...backendFilters,
          // Include the grouped data in the export request
          data: groupedData.data
        },
        { responseType: 'blob' }
      );
    } catch (error) {
      console.error('[DAILY_ACTIONS_SERVICE] Error in exportFilteredReport:', error);

      // Fallback to the regular export endpoint
      console.log('[DAILY_ACTIONS_SERVICE] Falling back to regular export endpoint');
      return this.post(
        DAILY_ACTIONS_ENDPOINTS.EXPORT,
        backendFilters,
        { responseType: 'blob' }
      );
    }
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

  /**
   * Get grouped daily actions report data
   * This endpoint groups data by the selected field and sums all numeric metrics
   * @param {ReportFilters} filters - Report filters with groupBy option
   * @returns {Promise<any>} - Grouped report data
   */
  async getGroupedData(filters: ReportFilters): Promise<any> {
    console.log('[DAILY_ACTIONS_SERVICE] getGroupedData called with filters:', filters);
    try {
      // Create a new filters object with the converted groupBy value
      const backendFilters = {
        ...filters,
        groupBy: typeof filters.groupBy === 'string' ? GROUP_BY_MAPPING[filters.groupBy] || 0 : filters.groupBy
      };

      console.log('[DAILY_ACTIONS_SERVICE] getGroupedData with converted filters:', backendFilters);

      // Use the filtered-grouped endpoint
      const endpoint = '/reports/daily-actions/filtered-grouped';
      console.log('[DAILY_ACTIONS_SERVICE] Using filtered-grouped endpoint:', endpoint);

      // Use POST method for the filtered-grouped endpoint
      console.log('[DAILY_ACTIONS_SERVICE] Using POST method for filtered-grouped endpoint');
      const result = await this.post(endpoint, backendFilters);
      console.log('[DAILY_ACTIONS_SERVICE] filtered-grouped result:', result);
      return result;
    } catch (error) {
      console.error('[DAILY_ACTIONS_SERVICE] getGroupedData error:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export default new DailyActionsService();
