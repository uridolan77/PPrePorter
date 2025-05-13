import { SummaryMetricType, ComparisonPeriodType, DailyActionsSummary } from '../../../types/reports';

export interface WhiteLabel {
  id: string;
  name: string;
}

export interface DailyAction {
  id: string;
  date: string;
  whiteLabelId: number;
  whiteLabelName: string;
  registrations: number;
  ftd: number;
  deposits: number;
  paidCashouts: number;
  betsCasino?: number;
  winsCasino?: number;
  betsSport?: number;
  winsSport?: number;
  betsLive?: number;
  winsLive?: number;
  betsBingo?: number;
  winsBingo?: number;
  ggrCasino: number;
  ggrSport: number;
  ggrLive: number;
  ggrBingo?: number;
  totalGGR: number;
  // Additional properties for metrics
  bets?: number;
  uniquePlayers?: number;
  // Additional properties for grouped data
  groupKey?: string;
  groupValue?: string;
  // Additional properties for other grouping dimensions
  country?: string;
  tracker?: string;
  currency?: string;
  gender?: string;
  platform?: string;
  ranking?: string;

  // Hierarchical data properties
  hierarchicalPath?: string;
  level?: number;
  hasChildren?: boolean;
  childrenLoaded?: boolean;
  children?: DailyAction[];
}

// Using the DailyActionsSummary interface from types/reports.ts
export interface Summary extends DailyActionsSummary {
  totalFTD: number;
  totalCashouts: number;
  // For backward compatibility with existing code
  totalRegistrations?: number;
}

export interface Filters {
  startDate: string;
  endDate: string;
  whiteLabelIds?: number[]; // Changed to match backend's expectation of a list
  countryIds?: string[]; // Added country IDs for filtering
  groupBy?: number; // Changed to number to match backend's GroupByOption enum

  // Advanced filters - Date filters
  registrationDate?: string;
  firstDepositDate?: string;
  lastDepositDate?: string;
  lastLoginDate?: string;

  // Advanced filters - String filters
  trackers?: string;
  promotionCode?: string;
  playerIds?: string[];

  // Advanced filters - Array filters
  playModes?: string[];
  platforms?: string[];
  statuses?: string[];
  genders?: string[];
  currencies?: string[];

  // Advanced filters - Boolean filters
  smsEnabled?: boolean;
  mailEnabled?: boolean;
  phoneEnabled?: boolean;
  postEnabled?: boolean;
  bonusEnabled?: boolean;
}

export interface Country {
  id: string;
  name: string;
}

export interface GroupByOption {
  id: string;
  name: string;
}

export interface AdvancedFilters {
  registration?: Date | null;
  firstTimeDeposit?: Date | null;
  lastDepositDate?: Date | null;
  lastLogin?: Date | null;
  trackers?: string;
  promotionCode?: string;
  players?: string;
  regPlayMode?: string[];
  platform?: string[];
  status?: string[];
  gender?: string[];
  currency?: string[];
  playersType?: string[];
  smsEnabled?: string;
  mailEnabled?: string;
  phoneEnabled?: string;
  postEnabled?: string;
  bonusEnabled?: string;
}

// Hierarchical Grouping
export interface HierarchicalGrouping {
  enabled: boolean;
  groupByLevels: string[];
  expandedGroups?: string[];
  currentLevel?: number;
  parentPath?: string;
}

// Hierarchical Group
export interface HierarchicalGroup {
  id: string;
  key: string;
  value: string;
  path: string;
  level: number;
  children: HierarchicalGroup[];
  data: DailyAction[];
  metrics: Record<string, number>;
  hasChildren: boolean;
  childrenLoaded: boolean;
  groupData?: any;
}
