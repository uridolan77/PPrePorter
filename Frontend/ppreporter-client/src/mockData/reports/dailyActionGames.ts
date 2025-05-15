/**
 * Daily Action Games Mock Data
 */
import { DailyActionGame } from '../../types/reports';

/**
 * Mock platforms
 */
const platforms = ['Web', 'Mobile', 'Desktop', 'Tablet', 'App'];

/**
 * Generate a random daily action game
 * @param index Index for generating unique ID
 * @returns Random daily action game
 */
const generateDailyActionGame = (index: number): DailyActionGame => {
  // Generate a random timestamp within the last 30 days
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));

  // Random player ID between 1000 and 2000
  const playerId = 1000 + Math.floor(Math.random() * 1000);
  
  // Random game ID between 2000 and 3000
  const gameId = 2000 + Math.floor(Math.random() * 1000);
  
  // Random platform
  const platform = platforms[Math.floor(Math.random() * platforms.length)];
  
  // Random bet amounts
  const realBetAmount = Math.floor(Math.random() * 1000) + 10;
  const realWinAmount = Math.floor(Math.random() * 800) + 5;
  const bonusBetAmount = Math.floor(Math.random() * 200) + 5;
  const bonusWinAmount = Math.floor(Math.random() * 150) + 2;
  
  // Calculate net gaming revenue
  const netGamingRevenue = realBetAmount - realWinAmount + bonusBetAmount - bonusWinAmount;
  
  // Random counts
  const numberOfRealBets = Math.floor(Math.random() * 20) + 1;
  const numberOfBonusBets = Math.floor(Math.random() * 10) + 1;
  const numberOfSessions = Math.floor(Math.random() * 5) + 1;
  const numberOfRealWins = Math.floor(Math.random() * 15) + 1;
  const numberOfBonusWins = Math.floor(Math.random() * 8) + 1;

  return {
    id: index + 1,
    gameDate: date.toISOString(),
    playerId,
    gameId,
    platform,
    realBetAmount,
    realWinAmount,
    bonusBetAmount,
    bonusWinAmount,
    netGamingRevenue,
    numberOfRealBets,
    numberOfBonusBets,
    numberOfSessions,
    numberOfRealWins,
    numberOfBonusWins,
    realBetAmountOriginal: realBetAmount,
    realWinAmountOriginal: realWinAmount,
    bonusBetAmountOriginal: bonusBetAmount,
    bonusWinAmountOriginal: bonusWinAmount,
    netGamingRevenueOriginal: netGamingRevenue,
    updateDate: new Date().toISOString()
  };
};

/**
 * Generate mock daily action games
 * @param count Number of games to generate
 * @returns Array of mock daily action games
 */
const generateDailyActionGames = (count: number): DailyActionGame[] => {
  const games: DailyActionGame[] = [];

  for (let i = 0; i < count; i++) {
    games.push(generateDailyActionGame(i));
  }

  // Sort by date (newest first)
  return games.sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime());
};

/**
 * Get mock data for daily action games report
 * @param params Parameters for filtering and pagination
 * @returns Filtered and paginated daily action games data
 */
const getData = (params?: any): any => {
  console.log('[DAILY ACTION GAMES MOCK] Getting data with params:', params);

  // Generate 50 games
  const games = generateDailyActionGames(50);

  // Apply filters if provided
  let filteredGames = [...games];

  if (params?.startDate) {
    const startDate = new Date(params.startDate);
    filteredGames = filteredGames.filter(game => new Date(game.gameDate) >= startDate);
  }

  if (params?.endDate) {
    const endDate = new Date(params.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day
    filteredGames = filteredGames.filter(game => new Date(game.gameDate) <= endDate);
  }

  if (params?.playerId) {
    filteredGames = filteredGames.filter(game => game.playerId === parseInt(params.playerId, 10));
  }

  if (params?.gameId) {
    filteredGames = filteredGames.filter(game => game.gameId === parseInt(params.gameId, 10));
  }

  // Format the response to match the expected structure
  const result = {
    data: filteredGames,
    totalCount: filteredGames.length,
    startDate: params?.startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: params?.endDate || new Date().toISOString().split('T')[0]
  };

  console.log('[DAILY ACTION GAMES MOCK] Returning data:', result);
  return result;
};

export default {
  getData,
  generateDailyActionGames
};
