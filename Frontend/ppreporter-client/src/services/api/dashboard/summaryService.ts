import apiClient from '../apiClient';
import { DashboardFilters } from '../../../types/redux';
import { DashboardStats } from '../../../types/dashboard';

/**
 * Dashboard Summary Service
 * Handles API calls related to dashboard summary statistics
 */

/**
 * Get dashboard overview stats
 * @param {DashboardFilters} filters - Dashboard filters
 * @returns {Promise<DashboardStats>} Promise object with dashboard stats
 */
const getDashboardSummary = async (filters?: DashboardFilters): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get('/api/Dashboard/summary', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getDashboardSummary
};
