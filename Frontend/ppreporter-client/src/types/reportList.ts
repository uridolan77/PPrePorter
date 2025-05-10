/**
 * Types for report list components
 */

import { Report } from './reportsData';

/**
 * Report category interface
 */
export interface ReportCategory {
  /**
   * Category ID
   */
  id: string;
  
  /**
   * Category name
   */
  name: string;
  
  /**
   * Category description
   */
  description?: string;
  
  /**
   * Category icon
   */
  icon?: string;
}

/**
 * Sort options for reports
 */
export type ReportSortOption = 'name' | 'created' | 'updated' | 'popular';

/**
 * Report list props interface
 */
export interface ReportListProps {
  /**
   * List of reports to display
   */
  reports?: Report[];
  
  /**
   * Function called when a report is viewed
   */
  onViewReport?: (report: Report) => void;
  
  /**
   * Function called when a new report is created
   */
  onCreateReport?: () => void;
  
  /**
   * Function called when a report is edited
   */
  onEditReport?: (report: Report) => void;
  
  /**
   * Function called when a report is deleted
   */
  onDeleteReport?: (report: Report) => void;
  
  /**
   * Function called when a report is duplicated
   */
  onDuplicateReport?: (report: Report) => void;
  
  /**
   * Function called when search query changes
   */
  onSearch?: (searchTerm: string, category: string, sortBy: ReportSortOption) => void;
  
  /**
   * Function called when a report is favorited/unfavorited
   */
  onFavoriteToggle?: (report: Report) => void;
  
  /**
   * Whether data is loading
   */
  loading?: boolean;
  
  /**
   * Total number of reports available
   */
  totalCount?: number;
  
  /**
   * Error message to display
   */
  error?: string | null;
  
  /**
   * Available report categories
   */
  categories?: ReportCategory[];
  
  /**
   * Whether to show action buttons
   */
  showActions?: boolean;
}

export default ReportListProps;
