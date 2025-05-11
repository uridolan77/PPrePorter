/**
 * API Test Utility
 * 
 * This utility provides functions to test API connectivity and verify that
 * the application is using real API calls instead of mock data.
 */

import apiClient from '../services/api/apiClient';

/**
 * Test API connectivity by making a simple request to the API server
 * @returns {Promise<boolean>} True if the API is reachable, false otherwise
 */
export const testApiConnectivity = async () => {
  try {
    // Extract the base URL without the /api part for health check
    const baseUrl = process.env.REACT_APP_API_URL || 'https://localhost:7075/api';
    const healthUrl = baseUrl.replace('/api', '/health');
    
    console.log('Testing API connectivity at:', healthUrl);
    
    // Try to ping the API server
    const response = await fetch(healthUrl, {
      method: 'HEAD',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
    
    console.log('API connectivity test successful, status:', response.status);
    return true;
  } catch (error) {
    console.error('API connectivity test failed:', error);
    return false;
  }
};

/**
 * Check if mock data is enabled
 * @returns {boolean} True if mock data is enabled, false otherwise
 */
export const isMockDataEnabled = () => {
  return localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';
};

/**
 * Disable mock data mode
 */
export const disableMockData = () => {
  localStorage.setItem('USE_MOCK_DATA_FOR_UI_TESTING', 'false');
  console.log('Mock data mode disabled, using real API calls');
  // Reload the page to apply the change
  window.location.reload();
};

/**
 * Make a test API call to verify real API connectivity
 * @returns {Promise<Object>} The API response or error
 */
export const makeTestApiCall = async () => {
  try {
    // Make a simple API call to a known endpoint
    const response = await apiClient.get('/health');
    console.log('Test API call successful:', response.data);
    return {
      success: true,
      data: response.data,
      message: 'API call successful'
    };
  } catch (error) {
    console.error('Test API call failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'API call failed'
    };
  }
};

export default {
  testApiConnectivity,
  isMockDataEnabled,
  disableMockData,
  makeTestApiCall
};
