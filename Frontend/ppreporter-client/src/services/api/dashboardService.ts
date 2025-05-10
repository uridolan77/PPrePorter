import apiClient from './apiClient';
import { DashboardFilters, RevenueData, GameData, RegistrationData, TransactionData } from '../../types/redux';
import { DashboardStats } from '../../types/dashboard';

/**
 * Get dashboard overview stats
 * @returns {Promise<DashboardStats>} Promise object with dashboard stats
 */
const getDashboardStats = async (filters?: DashboardFilters): Promise<DashboardStats> => {
  try {
    const response = await apiClient.get('/dashboard/stats', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get recent player registrations data
 * @param {Object} params - Query parameters
 * @param {number} params.days - Number of days to include
 * @returns {Promise<RegistrationData[]>} Promise object with registration data
 */
const getPlayerRegistrations = async (params: { days?: number } & DashboardFilters = { days: 30 }): Promise<RegistrationData[]> => {
  try {
    const response = await apiClient.get('/dashboard/player-registrations', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get recent transactions
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of transactions to return
 * @returns {Promise<TransactionData[]>} Promise object with transaction data
 */
const getRecentTransactions = async (params: { limit?: number } & DashboardFilters = { limit: 10 }): Promise<TransactionData[]> => {
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
 * @returns {Promise<GameData[]>} Promise object with top games data
 */
const getTopGames = async (params: { metric?: string, limit?: number } & DashboardFilters = { metric: 'revenue', limit: 5 }): Promise<GameData[]> => {
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
 * @returns {Promise<{ dailyRevenue: RevenueData[] }>} Promise object with casino revenue data
 */
const getCasinoRevenue = async (params: { period?: string } & DashboardFilters = { period: 'month' }): Promise<{ dailyRevenue: RevenueData[] }> => {
  try {
    const response = await apiClient.get('/dashboard/casino-revenue', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get player journey data for Sankey diagram
 * @returns {Promise<any>} Promise object with player journey data
 */
const getPlayerJourney = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/dashboard/player-journey');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get KPI data for dashboard
 * @param {DashboardFilters} filters - Dashboard filters
 * @returns {Promise<any>} Promise object with KPI data
 */
const getKpiData = async (filters?: DashboardFilters): Promise<any> => {
  try {
    const response = await apiClient.get('/dashboard/kpi', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user dashboard preferences
 * @returns {Promise<any>} Promise object with user preferences
 */
const getDashboardPreferences = async (): Promise<any> => {
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
 * @returns {Promise<any>} Promise object with saved preferences
 */
const saveDashboardPreferences = async (preferences: any): Promise<any> => {
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
 * @returns {Promise<any>} Promise object with query results
 */
const naturalLanguageQuery = async (query: { text: string }): Promise<any> => {
  try {
    const response = await apiClient.post('/dashboard/query', query);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get trend data for a specific metric
 * @param {string} metricId - Metric identifier
 * @param {DashboardFilters} filters - Dashboard filters
 * @returns {Promise<any>} Promise object with trend data
 */
const getMetricTrend = async (metricId: string, filters?: DashboardFilters): Promise<any> => {
  try {
    const response = await apiClient.get(`/dashboard/metrics/${metricId}/trend`, { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get anomalies for a specific metric
 * @param {string} metricId - Metric identifier
 * @param {DashboardFilters} filters - Dashboard filters
 * @returns {Promise<any>} Promise object with anomaly data
 */
const getMetricAnomalies = async (metricId: string, filters?: DashboardFilters): Promise<any> => {
  try {
    const response = await apiClient.get(`/dashboard/metrics/${metricId}/anomalies`, { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get forecast for a specific metric
 * @param {string} metricId - Metric identifier
 * @param {DashboardFilters} filters - Dashboard filters
 * @returns {Promise<any>} Promise object with forecast data
 */
const getMetricForecast = async (metricId: string, filters?: DashboardFilters): Promise<any> => {
  try {
    const response = await apiClient.get(`/dashboard/metrics/${metricId}/forecast`, { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get comparison data for a specific metric
 * @param {string} metricId - Metric identifier
 * @param {string} compareWith - Comparison period or segment
 * @param {DashboardFilters} filters - Dashboard filters
 * @returns {Promise<any>} Promise object with comparison data
 */
const getMetricComparison = async (metricId: string, compareWith: string, filters?: DashboardFilters): Promise<any> => {
  try {
    const response = await apiClient.get(`/dashboard/metrics/${metricId}/compare/${compareWith}`, { params: filters });
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
