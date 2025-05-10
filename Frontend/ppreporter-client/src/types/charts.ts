/**
 * Chart types for TypeScript components
 */

/**
 * Metric format type
 */
export type MetricFormat = 'currency' | 'percentage' | 'number' | 'string';

/**
 * Metric definition
 */
export interface Metric {
  /**
   * Metric identifier
   */
  id: string;
  
  /**
   * Metric display label
   */
  label: string;
  
  /**
   * Metric description
   */
  description?: string;
  
  /**
   * Metric unit
   */
  unit?: string;
  
  /**
   * Metric format
   */
  format?: MetricFormat;
  
  /**
   * Metric group identifier
   */
  groupId?: string;
  
  /**
   * Metric category
   */
  category?: string;
}

/**
 * Entity definition
 */
export interface Entity {
  /**
   * Entity identifier
   */
  id: string;
  
  /**
   * Entity name
   */
  name: string;
  
  /**
   * Entity category
   */
  category?: string;
  
  /**
   * Entity description
   */
  description?: string;
  
  /**
   * Entity color
   */
  color?: string;
}

/**
 * Metric group definition
 */
export interface MetricGroup {
  /**
   * Group identifier
   */
  id: string;
  
  /**
   * Group display label
   */
  label: string;
  
  /**
   * Group description
   */
  description?: string;
  
  /**
   * Group color
   */
  color?: string;
}

/**
 * Benchmark definition
 */
export interface Benchmark {
  /**
   * Benchmark identifier
   */
  id: string;
  
  /**
   * Benchmark name
   */
  name: string;
  
  /**
   * Benchmark description
   */
  description?: string;
  
  /**
   * Benchmark values
   */
  values: Record<string, number>;
}

/**
 * Data point for radar chart
 */
export interface RadarDataPoint {
  /**
   * Entity identifier
   */
  entityId: string;
  
  /**
   * Values for each metric
   */
  values: Record<string, number>;
}

/**
 * Historical data structure
 */
export type HistoricalData = Record<string, Record<string, number[]>>;

/**
 * Radar chart data structure
 */
export interface RadarChartData {
  /**
   * Subject (metric name)
   */
  subject: string;
  
  /**
   * Metric identifier
   */
  metricId: string;
  
  /**
   * Metric unit
   */
  unit?: string;
  
  /**
   * Metric description
   */
  description?: string;
  
  /**
   * Values for each entity
   */
  [key: string]: any;
}

export default RadarChartData;
