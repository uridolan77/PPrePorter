/**
 * Insight types for TypeScript components
 */

/**
 * Severity level
 */
export type SeverityLevel = 'high' | 'medium' | 'low';

/**
 * Trend direction
 */
export type TrendDirection = 'up' | 'down';

/**
 * Timeframe
 */
export type Timeframe = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Impact level
 */
export type ImpactLevel = 'high' | 'medium' | 'low';

/**
 * Effort level
 */
export type EffortLevel = 'high' | 'medium' | 'low';

/**
 * Status
 */
export type Status = 'unresolved' | 'investigating' | 'resolved';

/**
 * Anomaly interface
 */
export interface Anomaly {
  /**
   * Anomaly ID
   */
  id: string;
  
  /**
   * Anomaly title
   */
  title: string;
  
  /**
   * Anomaly description
   */
  description: string;
  
  /**
   * Anomaly severity
   */
  severity: SeverityLevel;
  
  /**
   * Anomaly timestamp
   */
  timestamp: string;
  
  /**
   * Anomaly status
   */
  status: Status;
  
  /**
   * Anomaly category
   */
  category: string;
  
  /**
   * Related metrics
   */
  relatedMetrics: string[];
  
  /**
   * Recommendation
   */
  recommendation: string;
}

/**
 * Trend interface
 */
export interface Trend {
  /**
   * Trend ID
   */
  id: string;
  
  /**
   * Trend title
   */
  title: string;
  
  /**
   * Trend description
   */
  description: string;
  
  /**
   * Trend direction
   */
  direction: TrendDirection;
  
  /**
   * Trend magnitude
   */
  magnitude: number;
  
  /**
   * Trend timeframe
   */
  timeframe: string;
  
  /**
   * Trend category
   */
  category: string;
  
  /**
   * Opportunity
   */
  opportunity: string;
}

/**
 * Recommendation interface
 */
export interface Recommendation {
  /**
   * Recommendation ID
   */
  id: string;
  
  /**
   * Recommendation title
   */
  title: string;
  
  /**
   * Recommendation description
   */
  description: string;
  
  /**
   * Recommendation impact
   */
  impact: ImpactLevel;
  
  /**
   * Recommendation effort
   */
  effort: EffortLevel;
  
  /**
   * Recommendation category
   */
  category: string;
  
  /**
   * Expected outcome
   */
  expectedOutcome: string;
}

/**
 * Data quality issue interface
 */
export interface DataQualityIssue {
  /**
   * Issue ID
   */
  id: string;
  
  /**
   * Issue title
   */
  title: string;
  
  /**
   * Issue description
   */
  description: string;
  
  /**
   * Issue severity
   */
  severity: SeverityLevel;
  
  /**
   * Issue status
   */
  status: Status;
  
  /**
   * Affected systems
   */
  affectedSystems: string[];
  
  /**
   * Recommendation
   */
  recommendation: string;
}

/**
 * Insights interface
 */
export interface Insights {
  /**
   * Anomalies
   */
  anomalies: Anomaly[];
  
  /**
   * Trends
   */
  trends: Trend[];
  
  /**
   * Recommendations
   */
  recommendations: Recommendation[];
  
  /**
   * Data quality issues
   */
  dataQualityIssues: DataQualityIssue[];
}

/**
 * Expanded sections interface
 */
export interface ExpandedSections {
  /**
   * Anomalies section expanded
   */
  anomalies: boolean;
  
  /**
   * Trends section expanded
   */
  trends: boolean;
  
  /**
   * Recommendations section expanded
   */
  recommendations: boolean;
  
  /**
   * Data quality issues section expanded
   */
  dataQualityIssues: boolean;
}

/**
 * Expanded items interface
 */
export interface ExpandedItems {
  /**
   * Item ID to expanded state mapping
   */
  [key: string]: boolean;
}

/**
 * Action type
 */
export type ActionType = 'resolve' | 'analyze' | 'implement';

export default Insights;
