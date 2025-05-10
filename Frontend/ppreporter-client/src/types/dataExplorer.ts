/**
 * Data explorer types for TypeScript components
 */

/**
 * Time series data point interface
 */
export interface TimeSeriesDataPoint {
  /**
   * Date string in ISO format
   */
  date: string;
  
  /**
   * Deposits amount
   */
  deposits: number;
  
  /**
   * Withdrawals amount
   */
  withdrawals: number;
  
  /**
   * New users count
   */
  newUsers: number;
  
  /**
   * Active users count
   */
  activeUsers: number;
  
  /**
   * Profit amount
   */
  profit: number;
  
  /**
   * Bet count
   */
  betCount: number;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Game performance data point interface
 */
export interface GamePerformanceDataPoint {
  /**
   * Game name
   */
  name: string;
  
  /**
   * Revenue amount
   */
  revenue: number;
  
  /**
   * Players count
   */
  players: number;
  
  /**
   * Bets count
   */
  bets: number;
  
  /**
   * Return rate (0-1)
   */
  returnRate: number;
  
  /**
   * Growth percentage
   */
  growth: number;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Player segment data point interface
 */
export interface PlayerSegmentDataPoint {
  /**
   * Segment name
   */
  name: string;
  
  /**
   * Segment value
   */
  value: number;
  
  /**
   * Segment color
   */
  color: string;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Geographic data point interface
 */
export interface GeoDataPoint {
  /**
   * Country name
   */
  country: string;
  
  /**
   * Players count
   */
  players: number;
  
  /**
   * Revenue amount
   */
  revenue: number;
  
  /**
   * Deposits amount
   */
  deposits: number;
  
  /**
   * Withdrawals amount
   */
  withdrawals: number;
  
  /**
   * Bonus amount
   */
  bonusAmount: number;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Sample data interface
 */
export interface SampleData {
  /**
   * Time series data
   */
  timeSeriesData: TimeSeriesDataPoint[];
  
  /**
   * Game performance data
   */
  gamePerformanceData: GamePerformanceDataPoint[];
  
  /**
   * Player segment data
   */
  playerSegmentData: PlayerSegmentDataPoint[];
  
  /**
   * Geographic data
   */
  geoData: GeoDataPoint[];
}

/**
 * Chart type interface
 */
export interface ChartType {
  /**
   * Chart type ID
   */
  id: string;
  
  /**
   * Chart type name
   */
  name: string;
  
  /**
   * Chart type icon
   */
  icon: React.ReactNode;
}

/**
 * Data source interface
 */
export interface DataSource {
  /**
   * Data source ID
   */
  id: string;
  
  /**
   * Data source name
   */
  name: string;
}

/**
 * Annotation interface
 */
export interface Annotation {
  /**
   * Annotation ID
   */
  id?: number;
  
  /**
   * Annotation text
   */
  text: string;
  
  /**
   * Annotation position
   */
  position: {
    /**
     * X coordinate
     */
    x: number;
    
    /**
     * Y coordinate
     */
    y: number;
  };
  
  /**
   * Annotation timestamp
   */
  timestamp: Date;
  
  /**
   * Chart type
   */
  chartType: string;
  
  /**
   * Data source
   */
  dataSource: string;
  
  /**
   * Metrics
   */
  metrics: string[];
}

/**
 * Natural language query result interface
 */
export interface NLQueryResult {
  /**
   * Whether clarification is needed
   */
  needsClarification?: boolean;
  
  /**
   * Clarification questions
   */
  clarificationQuestions?: {
    /**
     * Question ID
     */
    id: string;
    
    /**
     * Question text
     */
    text: string;
    
    /**
     * Question type
     */
    type: 'select' | 'text' | 'boolean';
    
    /**
     * Question options
     */
    options?: {
      /**
       * Option value
       */
      value: string;
      
      /**
       * Option label
       */
      label: string;
    }[];
  }[];
  
  /**
   * Data source
   */
  dataSource?: string;
  
  /**
   * Metrics
   */
  metrics?: string[];
  
  /**
   * Chart type
   */
  chartType?: string;
  
  /**
   * Time range
   */
  timeRange?: string;
  
  /**
   * Result data
   */
  data?: any;
}

/**
 * What-if parameters interface
 */
export interface WhatIfParameters {
  /**
   * Revenue growth percentage
   */
  revenueGrowth?: number;
  
  /**
   * Player growth percentage
   */
  playerGrowth?: number;
  
  /**
   * Return rate adjustment percentage
   */
  returnRateAdjustment?: number;
  
  /**
   * Deposit growth percentage
   */
  depositGrowth?: number;
  
  /**
   * Withdrawal reduction percentage
   */
  withdrawalReduction?: number;
  
  /**
   * Player retention improvement percentage
   */
  playerRetentionImprovement?: number;
}

/**
 * What-if results interface
 */
export interface WhatIfResults {
  /**
   * Result data
   */
  data: any[];
  
  /**
   * Data source
   */
  source: string;
}

/**
 * Contextual data explorer props interface
 */
export interface ContextualDataExplorerProps {
  /**
   * Data to visualize
   */
  data?: SampleData;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Callback when refresh button is clicked
   */
  onRefresh?: () => void;
  
  /**
   * Callback when export button is clicked
   */
  onExport?: () => void;
  
  /**
   * Callback when filter button is clicked
   */
  onFilter?: (filters: any) => void;
  
  /**
   * Callback when search is performed
   */
  onSearch?: (query: string) => void;
  
  /**
   * Callback when natural language search is performed
   */
  onNaturalLanguageSearch?: (query: string, clarificationResponses?: Record<string, any>) => Promise<NLQueryResult>;
  
  /**
   * Callback when data point is selected
   */
  onDataPointSelect?: (dataPoint: any) => void;
  
  /**
   * Callback when annotation is created
   */
  onAnnotationCreate?: (annotation: Annotation) => void;
}

export default ContextualDataExplorerProps;
