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
  console.log(`[MOCK] Getting mock data for endpoint: ${endpoint}`, params);

  // Normalize the endpoint by removing leading slash and any API prefix
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

  // Remove api/ prefix if present (for proxy requests)
  if (normalizedEndpoint.startsWith('api/')) {
    normalizedEndpoint = normalizedEndpoint.substring(4);
  }

  // Split the endpoint into segments
  const segments = normalizedEndpoint.split('/');
  const category = segments[0];

  console.log(`[MOCK] Category: ${category}, Segments:`, segments);

  let result;

  // Select the appropriate mock data based on the category
  switch (category) {
    case 'auth':
      result = authMockData.getMockData(normalizedEndpoint, params);
      break;
    case 'dashboard':
      result = dashboardMockData.getMockData(normalizedEndpoint, params);
      break;
    case 'reports':
      result = reportsMockData.getMockData(normalizedEndpoint, params);
      break;
    case 'players':
      result = playersMockData.getMockData(normalizedEndpoint, params);
      break;
    case 'games':
      result = gamesMockData.getMockData(normalizedEndpoint, params);
      break;
    case 'transactions':
      result = transactionsMockData.getMockData(normalizedEndpoint, params);
      break;
    case 'natural-language':
      result = naturalLanguageMockData.getMockData(normalizedEndpoint, params);
      break;
    default:
      console.warn(`[MOCK] No mock data available for endpoint: ${endpoint}`);
      result = null;
  }

  console.log(`[MOCK] Result for ${endpoint}:`, result);
  return result;
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
