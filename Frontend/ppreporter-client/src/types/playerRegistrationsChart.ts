/**
 * Types for PlayerRegistrationsChart component
 */

/**
 * Registration data interface
 */
export interface RegistrationData {
  /**
   * Date of the registration data
   */
  date: string;
  
  /**
   * Number of registrations
   */
  registrations: number;
  
  /**
   * Number of first time depositors
   */
  firstTimeDepositors: number;
  
  /**
   * Conversion rate (optional)
   */
  conversionRate?: number;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Formatted registration data for chart
 */
export interface FormattedRegistrationData {
  /**
   * Formatted date string
   */
  date: string;
  
  /**
   * Original full date
   */
  fullDate: string;
  
  /**
   * Number of registrations
   */
  registrations: number;
  
  /**
   * Number of first time depositors
   */
  ftd: number;
  
  /**
   * Conversion rate (optional)
   */
  conversionRate?: number;
}

/**
 * PlayerRegistrationsChart component props interface
 */
export interface PlayerRegistrationsChartProps {
  /**
   * Array of registration data
   */
  data: RegistrationData[];
  
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
   * Whether to show conversion rate
   */
  showConversionRate?: boolean;
}

export default PlayerRegistrationsChartProps;
