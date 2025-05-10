/**
 * Types for MetricExplanation component
 */

/**
 * Related metric interface
 */
export interface RelatedMetric {
  /**
   * Metric ID
   */
  id: string;
  
  /**
   * Metric name
   */
  name: string;
  
  /**
   * Metric description
   */
  description?: string;
}

/**
 * Explanation data interface
 */
export interface ExplanationData {
  /**
   * Metric ID
   */
  id: string;
  
  /**
   * Metric name
   */
  name: string;
  
  /**
   * Metric definition
   */
  definition: string;
  
  /**
   * Metric relevance
   */
  relevance: string;
  
  /**
   * Metric calculation formula
   */
  calculation?: string;
  
  /**
   * Metric benchmark information
   */
  benchmark?: string;
  
  /**
   * Recommendations for improving the metric
   */
  recommendations?: string[];
  
  /**
   * Related metrics
   */
  relatedMetrics?: RelatedMetric[];
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * User context interface
 */
export interface UserContext {
  /**
   * User role
   */
  role?: string;
  
  /**
   * User department
   */
  department?: string;
  
  /**
   * User experience level
   */
  experienceLevel?: string;
  
  /**
   * User preferences
   */
  preferences?: Record<string, any>;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * MetricExplanation component props interface
 */
export interface MetricExplanationProps {
  /**
   * Metric ID
   */
  metricId: string;
  
  /**
   * Metric name
   */
  metricName?: string;
  
  /**
   * Metric value
   */
  metricValue?: number | string;
  
  /**
   * Metric trend percentage
   */
  metricTrend?: number;
  
  /**
   * User context for personalized explanations
   */
  userContext?: UserContext;
  
  /**
   * Callback when a reference is saved
   */
  onSaveReference?: (metricId: string, isSaved: boolean) => void;
  
  /**
   * Whether the explanation is expanded by default
   */
  expanded?: boolean;
}

export default MetricExplanationProps;
