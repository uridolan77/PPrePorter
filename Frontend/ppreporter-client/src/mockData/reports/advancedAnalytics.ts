/**
 * Advanced Analytics Mock Data
 */

/**
 * Sankey diagram node interface
 */
export interface SankeyNode {
  id: string;
  name: string;
  category?: string;
  value?: number;
  [key: string]: any;
}

/**
 * Sankey diagram link interface
 */
export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  [key: string]: any;
}

/**
 * Sankey diagram data interface
 */
export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

/**
 * 3D surface plot data point interface
 */
export interface SurfaceDataPoint {
  x: number;
  y: number;
  z: number;
  [key: string]: any;
}

/**
 * Time series data point interface
 */
export interface TimeSeriesDataPoint {
  date: string;
  [key: string]: any;
}

/**
 * Scatter data point interface
 */
export interface ScatterDataPoint {
  id: string;
  x: number;
  y: number;
  z?: number;
  size?: number;
  group?: string;
  label?: string;
  [key: string]: any;
}

/**
 * Generate player journey Sankey diagram data
 * @returns Sankey diagram data
 */
export const generatePlayerJourneySankey = (): SankeyData => {
  // Define nodes for player journey
  const nodes: SankeyNode[] = [
    { id: 'acquisition', name: 'Acquisition', category: 'stage' },
    { id: 'registration', name: 'Registration', category: 'stage' },
    { id: 'first_deposit', name: 'First Deposit', category: 'stage' },
    { id: 'active_play', name: 'Active Play', category: 'stage' },
    { id: 'inactive', name: 'Inactive', category: 'stage' },
    { id: 'reactivated', name: 'Reactivated', category: 'stage' },
    { id: 'churned', name: 'Churned', category: 'stage' },
    
    { id: 'organic', name: 'Organic', category: 'channel' },
    { id: 'paid_search', name: 'Paid Search', category: 'channel' },
    { id: 'social', name: 'Social Media', category: 'channel' },
    { id: 'affiliate', name: 'Affiliate', category: 'channel' },
    { id: 'referral', name: 'Referral', category: 'channel' },
    
    { id: 'slots', name: 'Slots', category: 'game_type' },
    { id: 'table_games', name: 'Table Games', category: 'game_type' },
    { id: 'live_casino', name: 'Live Casino', category: 'game_type' },
    { id: 'sports', name: 'Sports Betting', category: 'game_type' }
  ];
  
  // Define links for player journey
  const links: SankeyLink[] = [
    // Acquisition to Registration
    { source: 'organic', target: 'registration', value: 2500 },
    { source: 'paid_search', target: 'registration', value: 1800 },
    { source: 'social', target: 'registration', value: 1200 },
    { source: 'affiliate', target: 'registration', value: 2200 },
    { source: 'referral', target: 'registration', value: 800 },
    
    // Registration to First Deposit
    { source: 'registration', target: 'first_deposit', value: 4000 },
    
    // First Deposit to Active Play
    { source: 'first_deposit', target: 'active_play', value: 3500 },
    
    // First Deposit to Inactive (didn't play after deposit)
    { source: 'first_deposit', target: 'inactive', value: 500 },
    
    // Active Play to Game Types
    { source: 'active_play', target: 'slots', value: 2000 },
    { source: 'active_play', target: 'table_games', value: 600 },
    { source: 'active_play', target: 'live_casino', value: 500 },
    { source: 'active_play', target: 'sports', value: 400 },
    
    // Game Types to Inactive
    { source: 'slots', target: 'inactive', value: 800 },
    { source: 'table_games', target: 'inactive', value: 200 },
    { source: 'live_casino', target: 'inactive', value: 150 },
    { source: 'sports', target: 'inactive', value: 100 },
    
    // Game Types to Churned
    { source: 'slots', target: 'churned', value: 400 },
    { source: 'table_games', target: 'churned', value: 100 },
    { source: 'live_casino', target: 'churned', value: 75 },
    { source: 'sports', target: 'churned', value: 50 },
    
    // Inactive to Reactivated
    { source: 'inactive', target: 'reactivated', value: 600 },
    
    // Inactive to Churned
    { source: 'inactive', target: 'churned', value: 1150 },
    
    // Reactivated to Game Types
    { source: 'reactivated', target: 'slots', value: 350 },
    { source: 'reactivated', target: 'table_games', value: 100 },
    { source: 'reactivated', target: 'live_casino', value: 100 },
    { source: 'reactivated', target: 'sports', value: 50 }
  ];
  
  return { nodes, links };
};

