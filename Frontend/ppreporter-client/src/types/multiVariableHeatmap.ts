/**
 * Types for MultiVariableHeatmap component
 */

/**
 * Option interface
 */
export interface Option {
  /**
   * Option value
   */
  value: string;
  
  /**
   * Option display label
   */
  label: string;
}

/**
 * Cell data interface
 */
export interface Cell {
  /**
   * X-axis value
   */
  x: string;
  
  /**
   * Y-axis value
   */
  y: string;
  
  /**
   * Cell data
   */
  data: {
    /**
     * Cell value
     */
    value: number;
    
    /**
     * X-axis value
     */
    x: string;
    
    /**
     * Y-axis value
     */
    y: string;
    
    /**
     * Cell color
     */
    color: string;
  };
}

/**
 * Heatmap data row interface
 */
export interface HeatmapDataRow {
  /**
   * Row ID
   */
  id: string;
  
  /**
   * Row data
   */
  [key: string]: string | number;
}

/**
 * Heatmap data interface
 */
export interface HeatmapData {
  /**
   * Data type
   */
  dataType: string;
  
  /**
   * X-axis dimension
   */
  xAxis: string;
  
  /**
   * Y-axis dimension
   */
  yAxis: string;
  
  /**
   * Value metric
   */
  valueMetric: string;
  
  /**
   * Time frame
   */
  timeFrame: string;
  
  /**
   * Heatmap data rows
   */
  data: HeatmapDataRow[];
}

/**
 * Dimension options interface
 */
export interface DimensionOptions {
  /**
   * Player activity dimensions
   */
  player_activity: Option[];
  
  /**
   * Game performance dimensions
   */
  game_performance: Option[];
  
  /**
   * Transaction patterns dimensions
   */
  transaction_patterns: Option[];
  
  /**
   * Player demographics dimensions
   */
  player_demographics: Option[];
  
  /**
   * Bonus effectiveness dimensions
   */
  bonus_effectiveness: Option[];
  
  /**
   * Index signature for dynamic access
   */
  [key: string]: Option[];
}

/**
 * Value metric options interface
 */
export interface ValueMetricOptions {
  /**
   * Player activity metrics
   */
  player_activity: Option[];
  
  /**
   * Game performance metrics
   */
  game_performance: Option[];
  
  /**
   * Transaction patterns metrics
   */
  transaction_patterns: Option[];
  
  /**
   * Player demographics metrics
   */
  player_demographics: Option[];
  
  /**
   * Bonus effectiveness metrics
   */
  bonus_effectiveness: Option[];
  
  /**
   * Index signature for dynamic access
   */
  [key: string]: Option[];
}

/**
 * MultiVariableHeatmap component props interface
 */
export interface MultiVariableHeatmapProps {
  /**
   * Height of the component
   */
  height?: number;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Time frame for the data
   */
  timeFrame?: string;
}

export default MultiVariableHeatmapProps;
