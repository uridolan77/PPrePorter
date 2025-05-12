import apiClient from '../apiClient';
import { DashboardFilters } from '../../../types/redux';

/**
 * Segment Comparison Service
 * Handles API calls related to segment comparison data
 */

/**
 * Get segment comparison data
 * @param {DashboardFilters} filters - Dashboard filters
 * @returns {Promise<any>} Promise object with segment comparison data
 */
const getSegmentComparison = async (filters?: DashboardFilters): Promise<any> => {
  try {
    const response = await apiClient.get('/api/Dashboard/segment-comparison', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getSegmentComparison
};
