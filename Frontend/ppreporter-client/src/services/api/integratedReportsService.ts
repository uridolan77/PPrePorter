import { format } from 'date-fns';
import apiClient from './apiClient';

// Date format for API requests
const API_DATE_FORMAT = 'yyyy-MM-dd';

/**
 * Format date for API requests
 * @param date Date to format (can be Date object or ISO string)
 * @returns Formatted date string
 */
const formatDateForApi = (date: Date | string | null): string => {
  if (!date) return '';

  // If date is already a string (ISO format), convert it to Date first
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, API_DATE_FORMAT);
};

/**
 * Integrated Reports Service
 * Provides methods for fetching data for the integrated reports page
 */
const integratedReportsService = {
  /**
   * Fetch daily actions data
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @param filters Additional filters
   * @returns Promise with daily actions data
   */
  getDailyActionsData: async (
    startDate: Date | string | null,
    endDate: Date | string | null,
    filters: Record<string, any> = {}
  ) => {
    try {
      const response = await apiClient.get('/reports/daily-action-games/data', {
        params: {
          startDate: formatDateForApi(startDate),
          endDate: formatDateForApi(endDate),
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily actions data:', error);
      throw error;
    }
  },

  /**
   * Fetch player data
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @param filters Additional filters
   * @returns Promise with player data
   */
  getPlayerData: async (
    startDate: Date | string | null,
    endDate: Date | string | null,
    filters: Record<string, any> = {}
  ) => {
    try {
      const response = await apiClient.get('/reports/players/data', {
        params: {
          startDate: formatDateForApi(startDate),
          endDate: formatDateForApi(endDate),
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching player data:', error);
      throw error;
    }
  },

  /**
   * Fetch game data
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @param filters Additional filters
   * @returns Promise with game data
   */
  getGameData: async (
    startDate: Date | string | null,
    endDate: Date | string | null,
    filters: Record<string, any> = {}
  ) => {
    try {
      const response = await apiClient.get('/reports/games/data', {
        params: {
          startDate: formatDateForApi(startDate),
          endDate: formatDateForApi(endDate),
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching game data:', error);
      throw error;
    }
  },

  /**
   * Fetch dashboard summary data
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @returns Promise with dashboard summary data
   */
  getDashboardSummary: async (
    startDate: Date | string | null,
    endDate: Date | string | null
  ) => {
    try {
      const response = await apiClient.get('/Dashboard/summary', {
        params: {
          startDate: formatDateForApi(startDate),
          endDate: formatDateForApi(endDate)
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  /**
   * Fetch revenue chart data
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @param interval Time interval (daily, weekly, monthly)
   * @returns Promise with revenue chart data
   */
  getRevenueChartData: async (
    startDate: Date | string | null,
    endDate: Date | string | null,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ) => {
    try {
      const response = await apiClient.get('/Dashboard/revenue-chart', {
        params: {
          startDate: formatDateForApi(startDate),
          endDate: formatDateForApi(endDate),
          interval
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue chart data:', error);
      throw error;
    }
  },

  /**
   * Fetch registrations chart data
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @param interval Time interval (daily, weekly, monthly)
   * @returns Promise with registrations chart data
   */
  getRegistrationsChartData: async (
    startDate: Date | string | null,
    endDate: Date | string | null,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ) => {
    try {
      const response = await apiClient.get('/Dashboard/registrations-chart', {
        params: {
          startDate: formatDateForApi(startDate),
          endDate: formatDateForApi(endDate),
          interval
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching registrations chart data:', error);
      throw error;
    }
  },

  /**
   * Fetch top games data
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @param limit Number of games to return
   * @returns Promise with top games data
   */
  getTopGamesData: async (
    startDate: Date | string | null,
    endDate: Date | string | null,
    limit: number = 10
  ) => {
    try {
      const response = await apiClient.get('/Dashboard/top-games', {
        params: {
          startDate: formatDateForApi(startDate),
          endDate: formatDateForApi(endDate),
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top games data:', error);
      throw error;
    }
  },

  /**
   * Fetch recent transactions data
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @param limit Number of transactions to return
   * @returns Promise with recent transactions data
   */
  getRecentTransactionsData: async (
    startDate: Date | string | null,
    endDate: Date | string | null,
    limit: number = 10
  ) => {
    try {
      const response = await apiClient.get('/Dashboard/recent-transactions', {
        params: {
          startDate: formatDateForApi(startDate),
          endDate: formatDateForApi(endDate),
          limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions data:', error);
      throw error;
    }
  },

  /**
   * Fetch heatmap data
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @param metric Metric to display (bets, deposits, etc.)
   * @returns Promise with heatmap data
   */
  getHeatmapData: async (
    startDate: Date | string | null,
    endDate: Date | string | null,
    metric: string = 'bets'
  ) => {
    try {
      const response = await apiClient.get('/Dashboard/heatmap', {
        params: {
          startDate: formatDateForApi(startDate),
          endDate: formatDateForApi(endDate),
          metric
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      throw error;
    }
  },

  /**
   * Fetch segment comparison data
   * @param startDate Start date for filtering
   * @param endDate End date for filtering
   * @param segments Segments to compare
   * @returns Promise with segment comparison data
   */
  getSegmentComparisonData: async (
    startDate: Date | string | null,
    endDate: Date | string | null,
    segments: string[] = []
  ) => {
    try {
      const response = await apiClient.get('/Dashboard/segment-comparison', {
        params: {
          startDate: formatDateForApi(startDate),
          endDate: formatDateForApi(endDate),
          segments: segments.join(',')
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching segment comparison data:', error);
      throw error;
    }
  },

  /**
   * Save user dashboard preferences
   * @param preferences User dashboard preferences
   * @returns Promise with saved preferences
   */
  saveUserPreferences: async (preferences: any) => {
    try {
      const response = await apiClient.post('/Dashboard/user-preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  },

  /**
   * Get user dashboard preferences
   * @returns Promise with user preferences
   */
  getUserPreferences: async () => {
    try {
      const response = await apiClient.get('/Dashboard/user-preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }
};

export default integratedReportsService;
