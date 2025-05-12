import apiClient from '../apiClient';
import { DashboardFilters } from '../../../types/redux';

/**
 * Heatmap Service
 * Handles API calls related to heatmap data
 */

/**
 * Get heatmap data
 * @param {DashboardFilters} filters - Dashboard filters
 * @returns {Promise<any>} Promise object with heatmap data
 */
const getHeatmap = async (filters?: DashboardFilters): Promise<any> => {
  try {
    const response = await apiClient.get('/api/Dashboard/heatmap', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getHeatmap
};
