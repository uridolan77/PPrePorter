/**
 * Types for Financial Report
 */

/**
 * Financial data point interface
 */
export interface FinancialData {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Date of the financial data
   */
  date: string;

  /**
   * White label ID
   */
  whiteLabelId?: string;

  /**
   * White label name
   */
  whiteLabelName?: string;

  /**
   * Total revenue
   */
  revenue: number;

  /**
   * Gross Gaming Revenue
   */
  ggr: number;

  /**
   * Net Gaming Revenue
   */
  ngr: number;

  /**
   * Total deposits amount
   */
  deposits: number;

  /**
   * Total withdrawals amount
   */
  withdrawals: number;

  /**
   * Net deposits (deposits - withdrawals)
   */
  netDeposits: number;

  /**
   * Bonus amount
   */
  bonusAmount?: number;

  /**
   * Marketing cost
   */
  marketingCost?: number;

  /**
   * Operational cost
   */
  operationalCost?: number;

  /**
   * Net profit
   */
  netProfit?: number;

  /**
   * Tax amount
   */
  taxAmount?: number;

  /**
   * Currency
   */
  currency?: string;

  /**
   * Additional properties
   */
  [key: string]: any;
}

/**
 * Financial summary interface
 */
export interface FinancialSummary {
  /**
   * Total revenue
   */
  totalRevenue: number;

  /**
   * Total GGR
   */
  totalGGR: number;

  /**
   * Total NGR
   */
  totalNGR: number;

  /**
   * Total deposits
   */
  totalDeposits: number;

  /**
   * Total withdrawals
   */
  totalWithdrawals: number;

  /**
   * Total net deposits
   */
  totalNetDeposits: number;

  /**
   * Total bonus amount
   */
  totalBonusAmount?: number;

  /**
   * Total marketing cost
   */
  totalMarketingCost?: number;

  /**
   * Total operational cost
   */
  totalOperationalCost?: number;

  /**
   * Total net profit
   */
  totalNetProfit?: number;

  /**
   * Total tax amount
   */
  totalTaxAmount?: number;
}

/**
 * Financial report filters interface
 */
export interface FinancialFilters {
  /**
   * Start date (YYYY-MM-DD)
   */
  startDate: string;

  /**
   * End date (YYYY-MM-DD)
   */
  endDate: string;

  /**
   * White label IDs
   */
  whiteLabelIds?: string[];

  /**
   * Country IDs
   */
  countryIds?: string[];

  /**
   * Group by option
   */
  groupBy?: 'day' | 'week' | 'month' | 'whiteLabel' | 'country';

  /**
   * Currency
   */
  currency?: string;

  /**
   * Additional filter properties
   */
  [key: string]: any;
}

/**
 * Financial metadata interface
 */
export interface FinancialMetadata {
  /**
   * Available white labels
   */
  whiteLabels: Array<{
    id: string;
    name: string;
  }>;

  /**
   * Available countries
   */
  countries: Array<{
    id: string;
    name: string;
  }>;

  /**
   * Available currencies
   */
  currencies: Array<{
    code: string;
    name: string;
  }>;
}
