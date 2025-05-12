import apiClient from '../apiClient';
import { DashboardPreferences } from '../../../types/dashboard';

/**
 * Preferences Service
 * Handles API calls related to user dashboard preferences
 */

/**
 * Get user dashboard preferences
 * @returns {Promise<DashboardPreferences>} Promise object with user preferences
 */
const getUserPreferences = async (): Promise<DashboardPreferences> => {
  try {
    const response = await apiClient.get('/api/Dashboard/user-preferences');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Save user dashboard preferences
 * @param {DashboardPreferences} preferences - User dashboard preferences
 * @returns {Promise<DashboardPreferences>} Promise object with saved preferences
 */
const saveUserPreferences = async (preferences: DashboardPreferences): Promise<DashboardPreferences> => {
  try {
    const response = await apiClient.put('/api/Dashboard/user-preferences', preferences);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getUserPreferences,
  saveUserPreferences
};
