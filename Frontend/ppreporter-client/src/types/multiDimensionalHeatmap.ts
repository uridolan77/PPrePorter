/**
 * Types for MultiDimensionalHeatmap component
 */

/**
 * Dimension option interface
 */
export interface DimensionOption {
  /**
   * Dimension value
   */
  value: string;
  
  /**
   * Dimension display label
   */
  label: string;
}

/**
 * Metric option interface
 */
export interface MetricOption {
  /**
   * Metric value
   */
  value: string;
  
  /**
   * Metric display label
   */
  label: string;
  
  /**
   * Format type for the metric
   */
  format: 'currency' | 'number' | 'percent';
}

/**
 * Color scheme option interface
 */
export interface ColorSchemeOption {
  /**
   * Color scheme value
   */
  value: string;
  
  /**
   * Color scheme display label
   */
  label: string;
  
  /**
   * D3 scale function
   */
  scale: (t: number) => string;
  
  /**
   * Whether the scale should be inverted by default
   */
  invert: boolean;
}

/**
 * Cell data interface
 */
export interface HeatmapCell {
  /**
   * X-axis value
   */
  x: string;
  
  /**
   * Y-axis value (metric value)
   */
  y: number;
}

/**
 * Row data interface
 */
export interface HeatmapRow {
  /**
   * Row ID
   */
  id: string;
  
  /**
   * Row data cells
   */
  data: HeatmapCell[];
}

/**
 * Heatmap data interface
 */
export interface HeatmapData {
  /**
   * Primary dimension
   */
  primaryDimension: string;
  
  /**
   * Secondary dimension
   */
  secondaryDimension: string;
  
  /**
   * Metric
   */
  metric: string;
  
  /**
   * Time frame
   */
  timeFrame: string;
  
  /**
   * Minimum value in the dataset
   */
  minValue?: number;
  
  /**
   * Maximum value in the dataset
   */
  maxValue?: number;
  
  /**
   * Heatmap data rows
   */
  data: HeatmapRow[];
}

/**
 * MultiDimensionalHeatmap component props interface
 */
export interface MultiDimensionalHeatmapProps {
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

export default MultiDimensionalHeatmapProps;
