/**
 * Performance Report Mock Data
 */
import { format, parseISO } from 'date-fns';
import { PerformanceData, PerformanceSummary, PerformanceFilters } from '../../types/performance';

/**
 * Generate daily performance data
 * @param startDate Start date
 * @param endDate End date
 * @returns Array of performance data points
 */
export const generateDailyPerformanceData = (startDate: string, endDate: string): PerformanceData[] => {
  const data: PerformanceData[] = [];
  
  // Parse dates
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  // Generate data for each day
  const currentDate = new Date(start);
  let id = 1;
  
  while (currentDate <= end) {
    // Generate random active players between 1000 and 5000
    const activePlayers = Math.floor(Math.random() * 4000) + 1000;
    
    // Generate random new players between 100 and 500
    const newPlayers = Math.floor(Math.random() * 400) + 100;
    
    // Generate random sessions between 2000 and 10000
    const sessions = Math.floor(Math.random() * 8000) + 2000;
    
    // Generate random average session duration between 10 and 60 minutes
    const avgSessionDuration = Math.floor(Math.random() * 50) + 10;
    
    // Generate random bets between 10000 and 50000
    const bets = Math.floor(Math.random() * 40000) + 10000;
    
    // Generate random average bet amount between 10 and 100
    const avgBet = Math.floor(Math.random() * 90) + 10;
    
    // Generate random wins between 5000 and 25000
    const wins = Math.floor(Math.random() * 20000) + 5000;
    
    // Generate random average win amount between 20 and 200
    const avgWin = Math.floor(Math.random() * 180) + 20;
    
    // Calculate win rate
    const winRate = wins / bets;
    
    // Generate random RTP between 0.9 and 0.98
    const rtp = 0.9 + (Math.random() * 0.08);
    
    // Calculate hold percentage
    const holdPercentage = 1 - rtp;
    
    // Generate random conversion rate between 0.05 and 0.2
    const conversionRate = 0.05 + (Math.random() * 0.15);
    
    // Generate random churn rate between 0.05 and 0.15
    const churnRate = 0.05 + (Math.random() * 0.1);
    
    // Generate random revenue per user between 50 and 200
    const revenuePerUser = Math.floor(Math.random() * 150) + 50;
    
    data.push({
      id: `perf-${id}`,
      date: format(currentDate, 'yyyy-MM-dd'),
      activePlayers,
      newPlayers,
      sessions,
      avgSessionDuration,
      bets,
      avgBet,
      wins,
      avgWin,
      winRate,
      rtp,
      holdPercentage,
      conversionRate,
      churnRate,
      revenuePerUser
    });
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
    id++;
  }
  
  return data;
};

/**
 * Generate performance data by game
 * @returns Array of performance data points
 */
export const generateGamePerformanceData = (): PerformanceData[] => {
  const games = [
    { id: 'game-1', name: 'Starburst', provider: 'NetEnt', category: 'Slots' },
    { id: 'game-2', name: 'Gonzo\'s Quest', provider: 'NetEnt', category: 'Slots' },
    { id: 'game-3', name: 'Book of Dead', provider: 'Play\'n GO', category: 'Slots' },
    { id: 'game-4', name: 'Mega Moolah', provider: 'Microgaming', category: 'Jackpot Slots' },
    { id: 'game-5', name: 'Blackjack', provider: 'Evolution', category: 'Table Games' },
    { id: 'game-6', name: 'Roulette', provider: 'Evolution', category: 'Table Games' },
    { id: 'game-7', name: 'Poker', provider: 'Evolution', category: 'Table Games' },
    { id: 'game-8', name: 'Baccarat', provider: 'Evolution', category: 'Table Games' },
    { id: 'game-9', name: 'Craps', provider: 'Evolution', category: 'Table Games' },
    { id: 'game-10', name: 'Dream Catcher', provider: 'Evolution', category: 'Game Shows' }
  ];
  
  return games.map((game, index) => {
    // Generate random active players between 500 and 3000
    const activePlayers = Math.floor(Math.random() * 2500) + 500;
    
    // Generate random new players between 50 and 300
    const newPlayers = Math.floor(Math.random() * 250) + 50;
    
    // Generate random sessions between 1000 and 6000
    const sessions = Math.floor(Math.random() * 5000) + 1000;
    
    // Generate random average session duration between 10 and 60 minutes
    const avgSessionDuration = Math.floor(Math.random() * 50) + 10;
    
    // Generate random bets between 5000 and 30000
    const bets = Math.floor(Math.random() * 25000) + 5000;
    
    // Generate random average bet amount between 10 and 100
    const avgBet = Math.floor(Math.random() * 90) + 10;
    
    // Generate random wins between 2500 and 15000
    const wins = Math.floor(Math.random() * 12500) + 2500;
    
    // Generate random average win amount between 20 and 200
    const avgWin = Math.floor(Math.random() * 180) + 20;
    
    // Calculate win rate
    const winRate = wins / bets;
    
    // Generate random RTP between 0.9 and 0.98
    const rtp = 0.9 + (Math.random() * 0.08);
    
    // Calculate hold percentage
    const holdPercentage = 1 - rtp;
    
    // Generate random conversion rate between 0.05 and 0.2
    const conversionRate = 0.05 + (Math.random() * 0.15);
    
    // Generate random churn rate between 0.05 and 0.15
    const churnRate = 0.05 + (Math.random() * 0.1);
    
    // Generate random revenue per user between 50 and 200
    const revenuePerUser = Math.floor(Math.random() * 150) + 50;
    
    return {
      id: `perf-game-${index + 1}`,
      date: format(new Date(), 'yyyy-MM-dd'),
      gameId: game.id,
      gameName: game.name,
      gameProvider: game.provider,
      gameCategory: game.category,
      activePlayers,
      newPlayers,
      sessions,
      avgSessionDuration,
      bets,
      avgBet,
      wins,
      avgWin,
      winRate,
      rtp,
      holdPercentage,
      conversionRate,
      churnRate,
      revenuePerUser
    };
  });
};

