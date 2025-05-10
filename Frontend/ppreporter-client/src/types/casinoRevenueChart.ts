/**
 * Types for CasinoRevenueChart component
 */

/**
 * Revenue data interface
 */
export interface RevenueData {
  /**
   * Date of the revenue data
   */
  date: string;
  
  /**
   * Revenue amount
   */
  revenue?: number | string;
  
  /**
   * Alternative value field
   */
  value?: number | string;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Formatted revenue data for chart
 */
export interface FormattedRevenueData {
  /**
   * Formatted date string
   */
  date: string;
  
  /**
   * Original full date
   */
  fullDate: string;
  
  /**
   * Revenue amount
   */
  revenue: number;
  
  /**
   * Formatted revenue value
   */
  formattedValue: string;
}

/**
 * CasinoRevenueChart component props interface
 */
export interface CasinoRevenueChartProps {
  /**
   * Array of revenue data
   */
  data: RevenueData[];
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Chart height
   */
  height?: number;
  
  /**
   * Whether to show the legend
   */
  showLegend?: boolean;
  
  /**
   * Currency code for formatting
   */
  currency?: string;
}

export default CasinoRevenueChartProps;
