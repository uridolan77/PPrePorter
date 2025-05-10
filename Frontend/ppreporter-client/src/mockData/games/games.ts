/**
 * Games Mock Data
 */
import topGamesMockData from '../dashboard/topGames';

/**
 * Get mock games data
 * @param params Parameters for filtering and pagination
 * @returns Filtered and paginated games data
 */
const getGames = (params?: any): any => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const category = params?.category;
  const provider = params?.provider;
  const searchTerm = params?.searchTerm;
  
  // Use the games from topGamesMockData
  let games = [...topGamesMockData.games];
  
  // Apply filters
  if (category) {
    games = games.filter(game => game.category === category);
  }
  
  if (provider) {
    games = games.filter(game => game.provider === provider);
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    games = games.filter(game => 
      game.name.toLowerCase().includes(term)
    );
  }
  
  // Calculate pagination
  const total = games.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedGames = games.slice(startIndex, endIndex);
  
  return {
    data: paginatedGames,
    total,
    page,
    pageSize,
    totalPages
  };
};

export default {
  getGames,
  gameCategories: topGamesMockData.gameCategories,
  gameProviders: topGamesMockData.gameProviders
};
