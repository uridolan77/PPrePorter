import {
  TimeSeriesDataPoint,
  GamePerformanceDataPoint,
  PlayerSegmentDataPoint,
  GeoDataPoint,
  SampleData
} from '../../../types/dataExplorer';

/**
 * Generates sample time series data
 * @param days Number of days to generate data for
 * @returns Array of time series data points
 */
export const generateSampleTimeSeriesData = (days = 30): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const deposits = 15000 + Math.random() * 8000;
    const withdrawals = 12000 + Math.random() * 6000;
    const newUsers = 100 + Math.random() * 80;
    const activeUsers = 1500 + Math.random() * 300;
    
    data.push({
      date: date.toISOString().split('T')[0],
      deposits,
      withdrawals,
      newUsers,
      activeUsers,
      profit: deposits - withdrawals,
      betCount: 12000 + Math.random() * 5000
    });
  }
  
  return data;
};

/**
 * Generates sample game performance data
 * @returns Array of game performance data points
 */
export const generateGamePerformanceData = (): GamePerformanceDataPoint[] => {
  const gameTypes = [
    'Slots', 'Live Casino', 'Table Games', 'Sports Betting',
    'Poker', 'Bingo', 'Virtual Sports', 'Lottery'
  ];
  
  return gameTypes.map(type => ({
    name: type,
    revenue: Math.round(10000 + Math.random() * 90000),
    players: Math.round(500 + Math.random() * 2500),
    bets: Math.round(5000 + Math.random() * 45000),
    returnRate: 0.9 + Math.random() * 0.09,
    growth: -15 + Math.random() * 30
  }));
};

/**
 * Generates sample player segment data
 * @returns Array of player segment data points
 */
export const generatePlayerSegmentData = (): PlayerSegmentDataPoint[] => {
  return [
    { name: 'VIP', value: 15, color: '#8884d8' },
    { name: 'High Value', value: 25, color: '#83a6ed' },
    { name: 'Regular', value: 35, color: '#8dd1e1' },
    { name: 'Casual', value: 20, color: '#82ca9d' },
    { name: 'New', value: 5, color: '#ffc658' }
  ];
};

/**
 * Generates sample geographic data
 * @returns Array of geographic data points
 */
export const generateGeoData = (): GeoDataPoint[] => {
  const countries = [
    'United Kingdom', 'Germany', 'Sweden', 'Finland', 'Denmark',
    'Netherlands', 'Spain', 'Italy', 'France', 'Canada'
  ];
  
  return countries.map(country => ({
    country,
    players: Math.round(200 + Math.random() * 1800),
    revenue: Math.round(5000 + Math.random() * 45000),
    deposits: Math.round(7000 + Math.random() * 55000),
    withdrawals: Math.round(5000 + Math.random() * 40000),
    bonusAmount: Math.round(1000 + Math.random() * 9000)
  }));
};

/**
 * Generates all sample data
 * @returns Sample data object
 */
export const generateSampleData = (): SampleData => {
  return {
    timeSeriesData: generateSampleTimeSeriesData(),
    gamePerformanceData: generateGamePerformanceData(),
    playerSegmentData: generatePlayerSegmentData(),
    geoData: generateGeoData()
  };
};

// Default sample data
export const SAMPLE_DATA: SampleData = generateSampleData();

// Chart types
export const CHART_TYPES = [
  { id: 'line', name: 'Line Chart', icon: 'TimelineOutlinedIcon' },
  { id: 'bar', name: 'Bar Chart', icon: 'BarChartOutlinedIcon' },
  { id: 'pie', name: 'Pie Chart', icon: 'PieChartOutlinedIcon' },
  { id: 'area', name: 'Area Chart', icon: 'AssessmentOutlinedIcon' },
  { id: 'scatter', name: 'Scatter Chart', icon: 'BubbleChartOutlinedIcon' },
  { id: 'map', name: 'Map View', icon: 'MapOutlinedIcon' },
  { id: 'table', name: 'Table View', icon: 'TableChartOutlinedIcon' }
];

// Colors for charts
export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];

// Add suggested queries for natural language search
export const SUGGESTED_NL_QUERIES: string[] = [
  "Show me deposits trend for the last month",
  "Which game type has the highest revenue?",
  "Compare VIP vs regular player segments",
  "What's the withdrawal to deposit ratio?",
  "Show countries with highest player counts"
];
