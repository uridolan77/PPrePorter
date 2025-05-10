/**
 * Test Data Generator
 * Utility to generate different test data scenarios for dashboard testing
 */

/**
 * Stat interface
 */
export interface Stat {
  /**
   * Stat value
   */
  value: number;
  
  /**
   * Stat change percentage
   */
  change: number;
  
  /**
   * Stat period
   */
  period: string;
}

/**
 * Game interface
 */
export interface Game {
  /**
   * Game ID
   */
  id?: number;
  
  /**
   * Game name
   */
  name: string;
  
  /**
   * Game revenue
   */
  revenue: number;
  
  /**
   * Number of players
   */
  players: number;
  
  /**
   * Game rating
   */
  rating?: string;
  
  /**
   * Game category
   */
  category?: string;
}

/**
 * Transaction interface
 */
export interface Transaction {
  /**
   * Transaction ID
   */
  id: number;
  
  /**
   * Player ID
   */
  playerId: number;
  
  /**
   * Player name
   */
  playerName: string;
  
  /**
   * Transaction amount
   */
  amount: string;
  
  /**
   * Transaction type
   */
  type: 'deposit' | 'withdrawal' | 'bet' | 'win';
  
  /**
   * Game ID
   */
  gameId: number;
  
  /**
   * Game name
   */
  gameName: string;
  
  /**
   * Transaction timestamp
   */
  timestamp: string;
}

/**
 * Revenue data point interface
 */
export interface RevenueDataPoint {
  /**
   * Day
   */
  day: string;
  
  /**
   * Revenue value
   */
  value: number;
}

/**
 * Player data point interface
 */
export interface PlayerDataPoint {
  /**
   * Game name
   */
  game: string;
  
  /**
   * Number of players
   */
  value: number;
}

/**
 * KPIs interface
 */
export interface KPIs {
  /**
   * Average session time in minutes
   */
  averageSessionTime: number;
  
  /**
   * Conversion rate percentage
   */
  conversionRate: number;
  
  /**
   * Churn rate percentage
   */
  churnRate: number;
  
  /**
   * Revenue per user
   */
  revenuePerUser: number;
}

/**
 * Dashboard data interface
 */
export interface DashboardData {
  /**
   * Dashboard stats
   */
  stats: {
    /**
     * Revenue stat
     */
    revenue: Stat;
    
    /**
     * Players stat
     */
    players: Stat;
    
    /**
     * New players stat
     */
    newPlayers?: Stat;
    
    /**
     * Games played stat
     */
    gamesPlayed?: Stat;
  };
  
  /**
   * Top games
   */
  topGames: Game[];
  
  /**
   * Recent transactions
   */
  recentTransactions: Transaction[];
  
  /**
   * Chart data
   */
  charts: {
    /**
     * Revenue by day
     */
    revenueByDay: RevenueDataPoint[];
    
    /**
     * Players by game
     */
    playersByGame?: PlayerDataPoint[];
  };
  
  /**
   * KPIs
   */
  kpis: KPIs;
}

/**
 * Generate empty data for testing empty states
 * @returns Empty dashboard data
 */
export const generateEmptyData = (): DashboardData => {
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
 * @returns Partial dashboard data
 */
export const generatePartialData = (): Partial<DashboardData> => {
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
  } as Partial<DashboardData>;
};

/**
 * Generate large dataset for testing performance
 * @returns Large dashboard data
 */
export const generateLargeData = (): DashboardData => {
  // Generate 100 games
  const topGames: Game[] = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Game ${i + 1}`,
    revenue: Math.random() * 10000,
    players: Math.floor(Math.random() * 1000),
    rating: (Math.random() * 5).toFixed(1),
    category: ['Slots', 'Table Games', 'Poker', 'Live Casino', 'Specialty'][Math.floor(Math.random() * 5)]
  }));

  // Generate 365 days of revenue data
  const revenueByDay: RevenueDataPoint[] = Array.from({ length: 365 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (364 - i));
    return {
      day: date.toISOString().split('T')[0],
      value: Math.random() * 5000 + 1000
    };
  });

  // Generate 1000 transactions
  const recentTransactions: Transaction[] = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    playerId: Math.floor(Math.random() * 1000),
    playerName: `Player ${Math.floor(Math.random() * 1000)}`,
    amount: (Math.random() * 1000).toFixed(2),
    type: ['deposit', 'withdrawal', 'bet', 'win'][Math.floor(Math.random() * 4)] as 'deposit' | 'withdrawal' | 'bet' | 'win',
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
 * @returns Error object
 */
export const generateErrorData = (): Error => {
  return new Error('Failed to fetch dashboard data from API');
};
