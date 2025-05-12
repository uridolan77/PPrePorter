import axios from 'axios';
import { format } from 'date-fns';

// Base API URL
const API_URL = 'https://localhost:7075/api';

// Date format for API requests
const API_DATE_FORMAT = 'yyyy-MM-dd';

/**
 * Format date for API requests
 * @param date Date to format
 * @returns Formatted date string
 */
const formatDateForApi = (date: Date | null): string => {
  if (!date) return '';
  return format(date, API_DATE_FORMAT);
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
    startDate: Date | null,
    endDate: Date | null,
    filters: Record<string, any> = {}
  ) => {
    try {
      const response = await axios.get(`${API_URL}/reports/daily-action-games/data`, {
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
    startDate: Date | null,
    endDate: Date | null,
    filters: Record<string, any> = {}
  ) => {
    try {
      const response = await axios.get(`${API_URL}/reports/players/data`, {
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
    startDate: Date | null,
    endDate: Date | null,
    filters: Record<string, any> = {}
  ) => {
    try {
      const response = await axios.get(`${API_URL}/reports/games/data`, {
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
    startDate: Date | null,
    endDate: Date | null
  ) => {
    try {
      const response = await axios.get(`${API_URL}/Dashboard/summary`, {
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
    startDate: Date | null,
    endDate: Date | null,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ) => {
    try {
      const response = await axios.get(`${API_URL}/Dashboard/revenue-chart`, {
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
    startDate: Date | null,
    endDate: Date | null,
    interval: 'daily' | 'weekly' | 'monthly' = 'daily'
  ) => {
    try {
      const response = await axios.get(`${API_URL}/Dashboard/registrations-chart`, {
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
    startDate: Date | null,
    endDate: Date | null,
    limit: number = 10
  ) => {
    try {
      const response = await axios.get(`${API_URL}/Dashboard/top-games`, {
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
    startDate: Date | null,
    endDate: Date | null,
    limit: number = 10
  ) => {
    try {
      const response = await axios.get(`${API_URL}/Dashboard/recent-transactions`, {
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
    startDate: Date | null,
    endDate: Date | null,
    metric: string = 'bets'
  ) => {
    try {
      const response = await axios.get(`${API_URL}/Dashboard/heatmap`, {
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
    startDate: Date | null,
    endDate: Date | null,
    segments: string[] = []
  ) => {
    try {
      const response = await axios.get(`${API_URL}/Dashboard/segment-comparison`, {
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
      const response = await axios.post(`${API_URL}/Dashboard/user-preferences`, preferences);
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
      const response = await axios.get(`${API_URL}/Dashboard/user-preferences`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  }
};

export default integratedReportsService;
