/**
 * Types for ContextualExplanation component
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
   * Metric name
   */
  name: string;
  
  /**
   * Metric unit (e.g., '%', '$')
   */
  unit?: string;
  
  /**
   * Whether higher values are better for this metric
   */
  higherIsBetter?: boolean;
  
  /**
   * Metric description
   */
  description?: string;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Data point interface
 */
export interface DataPoint {
  /**
   * Date of the data point
   */
  date: string;
  
  /**
   * Value of the data point
   */
  value: number;
  
  /**
   * Whether this data point is an anomaly
   */
  isAnomaly?: boolean;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Explanation interface
 */
export interface Explanation {
  /**
   * Explanation title
   */
  title: string;
  
  /**
   * Explanation content
   */
  content: string;
  
  /**
   * Key insights
   */
  insights: string[];
  
  /**
   * Recommendations
   */
  recommendations: string[];
}

/**
 * Insight type
 */
export type InsightType = 'trend' | 'anomaly' | 'forecast' | 'comparison' | 'correlation';

/**
 * ContextualExplanation component props interface
 */
export interface ContextualExplanationProps {
  /**
   * Metric to explain
   */
  metric: Metric;
  
  /**
   * Data points for the metric
   */
  data: DataPoint[];
  
  /**
   * Type of insight to generate
   */
  insightType?: InsightType;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Whether to show detailed view
   */
  showDetailedView?: boolean;
  
  /**
   * Callback when user clicks to show detailed view
   */
  onShowDetailedView?: () => void;
  
  /**
   * CSS class name
   */
  className?: string;
}

export default ContextualExplanationProps;
