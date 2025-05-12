import apiClient from '../apiClient';

/**
 * Accessibility Service
 * Handles API calls related to accessibility optimized dashboard data
 */

/**
 * Get accessibility optimized dashboard data
 * @returns {Promise<any>} Promise object with accessibility optimized data
 */
const getA11yOptimized = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/api/Dashboard/a11y-optimized');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getA11yOptimized
};
