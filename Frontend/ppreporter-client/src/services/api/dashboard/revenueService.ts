import apiClient from '../apiClient';
import { DashboardFilters, RevenueData } from '../../../types/redux';

/**
 * Revenue Chart Service
 * Handles API calls related to revenue chart data
 */

/**
 * Get revenue chart data
 * @param {Object} params - Query parameters
 * @param {string} params.period - Time period (day, week, month, year)
 * @returns {Promise<RevenueData[]>} Promise object with revenue chart data
 */
const getRevenueChart = async (params: { period?: string } & DashboardFilters = { period: 'month' }): Promise<RevenueData[]> => {
  try {
    const response = await apiClient.get('/api/Dashboard/revenue-chart', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getRevenueChart
};
