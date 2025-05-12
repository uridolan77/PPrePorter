import apiClient from '../apiClient';
import { DashboardFilters } from '../../../types/redux';

/**
 * Player Journey Service
 * Handles API calls related to player journey data
 */

/**
 * Get player journey data for Sankey diagram
 * @param {DashboardFilters} filters - Dashboard filters
 * @returns {Promise<any>} Promise object with player journey data
 */
const getPlayerJourney = async (filters?: DashboardFilters): Promise<any> => {
  try {
    const response = await apiClient.get('/api/Dashboard/player-journey', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getPlayerJourney
};