/**
 * Generate conversion funnel Sankey diagram data
 * @returns Sankey diagram data
 */
export const generateConversionFunnelSankey = (): SankeyData => {
  // Define nodes for conversion funnel
  const nodes: SankeyNode[] = [
    { id: 'visitors', name: 'Website Visitors', category: 'funnel' },
    { id: 'signup_page', name: 'Signup Page', category: 'funnel' },
    { id: 'registration', name: 'Registration', category: 'funnel' },
    { id: 'deposit_page', name: 'Deposit Page', category: 'funnel' },
    { id: 'first_deposit', name: 'First Deposit', category: 'funnel' },
    { id: 'game_selection', name: 'Game Selection', category: 'funnel' },
    { id: 'first_game', name: 'First Game', category: 'funnel' },
    { id: 'second_deposit', name: 'Second Deposit', category: 'funnel' },
    { id: 'retained', name: 'Retained Player', category: 'funnel' }
  ];
  
  // Define links for conversion funnel
  const links: SankeyLink[] = [
    { source: 'visitors', target: 'signup_page', value: 10000 },
    { source: 'visitors', target: 'registration', value: 1000 }, // Direct registration
    { source: 'signup_page', target: 'registration', value: 3000 },
    { source: 'registration', target: 'deposit_page', value: 2500 },
    { source: 'deposit_page', target: 'first_deposit', value: 1800 },
    { source: 'first_deposit', target: 'game_selection', value: 1700 },
    { source: 'game_selection', target: 'first_game', value: 1600 },
    { source: 'first_game', target: 'second_deposit', value: 800 },
    { source: 'second_deposit', target: 'retained', value: 700 }
  ];
  
  return { nodes, links };
};

/**
 * Generate 3D revenue surface data
 * @param xPoints Number of points on x-axis
 * @param yPoints Number of points on y-axis
 * @returns Array of 3D data points
 */
export const generate3DRevenueSurface = (xPoints: number = 20, yPoints: number = 20): SurfaceDataPoint[] => {
  const data: SurfaceDataPoint[] = [];
  
  // X-axis: Days of week (0-6)
  // Y-axis: Hours of day (0-23)
  // Z-axis: Revenue
  
  for (let x = 0; x < xPoints; x++) {
    for (let y = 0; y < yPoints; y++) {
      // Normalize x and y to 0-1 range
      const normalizedX = x / (xPoints - 1);
      const normalizedY = y / (yPoints - 1);
      
      // Map to day of week and hour
      const dayOfWeek = Math.floor(normalizedX * 7); // 0-6
      const hourOfDay = Math.floor(normalizedY * 24); // 0-23
      
      // Base revenue pattern - higher in evenings and weekends
      let baseRevenue = 1000 + 5000 * Math.sin(normalizedY * Math.PI); // Higher in evenings
      
      // Weekend boost
      if (dayOfWeek >= 5) { // Friday and Saturday
        baseRevenue *= 1.5;
      }
      
      // Add some randomness
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2
      const revenue = baseRevenue * randomFactor;
      
      data.push({
        x: dayOfWeek,
        y: hourOfDay,
        z: revenue,
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        hour: hourOfDay,
        revenue
      });
    }
  }
  
  return data;
};

/**
 * Generate 3D player activity surface data
 * @param xPoints Number of points on x-axis
 * @param yPoints Number of points on y-axis
 * @returns Array of 3D data points
 */
