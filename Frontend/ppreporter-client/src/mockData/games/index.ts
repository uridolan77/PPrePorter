/**
 * Games Mock Data
 */
import gamesMockData from './games';

/**
 * Get mock data for games endpoints
 * @param endpoint The API endpoint
 * @param params Optional parameters for the request
 * @returns Mock data for the endpoint
 */
const getMockData = (endpoint: string, params?: any): any => {
  // Handle different games endpoints
  if (endpoint.includes('games')) {
    return gamesMockData.getGames(params);
  } else {
    console.warn(`No mock data available for games endpoint: ${endpoint}`);
    return null;
  }
};

export default {
  getMockData,
  gamesMockData
};
