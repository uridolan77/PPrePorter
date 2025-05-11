/**
 * Report types for TypeScript components
 */

/**
 * Field type
 */
export type FieldType = 'number' | 'string' | 'date' | 'boolean' | 'enum';

/**
 * Operator type
 */
export type OperatorType =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equals'
  | 'less_than_or_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'before'
  | 'after'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_empty'
  | 'is_not_empty';

/**
 * Field option interface
 */
export interface FieldOption {
  /**
   * Option value
   */
  value: string;

  /**
   * Option label
   */
  label: string;
}

/**
 * Field interface
 */
export interface Field {
  /**
   * Field ID
   */
  id: string;

  /**
   * Field label
   */
  label: string;

  /**
   * Field type
   */
  type: FieldType;

  /**
   * Field description
   */
  description?: string;

  /**
   * Field options (for enum type)
   */
  options?: FieldOption[];

  /**
   * Field category
   */
  category?: string;
}

/**
 * Date range interface
 */
export interface DateRange {
  /**
   * Start date
   */
  start: Date | null;

  /**
   * End date
   */
  end: Date | null;
}

/**
 * Filter value type
 */
export type FilterValue = string | number | boolean | string[] | DateRange | Date | null;

/**
 * Filter interface
 */
export interface Filter {
  /**
   * Filter ID
   */
  id: string;

  /**
   * Field ID
   */
  fieldId: string;

  /**
   * Operator
   */
  operator: OperatorType;

  /**
   * Filter value
   */
  value: FilterValue;
}

/**
 * Operator interface
 */
export interface Operator {
  /**
   * Operator value
   */
  value: OperatorType;

  /**
   * Operator label
   */
  label: string;
}

/**
 * Filter preset interface
 */
export interface FilterPreset {
  /**
   * Preset ID
   */
  id?: string;

  /**
   * Preset name
   */
  name: string;

  /**
   * Preset filters
   */
  filters: Filter[];

  /**
   * Whether the preset is a system preset
   */
  isSystem?: boolean;

  /**
   * Preset description
   */
  description?: string;
}

/**
 * Report interface
 */
export interface Report {
  /**
   * Report ID
   */
  id: string;

  /**
   * Report name
   */
  name: string;

  /**
   * Report description
   */
  description?: string;

  /**
   * Report type
   */
  type: string;

  /**
   * Report category
   */
  category?: string;

  /**
   * Report filters
   */
  filters?: Filter[];

  /**
   * Report creation date
   */
  createdAt: string;

  /**
   * Report update date
   */
  updatedAt: string;

  /**
   * Report created by
   */
  createdBy: string;

  /**
   * Report owner
   */
  owner?: string;

  /**
   * Report schedule
   */
  schedule?: ReportSchedule;

  /**
   * Report sharing settings
   */
  sharing?: ReportSharing;

  /**
   * Report is favorite
   */
  isFavorite?: boolean;

  /**
   * Report configuration
   */
  configuration?: any;

  /**
   * Report view count
   */
  viewCount?: number;

  /**
   * Report title (alias for name)
   */
  title?: string;
}

/**
 * Report schedule interface
 */
export interface ReportSchedule {
  /**
   * Schedule ID
   */
  id: string;

  /**
   * Schedule frequency
   */
  frequency: 'daily' | 'weekly' | 'monthly';

  /**
   * Schedule time
   */
  time: string;

  /**
   * Schedule day (for weekly and monthly)
   */
  day?: number;

  /**
   * Schedule recipients
   */
  recipients: string[];

  /**
   * Schedule format
   */
  format: 'pdf' | 'excel' | 'csv';

  /**
   * Whether the schedule is active
   */
  isActive: boolean;
}

/**
 * Report sharing interface
 */
export interface ReportSharing {
  /**
   * Whether the report is public
   */
  isPublic: boolean;

  /**
   * Shared with users
   */
  sharedWith: string[];

  /**
   * Shared with teams
   */
  sharedWithTeams: string[];

  /**
   * Sharing permissions
   */
  permissions: 'view' | 'edit' | 'full';
}

export default Report;

// Group By Options
export type GroupByOption = 'Day' | 'Month' | 'Year' | 'Country' | 'Platform' | 'Game' | 'Currency';

// Advanced Filters
export interface AdvancedFilters {
  registration?: Date;
  firstTimeDeposit?: Date;
  lastDepositDate?: Date;
  lastLogin?: Date;
  trackers?: string;
  country?: string;
  platform?: string;
  game?: string;
  currency?: string;
  minDeposit?: number;
  maxDeposit?: number;
  minBet?: number;
  maxBet?: number;
  // New multi-select filters
  countries?: (string | number)[];
  labels?: (string | number)[];
  [key: string]: any;
}

// Report Filters
export interface ReportFilters {
  startDate: string;
  endDate: string;
  groupBy?: GroupByOption;
  registrationDate?: string;
  firstDepositDate?: string;
  lastDepositDate?: string;
  lastLoginDate?: string;
  trackers?: string;
  country?: string;
  platform?: string;
  game?: string;
  currency?: string;
  minDeposit?: number;
  maxDeposit?: number;
  minBet?: number;
  maxBet?: number;
  [key: string]: any;
}

// Daily Action Data
export interface DailyAction {
  id: string;
  date: string;
  groupValue: string;
  uniquePlayers: number;
  newRegistrations: number;
  deposits: number;
  withdrawals: number;
  bets: number;
  wins: number;
  ggr: number;
  betCount: number;
  avgSessionDuration?: string;
  conversionRate?: number;
  retentionRate?: number;
  [key: string]: any;
}

// Comparison Period Type
export type ComparisonPeriodType = 'previous' | 'lastWeek' | 'lastMonth' | 'lastYear' | 'custom';

// Metric Type for Summary Cards
export type SummaryMetricType =
  'totalPlayers' |
  'newRegistrations' |
  'totalDeposits' |
  'totalBets' |
  'totalWithdrawals' |
  'totalGGR' |
  'avgBetAmount' |
  'conversionRate' |
  'retentionRate' |
  'activeUsers' |
  'avgSessionDuration' |
  'betCount';

// Metric Definition
export interface MetricDefinition {
  id: SummaryMetricType;
  label: string;
  description: string;
  format: 'number' | 'currency' | 'percentage' | 'time';
  icon: React.ReactNode | null;
  defaultComparisonPeriod: ComparisonPeriodType;
}

// Daily Actions Summary
export interface DailyActionsSummary {
  // Core metrics
  totalPlayers: number;
  newRegistrations: number;
  totalDeposits: number;
  totalBets: number;

  // Additional metrics
  totalWithdrawals?: number;
  totalGGR?: number;
  avgBetAmount?: number;
  conversionRate?: number;
  retentionRate?: number;
  activeUsers?: number;
  avgSessionDuration?: number;
  betCount?: number;

  // Trends with comparison periods
  trends?: {
    [key in SummaryMetricType]?: {
      [period in ComparisonPeriodType]?: number;
    };
  };

  // Legacy trend fields for backward compatibility
  playersTrend?: number | null;
  registrationsTrend?: number | null;
  depositsTrend?: number | null;
  betsTrend?: number | null;
}
