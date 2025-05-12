import axios from 'axios';
import { DashboardStats } from '../types/dashboard';
import { TransactionData } from '../types/redux';
import { FilterOptions } from '../features/analytics/types';

/**
 * Base URL for API requests
 */
const API_URL = 'https://localhost:7075/api';

/**
 * Dashboard service for fetching dashboard data
 */
const dashboardService = {
  /**
   * Get dashboard summary statistics
   * 
   * @param filters - Filter options for the data
   * @returns Dashboard summary statistics
   */
  getDashboardSummary: async (filters?: Partial<FilterOptions>): Promise<DashboardStats> => {
    try {
      const response = await axios.get(`${API_URL}/Dashboard/summary`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  /**
   * Get recent transactions
   * 
   * @param filters - Filter options for the data
   * @returns Recent transactions data
   */
  getRecentTransactions: async (filters?: Partial<FilterOptions & { limit: number }>): Promise<TransactionData[]> => {
    try {
      const response = await axios.get(`${API_URL}/Dashboard/recent-transactions`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  },

  /**
   * Get revenue chart data
   * 
   * @param filters - Filter options for the data
   * @returns Revenue chart data
   */
  getRevenueChart: async (filters?: Partial<FilterOptions>): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}/Dashboard/revenue-chart`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue chart data:', error);
      throw error;
    }
  },

  /**
   * Get top games data
   * 
   * @param filters - Filter options for the data
   * @returns Top games data
   */
  getTopGames: async (filters?: Partial<FilterOptions & { limit: number }>): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}/Dashboard/top-games`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top games data:', error);
      throw error;
    }
  },

  /**
   * Get player registrations data
   * 
   * @param filters - Filter options for the data
   * @returns Player registrations data
   */
  getPlayerRegistrations: async (filters?: Partial<FilterOptions>): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}/Dashboard/registrations-chart`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching player registrations data:', error);
      throw error;
    }
  }
};

export default dashboardService;
