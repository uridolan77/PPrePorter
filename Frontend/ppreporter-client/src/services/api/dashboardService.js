import apiClient from './apiClient';

/**
 * Get dashboard overview stats
 * @returns {Promise} Promise object with dashboard stats
 */
const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get recent player registrations data
 * @param {Object} params - Query parameters
 * @param {number} params.days - Number of days to include
 * @returns {Promise} Promise object with registration data
 */
const getPlayerRegistrations = async (params = { days: 30 }) => {
  try {
    const response = await apiClient.get('/dashboard/player-registrations', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get recent transactions data
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of transactions to return
 * @returns {Promise} Promise object with transactions data
 */
const getRecentTransactions = async (params = { limit: 10 }) => {
  try {
    const response = await apiClient.get('/dashboard/recent-transactions', { params });
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
 * @returns {Promise} Promise object with top games data
 */
const getTopGames = async (params = { metric: 'revenue', limit: 5 }) => {
  try {
    const response = await apiClient.get('/dashboard/top-games', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get revenue by casino
 * @param {Object} params - Query parameters
 * @param {string} params.period - Time period (day, week, month, year)
 * @returns {Promise} Promise object with casino revenue data
 */
const getCasinoRevenue = async (params = { period: 'month' }) => {
  try {
    const response = await apiClient.get('/dashboard/casino-revenue', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get player journey data for Sankey diagram
 * @returns {Promise} Promise object with player journey data
 */
const getPlayerJourney = async () => {
  try {
    const response = await apiClient.get('/dashboard/player-journey');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get KPI data with targets and trends
 * @returns {Promise} Promise object with KPI data
 */
const getKpiData = async () => {
  try {
    const response = await apiClient.get('/dashboard/kpis');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user dashboard preferences
 * @returns {Promise} Promise object with user dashboard preferences
 */
const getDashboardPreferences = async () => {
  try {
    const response = await apiClient.get('/dashboard/preferences');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Save user dashboard preferences
 * @param {Object} preferences - User dashboard preferences
 * @returns {Promise} Promise object with saved preferences
 */
const saveDashboardPreferences = async (preferences) => {
  try {
    const response = await apiClient.post('/dashboard/preferences', preferences);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Run a natural language query for dashboard data
 * @param {Object} query - Query parameters
 * @param {string} query.text - Natural language query text
 * @returns {Promise} Promise object with query results
 */
const naturalLanguageQuery = async (query) => {
  try {
    const response = await apiClient.post('/dashboard/query', query);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get metric trend data
 * @param {Object} params - Query parameters
 * @param {string} params.metricId - ID of the metric
 * @param {string} params.timeRange - Time range to fetch data for
 * @returns {Promise} Promise object with trend data
 */
const getMetricTrend = async (params) => {
  try {
    const response = await apiClient.get('/dashboard/metrics/trend', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get anomalies for a specific metric
 * @param {Object} params - Query parameters
 * @param {string} params.metricId - ID of the metric
 * @param {string} params.timeRange - Time range to fetch anomalies for
 * @param {number} params.sensitivity - Sensitivity threshold for anomalies
 * @returns {Promise} Promise object with anomaly data
 */
const getMetricAnomalies = async (params) => {
  try {
    const response = await apiClient.get('/dashboard/metrics/anomalies', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get forecast for a specific metric
 * @param {Object} params - Query parameters
 * @param {string} params.metricId - ID of the metric
 * @param {string} params.timeRange - Historical time range to base forecast on
 * @param {number} params.forecastPeriods - Number of periods to forecast
 * @returns {Promise} Promise object with forecast data
 */
const getMetricForecast = async (params) => {
  try {
    const response = await apiClient.get('/dashboard/metrics/forecast', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get comparison data for a metric
 * @param {Object} params - Query parameters
 * @param {string} params.metricId - ID of the metric
 * @param {string} params.compareWith - What to compare with (industry, competitors, etc.)
 * @returns {Promise} Promise object with comparison data
 */
const getMetricComparison = async (params) => {
  try {
    const response = await apiClient.get('/dashboard/metrics/comparison', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getDashboardStats,
  getPlayerRegistrations,
  getRecentTransactions,
  getTopGames,
  getCasinoRevenue,
  getPlayerJourney,
  getKpiData,
  getDashboardPreferences,
  saveDashboardPreferences,
  naturalLanguageQuery,
  getMetricTrend,
  getMetricAnomalies,
  getMetricForecast,
  getMetricComparison
};
