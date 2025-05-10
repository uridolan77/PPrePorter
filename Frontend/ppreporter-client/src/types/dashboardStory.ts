/**
 * Types for DashboardStory component
 */

/**
 * Insight interface
 */
export interface Insight {
  /**
   * Insight title
   */
  Title: string;
  
  /**
   * Insight description
   */
  Description: string;
  
  /**
   * Detailed explanation of the insight
   */
  DetailedExplanation?: string;
  
  /**
   * Recommended action based on the insight
   */
  RecommendedAction?: string;
  
  /**
   * Insight category (Revenue, Users, etc.)
   */
  Category: string;
  
  /**
   * Trend direction (Positive, Negative, Neutral)
   */
  TrendDirection: 'Positive' | 'Negative' | 'Neutral';
  
  /**
   * Insight type (Trend, Anomaly, etc.)
   */
  InsightType: 'Trend' | 'Anomaly' | 'Correlation' | 'Summary';
  
  /**
   * Importance score (1-10)
   */
  Importance: number;
  
  /**
   * Metric key this insight relates to
   */
  MetricKey: string;
  
  /**
   * Metric value
   */
  MetricValue?: number;
  
  /**
   * Metric change
   */
  MetricChange?: number;
  
  /**
   * Metric change percentage
   */
  MetricChangePercentage?: number;
  
  /**
   * Time period the insight covers
   */
  TimePeriod?: string;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Anomaly interface
 */
export interface Anomaly {
  /**
   * Anomaly title
   */
  Title: string;
  
  /**
   * Anomaly description
   */
  Description: string;
  
  /**
   * Potential cause of the anomaly
   */
  PotentialCause?: string;
  
  /**
   * Severity of the anomaly (1-10)
   */
  Severity?: number;
  
  /**
   * Metric key this anomaly relates to
   */
  MetricKey?: string;
  
  /**
   * Detected date
   */
  DetectedDate?: string;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Story data interface
 */
export interface StoryData {
  /**
   * Story title
   */
  Title: string;
  
  /**
   * Story summary
   */
  Summary: string;
  
  /**
   * Business context
   */
  BusinessContext?: string;
  
  /**
   * Highlights (array of strings)
   */
  Highlights: string[];
  
  /**
   * Key insights
   */
  KeyInsights: Insight[];
  
  /**
   * Opportunity analysis
   */
  OpportunityAnalysis?: string;
  
  /**
   * Risk analysis
   */
  RiskAnalysis?: string;
  
  /**
   * Significant anomalies
   */
  SignificantAnomalies?: Anomaly[];
  
  /**
   * Recommended actions
   */
  RecommendedActions?: string[];
  
  /**
   * Time period the story covers
   */
  TimePeriod?: string;
  
  /**
   * Last updated timestamp
   */
  LastUpdated?: string;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * DashboardStory component props interface
 */
export interface DashboardStoryProps {
  /**
   * Story data
   */
  storyData: StoryData;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Callback when an insight is annotated
   */
  onAnnotate?: (insight: Insight) => void;
  
  /**
   * Callback when an insight is saved
   */
  onSaveInsight?: (insight: Insight) => void;
}

/**
 * InsightListItem component props interface
 */
export interface InsightListItemProps {
  /**
   * Insight data
   */
  insight: Insight;
  
  /**
   * Whether the insight is saved
   */
  isSaved: boolean;
  
  /**
   * Callback when the insight is saved
   */
  onSave: () => void;
  
  /**
   * Callback when the insight is removed
   */
  onRemove: () => void;
  
  /**
   * Callback when the insight is annotated
   */
  onAnnotate: () => void;
}

export default DashboardStoryProps;
