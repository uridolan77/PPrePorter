import apiClient from '../apiClient';
import { DashboardFilters, RegistrationData } from '../../../types/redux';

/**
 * Registrations Chart Service
 * Handles API calls related to player registrations chart data
 */

/**
 * Get player registrations chart data
 * @param {Object} params - Query parameters
 * @param {number} params.days - Number of days to include
 * @returns {Promise<RegistrationData[]>} Promise object with registration data
 */
const getRegistrationsChart = async (params: { days?: number } & DashboardFilters = { days: 30 }): Promise<RegistrationData[]> => {
  try {
    const response = await apiClient.get('/api/Dashboard/registrations-chart', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getRegistrationsChart
};
