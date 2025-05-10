/**
 * Types for MultiDimensionalRadarChart component
 */

/**
 * Metric interface
 */
export interface Metric {
  /**
   * Metric ID
   */
  id: string;
  
  /**
   * Metric display label
   */
  label: string;
  
  /**
   * Format type for the metric
   */
  format?: 'currency' | 'percentage' | 'number' | string;
}

/**
 * Entity interface
 */
export interface Entity {
  /**
   * Entity ID
   */
  id: string;
  
  /**
   * Entity name
   */
  name: string;
  
  /**
   * Entity category (optional)
   */
  category?: string;
}

/**
 * Data item interface
 */
export interface DataItem {
  /**
   * Entity ID
   */
  entityId: string;
  
  /**
   * Values for each metric
   */
  values: Record<string, number>;
}

/**
 * Radar chart data point interface
 */
export interface RadarDataPoint {
  /**
   * Subject (metric label)
   */
  subject: string;
  
  /**
   * Values for each entity
   */
  [entityName: string]: string | number | null;
}

/**
 * Legend payload item interface
 */
export interface LegendPayloadItem {
  /**
   * Value (entity name)
   */
  value: string;
  
  /**
   * Color
   */
  color: string;
  
  /**
   * Type
   */
  type?: string;
}

/**
 * Legend props interface
 */
export interface LegendProps {
  /**
   * Payload items
   */
  payload: LegendPayloadItem[];
}

/**
 * Tooltip formatter props interface
 */
export interface TooltipFormatterProps {
  /**
   * Payload
   */
  payload: {
    /**
     * Subject (metric label)
     */
    subject: string;
  };
}

/**
 * MultiDimensionalRadarChart component props interface
 */
export interface MultiDimensionalRadarChartProps {
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
   * Available metrics
   */
  metrics?: Metric[];
  
  /**
   * Available entities
   */
  entities?: Entity[];
  
  /**
   * Callback when refresh is requested
   */
  onRefresh?: () => void;
  
  /**
   * Callback when export is requested
   */
  onExport?: () => void;
}

export default MultiDimensionalRadarChartProps;
