/**
 * Types for ParallelCoordinatesPlot component
 */

/**
 * Dimension interface
 */
export interface Dimension {
  /**
   * Dimension ID
   */
  id: string;
  
  /**
   * Dimension display label
   */
  label: string;
  
  /**
   * Format type for the dimension
   */
  format?: 'currency' | 'percentage' | 'number' | string;
  
  /**
   * Dimension type
   */
  type?: 'numerical' | 'categorical';
}

/**
 * Data item interface
 */
export interface DataItem {
  /**
   * Item ID
   */
  id?: string | number;
  
  /**
   * Item name
   */
  name?: string;
  
  /**
   * Item category
   */
  category?: string;
  
  /**
   * Dynamic properties for dimensions
   */
  [key: string]: any;
}

/**
 * Filter range interface
 */
export interface FilterRange {
  /**
   * Minimum value
   */
  min: number;
  
  /**
   * Maximum value
   */
  max: number;
}

/**
 * Sort configuration interface
 */
export interface SortConfig {
  /**
   * Sort key
   */
  key: string;
  
  /**
   * Sort direction
   */
  direction: 'asc' | 'desc';
}

/**
 * Chart dimension interface
 */
export interface ChartDimension {
  /**
   * Dimension name
   */
  name: string;
  
  /**
   * Domain range [min, max]
   */
  domain: [number, number];
  
  /**
   * Tick formatter function
   */
  tickFormatter: (value: number) => string;
  
  /**
   * Dimension type
   */
  type: string;
}

/**
 * Color scale interface
 */
export interface ColorScale {
  /**
   * Data key for color mapping
   */
  dataKey?: string;
  
  /**
   * Start color for gradient
   */
  from?: string;
  
  /**
   * End color for gradient
   */
  to?: string;
  
  /**
   * Color mapping for categorical values
   */
  range?: Record<string, string>;
}

/**
 * ParallelCoordinatesPlot component props interface
 */
export interface ParallelCoordinatesPlotProps {
  /**
   * Chart data
   */
  data?: DataItem[];
  
  /**
   * Chart title
   */
  title?: string;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Available dimensions
   */
  dimensions?: Dimension[];
  
  /**
   * Color scale type
   */
  colorScale?: 'linear' | 'categorical';
  
  /**
   * Callback when refresh is requested
   */
  onRefresh?: () => void;
  
  /**
   * Callback when export is requested
   */
  onExport?: () => void;
}

export default ParallelCoordinatesPlotProps;
