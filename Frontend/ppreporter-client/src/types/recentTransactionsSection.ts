/**
 * Types for RecentTransactionsSection component
 */

/**
 * Transaction interface
 */
export interface Transaction {
  /**
   * Transaction ID
   */
  id: string | number;
  
  /**
   * Player name
   */
  player: string;
  
  /**
   * Transaction amount
   */
  amount: number;
  
  /**
   * Transaction type
   */
  type: string;
  
  /**
   * Transaction status
   */
  status: string;
  
  /**
   * Transaction date
   */
  date: string;
}

/**
 * RecentTransactionsSection component props interface
 */
export interface RecentTransactionsSectionProps {
  /**
   * Transactions data
   */
  data?: Transaction[];
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Callback when download button is clicked
   */
  onDownload?: () => void;
  
  /**
   * Callback when settings button is clicked
   */
  onSettings?: () => void;
}

export default RecentTransactionsSectionProps;
