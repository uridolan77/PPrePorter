/**
 * This file provides type definitions for the legacy EnhancedUnifiedDataTable component.
 * It's maintained for backward compatibility with the enhanced table components.
 */

import { ReactNode } from 'react';
import { UnifiedDataTableProps, ExportFormat } from './UnifiedDataTable';

/**
 * Props for the EnhancedUnifiedDataTable component
 */
export interface EnhancedUnifiedDataTableProps extends UnifiedDataTableProps {
  /**
   * Whether to enable column selection
   */
  enableColumnSelection?: boolean;
  
  /**
   * Whether to enable advanced filtering
   */
  enableAdvancedFiltering?: boolean;
  
  /**
   * Whether to enable export options
   */
  enableExportOptions?: boolean;
  
  /**
   * Whether to enable column reordering
   */
  enableColumnReordering?: boolean;
  
  /**
   * Whether to enable row grouping
   */
  enableRowGrouping?: boolean;
  
  /**
   * Whether to enable summary row
   */
  enableSummaryRow?: boolean;
  
  /**
   * Whether to enable expandable rows
   */
  enableExpandableRows?: boolean;
  
  /**
   * Whether to enable keyboard navigation
   */
  enableKeyboardNavigation?: boolean;
  
  /**
   * Whether to enable sticky columns
   */
  enableStickyColumns?: boolean;
  
  /**
   * Whether to enable responsive design
   */
  enableResponsiveDesign?: boolean;
  
  /**
   * Whether to enable drill down
   */
  enableDrillDown?: boolean;
  
  /**
   * Filter definitions
   */
  filterDefinitions?: any[];
  
  /**
   * Columns that can be grouped
   */
  groupableColumns?: string[];
  
  /**
   * IDs of sticky columns
   */
  stickyColumnIds?: string[];
  
  /**
   * Drill down configuration
   */
  drillDownConfig?: any[];
  
  /**
   * Aggregation definitions
   */
  aggregations?: any[];
  
  /**
   * Function to render row details
   */
  renderRowDetail?: (row: any) => ReactNode;
  
  /**
   * Callback when export format is selected
   */
  onExportFormat?: (format: string) => void;
  
  /**
   * Callback when advanced filters are applied
   */
  onApplyAdvancedFilters?: (filters: Record<string, any>) => void;
  
  /**
   * Callback when column order changes
   */
  onColumnOrderChange?: (columns: Array<{id: string}>) => void;
  
  /**
   * Callback when grouping changes
   */
  onGroupingChange?: (groupBy: string | null) => void;
  
  /**
   * Callback when row is expanded
   */
  onRowExpand?: (rowId: string, expanded: boolean) => void;
  
  /**
   * Callback when drill down is performed
   */
  onDrillDown?: (row: any, sourceGrouping: string, targetGrouping: string, filters: Record<string, any>) => void;
}

// Re-export ExportFormat
export { ExportFormat };

// Default export
export default EnhancedUnifiedDataTableProps;
