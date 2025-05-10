/**
 * Test data generator utility
 * Provides functions to generate different test data scenarios
 */

/**
 * Generate empty data for testing empty state handling
 * @returns Empty dashboard data
 */
export const generateEmptyData = () => {
  return {
    stats: {
      revenue: {
        value: 0,
        change: 0,
        period: 'vs last week'
      },
      players: {
        value: 0,
        change: 0,
        period: 'vs last week'
      },
      games: {
        value: 0,
        change: 0,
        period: 'vs last week'
      },
      engagement: {
        value: 0,
        change: 0,
        period: 'vs last week'
      }
    },
    topGames: [],
    recentTransactions: [],
    playerRegistrations: [],
    charts: {
      revenueByDay: [],
      playersByGame: []
    }
  };
};

/**
 * Generate partial data for testing partial data handling
 * @returns Partial dashboard data
 */
export const generatePartialData = () => {
  return {
    stats: {
      revenue: {
        value: 8765.43,
        change: 5.2,
        period: 'vs last week'
      },
      players: {
        value: 876,
        change: -2.1,
        period: 'vs last week'
      },
      games: {
        value: 45,
        change: 3.5,
        period: 'vs last week'
      },
      engagement: {
        value: 67.8,
        change: 1.2,
        period: 'vs last week'
      }
    },
    topGames: [
      { id: 'poker-pro', name: 'Poker Pro', category: 'poker', revenue: 2100.56, players: 321 },
      { id: 'blackjack-masters', name: 'Blackjack Masters', category: 'table', revenue: 1800.32, players: 287 },
      // Other games are missing
    ],
    // recentTransactions is missing
    recentTransactions: [],
    playerRegistrations: [],
    charts: {
      revenueByDay: [
        { day: 'Mon', value: 1100 },
        { day: 'Tue', value: 1400 },
        { day: 'Wed', value: 1200 },
        // Other days are missing
      ],
      playersByGame: [
        { game: 'Poker', value: 321 },
        { game: 'Blackjack', value: 287 }
      ]
    }
  };
};

/**
 * Generate large data for testing performance
 * @returns Large dashboard data
 */
export const generateLargeData = () => {
  // Generate large arrays of data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const revenueByDay = [];
  const recentTransactions = [];
  const topGames = [];

  // Generate 100 days of revenue data
  for (let i = 0; i < 100; i++) {
    const day = days[i % 7];
    const date = new Date();
    date.setDate(date.getDate() - i);

    revenueByDay.push({
      day,
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 5000) + 1000
    });
  }

  // Generate 1000 transactions
  for (let i = 0; i < 1000; i++) {
    const date = new Date();
    date.setMinutes(date.getMinutes() - i * 30);

    recentTransactions.push({
      id: `tx-${i}`,
      playerId: `player-${Math.floor(Math.random() * 100) + 1}`,
      playerName: `Player ${Math.floor(Math.random() * 100) + 1}`,
      amount: Math.floor(Math.random() * 1000) / 10,
      type: ['deposit', 'withdrawal', 'bet', 'win'][Math.floor(Math.random() * 4)],
      timestamp: date.toISOString(),
      status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)]
    });
  }

  // Generate 100 games
  const gameTypes = ['Slots', 'Poker', 'Blackjack', 'Roulette', 'Baccarat', 'Craps', 'Bingo'];
  for (let i = 0; i < 100; i++) {
    const gameType = gameTypes[Math.floor(Math.random() * gameTypes.length)];
    topGames.push({
      id: `game-${i}`,
      name: `${gameType} ${i + 1}`,
      revenue: Math.floor(Math.random() * 10000) + 500,
      players: Math.floor(Math.random() * 1000) + 50,
      sessions: Math.floor(Math.random() * 5000) + 100,
      category: gameType.toLowerCase()
    });
  }

  return {
    stats: {
      revenue: {
        value: 123456.78,
        change: 25.4,
        period: 'vs last week'
      },
      players: {
        value: 12345,
        change: 15.7,
        period: 'vs last week'
      },
      games: {
        value: 245,
        change: 32.8,
        period: 'vs last week'
      },
      engagement: {
        value: 78.5,
        change: 18.2,
        period: 'vs last week'
      }
    },
    topGames: topGames.slice(0, 20), // Top 20 games
    recentTransactions: recentTransactions.slice(0, 50), // Latest 50 transactions
    playerRegistrations: revenueByDay.map(day => ({
      date: day.date,
      registrations: Math.floor(Math.random() * 200) + 50,
      ftd: Math.floor(Math.random() * 50) + 10
    })),
    charts: {
      revenueByDay: revenueByDay.slice(0, 30), // Last 30 days
      playersByGame: topGames.slice(0, 10).map(game => ({
        game: game.name,
        value: game.players
      }))
    }
  };
};

/**
 * Generate error data for testing error handling
 * @returns Error object
 */
export const generateErrorData = () => {
  const errorTypes = [
    { code: 'API_ERROR', message: 'Failed to connect to API endpoint' },
    { code: 'AUTH_ERROR', message: 'Authentication token expired' },
    { code: 'TIMEOUT_ERROR', message: 'Request timed out after 30 seconds' },
    { code: 'DATA_ERROR', message: 'Invalid data format received from server' },
    { code: 'SERVER_ERROR', message: 'Internal server error (500)' }
  ];

  const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];

  return {
    code: randomError.code,
    message: randomError.message,
    timestamp: new Date().toISOString()
  };
};
