/**
 * Revenue Report Mock Data
 */

/**
 * Get mock data for revenue report
 * @param params Parameters for filtering and pagination
 * @returns Filtered and paginated revenue data
 */
const getData = (params?: any): any => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const startDate = params?.startDate;
  const endDate = params?.endDate;
  const gameCategory = params?.gameCategory;
  const period = params?.period || 'day';
  
  // Generate revenue data based on period
  let revenueData;
  
  switch (period) {
    case 'day':
      revenueData = generateDailyRevenueData(startDate, endDate, gameCategory);
      break;
    case 'week':
      revenueData = generateWeeklyRevenueData(startDate, endDate, gameCategory);
      break;
    case 'month':
      revenueData = generateMonthlyRevenueData(startDate, endDate, gameCategory);
      break;
    default:
      revenueData = generateDailyRevenueData(startDate, endDate, gameCategory);
  }
  
  // Calculate pagination
  const total = revenueData.data.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = revenueData.data.slice(startIndex, endIndex);
  
  return {
    ...revenueData,
    data: paginatedData,
    page,
    pageSize,
    totalPages
  };
};

/**
 * Generate daily revenue data
 * @param startDate Start date
 * @param endDate End date
 * @param gameCategory Game category filter
 * @returns Daily revenue data
 */
const generateDailyRevenueData = (startDate?: string, endDate?: string, gameCategory?: string): any => {
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(endDate) : new Date();
  const data = [];
  
  // Generate data for each day
  const currentDate = new Date(start);
  while (currentDate <= end) {
    // Generate random revenue between 10000 and 50000
    const revenue = Math.floor(Math.random() * 40000) + 10000;
    
    // Generate random GGR between 3000 and 15000
    const ggr = Math.floor(Math.random() * 12000) + 3000;
    
    // Generate random NGR between 2000 and 10000
    const ngr = Math.floor(Math.random() * 8000) + 2000;
    
    // Generate random player count between 500 and 2000
    const players = Math.floor(Math.random() * 1500) + 500;
    
    // Generate random new player count between 50 and 200
    const newPlayers = Math.floor(Math.random() * 150) + 50;
    
    // Generate random deposit amount between 20000 and 80000
    const deposits = Math.floor(Math.random() * 60000) + 20000;
    
    // Generate random withdrawal amount between 15000 and 60000
    const withdrawals = Math.floor(Math.random() * 45000) + 15000;
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      revenue,
      ggr,
      ngr,
      players,
      newPlayers,
      deposits,
      withdrawals,
      netDeposits: deposits - withdrawals
    });
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return {
    data,
    period: 'day',
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    category: gameCategory,
    total: {
      revenue: data.reduce((sum, item) => sum + item.revenue, 0),
      ggr: data.reduce((sum, item) => sum + item.ggr, 0),
      ngr: data.reduce((sum, item) => sum + item.ngr, 0),
      players: data.reduce((sum, item) => sum + item.players, 0),
      newPlayers: data.reduce((sum, item) => sum + item.newPlayers, 0),
      deposits: data.reduce((sum, item) => sum + item.deposits, 0),
      withdrawals: data.reduce((sum, item) => sum + item.withdrawals, 0),
      netDeposits: data.reduce((sum, item) => sum + item.netDeposits, 0)
    }
  };
};

/**
 * Generate weekly revenue data
 * @param startDate Start date
 * @param endDate End date
 * @param gameCategory Game category filter
 * @returns Weekly revenue data
 */
