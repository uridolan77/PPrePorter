/**
 * Geographic Report Mock Data
 */
import { format, subDays, parseISO } from 'date-fns';
import { GeographicData, GeographicSummary, GeographicFilters, GeographicMetadata } from '../../types/geographic';

/**
 * Country data with ISO codes and regions
 */
const countries = [
  { id: 'US', name: 'United States', region: 'North America', continent: 'Americas' },
  { id: 'GB', name: 'United Kingdom', region: 'Northern Europe', continent: 'Europe' },
  { id: 'DE', name: 'Germany', region: 'Western Europe', continent: 'Europe' },
  { id: 'FR', name: 'France', region: 'Western Europe', continent: 'Europe' },
  { id: 'IT', name: 'Italy', region: 'Southern Europe', continent: 'Europe' },
  { id: 'ES', name: 'Spain', region: 'Southern Europe', continent: 'Europe' },
  { id: 'CA', name: 'Canada', region: 'North America', continent: 'Americas' },
  { id: 'AU', name: 'Australia', region: 'Oceania', continent: 'Oceania' },
  { id: 'SE', name: 'Sweden', region: 'Northern Europe', continent: 'Europe' },
  { id: 'NO', name: 'Norway', region: 'Northern Europe', continent: 'Europe' },
  { id: 'DK', name: 'Denmark', region: 'Northern Europe', continent: 'Europe' },
  { id: 'FI', name: 'Finland', region: 'Northern Europe', continent: 'Europe' },
  { id: 'NL', name: 'Netherlands', region: 'Western Europe', continent: 'Europe' },
  { id: 'BE', name: 'Belgium', region: 'Western Europe', continent: 'Europe' },
  { id: 'CH', name: 'Switzerland', region: 'Western Europe', continent: 'Europe' },
  { id: 'AT', name: 'Austria', region: 'Western Europe', continent: 'Europe' },
  { id: 'PT', name: 'Portugal', region: 'Southern Europe', continent: 'Europe' },
  { id: 'IE', name: 'Ireland', region: 'Northern Europe', continent: 'Europe' },
  { id: 'NZ', name: 'New Zealand', region: 'Oceania', continent: 'Oceania' },
  { id: 'JP', name: 'Japan', region: 'Eastern Asia', continent: 'Asia' }
];

/**
 * White label data
 */
const whiteLabels = [
  { id: 'wl-1', name: 'Casino Royale' },
  { id: 'wl-2', name: 'Lucky Spins' },
  { id: 'wl-3', name: 'Golden Palace' },
  { id: 'wl-4', name: 'Diamond Club' },
  { id: 'wl-5', name: 'Royal Flush' }
];

/**
 * Generate daily geographic data
 * @param startDate Start date
 * @param endDate End date
 * @returns Array of geographic data points
 */
