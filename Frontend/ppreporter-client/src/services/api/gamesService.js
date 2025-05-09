import apiClient from './apiClient';

/**
 * Get all games with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (1-based)
 * @param {number} params.limit - Number of items per page
 * @param {string} params.sortBy - Field to sort by
 * @param {string} params.sortOrder - Sort order (asc or desc)
 * @param {string} params.search - Search term
 * @param {string} params.category - Filter by category
 * @returns {Promise} Promise object with games data
 */
const getGames = async (params = {}) => {
  try {
    const response = await apiClient.get('/games', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game by ID
 * @param {string} id - Game ID
 * @returns {Promise} Promise object with game data
 */
const getGameById = async (id) => {
  try {
    const response = await apiClient.get(`/games/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game performance metrics
 * @param {string} id - Game ID
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (ISO format)
 * @param {string} params.endDate - End date (ISO format)
 * @returns {Promise} Promise object with game performance data
 */
const getGamePerformance = async (id, params = {}) => {
  try {
    const response = await apiClient.get(`/games/${id}/performance`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get top games by metric
 * @param {Object} params - Query parameters
 * @param {string} params.metric - Metric to sort by (revenue, players, sessions)
 * @param {number} params.limit - Number of games to return
 * @param {string} params.startDate - Start date (ISO format)
 * @param {string} params.endDate - End date (ISO format)
 * @returns {Promise} Promise object with top games data
 */
const getTopGames = async (params = {}) => {
  try {
    const response = await apiClient.get('/games/top', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game categories
 * @returns {Promise} Promise object with game categories
 */
const getGameCategories = async () => {
  try {
    const response = await apiClient.get('/games/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game providers
 * @returns {Promise} Promise object with game providers
 */
const getGameProviders = async () => {
  try {
    const response = await apiClient.get('/games/providers');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game player demographics
 * @param {string} id - Game ID
 * @returns {Promise} Promise object with player demographics for the game
 */
const getGamePlayerDemographics = async (id) => {
  try {
    const response = await apiClient.get(`/games/${id}/player-demographics`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game session data
 * @param {string} id - Game ID
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (ISO format)
 * @param {string} params.endDate - End date (ISO format)
 * @returns {Promise} Promise object with game session data
 */
const getGameSessions = async (id, params = {}) => {
  try {
    const response = await apiClient.get(`/games/${id}/sessions`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getGames,
  getGameById,
  getGamePerformance,
  getTopGames,
  getGameCategories,
  getGameProviders,
  getGamePlayerDemographics,
  getGameSessions
};
