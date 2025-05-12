import apiClient from '../apiClient';
import { DashboardFilters, GameData } from '../../../types/redux';

/**
 * Top Games Service
 * Handles API calls related to top games data
 */

/**
 * Get top games data
 * @param {Object} params - Query parameters
 * @param {string} params.metric - Metric to sort by (revenue, players, sessions)
 * @param {number} params.limit - Number of games to return
 * @returns {Promise<GameData[]>} Promise object with top games data
 */
const getTopGames = async (params: { metric?: string, limit?: number } & DashboardFilters = { metric: 'revenue', limit: 5 }): Promise<GameData[]> => {
  try {
    const response = await apiClient.get('/api/Dashboard/top-games', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getTopGames
};