export const generateDailyGeographicData = (startDate: string, endDate: string): GeographicData[] => {
  const data: GeographicData[] = [];
  
  // Parse dates
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  // Generate data for each country for each day
  const currentDate = new Date(start);
  let id = 1;
  
  while (currentDate <= end) {
    countries.forEach(country => {
      // Generate random players between 100 and 1000
      const players = Math.floor(Math.random() * 900) + 100;
      
      // Generate random new players between 10 and 100
      const newPlayers = Math.floor(Math.random() * 90) + 10;
      
      // Generate random revenue between 5000 and 50000
      const revenue = Math.floor(Math.random() * 45000) + 5000;
      
      // Generate random GGR between 1000 and 10000
      const ggr = Math.floor(Math.random() * 9000) + 1000;
      
      // Generate random NGR between 800 and 8000
      const ngr = Math.floor(Math.random() * 7200) + 800;
      
      // Generate random deposits between 10000 and 100000
      const deposits = Math.floor(Math.random() * 90000) + 10000;
      
      // Generate random withdrawals between 8000 and 80000
      const withdrawals = Math.floor(Math.random() * 72000) + 8000;
      
      // Generate random bonus amount between 500 and 5000
      const bonusAmount = Math.floor(Math.random() * 4500) + 500;
      
      // Generate random bets between 20000 and 200000
      const bets = Math.floor(Math.random() * 180000) + 20000;
      
      // Generate random wins between 18000 and 180000
      const wins = Math.floor(Math.random() * 162000) + 18000;
      
      // Calculate win rate
      const winRate = wins / bets;
      
      // Generate random average bet between 10 and 100
      const avgBet = Math.floor(Math.random() * 90) + 10;
      
      // Generate random average win between 9 and 90
      const avgWin = Math.floor(Math.random() * 81) + 9;
      
      data.push({
        id: `geo-${id}`,
        date: format(currentDate, 'yyyy-MM-dd'),
        countryId: country.id,
        countryName: country.name,
        players,
        newPlayers,
        revenue,
        ggr,
        ngr,
        deposits,
        withdrawals,
        netDeposits: deposits - withdrawals,
        bonusAmount,
        bets,
        wins,
        winRate,
        avgBet,
        avgWin,
        region: country.region,
        continent: country.continent
      });
      
      id++;
    });
    
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
};

/**
 * Generate country geographic data
 * @returns Array of geographic data points
 */
export const generateCountryGeographicData = (): GeographicData[] => {
  return countries.map((country, index) => {
    // Generate random players between 1000 and 10000
    const players = Math.floor(Math.random() * 9000) + 1000;
    
    // Generate random new players between 100 and 1000
    const newPlayers = Math.floor(Math.random() * 900) + 100;
    
    // Generate random revenue between 50000 and 500000
    const revenue = Math.floor(Math.random() * 450000) + 50000;
    
    // Generate random GGR between 10000 and 100000
    const ggr = Math.floor(Math.random() * 90000) + 10000;
    
    // Generate random NGR between 8000 and 80000
    const ngr = Math.floor(Math.random() * 72000) + 8000;
    
    // Generate random deposits between 100000 and 1000000
    const deposits = Math.floor(Math.random() * 900000) + 100000;
    
    // Generate random withdrawals between 80000 and 800000
    const withdrawals = Math.floor(Math.random() * 720000) + 80000;
    
    // Generate random bonus amount between 5000 and 50000
    const bonusAmount = Math.floor(Math.random() * 45000) + 5000;
    
    // Generate random bets between 200000 and 2000000
    const bets = Math.floor(Math.random() * 1800000) + 200000;
    
    // Generate random wins between 180000 and 1800000
    const wins = Math.floor(Math.random() * 1620000) + 180000;
    
    // Calculate win rate
    const winRate = wins / bets;
    
    // Generate random average bet between 10 and 100
    const avgBet = Math.floor(Math.random() * 90) + 10;
    
    // Generate random average win between 9 and 90
    const avgWin = Math.floor(Math.random() * 81) + 9;
    
    return {
      id: `geo-country-${index + 1}`,
      date: format(new Date(), 'yyyy-MM-dd'),
      countryId: country.id,
      countryName: country.name,
      players,
      newPlayers,
      revenue,
      ggr,
      ngr,
      deposits,
      withdrawals,
      netDeposits: deposits - withdrawals,
      bonusAmount,
      bets,
      wins,
      winRate,
      avgBet,
      avgWin,
      region: country.region,
      continent: country.continent
    };
  });
};

/**
 * Calculate geographic summary
 * @param data Geographic data
 * @returns Geographic summary
 */
export const calculateGeographicSummary = (data: GeographicData[]): GeographicSummary => {
  return {
    totalPlayers: data.reduce((sum, item) => sum + item.players, 0),
    totalNewPlayers: data.reduce((sum, item) => sum + (item.newPlayers || 0), 0),
    totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
    totalGGR: data.reduce((sum, item) => sum + (item.ggr || 0), 0),
    totalNGR: data.reduce((sum, item) => sum + (item.ngr || 0), 0),
    totalDeposits: data.reduce((sum, item) => sum + item.deposits, 0),
    totalWithdrawals: data.reduce((sum, item) => sum + item.withdrawals, 0),
    totalNetDeposits: data.reduce((sum, item) => sum + (item.netDeposits || 0), 0),
    totalBonusAmount: data.reduce((sum, item) => sum + (item.bonusAmount || 0), 0),
    totalBets: data.reduce((sum, item) => sum + (item.bets || 0), 0),
    totalWins: data.reduce((sum, item) => sum + (item.wins || 0), 0),
    overallWinRate: data.reduce((sum, item) => sum + (item.bets || 0), 0) > 0 
      ? data.reduce((sum, item) => sum + (item.wins || 0), 0) / data.reduce((sum, item) => sum + (item.bets || 0), 0)
      : 0,
    avgBet: data.length > 0 
      ? data.reduce((sum, item) => sum + (item.avgBet || 0), 0) / data.length
      : 0,
    avgWin: data.length > 0 
      ? data.reduce((sum, item) => sum + (item.avgWin || 0), 0) / data.length
      : 0
  };
};

/**
 * Get geographic metadata
 * @returns Geographic metadata
 */
export const getGeographicMetadata = (): GeographicMetadata => {
  return {
    countries,
    whiteLabels,
    regions: Array.from(new Set(countries.map(country => country.region))).map(region => ({
      id: region,
      name: region
    })),
    continents: Array.from(new Set(countries.map(country => country.continent))).map(continent => ({
      id: continent,
      name: continent
    }))
  };
};

/**
 * Get geographic data based on filters
 * @param filters Geographic filters
 * @returns Object with data and summary
 */
export const getGeographicData = (filters: GeographicFilters) => {
  let data: GeographicData[] = [];
  
  // Generate data based on groupBy
  if (filters.groupBy === 'country') {
    data = generateCountryGeographicData();
  } else {
    data = generateDailyGeographicData(filters.startDate, filters.endDate);
  }
  
  // Apply country filter if provided
  if (filters.countryIds && filters.countryIds.length > 0) {
    data = data.filter(item => 
      filters.countryIds?.includes(item.countryId)
    );
  }
  
  // Apply region filter if provided
  if (filters.regions && filters.regions.length > 0) {
    data = data.filter(item => 
      item.region && filters.regions?.includes(item.region)
    );
  }
  
  // Apply continent filter if provided
  if (filters.continents && filters.continents.length > 0) {
    data = data.filter(item => 
      item.continent && filters.continents?.includes(item.continent)
    );
  }
  
  // Calculate summary
  const summary = calculateGeographicSummary(data);
  
  return {
    data,
    summary,
    metadata: getGeographicMetadata()
  };
};

export default {
  generateDailyGeographicData,
  generateCountryGeographicData,
  calculateGeographicSummary,
  getGeographicMetadata,
  getGeographicData
};
