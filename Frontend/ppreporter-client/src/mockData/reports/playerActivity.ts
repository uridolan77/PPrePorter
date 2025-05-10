/**
 * Player Activity Report Mock Data
 */

/**
 * Get mock data for player activity report
 * @param params Parameters for filtering and pagination
 * @returns Filtered and paginated player activity data
 */
const getData = (params?: any): any => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const startDate = params?.startDate;
  const endDate = params?.endDate;
  const playerId = params?.playerId;
  const gameCategory = params?.gameCategory;

  // Generate player activity data
  let activities = generatePlayerActivities(100);

  // Apply filters
  if (startDate) {
    const start = new Date(startDate);
    activities = activities.filter(activity => new Date(activity.date) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    activities = activities.filter(activity => new Date(activity.date) <= end);
  }

  if (playerId) {
    activities = activities.filter(activity => activity.playerId === playerId);
  }

  if (gameCategory) {
    activities = activities.filter(activity => activity.gameCategory === gameCategory);
  }

  // Calculate pagination
  const total = activities.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivities = activities.slice(startIndex, endIndex);

  return {
    data: paginatedActivities,
    total,
    page,
    pageSize,
    totalPages
  };
};

/**
 * Generate mock player activities
 * @param count Number of activities to generate
 * @returns Array of mock player activities
 */
const generatePlayerActivities = (count: number): any[] => {
  const activities = [];
  const today = new Date();

  // Game categories
  const gameCategories = ['slots', 'table', 'live', 'poker', 'sports', 'arcade'];

  // Devices
  const devices = ['Desktop', 'Mobile - Android', 'Mobile - iOS', 'Tablet - Android', 'Tablet - iOS'];

  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(today.getDate() - Math.floor(Math.random() * 30));

    // Random player ID
    const playerId = `player-${Math.floor(Math.random() * 1000) + 1}`;

    // Random player username
    const playerUsername = `user${Math.floor(Math.random() * 1000) + 1}`;

    // Random session duration between 5 and 120 minutes
    const sessionDuration = Math.floor(Math.random() * 115) + 5;

    // Random game category
    const gameCategory = gameCategories[Math.floor(Math.random() * gameCategories.length)] as 'slots' | 'table' | 'live' | 'poker' | 'sports' | 'arcade';

    // Random game name
    const gameNames: Record<string, string[]> = {
      slots: ['Starburst', 'Gonzo\'s Quest', 'Book of Dead', 'Mega Moolah', 'Reactoonz'],
      table: ['Blackjack', 'Roulette', 'Baccarat', 'Craps', 'Poker'],
      live: ['Live Blackjack', 'Live Roulette', 'Live Baccarat', 'Live Poker', 'Dream Catcher'],
      poker: ['Texas Hold\'em', 'Omaha', 'Seven Card Stud', 'Caribbean Stud', 'Three Card Poker'],
      sports: ['Football', 'Basketball', 'Tennis', 'Baseball', 'Hockey'],
      arcade: ['Crash', 'Plinko', 'Mines', 'Dice', 'Keno']
    };

    const gameName = gameNames[gameCategory][Math.floor(Math.random() * gameNames[gameCategory].length)];

    // Random bet count between 10 and 100
    const betCount = Math.floor(Math.random() * 90) + 10;

    // Random bet amount between 10 and 500
    const betAmount = Math.floor(Math.random() * 490) + 10;

    // Random win amount between 0 and bet amount * 1.5
    const winAmount = Math.floor(Math.random() * betAmount * 1.5);

    // Random device
    const device = devices[Math.floor(Math.random() * devices.length)];

    activities.push({
      id: `activity-${Date.now()}-${i}`,
      date: date.toISOString(),
      playerId,
      playerUsername,
      sessionDuration,
      gameCategory,
      gameName,
      betCount,
      betAmount,
      winAmount,
      netGaming: betAmount - winAmount,
      device
    });
  }

  // Sort by date (newest first)
  return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Get metadata for player activity report
 * @returns Metadata for player activity report
 */
const getMetadata = (): any => {
  return {
    filters: [
      {
        id: 'dateRange',
        label: 'Date Range',
        type: 'dateRange'
      },
      {
        id: 'playerId',
        label: 'Player ID',
        type: 'text'
      },
      {
        id: 'gameCategory',
        label: 'Game Category',
        type: 'select',
        options: [
          { value: 'slots', label: 'Slots' },
          { value: 'table', label: 'Table Games' },
          { value: 'live', label: 'Live Casino' },
          { value: 'poker', label: 'Poker' },
          { value: 'sports', label: 'Sports' },
          { value: 'arcade', label: 'Arcade' }
        ]
      }
    ],
    columns: [
      {
        id: 'date',
        label: 'Date',
        type: 'date',
        sortable: true,
        filterable: true
      },
      {
        id: 'playerUsername',
        label: 'Player',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'sessionDuration',
        label: 'Session Duration',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'gameCategory',
        label: 'Game Category',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'gameName',
        label: 'Game',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'betCount',
        label: 'Bet Count',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'betAmount',
        label: 'Bet Amount',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'winAmount',
        label: 'Win Amount',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'netGaming',
        label: 'Net Gaming',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'device',
        label: 'Device',
        type: 'string',
        sortable: true,
        filterable: true
      }
    ]
  };
};

export default {
  getData,
  getMetadata,
  generatePlayerActivities
};
