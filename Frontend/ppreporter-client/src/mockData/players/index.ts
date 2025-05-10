/**
 * Players Mock Data
 */
import playersMockData from './players';
import playerDetailsMockData from './playerDetails';

/**
 * Get mock data for players endpoints
 * @param endpoint The API endpoint
 * @param params Optional parameters for the request
 * @returns Mock data for the endpoint
 */
const getMockData = (endpoint: string, params?: any): any => {
  // Handle different players endpoints
  if (endpoint.includes('players') && endpoint.includes('details')) {
    const playerId = endpoint.split('/').pop();
    return playerDetailsMockData.getPlayerDetails(playerId);
  } else if (endpoint.includes('players')) {
    return playersMockData.getPlayers(params);
  } else {
    console.warn(`No mock data available for players endpoint: ${endpoint}`);
    return null;
  }
};

export default {
  getMockData,
  playersMockData,
  playerDetailsMockData
};