export const generate3DPlayerActivitySurface = (xPoints: number = 20, yPoints: number = 20): SurfaceDataPoint[] => {
  const data: SurfaceDataPoint[] = [];
  
  // X-axis: Days of week (0-6)
  // Y-axis: Hours of day (0-23)
  // Z-axis: Active players
  
  for (let x = 0; x < xPoints; x++) {
    for (let y = 0; y < yPoints; y++) {
      // Normalize x and y to 0-1 range
      const normalizedX = x / (xPoints - 1);
      const normalizedY = y / (yPoints - 1);
      
      // Map to day of week and hour
      const dayOfWeek = Math.floor(normalizedX * 7); // 0-6
      const hourOfDay = Math.floor(normalizedY * 24); // 0-23
      
      // Base player activity pattern - higher in evenings and weekends
      let basePlayers = 100 + 900 * Math.sin(normalizedY * Math.PI); // Higher in evenings
      
      // Weekend boost
      if (dayOfWeek >= 5) { // Friday and Saturday
        basePlayers *= 1.8;
      }
      
      // Add some randomness
      const randomFactor = 0.85 + Math.random() * 0.3; // 0.85-1.15
      const players = Math.floor(basePlayers * randomFactor);
      
      data.push({
        x: dayOfWeek,
        y: hourOfDay,
        z: players,
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
        hour: hourOfDay,
        players
      });
    }
  }
  
  return data;
};

/**
 * Generate multi-dimensional scatter data
 * @param count Number of data points
 * @returns Array of scatter data points
 */
export const generateMultiDimensionalScatter = (count: number = 100): ScatterDataPoint[] => {
  const data: ScatterDataPoint[] = [];
  
  // Player segments
  const segments = ['New', 'Casual', 'Regular', 'VIP', 'Inactive'];
  
  for (let i = 0; i < count; i++) {
    // Randomly assign segment
    const segment = segments[Math.floor(Math.random() * segments.length)];
    
    // Generate metrics based on segment
    let depositRange, betRange, sessionRange, lifetimeRange;
    
    switch (segment) {
      case 'New':
        depositRange = [10, 200];
        betRange = [10, 300];
        sessionRange = [1, 5];
        lifetimeRange = [1, 10];
        break;
      case 'Casual':
        depositRange = [50, 500];
        betRange = [100, 1000];
        sessionRange = [5, 20];
        lifetimeRange = [10, 60];
        break;
      case 'Regular':
        depositRange = [200, 2000];
        betRange = [500, 5000];
        sessionRange = [15, 50];
        lifetimeRange = [30, 180];
        break;
      case 'VIP':
        depositRange = [1000, 10000];
        betRange = [2000, 20000];
        sessionRange = [30, 100];
        lifetimeRange = [90, 365];
        break;
      case 'Inactive':
        depositRange = [0, 100];
        betRange = [0, 200];
        sessionRange = [0, 2];
        lifetimeRange = [30, 365];
        break;
      default:
        depositRange = [0, 1000];
        betRange = [0, 2000];
        sessionRange = [0, 50];
        lifetimeRange = [0, 365];
    }
    
    // Generate random values within ranges
    const avgDeposit = depositRange[0] + Math.random() * (depositRange[1] - depositRange[0]);
    const totalBets = betRange[0] + Math.random() * (betRange[1] - betRange[0]);
    const sessionCount = sessionRange[0] + Math.random() * (sessionRange[1] - sessionRange[0]);
    const lifetimeDays = lifetimeRange[0] + Math.random() * (lifetimeRange[1] - lifetimeRange[0]);
    
    data.push({
      id: `player-${i + 1}`,
      x: avgDeposit,
      y: totalBets,
      z: sessionCount,
      size: lifetimeDays / 10,
      group: segment,
      label: `Player ${i + 1}`,
      avgDeposit,
      totalBets,
      sessionCount,
      lifetimeDays,
      segment
    });
  }
  
  return data;
};

export default {
  generatePlayerJourneySankey,
  generateConversionFunnelSankey,
  generate3DRevenueSurface,
  generate3DPlayerActivitySurface,
  generateMultiDimensionalScatter
};
