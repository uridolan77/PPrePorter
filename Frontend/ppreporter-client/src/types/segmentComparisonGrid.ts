/**
 * Types for SegmentComparisonGrid component
 */

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
 * Segment option interface
 */
export interface SegmentOption {
  /**
   * Segment value
   */
  value: string;
  
  /**
   * Segment display label
   */
  label: string;
}

/**
 * Chart type option interface
 */
export interface ChartTypeOption {
  /**
   * Chart type value
   */
  value: string;
  
  /**
   * Chart type display label
   */
  label: string;
}

/**
 * Focused segment interface
 */
export interface FocusedSegment {
  /**
   * Segment type
   */
  segment: string;
  
  /**
   * Metric ID
   */
  metric: string;
}

/**
 * Data point interface
 */
export interface DataPoint {
  /**
   * Date
   */
  date: string;
  
  /**
   * Value
   */
  value: number;
}

/**
 * Segment value interface
 */
export interface SegmentValue {
  /**
   * Segment name
   */
  name: string;
  
  /**
   * Segment data points
   */
  data: DataPoint[];
}

/**
 * Segment data interface
 */
export interface SegmentData {
  /**
   * Segment type
   */
  segmentType: string;
  
  /**
   * Metric ID
   */
  metricId: string;
  
  /**
   * Segment values
   */
  values: SegmentValue[];
}

/**
 * Segment comparison data interface
 */
export interface SegmentComparisonData {
  /**
   * Time frame
   */
  timeFrame: string;
  
  /**
   * Metrics
   */
  metrics: string[];
  
  /**
   * Segments
   */
  segments: string[];
  
  /**
   * Segment data
   */
  data: SegmentData[];
}

/**
 * Line chart data point interface
 */
export interface LineChartDataPoint {
  /**
   * X-axis value
   */
  x: string;
  
  /**
   * Y-axis value
   */
  y: number;
}

/**
 * Line chart series interface
 */
export interface LineChartSeries {
  /**
   * Series ID
   */
  id: string;
  
  /**
   * Series data points
   */
  data: LineChartDataPoint[];
}

/**
 * Bar chart data point interface
 */
export interface BarChartDataPoint {
  /**
   * Date
   */
  date: string;
  
  /**
   * Dynamic properties for segment values
   */
  [key: string]: string | number;
}

/**
 * SegmentComparisonGrid component props interface
 */
export interface SegmentComparisonGridProps {
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

export default SegmentComparisonGridProps;
