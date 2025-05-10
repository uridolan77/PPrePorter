/**
 * Casino Revenue Mock Data
 */

/**
 * Generate mock revenue data
 * @param params Parameters for customizing the data
 * @returns Mock revenue data
 */
const getRevenueData = (params?: any): any => {
  const period = params?.period || 'month';
  const startDate = params?.startDate || '2023-01-01';
  const endDate = params?.endDate || '2023-06-30';
  const gameCategory = params?.gameCategory || null;
  
  // Generate data based on the period
  switch (period) {
    case 'day':
      return generateDailyData(startDate, endDate, gameCategory);
    case 'week':
      return generateWeeklyData(startDate, endDate, gameCategory);
    case 'month':
    default:
      return generateMonthlyData(startDate, endDate, gameCategory);
  }
};

/**
 * Generate daily revenue data
 * @param startDate Start date
 * @param endDate End date
 * @param gameCategory Game category filter
 * @returns Daily revenue data
 */
const generateDailyData = (startDate: string, endDate: string, gameCategory?: string): any => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data = [];
  
  // Generate data for each day
  const currentDate = new Date(start);
  while (currentDate <= end) {
    // Generate random revenue between 10000 and 50000
    const revenue = Math.floor(Math.random() * 40000) + 10000;
    
    // Generate random player count between 500 and 2000
    const players = Math.floor(Math.random() * 1500) + 500;
    
    // Generate random bet count between 5000 and 20000
    const bets = Math.floor(Math.random() * 15000) + 5000;
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      revenue,
      players,
      bets
    });
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return {
    data,
    period: 'day',
    startDate: startDate,
    endDate: endDate,
    category: gameCategory,
    total: {
      revenue: data.reduce((sum, item) => sum + item.revenue, 0),
      players: data.reduce((sum, item) => sum + item.players, 0),
      bets: data.reduce((sum, item) => sum + item.bets, 0)
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
const generateWeeklyData = (startDate: string, endDate: string, gameCategory?: string): any => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data = [];
  
  // Generate data for each week
  const currentDate = new Date(start);
  let weekNumber = 1;
  
  while (currentDate <= end) {
    // Generate random revenue between 50000 and 200000
    const revenue = Math.floor(Math.random() * 150000) + 50000;
    
    // Generate random player count between 2000 and 8000
    const players = Math.floor(Math.random() * 6000) + 2000;
    
    // Generate random bet count between 20000 and 80000
    const bets = Math.floor(Math.random() * 60000) + 20000;
    
    data.push({
      week: weekNumber,
      startDate: currentDate.toISOString().split('T')[0],
      endDate: new Date(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue,
      players,
      bets
    });
    
    // Move to the next week
    currentDate.setDate(currentDate.getDate() + 7);
    weekNumber++;
  }
  
  return {
    data,
    period: 'week',
    startDate: startDate,
    endDate: endDate,
    category: gameCategory,
    total: {
      revenue: data.reduce((sum, item) => sum + item.revenue, 0),
      players: data.reduce((sum, item) => sum + item.players, 0),
      bets: data.reduce((sum, item) => sum + item.bets, 0)
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
const generateMonthlyData = (startDate: string, endDate: string, gameCategory?: string): any => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data = [];
  
  // Generate data for each month
  const currentDate = new Date(start);
  currentDate.setDate(1); // Start from the first day of the month
  
  while (currentDate <= end) {
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    
    // Generate random revenue between 200000 and 800000
    const revenue = Math.floor(Math.random() * 600000) + 200000;
    
    // Generate random player count between 8000 and 25000
    const players = Math.floor(Math.random() * 17000) + 8000;
    
    // Generate random bet count between 80000 and 250000
    const bets = Math.floor(Math.random() * 170000) + 80000;
    
    data.push({
      month,
      year,
      date: `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
      revenue,
      players,
      bets
    });
    
    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return {
    data,
    period: 'month',
    startDate: startDate,
    endDate: endDate,
    category: gameCategory,
    total: {
      revenue: data.reduce((sum, item) => sum + item.revenue, 0),
      players: data.reduce((sum, item) => sum + item.players, 0),
      bets: data.reduce((sum, item) => sum + item.bets, 0)
    }
  };
};

// Sample monthly data
const monthlyData = {
  data: [
    { month: 'January', year: 2023, date: '2023-01', revenue: 350000, players: 12000, bets: 120000 },
    { month: 'February', year: 2023, date: '2023-02', revenue: 420000, players: 14500, bets: 145000 },
    { month: 'March', year: 2023, date: '2023-03', revenue: 510000, players: 16800, bets: 168000 },
    { month: 'April', year: 2023, date: '2023-04', revenue: 480000, players: 15500, bets: 155000 },
    { month: 'May', year: 2023, date: '2023-05', revenue: 550000, players: 18200, bets: 182000 },
    { month: 'June', year: 2023, date: '2023-06', revenue: 620000, players: 20500, bets: 205000 }
  ],
  period: 'month',
  startDate: '2023-01-01',
  endDate: '2023-06-30',
  category: null,
  total: {
    revenue: 2930000,
    players: 97500,
    bets: 975000
  }
};

export default {
  getRevenueData,
  monthlyData
};
