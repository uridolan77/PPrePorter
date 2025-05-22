/**
 * Reports Mock Data
 */
import dailyActionsMockData from './dailyActions';
import dailyActionsSummaryMockData from './dailyActionsSummary';
import playerActivityMockData from './playerActivity';
import revenueMockData from './revenue';
import promotionalMockData from './promotional';
import complianceMockData from './compliance';
import exportMockData from './export';
import scheduleMockData from './schedule';
import financialMockData from './financial';
import performanceMockData from './performance';
import geographicMockData from './geographic';
import networkGraphMockData from './networkGraph';
import advancedAnalyticsMockData from './advancedAnalytics';

/**
 * Get mock data for reports endpoints
 * @param endpoint The API endpoint
 * @param params Optional parameters for the request
 * @returns Mock data for the endpoint
 */
const getMockData = (endpoint: string, params?: any): any => {
  console.log('[REPORTS MOCK] Getting mock data for reports endpoint:', endpoint, params);

  let result = null;

  // Handle different reports endpoints
  if (endpoint.includes('reports/daily-actions/summary')) {
    console.log('[REPORTS MOCK] Using dailyActionsSummaryMockData.getSummaryData');
    result = dailyActionsSummaryMockData.getSummaryData(params);
  } else if (endpoint.includes('reports/daily-actions/metadata')) {
    console.log('[REPORTS MOCK] Using dailyActionsSummaryMockData.getMetadata');
    result = dailyActionsSummaryMockData.getMetadata();
  } else if (endpoint.includes('reports/daily-actions/data')) {
    console.log('[REPORTS MOCK] Using dailyActionsMockData.getData for /data endpoint');
    result = dailyActionsMockData.getData(params);
  } else if (endpoint.includes('reports/daily-actions')) {
    console.log('[REPORTS MOCK] Using dailyActionsMockData.getData for general endpoint');
    result = dailyActionsMockData.getData(params);
  } else if (endpoint.includes('reports/player-activity')) {
    result = playerActivityMockData.getData(params);
  } else if (endpoint.includes('reports/revenue')) {
    result = revenueMockData.getData(params);
  } else if (endpoint.includes('reports/promotional')) {
    result = promotionalMockData.getData(params);
  } else if (endpoint.includes('reports/compliance')) {
    result = complianceMockData.getData(params);
  } else if (endpoint.includes('reports/export')) {
    result = exportMockData.getData(params);
  } else if (endpoint.includes('reports/schedule')) {
    result = scheduleMockData.getData(params);
  } else {
    console.warn(`[REPORTS MOCK] No mock data available for reports endpoint: ${endpoint}`);
  }

  console.log(`[REPORTS MOCK] Result for ${endpoint}:`, result);
  return result;
};

export default {
  getMockData,
  dailyActionsMockData,
  dailyActionsSummaryMockData,
  playerActivityMockData,
  revenueMockData,
  promotionalMockData,
  complianceMockData,
  exportMockData,
  scheduleMockData
};
