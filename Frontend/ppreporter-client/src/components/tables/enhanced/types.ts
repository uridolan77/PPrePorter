import { ColumnDef as BaseColumnDef, TableFeatures } from '../UnifiedDataTable';
import { SxProps, Theme, TooltipProps } from '@mui/material';
import React from 'react';

// Export formats
export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
  JSON = 'json'
}

// Aggregation function type
export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count';

// Aggregation definition interface
export interface AggregationDefinition {
  columnId: string;
  function: AggregationFunction;
  label?: string;
}

// Row detail renderer function type
export type RowDetailRenderer = (row: any) => React.ReactNode;

// Drill-down configuration interface
export interface DrillDownConfig {
  // The source grouping level (e.g., 'Month', 'Label')
  sourceGrouping: string;
  // The target grouping level (e.g., 'Day', 'Player')
  targetGrouping: string;
  // Optional filter transformation function
  transformFilter?: (row: any) => Record<string, any>;
  // Label for the drill-down action
  label?: string;
}

// Cell spanning configuration
export interface CellSpanConfig {
  rowSpan?: number | ((row: any, rowIndex: number, data: any[]) => number);
  colSpan?: number | ((row: any, rowIndex: number, data: any[]) => number);
}

// Tooltip configuration
export interface TooltipConfig {
  enabled: boolean;
  content?: React.ReactNode | ((value: any, row: any) => React.ReactNode);
  placement?: 'top' | 'right' | 'bottom' | 'left';
  props?: Partial<TooltipProps>;
}

// Extended column definition with additional properties
export interface ColumnDef extends BaseColumnDef {
  // Additional properties for enhanced features
  hidden?: boolean;
  pinned?: boolean;
  groupable?: boolean;
  filterable?: boolean;
  aggregatable?: boolean;
  drillDownTarget?: string;

  // New properties for additional features
  spanConfig?: CellSpanConfig;
  tooltip?: TooltipConfig;
  calculated?: boolean;
  formula?: (row: any) => any;

  // Tree data properties
  treeColumn?: boolean;
}

// Feature configuration interfaces
export interface SortingConfig {
  enabled: boolean;
  defaultColumn?: string;
  defaultDirection?: 'asc' | 'desc';
  multiColumn?: boolean;
  serverSide?: boolean;
}

export interface FilteringConfig {
  enabled: boolean;
  serverSide?: boolean;
  quickFilter?: boolean;
  advancedFilter?: boolean;
  filterTypes?: string[];
}

export interface PaginationConfig {
  enabled: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  serverSide?: boolean;
}

export interface GroupingConfig {
  enabled: boolean;
  defaultGroupBy?: string | null;
  allowMultipleGroups?: boolean;
  expandByDefault?: boolean;
}

export interface AggregationConfig {
  enabled: boolean;
  defaultAggregations?: string[];
  showInFooter?: boolean;
  showInGroupHeader?: boolean;
}

export interface ColumnManagementConfig {
  enabled: boolean;
  allowReordering?: boolean;
  allowHiding?: boolean;
  allowPinning?: boolean;
  allowResizing?: boolean;
}

export interface ExpandableRowsConfig {
  enabled: boolean;
  expandByDefault?: boolean;
  singleExpand?: boolean;
}

export interface KeyboardNavigationConfig {
  enabled: boolean;
  allowCellNavigation?: boolean;
  allowRowNavigation?: boolean;
  allowPageNavigation?: boolean;
}

export interface StickyColumnsConfig {
  enabled: boolean;
  defaultStickyColumns?: string[];
  allowUserCustomization?: boolean;
}

export interface ResponsiveConfig {
  enabled: boolean;
  breakpoints?: {
    xs?: string[];
    sm?: string[];
    md?: string[];
    lg?: string[];
    xl?: string[];
  };
  priorityColumns?: string[];
}

export interface DrillDownConfig {
  enabled: boolean;
  configs?: DrillDownConfig[];
}

export interface StateManagementConfig {
  enabled: boolean;
  persistInLocalStorage?: boolean;
  persistInUrl?: boolean;
  stateKey?: string;
}

export interface ExportConfig {
  enabled: boolean;
  formats?: ExportFormat[];
  includeHiddenColumns?: boolean;
  fileName?: string;
}

export interface TreeDataConfig {
  enabled: boolean;
  childField: string;
  expandByDefault?: boolean;
  levelIndent?: number;
  labelField?: string;
}

