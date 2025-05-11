/**
 * This file provides type definitions for the legacy UnifiedDataTable component.
 * It's maintained for backward compatibility with the enhanced table components.
 */

import { ReactNode } from 'react';

/**
 * Column definition for the UnifiedDataTable
 */
export interface ColumnDef {
  /**
   * Unique identifier for the column
   */
  id: string;
  
  /**
   * Display label for the column
   */
  label: string;
  
  /**
   * Alignment of the column content
   */
  align?: 'left' | 'right' | 'center';
  
  /**
   * Format function for the column value
   */
  format?: (value: any, row: any) => ReactNode;
  
  /**
   * Data type of the column
   */
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'status' | 'sparkline' | 'progress' | 'bars' | 'link' |
         'user' | 'rating' | 'badge' | 'boolean' | 'date' | 'tags' | 'microChart';
  
  /**
   * Whether the column content should wrap
   */
  wrap?: boolean;
  
  /**
   * Maximum width of the column
   */
  maxWidth?: string;
  
  /**
   * Whether the column is sortable
   */
  sortable?: boolean;
  
  /**
   * Width of the column
   */
  width?: number;
}

/**
 * Table features configuration
 */
export interface TableFeatures {
  /**
   * Whether sorting is enabled
   */
  sorting?: boolean;
  
  /**
   * Whether filtering is enabled
   */
  filtering?: boolean;
  
  /**
   * Whether pagination is enabled
   */
  pagination?: boolean;
  
  /**
   * Whether virtualization is enabled
   */
  virtualization?: boolean;
  
  /**
   * Whether micro visualizations are enabled
   */
  microVisualizations?: boolean;
  
  /**
   * Whether export is enabled
   */
  exportable?: boolean;
}

/**
 * Props for the UnifiedDataTable component
 */
export interface UnifiedDataTableProps {
  /**
   * Data to display in the table
   */
  data: any[];
  
  /**
   * Column definitions
   */
  columns: ColumnDef[];
  
  /**
   * Table title
   */
  title?: string;
  
  /**
   * Whether the table is loading
   */
  loading?: boolean;
  
  /**
   * Message to display when the table is empty
   */
  emptyMessage?: string;
  
  /**
   * Field to use as the unique identifier for rows
   */
  idField?: string;
  
  /**
   * Features configuration
   */
  features?: TableFeatures;
  
  /**
   * Callback when refresh is requested
   */
  onRefresh?: () => void;
  
  /**
   * Callback when export is requested
   */
  onExport?: () => void;
  
  /**
   * Maximum height of the table
   */
  maxHeight?: string;
  
  /**
   * Options for rows per page
   */
  rowsPerPageOptions?: number[];
  
  /**
   * Default rows per page
   */
  defaultRowsPerPage?: number;
}

/**
 * Export format enum
 */
export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
  JSON = 'json'
}

export default UnifiedDataTableProps;
