/**
 * Dashboard Mock Data
 */
import statsMockData from './stats';
import playerRegistrationsMockData from './playerRegistrations';
import recentTransactionsMockData from './recentTransactions';
import topGamesMockData from './topGames';
import casinoRevenueMockData from './casinoRevenue';
import playerJourneyMockData from './playerJourney';
import kpiMockData from './kpi';

/**
 * Get mock data for dashboard endpoints
 * @param endpoint The API endpoint
 * @param params Optional parameters for the request
 * @returns Mock data for the endpoint
 */
const getMockData = (endpoint: string, params?: any): any => {
  // Handle different dashboard endpoints
  if (endpoint.includes('dashboard/stats')) {
    return statsMockData.stats;
  } else if (endpoint.includes('dashboard/player-registrations')) {
    return playerRegistrationsMockData.getRegistrationsData(params);
  } else if (endpoint.includes('dashboard/recent-transactions')) {
    return recentTransactionsMockData.transactions;
  } else if (endpoint.includes('dashboard/top-games')) {
    return topGamesMockData.getTopGames(params);
  } else if (endpoint.includes('dashboard/casino-revenue')) {
    return casinoRevenueMockData.getRevenueData(params);
  } else if (endpoint.includes('dashboard/player-journey')) {
    return playerJourneyMockData.playerJourney;
  } else if (endpoint.includes('dashboard/kpi')) {
    return kpiMockData.kpiData;
  } else if (endpoint.includes('dashboard/preferences')) {
    return { theme: 'light', layout: 'default', favorites: [] };
  } else if (endpoint.includes('dashboard/query')) {
    return { results: [], message: 'Query executed successfully' };
  } else {
    console.warn(`No mock data available for dashboard endpoint: ${endpoint}`);
    return null;
  }
};

export default {
  getMockData,
  statsMockData,
  playerRegistrationsMockData,
  recentTransactionsMockData,
  topGamesMockData,
  casinoRevenueMockData,
  playerJourneyMockData,
  kpiMockData
};
