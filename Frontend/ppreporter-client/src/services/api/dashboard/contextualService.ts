import apiClient from '../apiClient';

/**
 * Contextual Explorer Service
 * Handles API calls related to contextual explorer data
 */

/**
 * Get contextual explorer data
 * @param {Object} params - Query parameters
 * @returns {Promise<any>} Promise object with contextual explorer data
 */
const getContextualExplorer = async (params: any): Promise<any> => {
  try {
    const response = await apiClient.post('/api/Dashboard/contextual-explorer', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getContextualExplorer
};
