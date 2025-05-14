/**
 * Financial Report Mock Data
 */
import { format, subDays, addDays, parseISO } from 'date-fns';
import { FinancialData, FinancialSummary, FinancialFilters } from '../../types/financial';

/**
 * Generate daily financial data
 * @param startDate Start date
 * @param endDate End date
 * @returns Array of financial data points
 */
export const generateDailyFinancialData = (startDate: string, endDate: string): FinancialData[] => {
  const data: FinancialData[] = [];
  
  // Parse dates
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  // Generate data for each day
  const currentDate = new Date(start);
  let id = 1;
  
  while (currentDate <= end) {
    // Generate random revenue between 10000 and 50000
    const revenue = Math.floor(Math.random() * 40000) + 10000;
    
    // Generate random GGR between 3000 and 15000
    const ggr = Math.floor(Math.random() * 12000) + 3000;
    
    // Generate random NGR between 2000 and 10000
    const ngr = Math.floor(Math.random() * 8000) + 2000;
    
    // Generate random deposit amount between 20000 and 80000
    const deposits = Math.floor(Math.random() * 60000) + 20000;
    
    // Generate random withdrawal amount between 15000 and 60000
    const withdrawals = Math.floor(Math.random() * 45000) + 15000;
    
    // Generate random bonus amount between 1000 and 5000
    const bonusAmount = Math.floor(Math.random() * 4000) + 1000;
    
    // Generate random marketing cost between 2000 and 8000
    const marketingCost = Math.floor(Math.random() * 6000) + 2000;
    
    // Generate random operational cost between 5000 and 15000
    const operationalCost = Math.floor(Math.random() * 10000) + 5000;
    
    // Calculate net profit
    const netProfit = ngr - marketingCost - operationalCost;
    
    // Generate random tax amount between 500 and 2000
    const taxAmount = Math.floor(Math.random() * 1500) + 500;
    
    data.push({
      id: `fin-${id}`,
      date: format(currentDate, 'yyyy-MM-dd'),
      revenue,
      ggr,
      ngr,
      deposits,
      withdrawals,
      netDeposits: deposits - withdrawals,
      bonusAmount,
      marketingCost,
      operationalCost,
      netProfit,
      taxAmount,
      currency: 'USD'
    });
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
    id++;
  }
  
  return data;
};

/**
 * Generate financial data by white label
 * @param startDate Start date
 * @param endDate End date
 * @returns Array of financial data points
 */
export const generateWhiteLabelFinancialData = (startDate: string, endDate: string): FinancialData[] => {
  const whiteLabels = [
    { id: 'wl-1', name: 'Casino Royale' },
    { id: 'wl-2', name: 'Lucky Spin' },
    { id: 'wl-3', name: 'Golden Palace' },
    { id: 'wl-4', name: 'Silver Star' },
    { id: 'wl-5', name: 'Diamond Club' }
  ];
  
  return whiteLabels.map((whiteLabel, index) => {
    // Generate random revenue between 50000 and 200000
    const revenue = Math.floor(Math.random() * 150000) + 50000;
    
    // Generate random GGR between 15000 and 60000
    const ggr = Math.floor(Math.random() * 45000) + 15000;
    
    // Generate random NGR between 10000 and 40000
    const ngr = Math.floor(Math.random() * 30000) + 10000;
    
    // Generate random deposit amount between 100000 and 400000
    const deposits = Math.floor(Math.random() * 300000) + 100000;
    
    // Generate random withdrawal amount between 80000 and 320000
    const withdrawals = Math.floor(Math.random() * 240000) + 80000;
    
    // Generate random bonus amount between 5000 and 20000
    const bonusAmount = Math.floor(Math.random() * 15000) + 5000;
    
    // Generate random marketing cost between 10000 and 40000
    const marketingCost = Math.floor(Math.random() * 30000) + 10000;
    
    // Generate random operational cost between 20000 and 60000
    const operationalCost = Math.floor(Math.random() * 40000) + 20000;
    
    // Calculate net profit
    const netProfit = ngr - marketingCost - operationalCost;
    
    // Generate random tax amount between 2000 and 8000
    const taxAmount = Math.floor(Math.random() * 6000) + 2000;
    
    return {
      id: `fin-wl-${index + 1}`,
      date: format(new Date(), 'yyyy-MM-dd'),
      whiteLabelId: whiteLabel.id,
      whiteLabelName: whiteLabel.name,
      revenue,
      ggr,
      ngr,
      deposits,
      withdrawals,
      netDeposits: deposits - withdrawals,
      bonusAmount,
      marketingCost,
      operationalCost,
      netProfit,
      taxAmount,
      currency: 'USD'
    };
  });
};

/**
 * Calculate financial summary
 * @param data Financial data
 * @returns Financial summary
 */
export const calculateFinancialSummary = (data: FinancialData[]): FinancialSummary => {
  return {
    totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
    totalGGR: data.reduce((sum, item) => sum + item.ggr, 0),
    totalNGR: data.reduce((sum, item) => sum + item.ngr, 0),
    totalDeposits: data.reduce((sum, item) => sum + item.deposits, 0),
    totalWithdrawals: data.reduce((sum, item) => sum + item.withdrawals, 0),
    totalNetDeposits: data.reduce((sum, item) => sum + item.netDeposits, 0),
    totalBonusAmount: data.reduce((sum, item) => sum + (item.bonusAmount || 0), 0),
    totalMarketingCost: data.reduce((sum, item) => sum + (item.marketingCost || 0), 0),
    totalOperationalCost: data.reduce((sum, item) => sum + (item.operationalCost || 0), 0),
    totalNetProfit: data.reduce((sum, item) => sum + (item.netProfit || 0), 0),
    totalTaxAmount: data.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
  };
};

/**
 * Get financial data based on filters
 * @param filters Financial filters
 * @returns Object with data and summary
 */
export const getFinancialData = (filters: FinancialFilters) => {
  let data: FinancialData[] = [];
  
  // Generate data based on groupBy
  if (filters.groupBy === 'whiteLabel') {
    data = generateWhiteLabelFinancialData(filters.startDate, filters.endDate);
  } else {
    data = generateDailyFinancialData(filters.startDate, filters.endDate);
  }
  
  // Apply white label filter if provided
  if (filters.whiteLabelIds && filters.whiteLabelIds.length > 0) {
    data = data.filter(item => 
      item.whiteLabelId && filters.whiteLabelIds?.includes(item.whiteLabelId)
    );
  }
  
  // Calculate summary
  const summary = calculateFinancialSummary(data);
  
  return {
    data,
    summary
  };
};

export default {
  generateDailyFinancialData,
  generateWhiteLabelFinancialData,
  calculateFinancialSummary,
  getFinancialData
};
