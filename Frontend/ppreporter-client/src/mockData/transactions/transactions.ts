/**
 * Transactions Mock Data
 */
import recentTransactionsMockData from '../dashboard/recentTransactions';

/**
 * Get mock transactions data
 * @param params Parameters for filtering and pagination
 * @returns Filtered and paginated transactions data
 */
const getTransactions = (params?: any): any => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const type = params?.type;
  const status = params?.status;
  const playerId = params?.playerId;
  const startDate = params?.startDate;
  const endDate = params?.endDate;
  const minAmount = params?.minAmount;
  const maxAmount = params?.maxAmount;
  
  // Generate 100 transactions
  let transactions = recentTransactionsMockData.generateTransactions(100);
  
  // Apply filters
  if (type) {
    transactions = transactions.filter(tx => tx.type === type);
  }
  
  if (status) {
    transactions = transactions.filter(tx => tx.status === status);
  }
  
  if (playerId) {
    transactions = transactions.filter(tx => tx.playerId === playerId);
  }
  
  if (startDate) {
    const start = new Date(startDate);
    transactions = transactions.filter(tx => new Date(tx.timestamp) >= start);
  }
  
  if (endDate) {
    const end = new Date(endDate);
    transactions = transactions.filter(tx => new Date(tx.timestamp) <= end);
  }
  
  if (minAmount !== undefined) {
    transactions = transactions.filter(tx => tx.amount >= minAmount);
  }
  
  if (maxAmount !== undefined) {
    transactions = transactions.filter(tx => tx.amount <= maxAmount);
  }
  
  // Calculate pagination
  const total = transactions.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);
  
  return {
    data: paginatedTransactions,
    total,
    page,
    pageSize,
    totalPages
  };
};

export default {
  getTransactions,
  transactionTypes: recentTransactionsMockData.transactionTypes,
  paymentMethods: recentTransactionsMockData.paymentMethods,
  transactionStatuses: recentTransactionsMockData.transactionStatuses
};
