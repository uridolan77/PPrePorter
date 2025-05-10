/**
 * Transactions Mock Data
 */
import transactionsMockData from './transactions';

/**
 * Get mock data for transactions endpoints
 * @param endpoint The API endpoint
 * @param params Optional parameters for the request
 * @returns Mock data for the endpoint
 */
const getMockData = (endpoint: string, params?: any): any => {
  // Handle different transactions endpoints
  if (endpoint.includes('transactions')) {
    return transactionsMockData.getTransactions(params);
  } else {
    console.warn(`No mock data available for transactions endpoint: ${endpoint}`);
    return null;
  }
};

export default {
  getMockData,
  transactionsMockData
};
