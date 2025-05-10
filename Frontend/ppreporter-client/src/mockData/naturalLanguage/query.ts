/**
 * Natural Language Query Mock Data
 */

/**
 * Process a natural language query
 * @param params Query parameters
 * @returns Mock query result
 */
const processQuery = (params?: any): any => {
  const query = params?.query || '';
  
  // Process the query based on keywords
  if (query.toLowerCase().includes('revenue')) {
    return generateRevenueResponse(query);
  } else if (query.toLowerCase().includes('player') || query.toLowerCase().includes('user')) {
    return generatePlayerResponse(query);
  } else if (query.toLowerCase().includes('game')) {
    return generateGameResponse(query);
  } else if (query.toLowerCase().includes('transaction')) {
    return generateTransactionResponse(query);
  } else {
    return generateGenericResponse(query);
  }
};

/**
 * Generate a revenue-related response
 * @param query The original query
 * @returns Mock response for revenue query
 */
const generateRevenueResponse = (query: string): any => {
  return {
    query,
    entities: {
      metric: 'revenue',
      timeframe: 'last 30 days',
      filters: []
    },
    sql: 'SELECT date, SUM(amount) as revenue FROM transactions WHERE type = "win" AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY date ORDER BY date',
    data: generateRevenueData(30),
    visualization: 'line',
    insights: [
      'Revenue has increased by 15% compared to the previous period',
      'Weekend days show higher revenue than weekdays',
      'The highest revenue day was last Saturday'
    ]
  };
};

/**
 * Generate a player-related response
 * @param query The original query
 * @returns Mock response for player query
 */
const generatePlayerResponse = (query: string): any => {
  return {
    query,
    entities: {
      metric: 'players',
      timeframe: 'last 30 days',
      filters: []
    },
    sql: 'SELECT date, COUNT(DISTINCT player_id) as active_players FROM sessions WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY date ORDER BY date',
    data: generatePlayerData(30),
    visualization: 'line',
    insights: [
      'Active players have increased by 8% compared to the previous period',
      'New player registrations are up 12% month-over-month',
      'Player retention rate is 65% for the period'
    ]
  };
};

/**
 * Generate a game-related response
 * @param query The original query
 * @returns Mock response for game query
 */
const generateGameResponse = (query: string): any => {
  return {
    query,
    entities: {
      metric: 'games',
      timeframe: 'last 30 days',
      filters: []
    },
    sql: 'SELECT game_name, COUNT(*) as plays, SUM(bet_amount) as total_bets FROM game_sessions WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY game_name ORDER BY plays DESC LIMIT 10',
    data: generateGameData(10),
    visualization: 'bar',
    insights: [
      'Slot games are the most popular category with 65% of all plays',
      'The top 5 games account for 40% of all bets',
      'New games released this month have a 25% higher engagement rate'
    ]
  };
};

/**
 * Generate a transaction-related response
 * @param query The original query
 * @returns Mock response for transaction query
 */
const generateTransactionResponse = (query: string): any => {
  return {
    query,
    entities: {
      metric: 'transactions',
      timeframe: 'last 30 days',
      filters: []
    },
    sql: 'SELECT date, type, COUNT(*) as count, SUM(amount) as total_amount FROM transactions WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY date, type ORDER BY date',
    data: generateTransactionData(30),
    visualization: 'bar',
    insights: [
      'Deposit transactions have increased by 10% compared to the previous period',
      'The average transaction amount is $85',
      'Credit card remains the most popular payment method at 55% of all deposits'
    ]
  };
};

/**
 * Generate a generic response
 * @param query The original query
 * @returns Mock generic response
 */
const generateGenericResponse = (query: string): any => {
  return {
    query,
    entities: {
      metric: 'general',
      timeframe: 'last 30 days',
      filters: []
    },
    sql: 'SELECT * FROM dashboard_summary WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)',
    data: generateGenericData(),
    visualization: 'table',
    insights: [
      'Overall platform performance is up 12% compared to the previous period',
      'Mobile usage has increased to 65% of all sessions',
      'Peak usage time is between 8 PM and 11 PM daily'
    ]
  };
};

/**
 * Generate mock revenue data
 * @param days Number of days to generate data for
 * @returns Array of revenue data points
 */
const generateRevenueData = (days: number): any[] => {
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() - (days - i - 1));
    
    // Generate random revenue between 10000 and 50000
    const revenue = Math.floor(Math.random() * 40000) + 10000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue
    });
  }
  
  return data;
};

/**
 * Generate mock player data
 * @param days Number of days to generate data for
 * @returns Array of player data points
 */
const generatePlayerData = (days: number): any[] => {
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() - (days - i - 1));
    
    // Generate random player counts between 1000 and 5000
    const activePlayers = Math.floor(Math.random() * 4000) + 1000;
    const newPlayers = Math.floor(activePlayers * (Math.random() * 0.2 + 0.05));
    
    data.push({
      date: date.toISOString().split('T')[0],
      activePlayers,
      newPlayers
    });
  }
  
  return data;
};

/**
 * Generate mock game data
 * @param count Number of games to generate data for
 * @returns Array of game data points
 */
const generateGameData = (count: number): any[] => {
  const games = [
    'Starburst',
    'Gonzo\'s Quest',
    'Book of Dead',
    'Mega Moolah',
    'Reactoonz',
    'Immortal Romance',
    'Bonanza',
    'Dead or Alive',
    'Wolf Gold',
    'Sweet Bonanza'
  ];
  
  const data = [];
  
  for (let i = 0; i < count; i++) {
    // Generate random plays between 1000 and 10000
    const plays = Math.floor(Math.random() * 9000) + 1000;
    
    // Generate random bets between 10000 and 100000
    const totalBets = Math.floor(Math.random() * 90000) + 10000;
    
    data.push({
      game: games[i],
      plays,
      totalBets
    });
  }
  
  // Sort by plays (descending)
  return data.sort((a, b) => b.plays - a.plays);
};

/**
 * Generate mock transaction data
 * @param days Number of days to generate data for
 * @returns Array of transaction data points
 */
const generateTransactionData = (days: number): any[] => {
  const data = [];
  const today = new Date();
  const transactionTypes = ['deposit', 'withdrawal', 'bet', 'win'];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() - (days - i - 1));
    const dateStr = date.toISOString().split('T')[0];
    
    for (const type of transactionTypes) {
      // Generate random count between 100 and 1000
      const count = Math.floor(Math.random() * 900) + 100;
      
      // Generate random amount between 10000 and 50000
      const totalAmount = Math.floor(Math.random() * 40000) + 10000;
      
      data.push({
        date: dateStr,
        type,
        count,
        totalAmount
      });
    }
  }
  
  return data;
};

/**
 * Generate mock generic data
 * @returns Generic dashboard data
 */
const generateGenericData = (): any => {
  return {
    revenue: 1250000,
    players: {
      active: 45000,
      new: 12500
    },
    transactions: {
      deposits: 85000,
      withdrawals: 35000,
      bets: 450000,
      wins: 420000
    },
    games: {
      mostPlayed: 'Starburst',
      mostProfitable: 'Mega Moolah'
    },
    devices: {
      mobile: 65,
      desktop: 30,
      tablet: 5
    }
  };
};

export default {
  processQuery,
  generateRevenueResponse,
  generatePlayerResponse,
  generateGameResponse,
  generateTransactionResponse,
  generateGenericResponse
};
