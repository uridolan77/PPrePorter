/**
 * Types for Pagination component
 */
import { SxProps, Theme } from '@mui/material';

/**
 * Pagination component props interface
 */
export interface PaginationProps {
  /**
   * Current page (1-based)
   */
  page?: number;
  
  /**
   * Total number of items
   */
  count?: number;
  
  /**
   * Number of items per page
   */
  pageSize?: number;
  
  /**
   * Available page size options
   */
  pageSizeOptions?: number[];
  
  /**
   * Callback when page changes
   */
  onPageChange?: (page: number) => void;
  
  /**
   * Callback when page size changes
   */
  onPageSizeChange?: (pageSize: number) => void;
  
  /**
   * Whether to show page size selector
   */
  showPageSizeSelector?: boolean;
  
  /**
   * Whether to show total count
   */
  showTotalCount?: boolean;
  
  /**
   * Label for page size selector
   */
  labelPageSize?: string;
  
  /**
   * Label for total items
   */
  labelTotalItems?: string;
  
  /**
   * Additional styles
   */
  sx?: SxProps<Theme>;
}

export default PaginationProps;
