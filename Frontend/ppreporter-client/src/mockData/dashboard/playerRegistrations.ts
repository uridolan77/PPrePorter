/**
 * Player Registrations Mock Data
 */

/**
 * Generate mock player registrations data
 * @param params Optional parameters for customizing the data
 * @returns Mock player registrations data
 */
const getRegistrationsData = (params?: any): any => {
  const period = params?.period || 'month';
  const startDate = params?.startDate || '2023-01-01';
  const endDate = params?.endDate || '2023-06-30';
  
  // Generate data based on the period
  switch (period) {
    case 'day':
      return generateDailyData(startDate, endDate);
    case 'week':
      return generateWeeklyData(startDate, endDate);
    case 'month':
    default:
      return generateMonthlyData(startDate, endDate);
  }
};

/**
 * Generate daily player registrations data
 * @param startDate Start date
 * @param endDate End date
 * @returns Daily player registrations data
 */
const generateDailyData = (startDate: string, endDate: string): any => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data = [];
  
  // Generate data for each day
  const currentDate = new Date(start);
  while (currentDate <= end) {
    // Generate a random number of registrations between 50 and 500
    const registrations = Math.floor(Math.random() * 450) + 50;
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      registrations
    });
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return {
    data,
    period: 'day',
    startDate: startDate,
    endDate: endDate,
    total: data.reduce((sum, item) => sum + item.registrations, 0)
  };
};

/**
 * Generate weekly player registrations data
 * @param startDate Start date
 * @param endDate End date
 * @returns Weekly player registrations data
 */
const generateWeeklyData = (startDate: string, endDate: string): any => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data = [];
  
  // Generate data for each week
  const currentDate = new Date(start);
  let weekNumber = 1;
  
  while (currentDate <= end) {
    // Generate a random number of registrations between 500 and 2500
    const registrations = Math.floor(Math.random() * 2000) + 500;
    
    data.push({
      week: weekNumber,
      startDate: currentDate.toISOString().split('T')[0],
      endDate: new Date(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      registrations
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
    total: data.reduce((sum, item) => sum + item.registrations, 0)
  };
};

/**
 * Generate monthly player registrations data
 * @param startDate Start date
 * @param endDate End date
 * @returns Monthly player registrations data
 */
const generateMonthlyData = (startDate: string, endDate: string): any => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data = [];
  
  // Generate data for each month
  const currentDate = new Date(start);
  currentDate.setDate(1); // Start from the first day of the month
  
  while (currentDate <= end) {
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    
    // Generate a random number of registrations between 2000 and 8000
    const registrations = Math.floor(Math.random() * 6000) + 2000;
    
    data.push({
      month,
      year,
      date: `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
      registrations
    });
    
    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return {
    data,
    period: 'month',
    startDate: startDate,
    endDate: endDate,
    total: data.reduce((sum, item) => sum + item.registrations, 0)
  };
};

// Sample monthly data
const monthlyData = {
  data: [
    { month: 'January', year: 2023, date: '2023-01', registrations: 3500 },
    { month: 'February', year: 2023, date: '2023-02', registrations: 4200 },
    { month: 'March', year: 2023, date: '2023-03', registrations: 5100 },
    { month: 'April', year: 2023, date: '2023-04', registrations: 4800 },
    { month: 'May', year: 2023, date: '2023-05', registrations: 5500 },
    { month: 'June', year: 2023, date: '2023-06', registrations: 6200 }
  ],
  period: 'month',
  startDate: '2023-01-01',
  endDate: '2023-06-30',
  total: 29300
};

export default {
  getRegistrationsData,
  monthlyData
};
