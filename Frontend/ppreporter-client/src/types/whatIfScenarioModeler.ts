/**
 * Types for WhatIfScenarioModeler component
 */

/**
 * Data point interface
 */
export interface DataPoint {
  /**
   * Date string in format 'YYYY-MM-DD'
   */
  date: string;
  
  /**
   * Revenue value
   */
  revenue: number;
  
  /**
   * Number of bets
   */
  bets: number;
  
  /**
   * Number of active players
   */
  players: number;
  
  /**
   * Retention rate percentage
   */
  retention: number;
  
  /**
   * First-time depositor conversion percentage
   */
  ftdConversion: number;
  
  /**
   * Whether this is a forecasted data point
   */
  isForecast?: boolean;
  
  /**
   * Baseline value for comparison
   */
  baselineValue?: number | null;
  
  /**
   * Difference value between scenario and baseline
   */
  differenceValue?: number;
}

/**
 * Parameters interface
 */
export interface Parameters {
  /**
   * Marketing budget percentage relative to baseline
   */
  marketingBudget: number;
  
  /**
   * Bonus amount percentage relative to baseline
   */
  bonusAmount: number;
  
  /**
   * Retention effort percentage relative to baseline
   */
  retentionEffort: number;
  
  /**
   * Player acquisition percentage relative to baseline
   */
  playerAcquisition: number;
  
  /**
   * Game portfolio percentage relative to baseline
   */
  gamePortfolio: number;
}

/**
 * Parameter impacts interface
 */
export interface ParameterImpacts {
  /**
   * Marketing budget impacts
   */
  marketingBudget: MetricImpacts;
  
  /**
   * Bonus amount impacts
   */
  bonusAmount: MetricImpacts;
  
  /**
   * Retention effort impacts
   */
  retentionEffort: MetricImpacts;
  
  /**
   * Player acquisition impacts
   */
  playerAcquisition: MetricImpacts;
  
  /**
   * Game portfolio impacts
   */
  gamePortfolio: MetricImpacts;
}

/**
 * Metric impacts interface
 */
export interface MetricImpacts {
  /**
   * Impact on revenue
   */
  revenue: number;
  
  /**
   * Impact on bets
   */
  bets: number;
  
  /**
   * Impact on players
   */
  players: number;
  
  /**
   * Impact on retention
   */
  retention: number;
  
  /**
   * Impact on FTD conversion
   */
  ftdConversion: number;
}

/**
 * Metric colors interface
 */
export interface MetricColors {
  /**
   * Revenue color
   */
  revenue: string;
  
  /**
   * Bets color
   */
  bets: string;
  
  /**
   * Players color
   */
  players: string;
  
  /**
   * Retention color
   */
  retention: string;
  
  /**
   * FTD conversion color
   */
  ftdConversion: string;
}

/**
 * Metric labels interface
 */
export interface MetricLabels {
  /**
   * Revenue label
   */
  revenue: string;
  
  /**
   * Bets label
   */
  bets: string;
  
  /**
   * Players label
   */
  players: string;
  
  /**
   * Retention label
   */
  retention: string;
  
  /**
   * FTD conversion label
   */
  ftdConversion: string;
}

/**
 * Parameter labels interface
 */
export interface ParameterLabels {
  /**
   * Marketing budget label
   */
  marketingBudget: string;
  
  /**
   * Bonus amount label
   */
  bonusAmount: string;
  
  /**
   * Retention effort label
   */
  retentionEffort: string;
  
  /**
   * Player acquisition label
   */
  playerAcquisition: string;
  
  /**
   * Game portfolio label
   */
  gamePortfolio: string;
}

/**
 * Summary interface
 */
export interface Summary {
  /**
   * Percentage change
   */
  change: number;
  
  /**
   * Average value
   */
  average: number;
}

/**
 * Saved scenario interface
 */
export interface SavedScenario {
  /**
   * Parameters
   */
  parameters: Parameters;
  
  /**
   * Number of forecast days
   */
  forecastDays: number;
  
  /**
   * Target metric
   */
  targetMetric: string;
  
  /**
   * Scenario data
   */
  data: DataPoint[];
  
  /**
   * Summary
   */
  summary: Summary;
  
  /**
   * Creation timestamp
   */
  createdAt: string;
  
  /**
   * Scenario name
   */
  name: string;
}

/**
 * WhatIfScenarioModeler component props interface
 */
export interface WhatIfScenarioModelerProps {
  /**
   * Data points
   */
  data?: DataPoint[];
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Callback when a scenario is saved
   */
  onSaveScenario?: (scenario: SavedScenario) => void;
}

export default WhatIfScenarioModelerProps;