/**
 * Calculate performance summary
 * @param data Performance data
 * @returns Performance summary
 */
export const calculatePerformanceSummary = (data: PerformanceData[]): PerformanceSummary => {
  return {
    totalActivePlayers: data.reduce((sum, item) => sum + item.activePlayers, 0),
    totalNewPlayers: data.reduce((sum, item) => sum + item.newPlayers, 0),
    totalSessions: data.reduce((sum, item) => sum + item.sessions, 0),
    avgSessionDuration: data.reduce((sum, item) => sum + item.avgSessionDuration, 0) / data.length,
    totalBets: data.reduce((sum, item) => sum + item.bets, 0),
    avgBet: data.reduce((sum, item) => sum + item.avgBet, 0) / data.length,
    totalWins: data.reduce((sum, item) => sum + item.wins, 0),
    avgWin: data.reduce((sum, item) => sum + item.avgWin, 0) / data.length,
    overallWinRate: data.reduce((sum, item) => sum + item.winRate, 0) / data.length,
    avgRTP: data.reduce((sum, item) => sum + item.rtp, 0) / data.length,
    avgHoldPercentage: data.reduce((sum, item) => sum + item.holdPercentage, 0) / data.length,
    avgConversionRate: data.reduce((sum, item) => sum + (item.conversionRate || 0), 0) / data.length,
    avgChurnRate: data.reduce((sum, item) => sum + (item.churnRate || 0), 0) / data.length,
    avgRevenuePerUser: data.reduce((sum, item) => sum + (item.revenuePerUser || 0), 0) / data.length
  };
};

/**
 * Get performance data based on filters
 * @param filters Performance filters
 * @returns Object with data and summary
 */
export const getPerformanceData = (filters: PerformanceFilters) => {
  let data: PerformanceData[] = [];
  
  // Generate data based on groupBy
  if (filters.groupBy === 'game' || filters.groupBy === 'category' || filters.groupBy === 'provider') {
    data = generateGamePerformanceData();
  } else {
    data = generateDailyPerformanceData(filters.startDate, filters.endDate);
  }
  
  // Apply game filter if provided
  if (filters.gameIds && filters.gameIds.length > 0) {
    data = data.filter(item => 
      item.gameId && filters.gameIds?.includes(item.gameId)
    );
  }
  
  // Apply category filter if provided
  if (filters.gameCategories && filters.gameCategories.length > 0) {
    data = data.filter(item => 
      item.gameCategory && filters.gameCategories?.includes(item.gameCategory)
    );
  }
  
  // Apply provider filter if provided
  if (filters.gameProviders && filters.gameProviders.length > 0) {
    data = data.filter(item => 
      item.gameProvider && filters.gameProviders?.includes(item.gameProvider)
    );
  }
  
  // Calculate summary
  const summary = calculatePerformanceSummary(data);
  
  return {
    data,
    summary
  };
};

export default {
  generateDailyPerformanceData,
  generateGamePerformanceData,
  calculatePerformanceSummary,
  getPerformanceData
};
