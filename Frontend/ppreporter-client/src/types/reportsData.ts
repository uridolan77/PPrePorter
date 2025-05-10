/**
 * Reports data types for TypeScript components
 */

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
   * Report created date
   */
  createdAt: string;

  /**
   * Report updated date
   */
  updatedAt: string;

  /**
   * Report created by
   */
  createdBy: string;

  /**
   * Report is favorite
   */
  isFavorite?: boolean;

  /**
   * Report configuration
   */
  configuration?: ReportConfiguration;

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
 * Player data
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
  email: string;

  /**
   * Player registration date
   */
  registrationDate: string;

  /**
   * Player status
   */
  status: string;

  /**
   * Player country
   */
  country: string;

  /**
   * Player balance
   */
  balance: number;

  /**
   * Player tier
   */
  tier: string;

  /**
   * Player last login date
   */
  lastLogin?: string;

  /**
   * Player device
   */
  device?: string;

  /**
   * Player white label
   */
  whiteLabel?: string;

  /**
   * Player KYC status
   */
  kycStatus?: string;

  /**
   * Player lifetime deposits
   */
  lifetimeDeposits?: number;

  /**
   * Player lifetime withdrawals
   */
  lifetimeWithdrawals?: number;

  /**
   * Player lifetime bets
   */
  lifetimeBets?: number;

  /**
   * Player lifetime wins
   */
  lifetimeWins?: number;

  /**
   * Player lifetime GGR
   */
  lifetimeGGR?: number;

  /**
   * Player tags
   */
  tags?: string[];

  /**
   * Player notes
   */
  notes?: string;

  /**
   * Player risk score
   */
  riskScore?: number;

  /**
   * Player favorite games
   */
  favoriteGames?: string[];

  /**
   * Player preferred payment method
   */
  preferredPaymentMethod?: string;

  /**
   * Player marketing preferences
   */
  marketingPreferences?: {
    /**
     * Email marketing enabled
     */
    email: boolean;

    /**
     * SMS marketing enabled
     */
    sms: boolean;

    /**
     * Push notifications enabled
     */
    push: boolean;
  };
}

/**
 * Player details
 */
export interface PlayerDetails extends Player {
  /**
   * Player activity history
   */
  activityHistory: {
    /**
     * Activity date
     */
    date: string;

    /**
     * Activity type
     */
    type: string;

    /**
     * Activity amount
     */
    amount?: number;

    /**
     * Activity game
     */
    game?: string;

    /**
     * Activity payment method
     */
    paymentMethod?: string;

    /**
     * Activity IP address
     */
    ipAddress?: string;

    /**
     * Activity device
     */
    device?: string;

    /**
     * Activity location
     */
    location?: string;
  }[];

  /**
   * Player deposit history
   */
  depositHistory: {
    /**
     * Deposit date
     */
    date: string;

    /**
     * Deposit amount
     */
    amount: number;

    /**
     * Deposit payment method
     */
    paymentMethod: string;

    /**
     * Deposit status
     */
    status: string;
  }[];

  /**
   * Player withdrawal history
   */
  withdrawalHistory: {
    /**
     * Withdrawal date
     */
    date: string;

    /**
     * Withdrawal amount
     */
    amount: number;

    /**
     * Withdrawal payment method
     */
    paymentMethod: string;

    /**
     * Withdrawal status
     */
    status: string;
  }[];

  /**
   * Player game history
   */
  gameHistory: {
    /**
     * Game date
     */
    date: string;

    /**
     * Game name
     */
    game: string;

    /**
     * Game bet amount
     */
    betAmount: number;

    /**
     * Game win amount
     */
    winAmount: number;

    /**
     * Game GGR
     */
    ggr: number;

    /**
     * Game duration
     */
    duration: number;
  }[];

  /**
   * Player bonus history
   */
  bonusHistory: {
    /**
     * Bonus date
     */
    date: string;

    /**
     * Bonus type
     */
    type: string;

    /**
     * Bonus amount
     */
    amount: number;

    /**
     * Bonus status
     */
    status: string;

    /**
     * Bonus wagering requirement
     */
    wageringRequirement: number;

    /**
     * Bonus wagering completed
     */
    wageringCompleted: number;
  }[];
}

/**
 * Daily action
 */
export interface DailyAction {
  /**
   * Action ID
   */
  id: string;

  /**
   * Action date
   */
  date: string;

  /**
   * Action player ID
   */
  playerId: string;

  /**
   * Action player username
   */
  playerUsername: string;

  /**
   * Action type
   */
  actionType: string;

  /**
   * Action amount
   */
  amount: number;

  /**
   * Action game
   */
  game?: string;

  /**
   * Action payment method
   */
  paymentMethod?: string;

  /**
   * Action status
   */
  status: string;

  /**
   * Action white label
   */
  whiteLabel: string;

  /**
   * Action country
   */
  country: string;

  /**
   * Action device
   */
  device: string;

  /**
   * Action IP address
   */
  ipAddress?: string;

  /**
   * Action location
   */
  location?: string;

  /**
   * Action duration
   */
  duration?: number;

  /**
   * Action result
   */
  result?: string;
}

/**
 * Report configuration
 */
export interface ReportConfiguration {
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
  filters: any;

  /**
   * Configuration created date
   */
  createdAt?: string;

  /**
   * Configuration updated date
   */
  updatedAt?: string;

  /**
   * Configuration created by
   */
  createdBy?: string;

  /**
   * Configuration is shared
   */
  isShared?: boolean;
}

/**
 * Report metadata
 */
export interface ReportMetadata {
  /**
   * Available filters
   */
  filters: {
    /**
     * Filter ID
     */
    id: string;

    /**
     * Filter label
     */
    label: string;

    /**
     * Filter type
     */
    type: string;

    /**
     * Filter options
     */
    options?: {
      /**
       * Option value
       */
      value: string;

      /**
       * Option label
       */
      label: string;
    }[];
  }[];

  /**
   * Available columns
   */
  columns: {
    /**
     * Column ID
     */
    id: string;

    /**
     * Column label
     */
    label: string;

    /**
     * Column type
     */
    type: string;

    /**
     * Column is sortable
     */
    sortable: boolean;

    /**
     * Column is filterable
     */
    filterable: boolean;
  }[];
}
