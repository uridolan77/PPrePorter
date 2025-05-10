/**
 * Recent Transactions Mock Data
 */

/**
 * Mock transaction types
 */
const transactionTypes = [
  'deposit',
  'withdrawal',
  'bet',
  'win',
  'bonus',
  'refund'
];

/**
 * Mock payment methods
 */
const paymentMethods = [
  'Credit Card',
  'PayPal',
  'Bank Transfer',
  'Skrill',
  'Neteller',
  'Bitcoin',
  'Apple Pay',
  'Google Pay'
];

/**
 * Mock transaction statuses
 */
const transactionStatuses = [
  'completed',
  'pending',
  'failed',
  'cancelled',
  'processing'
];

/**
 * Generate a random transaction
 * @param index Index for generating unique ID
 * @returns Random transaction object
 */
const generateTransaction = (index: number) => {
  const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
  const amount = Math.floor(Math.random() * 1000) + 10;
  const status = transactionStatuses[Math.floor(Math.random() * transactionStatuses.length)];
  const paymentMethod = type === 'deposit' || type === 'withdrawal'
    ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    : null;

  // Generate a random timestamp within the last 24 hours
  const timestamp = new Date();
  timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 24));

  return {
    id: `tx-${Date.now()}-${index}`,
    playerId: `player-${Math.floor(Math.random() * 1000) + 1}`,
    playerUsername: `user${Math.floor(Math.random() * 1000) + 1}`,
    type,
    amount,
    currency: 'USD',
    status,
    paymentMethod,
    timestamp: timestamp.toISOString(),
    gameId: type === 'bet' || type === 'win' ? `game-${Math.floor(Math.random() * 100) + 1}` : null,
    gameName: type === 'bet' || type === 'win' ? `Game ${Math.floor(Math.random() * 100) + 1}` : null
  };
};

/**
 * Generate mock transactions
 * @param count Number of transactions to generate
 * @returns Array of mock transactions
 */
const generateTransactions = (count: number) => {
  const transactions = [];

  for (let i = 0; i < count; i++) {
    transactions.push(generateTransaction(i));
  }

  // Sort by timestamp (newest first)
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

/**
 * Mock recent transactions
 */
const transactions = {
  data: generateTransactions(20),
  total: 20,
  page: 1,
  pageSize: 20,
  totalPages: 1
};

export default {
  transactions,
  generateTransactions,
  transactionTypes,
  paymentMethods,
  transactionStatuses
};
