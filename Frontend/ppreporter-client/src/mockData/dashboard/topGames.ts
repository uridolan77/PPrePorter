/**
 * Top Games Mock Data
 */

/**
 * Mock game categories
 */
const gameCategories = [
  'slots',
  'table',
  'live',
  'poker',
  'sports',
  'arcade'
];

/**
 * Mock game providers
 */
const gameProviders = [
  'NetEnt',
  'Microgaming',
  'Playtech',
  'Evolution Gaming',
  'Pragmatic Play',
  'Yggdrasil',
  'Play\'n GO',
  'Red Tiger'
];

/**
 * Mock games data
 */
const games = [
  {
    id: 'game-1',
    name: 'Starburst',
    category: 'slots',
    provider: 'NetEnt',
    revenue: 125000,
    players: 8500,
    bets: 45000,
    rtp: 0.96,
    popularity: 9.8,
    releaseDate: '2012-01-15',
    image: 'https://via.placeholder.com/150?text=Starburst'
  },
  {
    id: 'game-2',
    name: 'Gonzo\'s Quest',
    category: 'slots',
    provider: 'NetEnt',
    revenue: 110000,
    players: 7800,
    bets: 42000,
    rtp: 0.95,
    popularity: 9.6,
    releaseDate: '2013-05-20',
    image: 'https://via.placeholder.com/150?text=Gonzo'
  },
  {
    id: 'game-3',
    name: 'Book of Dead',
    category: 'slots',
    provider: 'Play\'n GO',
    revenue: 95000,
    players: 7200,
    bets: 38000,
    rtp: 0.94,
    popularity: 9.5,
    releaseDate: '2014-11-10',
    image: 'https://via.placeholder.com/150?text=BookOfDead'
  },
  {
    id: 'game-4',
    name: 'Blackjack VIP',
    category: 'table',
    provider: 'Evolution Gaming',
    revenue: 85000,
    players: 5500,
    bets: 32000,
    rtp: 0.99,
    popularity: 9.3,
    releaseDate: '2015-03-25',
    image: 'https://via.placeholder.com/150?text=BlackjackVIP'
  },
  {
    id: 'game-5',
    name: 'Lightning Roulette',
    category: 'live',
    provider: 'Evolution Gaming',
    revenue: 78000,
    players: 6200,
    bets: 30000,
    rtp: 0.97,
    popularity: 9.4,
    releaseDate: '2018-02-15',
    image: 'https://via.placeholder.com/150?text=LightningRoulette'
  },
  {
    id: 'game-6',
    name: 'Mega Moolah',
    category: 'slots',
    provider: 'Microgaming',
    revenue: 72000,
    players: 5800,
    bets: 28000,
    rtp: 0.93,
    popularity: 9.2,
    releaseDate: '2008-11-28',
    image: 'https://via.placeholder.com/150?text=MegaMoolah'
  },
  {
    id: 'game-7',
    name: 'Texas Hold\'em',
    category: 'poker',
    provider: 'Playtech',
    revenue: 68000,
    players: 4900,
    bets: 25000,
    rtp: 0.98,
    popularity: 9.0,
    releaseDate: '2010-07-12',
    image: 'https://via.placeholder.com/150?text=TexasHoldem'
  },
  {
    id: 'game-8',
    name: 'Football Studio',
    category: 'live',
    provider: 'Evolution Gaming',
    revenue: 65000,
    players: 5100,
    bets: 24000,
    rtp: 0.96,
    popularity: 8.9,
    releaseDate: '2019-06-05',
    image: 'https://via.placeholder.com/150?text=FootballStudio'
  },
  {
    id: 'game-9',
    name: 'Sweet Bonanza',
    category: 'slots',
    provider: 'Pragmatic Play',
    revenue: 62000,
    players: 5300,
    bets: 23000,
    rtp: 0.95,
    popularity: 9.1,
    releaseDate: '2019-06-25',
    image: 'https://via.placeholder.com/150?text=SweetBonanza'
  },
  {
    id: 'game-10',
    name: 'Immortal Romance',
    category: 'slots',
    provider: 'Microgaming',
    revenue: 58000,
    players: 4800,
    bets: 22000,
    rtp: 0.94,
    popularity: 8.8,
    releaseDate: '2011-12-05',
    image: 'https://via.placeholder.com/150?text=ImmortalRomance'
  },
  {
    id: 'game-11',
    name: 'Crazy Time',
    category: 'live',
    provider: 'Evolution Gaming',
    revenue: 55000,
    players: 4600,
    bets: 21000,
    rtp: 0.95,
    popularity: 9.0,
    releaseDate: '2020-06-10',
    image: 'https://via.placeholder.com/150?text=CrazyTime'
  },
  {
    id: 'game-12',
    name: 'Vikings Go Berzerk',
    category: 'slots',
    provider: 'Yggdrasil',
    revenue: 52000,
    players: 4400,
    bets: 20000,
    rtp: 0.96,
    popularity: 8.7,
    releaseDate: '2016-11-22',
    image: 'https://via.placeholder.com/150?text=VikingsGoBerzerk'
  },
  {
    id: 'game-13',
    name: 'European Roulette',
    category: 'table',
    provider: 'Playtech',
    revenue: 48000,
    players: 4200,
    bets: 19000,
    rtp: 0.97,
    popularity: 8.6,
    releaseDate: '2009-03-15',
    image: 'https://via.placeholder.com/150?text=EuropeanRoulette'
  },
  {
    id: 'game-14',
    name: 'Reactoonz',
    category: 'slots',
    provider: 'Play\'n GO',
    revenue: 45000,
    players: 4000,
    bets: 18000,
    rtp: 0.96,
    popularity: 8.9,
    releaseDate: '2017-10-12',
    image: 'https://via.placeholder.com/150?text=Reactoonz'
  },
  {
    id: 'game-15',
    name: 'Monopoly Live',
    category: 'live',
    provider: 'Evolution Gaming',
    revenue: 42000,
    players: 3800,
    bets: 17000,
    rtp: 0.96,
    popularity: 8.8,
    releaseDate: '2019-05-02',
    image: 'https://via.placeholder.com/150?text=MonopolyLive'
  }
];

/**
 * Get top games based on parameters
 * @param params Parameters for filtering and sorting
 * @returns Filtered and sorted top games
 */
const getTopGames = (params?: any): any => {
  const metric = params?.metric || 'revenue';
  const limit = params?.limit || 10;
  const gameCategory = params?.gameCategory || null;
  const minRevenue = params?.minRevenue || 0;
  const maxRevenue = params?.maxRevenue || Number.MAX_SAFE_INTEGER;
  
  // Filter games
  let filteredGames = [...games];
  
  if (gameCategory) {
    filteredGames = filteredGames.filter(game => game.category === gameCategory);
  }
  
  filteredGames = filteredGames.filter(game => 
    game.revenue >= minRevenue && game.revenue <= maxRevenue
  );
  
  // Sort games based on metric
  filteredGames.sort((a, b) => {
    if (metric === 'revenue') {
      return b.revenue - a.revenue;
    } else if (metric === 'players') {
      return b.players - a.players;
    } else if (metric === 'bets') {
      return b.bets - a.bets;
    } else if (metric === 'popularity') {
      return b.popularity - a.popularity;
    } else {
      return b.revenue - a.revenue; // Default to revenue
    }
  });
  
  // Limit the number of games
  filteredGames = filteredGames.slice(0, limit);
  
  return {
    data: filteredGames,
    total: filteredGames.length,
    metric,
    category: gameCategory
  };
};

export default {
  games,
  getTopGames,
  gameCategories,
  gameProviders
};
