import apiClient from '../apiClient';
import { DashboardFilters } from '../../../types/redux';

/**
 * Micro Charts Service
 * Handles API calls related to micro charts data
 */

/**
 * Get micro charts data
 * @param {DashboardFilters} filters - Dashboard filters
 * @returns {Promise<any>} Promise object with micro charts data
 */
const getMicroCharts = async (filters?: DashboardFilters): Promise<any> => {
  try {
    const response = await apiClient.get('/api/Dashboard/micro-charts', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getMicroCharts
};
