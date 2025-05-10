/**
 * Natural language query types for TypeScript components
 */

/**
 * Metric entity
 */
export interface MetricEntity {
  /**
   * Metric name
   */
  Name: string;
  
  /**
   * Metric type
   */
  Type?: string;
  
  /**
   * Metric format
   */
  Format?: string;
  
  /**
   * Metric description
   */
  Description?: string;
}

/**
 * Dimension entity
 */
export interface DimensionEntity {
  /**
   * Dimension name
   */
  Name: string;
  
  /**
   * Whether this is a time field
   */
  isTimeField?: boolean;
  
  /**
   * Dimension type
   */
  Type?: string;
  
  /**
   * Dimension description
   */
  Description?: string;
}

/**
 * Filter entity
 */
export interface FilterEntity {
  /**
   * Dimension name
   */
  Dimension: string;
  
  /**
   * Filter operator
   */
  Operator: string;
  
  /**
   * Filter value
   */
  Value: string | number | boolean;
}

/**
 * Time range entity
 */
export interface TimeRangeEntity {
  /**
   * Whether the time range is relative
   */
  IsRelative: boolean;
  
  /**
   * Relative period (e.g. 'last_7_days', 'this_month')
   */
  RelativePeriod?: string;
  
  /**
   * Start date
   */
  Start?: string;
  
  /**
   * End date
   */
  End?: string;
}

/**
 * Extracted entities
 */
export interface ExtractedEntities {
  /**
   * Metrics
   */
  Metrics: MetricEntity[];
  
  /**
   * Dimensions
   */
  Dimensions: DimensionEntity[];
  
  /**
   * Filters
   */
  Filters?: FilterEntity[];
  
  /**
   * Time range
   */
  TimeRange?: TimeRangeEntity;
}

/**
 * Query result
 */
export interface QueryResult {
  /**
   * Extracted entities
   */
  entities: ExtractedEntities;
  
  /**
   * Generated SQL
   */
  sql: string;
  
  /**
   * Result data
   */
  data: Record<string, any>[];
  
  /**
   * Query ID
   */
  queryId?: string;
  
  /**
   * Error message
   */
  error?: string;
}

/**
 * Natural language state
 */
export interface NaturalLanguageState {
  /**
   * Query text
   */
  queryText: string;
  
  /**
   * Query result
   */
  queryResult: QueryResult | null;
  
  /**
   * Whether the query is being processed
   */
  isProcessing: boolean;
  
  /**
   * Error message
   */
  error: string | null;
  
  /**
   * Query history
   */
  queryHistory: string[];
}

/**
 * Chart type
 */
export type ChartType = 'bar' | 'line' | 'pie' | 'table';

/**
 * Metric type for formatting
 */
export type MetricFormatType = 'currency' | 'percent' | 'number';

export default NaturalLanguageState;
