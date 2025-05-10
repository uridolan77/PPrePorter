/**
 * Reports Mock Data
 */
import dailyActionsMockData from './dailyActions';
import playerActivityMockData from './playerActivity';
import revenueMockData from './revenue';
import promotionalMockData from './promotional';
import complianceMockData from './compliance';
import exportMockData from './export';
import scheduleMockData from './schedule';

/**
 * Get mock data for reports endpoints
 * @param endpoint The API endpoint
 * @param params Optional parameters for the request
 * @returns Mock data for the endpoint
 */
const getMockData = (endpoint: string, params?: any): any => {
  // Handle different reports endpoints
  if (endpoint.includes('reports/daily-actions')) {
    return dailyActionsMockData.getData(params);
  } else if (endpoint.includes('reports/player-activity')) {
    return playerActivityMockData.getData(params);
  } else if (endpoint.includes('reports/revenue')) {
    return revenueMockData.getData(params);
  } else if (endpoint.includes('reports/promotional')) {
    return promotionalMockData.getData(params);
  } else if (endpoint.includes('reports/compliance')) {
    return complianceMockData.getData(params);
  } else if (endpoint.includes('reports/export')) {
    return exportMockData.getData(params);
  } else if (endpoint.includes('reports/schedule')) {
    return scheduleMockData.getData(params);
  } else {
    console.warn(`No mock data available for reports endpoint: ${endpoint}`);
    return null;
  }
};

export default {
  getMockData,
  dailyActionsMockData,
  playerActivityMockData,
  revenueMockData,
  promotionalMockData,
  complianceMockData,
  exportMockData,
  scheduleMockData
};