export interface CellSpanningConfig {
  enabled: boolean;
  defaultRowSpan?: number;
  defaultColSpan?: number;
}

export interface InfiniteScrollConfig {
  enabled: boolean;
  loadMoreThreshold?: number;
  pageSize?: number;
  initialLoad?: number;
}

export interface ColumnResizingConfig {
  enabled: boolean;
  minWidth?: number;
  maxWidth?: number;
  persistWidths?: boolean;
  resizeMode?: 'fit' | 'expand';
}

export interface SearchHighlightingConfig {
  enabled: boolean;
  highlightStyle?: React.CSSProperties;
  caseSensitive?: boolean;
}

export interface HistoryConfig {
  enabled: boolean;
  maxHistoryLength?: number;
  trackChanges?: ('sorting' | 'filtering' | 'pagination' | 'grouping' | 'columns' | 'aggregation')[];
}

export interface BulkImportConfig {
  enabled: boolean;
  formats: ('csv' | 'json' | 'excel')[];
  validateRow?: (row: any) => { valid: boolean; errors: string[] };
  headerMapping?: Record<string, string>;
}

export interface ColumnCalculationsConfig {
  enabled: boolean;
  recalculateOnDataChange?: boolean;
}

// Table state interface
export interface TableState {
  sorting: {
    column: string;
    direction: 'asc' | 'desc';
  };
  filtering: {
    quickFilter: string;
    advancedFilters: Record<string, any>;
  };
  pagination: {
    page: number;
    pageSize: number;
  };
  grouping: {
    groupByColumn: string | null;
  };
  columns: {
    visible: string[];
    order: string[];
    sticky: string[];
    widths: Record<string, number>;
  };
  aggregation: {
    enabled: string[];
  };
  expandedRows: string[];
  selectedRows: string[];
  treeData: {
    expandedNodes: string[];
  };
  infiniteScroll: {
    loadedPages: number;
  };
  history: {
    undoStack: Partial<TableState>[];
    redoStack: Partial<TableState>[];
  };
  calculatedColumns: {
    values: Record<string, any>;
  };
}

// Enhanced table props interface
export interface EnhancedTableProps {
  // Base props
  data: any[];
  columns: ColumnDef[];
  title?: string;
  loading?: boolean;
  emptyMessage?: string;
  idField?: string;
  sx?: SxProps<Theme>;

  // Event handlers
  onRowClick?: (row: any) => void;
  onRefresh?: () => void;
  onExport?: (format: ExportFormat, data: any[]) => void;
  onStateChange?: (state: TableState) => void;
  onDrillDown?: (row: any, sourceGrouping: string, targetGrouping: string, filters: Record<string, any>) => void;

  // Feature configurations
  features?: {
    sorting?: boolean | SortingConfig;
    filtering?: boolean | FilteringConfig;
    pagination?: boolean | PaginationConfig;
    grouping?: boolean | GroupingConfig;
    aggregation?: boolean | AggregationConfig;
    columnManagement?: boolean | ColumnManagementConfig;
    expandableRows?: boolean | ExpandableRowsConfig;
    keyboardNavigation?: boolean | KeyboardNavigationConfig;
    stickyColumns?: boolean | StickyColumnsConfig;
    responsive?: boolean | ResponsiveConfig;
    drillDown?: boolean | DrillDownConfig;
    stateManagement?: boolean | StateManagementConfig;
    export?: boolean | ExportConfig;

    // New features
    treeData?: boolean | TreeDataConfig;
    cellSpanning?: boolean | CellSpanningConfig;
    infiniteScroll?: boolean | InfiniteScrollConfig;
    columnResizing?: boolean | ColumnResizingConfig;
    searchHighlighting?: boolean | SearchHighlightingConfig;
    history?: boolean | HistoryConfig;
    bulkImport?: boolean | BulkImportConfig;
    columnCalculations?: boolean | ColumnCalculationsConfig;
  };

  // Feature-specific props
  renderRowDetail?: RowDetailRenderer;
  initialState?: Partial<TableState>;
  stateFromUrl?: boolean;

  // New event handlers
  onColumnResize?: (columnId: string, width: number) => void;
  onLoadMore?: (page: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onImport?: (data: any[]) => void;
  onCalculatedColumnChange?: (columnId: string, values: Record<string, any>) => void;
}