const generateWeeklyRevenueData = (startDate?: string, endDate?: string, gameCategory?: string): any => {
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 90));
  const end = endDate ? new Date(endDate) : new Date();
  const data = [];
  
  // Generate data for each week
  const currentDate = new Date(start);
  let weekNumber = 1;
  
  while (currentDate <= end) {
    // Generate random revenue between 50000 and 200000
    const revenue = Math.floor(Math.random() * 150000) + 50000;
    
    // Generate random GGR between 15000 and 60000
    const ggr = Math.floor(Math.random() * 45000) + 15000;
    
    // Generate random NGR between 10000 and 40000
    const ngr = Math.floor(Math.random() * 30000) + 10000;
    
    // Generate random player count between 2000 and 8000
    const players = Math.floor(Math.random() * 6000) + 2000;
    
    // Generate random new player count between 200 and 800
    const newPlayers = Math.floor(Math.random() * 600) + 200;
    
    // Generate random deposit amount between 100000 and 400000
    const deposits = Math.floor(Math.random() * 300000) + 100000;
    
    // Generate random withdrawal amount between 80000 and 320000
    const withdrawals = Math.floor(Math.random() * 240000) + 80000;
    
    data.push({
      week: weekNumber,
      startDate: currentDate.toISOString().split('T')[0],
      endDate: new Date(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue,
      ggr,
      ngr,
      players,
      newPlayers,
      deposits,
      withdrawals,
      netDeposits: deposits - withdrawals
    });
    
    // Move to the next week
    currentDate.setDate(currentDate.getDate() + 7);
    weekNumber++;
  }
  
  return {
    data,
    period: 'week',
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    category: gameCategory,
    total: {
      revenue: data.reduce((sum, item) => sum + item.revenue, 0),
      ggr: data.reduce((sum, item) => sum + item.ggr, 0),
      ngr: data.reduce((sum, item) => sum + item.ngr, 0),
      players: data.reduce((sum, item) => sum + item.players, 0),
      newPlayers: data.reduce((sum, item) => sum + item.newPlayers, 0),
      deposits: data.reduce((sum, item) => sum + item.deposits, 0),
      withdrawals: data.reduce((sum, item) => sum + item.withdrawals, 0),
      netDeposits: data.reduce((sum, item) => sum + item.netDeposits, 0)
    }
  };
};

/**
 * Generate monthly revenue data
 * @param startDate Start date
 * @param endDate End date
 * @param gameCategory Game category filter
 * @returns Monthly revenue data
 */
const generateMonthlyRevenueData = (startDate?: string, endDate?: string, gameCategory?: string): any => {
  const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 12));
  const end = endDate ? new Date(endDate) : new Date();
  const data = [];
  
  // Generate data for each month
  const currentDate = new Date(start);
  currentDate.setDate(1); // Start from the first day of the month
  
  while (currentDate <= end) {
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    
    // Generate random revenue between 200000 and 800000
    const revenue = Math.floor(Math.random() * 600000) + 200000;
    
    // Generate random GGR between 60000 and 240000
    const ggr = Math.floor(Math.random() * 180000) + 60000;
    
    // Generate random NGR between 40000 and 160000
    const ngr = Math.floor(Math.random() * 120000) + 40000;
    
    // Generate random player count between 8000 and 25000
    const players = Math.floor(Math.random() * 17000) + 8000;
    
    // Generate random new player count between 800 and 2500
    const newPlayers = Math.floor(Math.random() * 1700) + 800;
    
    // Generate random deposit amount between 400000 and 1600000
    const deposits = Math.floor(Math.random() * 1200000) + 400000;
    
    // Generate random withdrawal amount between 320000 and 1280000
    const withdrawals = Math.floor(Math.random() * 960000) + 320000;
    
    data.push({
      month,
      year,
      date: `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
      revenue,
      ggr,
      ngr,
      players,
      newPlayers,
      deposits,
      withdrawals,
      netDeposits: deposits - withdrawals
    });
    
    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return {
    data,
    period: 'month',
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    category: gameCategory,
    total: {
      revenue: data.reduce((sum, item) => sum + item.revenue, 0),
      ggr: data.reduce((sum, item) => sum + item.ggr, 0),
      ngr: data.reduce((sum, item) => sum + item.ngr, 0),
      players: data.reduce((sum, item) => sum + item.players, 0),
      newPlayers: data.reduce((sum, item) => sum + item.newPlayers, 0),
      deposits: data.reduce((sum, item) => sum + item.deposits, 0),
      withdrawals: data.reduce((sum, item) => sum + item.withdrawals, 0),
      netDeposits: data.reduce((sum, item) => sum + item.netDeposits, 0)
    }
  };
};

/**
 * Get metadata for revenue report
 * @returns Metadata for revenue report
 */
const getMetadata = (): any => {
  return {
    filters: [
      {
        id: 'period',
        label: 'Period',
        type: 'select',
        options: [
          { value: 'day', label: 'Daily' },
          { value: 'week', label: 'Weekly' },
          { value: 'month', label: 'Monthly' }
        ]
      },
      {
        id: 'dateRange',
        label: 'Date Range',
        type: 'dateRange'
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
        id: 'revenue',
        label: 'Revenue',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'ggr',
        label: 'GGR',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'ngr',
        label: 'NGR',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'players',
        label: 'Players',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'newPlayers',
        label: 'New Players',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'deposits',
        label: 'Deposits',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'withdrawals',
        label: 'Withdrawals',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'netDeposits',
        label: 'Net Deposits',
        type: 'number',
        sortable: true,
        filterable: true
      }
    ]
  };
};

export default {
  getData,
  getMetadata,
  generateDailyRevenueData,
  generateWeeklyRevenueData,
  generateMonthlyRevenueData
};
