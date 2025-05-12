import apiClient from '../apiClient';
import { DashboardFilters, TransactionData } from '../../../types/redux';

/**
 * Transactions Service
 * Handles API calls related to recent transactions data
 */

/**
 * Get recent transactions
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of transactions to return
 * @returns {Promise<TransactionData[]>} Promise object with transaction data
 */
const getRecentTransactions = async (params: { limit?: number } & DashboardFilters = { limit: 10 }): Promise<TransactionData[]> => {
  try {
    const response = await apiClient.get('/api/Dashboard/recent-transactions', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getRecentTransactions
};
