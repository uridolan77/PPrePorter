/**
 * Types for players
 */

/**
 * Player interface
 */
export interface Player {
  /**
   * Player ID
   */
  id: string;

  /**
   * Player username
   */
  username: string;

  /**
   * Player email
   */
  email?: string;

  /**
   * Player first name
   */
  firstName?: string;

  /**
   * Player last name
   */
  lastName?: string;

  /**
   * Player country
   */
  country?: string;

  /**
   * Player status
   */
  status?: string;

  /**
   * Player registration date
   */
  registrationDate?: string;

  /**
   * Player last login date
   */
  lastLoginDate?: string;

  /**
   * Player balance
   */
  balance?: number;

  /**
   * Player total deposits
   */
  totalDeposits?: number;

  /**
   * Player total withdrawals
   */
  totalWithdrawals?: number;

  /**
   * Player total bets
   */
  totalBets?: number;

  /**
   * Player total wins
   */
  totalWins?: number;

  /**
   * Player net profit
   */
  netProfit?: number;

  /**
   * Player KYC status
   */
  kycStatus?: string;

  /**
   * Player VIP level
   */
  vipLevel?: string;

  /**
   * Player tags
   */
  tags?: string[];

  /**
   * Player notes
   */
  notes?: string;

  /**
   * Player creation date
   */
  createdAt?: string;

  /**
   * Player last update date
   */
  updatedAt?: string;

  /**
   * Player currency
   */
  currency?: string;

  /**
   * Player white label
   */
  whiteLabel?: string;

  /**
   * Player white label ID
   */
  whiteLabelId?: number;

  /**
   * Player platform
   */
  platform?: string;

  /**
   * Player device
   */
  device?: string;

  /**
   * Player phone number
   */
  phoneNumber?: string;

  /**
   * Player SMS enabled
   */
  smsEnabled?: boolean;

  /**
   * Player email enabled
   */
  emailEnabled?: boolean;

  /**
   * Player phone enabled
   */
  phoneEnabled?: boolean;

  /**
   * Player bonus eligible
   */
  bonusEligible?: boolean;
}

/**
 * Player activity interface
 */
export interface PlayerActivity {
  /**
   * Activity ID
   */
  id: string;

  /**
   * Player ID
   */
  playerId: string;

  /**
   * Activity type
   */
  type: string;

  /**
   * Activity timestamp
   */
  timestamp: string;

  /**
   * Activity details
   */
  details: any;

  /**
   * IP address
   */
  ipAddress?: string;

  /**
   * Device information
   */
  device?: string;

  /**
   * Browser information
   */
  browser?: string;

  /**
   * Operating system
   */
  os?: string;

  /**
   * Location information
   */
  location?: string;
}

/**
 * Player transaction interface
 */
export interface PlayerTransaction {
  /**
   * Transaction ID
   */
  id: string;

  /**
   * Player ID
   */
  playerId: string;

  /**
   * Transaction type
   */
  type: string;

  /**
   * Transaction amount
   */
  amount: number;

  /**
   * Transaction currency
   */
  currency: string;

  /**
   * Transaction status
   */
  status: string;

  /**
   * Transaction timestamp
   */
  timestamp: string;

  /**
   * Transaction details
   */
  details?: any;

  /**
   * Payment method
   */
  paymentMethod?: string;

  /**
   * Transaction reference
   */
  reference?: string;
}

/**
 * Player report filters interface
 */
export interface PlayerReportFilters {
  /**
   * Start date
   */
  startDate?: string;

  /**
   * End date
   */
  endDate?: string;

  /**
   * Player status
   */
  status?: string[];

  /**
   * Player country
   */
  country?: string[];

  /**
   * Player VIP level
   */
  vipLevel?: string[];

  /**
   * Player KYC status
   */
  kycStatus?: string[];

  /**
   * Player tags
   */
  tags?: string[];

  /**
   * Search query
   */
  search?: string;

  /**
   * Minimum balance
   */
  minBalance?: number;

  /**
   * Maximum balance
   */
  maxBalance?: number;

  /**
   * Minimum total deposits
   */
  minTotalDeposits?: number;

  /**
   * Maximum total deposits
   */
  maxTotalDeposits?: number;

  /**
   * Sort field
   */
  sortBy?: string;

  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc';

  /**
   * Page number
   */
  page?: number;

  /**
   * Page size
   */
  pageSize?: number;
}

/**
 * Player metadata interface
 */
export interface PlayerMetadata {
  /**
   * Available countries
   */
  countries: string[] | { id: string; name: string }[];

  /**
   * Available statuses
   */
  statuses: string[] | { id: string; name: string }[];

  /**
   * Available VIP levels
   */
  vipLevels: string[];

  /**
   * Available KYC statuses
   */
  kycStatuses: string[];

  /**
   * Available tags
   */
  tags: string[];

  /**
   * Available white labels
   */
  whiteLabels?: { id: string; name: string }[];
}

/**
 * Player report configuration interface
 */
export interface PlayerReportConfiguration {
  /**
   * Configuration ID
   */
  id?: string;

  /**
   * Configuration name
   */
  name: string;

  /**
   * Configuration description
   */
  description?: string;

  /**
   * Configuration filters
   */
  filters: PlayerReportFilters;

  /**
   * Configuration columns
   */
  columns?: string[];

  /**
   * Whether this is the default configuration
   */
  isDefault?: boolean;

  /**
   * Configuration creation date
   */
  createdAt?: string;

  /**
   * Configuration last update date
   */
  updatedAt?: string;
}

/**
 * Export format type
 */
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export default Player;
