/**
 * Test Data Generator
 * Utility to generate different test data scenarios for dashboard testing
 */

/**
 * Generate empty data for testing empty states
 * @returns {Object} Empty dashboard data
 */
export const generateEmptyData = () => {
  return {
    stats: {
      revenue: { value: 0, change: 0, period: 'vs last week' },
      players: { value: 0, change: 0, period: 'vs last week' },
      newPlayers: { value: 0, change: 0, period: 'vs last week' },
      gamesPlayed: { value: 0, change: 0, period: 'vs last week' }
    },
    topGames: [],
    recentTransactions: [],
    charts: {
      revenueByDay: [],
      playersByGame: []
    },
    kpis: {
      averageSessionTime: 0,
      conversionRate: 0,
      churnRate: 0,
      revenuePerUser: 0
    }
  };
};

/**
 * Generate partial data for testing partial data states
 * @returns {Object} Partial dashboard data
 */
export const generatePartialData = () => {
  return {
    stats: {
      revenue: { value: 12567.89, change: 15.2, period: 'vs last week' },
      players: { value: 1432, change: 7.5, period: 'vs last week' },
      // Missing newPlayers
      // Missing gamesPlayed
    },
    topGames: [
      { name: 'Poker Pro', revenue: 3200.56, players: 432 },
      { name: 'Blackjack Masters', revenue: 2800.32, players: 387 }
    ],
    // Missing recentTransactions
    charts: {
      revenueByDay: [
        { day: 'Mon', value: 2100 },
        { day: 'Tue', value: 2400 }
      ],
      // Missing playersByGame
    },
    kpis: {
      averageSessionTime: 45,
      // Missing conversionRate
      churnRate: 5.7,
      // Missing revenuePerUser
    }
  };
};

/**
 * Generate large dataset for testing performance
 * @returns {Object} Large dashboard data
 */
export const generateLargeData = () => {
  // Generate 100 games
  const topGames = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Game ${i + 1}`,
    revenue: Math.random() * 10000,
    players: Math.floor(Math.random() * 1000),
    rating: (Math.random() * 5).toFixed(1),
    category: ['Slots', 'Table Games', 'Poker', 'Live Casino', 'Specialty'][Math.floor(Math.random() * 5)]
  }));

  // Generate 365 days of revenue data
  const revenueByDay = Array.from({ length: 365 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (364 - i));
    return {
      day: date.toISOString().split('T')[0],
      value: Math.random() * 5000 + 1000
    };
  });

  // Generate 1000 transactions
  const recentTransactions = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    playerId: Math.floor(Math.random() * 1000),
    playerName: `Player ${Math.floor(Math.random() * 1000)}`,
    amount: (Math.random() * 1000).toFixed(2),
    type: ['deposit', 'withdrawal', 'bet', 'win'][Math.floor(Math.random() * 4)],
    gameId: Math.floor(Math.random() * 100),
    gameName: `Game ${Math.floor(Math.random() * 100)}`,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));

  return {
    stats: {
      revenue: { value: 1256789.89, change: 15.2, period: 'vs last week' },
      players: { value: 143200, change: 7.5, period: 'vs last week' },
      newPlayers: { value: 25600, change: 12.8, period: 'vs last week' },
      gamesPlayed: { value: 562100, change: -3.2, period: 'vs last week' }
    },
    topGames,
    recentTransactions,
    charts: {
      revenueByDay,
      playersByGame: topGames.slice(0, 20).map(game => ({ game: game.name, value: game.players }))
    },
    kpis: {
      averageSessionTime: 45,
      conversionRate: 3.2,
      churnRate: 5.7,
      revenuePerUser: 87.5
    }
  };
};

/**
 * Generate error data for testing error states
 * @returns {Object} Error object
 */
export const generateErrorData = () => {
  return new Error('Failed to fetch dashboard data from API');
};
