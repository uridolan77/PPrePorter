/**
 * Mock Data Service
 * 
 * This service provides mock data for UI testing when the backend server is not available.
 * It intercepts API calls and returns appropriate mock data based on the endpoint.
 */

import { FEATURES } from '../config/constants';
import authMockData from './auth';
import dashboardMockData from './dashboard';
import reportsMockData from './reports';
import playersMockData from './players';
import gamesMockData from './games';
import transactionsMockData from './transactions';
import naturalLanguageMockData from './naturalLanguage';

/**
 * Check if mock data should be used
 */
export const shouldUseMockData = (): boolean => {
  return FEATURES.USE_MOCK_DATA_FOR_UI_TESTING;
};

/**
 * Get mock data for a specific endpoint
 * @param endpoint The API endpoint
 * @param params Optional parameters for the request
 * @returns Mock data for the endpoint
 */
export const getMockData = (endpoint: string, params?: any): any => {
  // Remove leading slash if present
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // Split the endpoint into segments
  const segments = normalizedEndpoint.split('/');
  const category = segments[0];
  
  // Select the appropriate mock data based on the category
  switch (category) {
    case 'auth':
      return authMockData.getMockData(normalizedEndpoint, params);
    case 'dashboard':
      return dashboardMockData.getMockData(normalizedEndpoint, params);
    case 'reports':
      return reportsMockData.getMockData(normalizedEndpoint, params);
    case 'players':
      return playersMockData.getMockData(normalizedEndpoint, params);
    case 'games':
      return gamesMockData.getMockData(normalizedEndpoint, params);
    case 'transactions':
      return transactionsMockData.getMockData(normalizedEndpoint, params);
    case 'natural-language':
      return naturalLanguageMockData.getMockData(normalizedEndpoint, params);
    default:
      console.warn(`No mock data available for endpoint: ${endpoint}`);
      return null;
  }
};

/**
 * Simulate API delay
 * @param min Minimum delay in milliseconds
 * @param max Maximum delay in milliseconds
 * @returns Promise that resolves after the delay
 */
export const simulateApiDelay = (min: number = 200, max: number = 800): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Mock data service
 */
const mockDataService = {
  shouldUseMockData,
  getMockData,
  simulateApiDelay
};

export default mockDataService;
