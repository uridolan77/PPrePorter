/**
 * Natural Language Mock Data
 */
import queryMockData from './query';
import historyMockData from './history';
import suggestionsMockData from './suggestions';

/**
 * Get mock data for natural language endpoints
 * @param endpoint The API endpoint
 * @param params Optional parameters for the request
 * @returns Mock data for the endpoint
 */
const getMockData = (endpoint: string, params?: any): any => {
  // Handle different natural language endpoints
  if (endpoint.includes('natural-language/query')) {
    return queryMockData.processQuery(params);
  } else if (endpoint.includes('natural-language/history')) {
    return historyMockData.getQueryHistory();
  } else if (endpoint.includes('natural-language/suggestions')) {
    return suggestionsMockData.getSuggestions();
  } else {
    console.warn(`No mock data available for natural language endpoint: ${endpoint}`);
    return null;
  }
};

export default {
  getMockData,
  queryMockData,
  historyMockData,
  suggestionsMockData
};
