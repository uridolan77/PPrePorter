import apiClient from '../apiClient';
import { DashboardFilters } from '../../../types/redux';

/**
 * Segment Comparison Service
 * Handles API calls related to segment comparison data
 */

// Define a custom interface that extends DashboardFilters but with string segments and metrics
interface SegmentComparisonFilters extends Omit<DashboardFilters, 'segments' | 'metrics'> {
  segments?: string;
  metrics?: string;
  timeFrame?: string;
}

/**
 * Get segment comparison data
 * @param {SegmentComparisonFilters} filters - Dashboard filters with string segments and metrics
 * @returns {Promise<any>} Promise object with segment comparison data
 */
const getSegmentComparison = async (filters?: SegmentComparisonFilters): Promise<any> => {
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
