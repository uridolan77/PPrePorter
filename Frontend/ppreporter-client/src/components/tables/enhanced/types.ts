import { TableFeatures } from '../UnifiedDataTable';
import { SxProps, Theme, TooltipProps } from '@mui/material';
import React from 'react';

// Base column definition
export interface BaseColumnDef {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: any) => React.ReactNode;
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'status' | 'sparkline' | 'progress' | 'bars' | 'link' |
         'user' | 'rating' | 'badge' | 'boolean' | 'date' | 'tags' | 'microChart';
  wrap?: boolean;
  maxWidth?: string;
  valueKey?: string;
  comparativeKey?: string;
  target?: number;
  sortable?: boolean;
  cellProps?: Record<string, any>;
  linkConfig?: {
    urlField?: string;
    urlPrefix?: string;
    urlSuffix?: string;
    urlBuilder?: (row: any) => string;
    openInNewTab?: boolean;
    displayField?: string;
  };

  // Additional properties for enhanced features
  groupable?: boolean;
  filterable?: boolean;
  aggregatable?: boolean;
  drillDownTarget?: string;
  hidden?: boolean;
  pinned?: boolean;
  width?: number;

  // New properties for additional features
  spanConfig?: CellSpanConfig;
  tooltip?: TooltipConfig;
  calculated?: boolean;
  formula?: (row: any) => any;

  // Tree data properties
  treeColumn?: boolean;

  // Advanced feature properties
  microChartConfig?: MicroChartConfig;
  heatmap?: HeatmapConfig;
  ratingMax?: number;
  progressColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  showProgressValue?: boolean;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  badgeMax?: number;
  badgeContent?: string;
  showZeroBadge?: boolean;
  trueIcon?: string;
  falseIcon?: string;
  trueColor?: string;
  falseColor?: string;
  dateFormat?: 'short' | 'medium' | 'long' | 'relative' | 'datetime' | 'time';
}

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
export interface DrillDownConfigItem {
  // The source grouping level (e.g., 'Month', 'Label')
  sourceGrouping: string;
  // The target grouping level (e.g., 'Day', 'Player')
  targetGrouping: string;
  // Optional filter transformation function
  transformFilter?: (row: any) => Record<string, any>;
  // Label for the drill-down action
  label?: string;
  // Required for compatibility
  enabled?: boolean;
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
  // All properties are now in BaseColumnDef
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
  configs?: DrillDownConfigItem[];
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

export interface PivotTableConfig {
  enabled: boolean;
  rowFields: string[];
  columnFields: string[];
  valueField: string;
  aggregationFunction: AggregationFunction;
  valueFormat?: 'number' | 'currency' | 'percentage';
  showTotals?: boolean;
  midPoint?: number;
}

export interface CustomAggregationsConfig {
  enabled: boolean;
  functions?: Record<string, (values: number[], context?: any) => number>;
}

export interface MicroChartConfig {
  type: 'sparkline' | 'bar' | 'pie';
  dataField: string;
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  showArea?: boolean;
  showPoints?: boolean;
  barSpacing?: number;
  borderRadius?: number;
  showValues?: boolean;
  colors?: string[];
  donut?: boolean;
  innerRadius?: number;
}

export interface HeatmapConfig {
  enabled: boolean;
  minValue?: number;
  maxValue?: number;
  minColor?: string;
  midColor?: string;
  maxColor?: string;
  midPoint?: number;
  adaptiveText?: boolean;
  padding?: number;
  borderRadius?: number;
  align?: 'left' | 'right' | 'center';
}

export interface GanttChartConfig {
  enabled: boolean;
  startField: string;
  endField: string;
  taskField: string;
  dependenciesField?: string;
  progressField?: string;
  colorField?: string;
  defaultColor?: string;
  showDependencies?: boolean;
  showProgress?: boolean;
  showToday?: boolean;
  showWeekends?: boolean;
}

export interface RealtimeConfig {
  enabled: boolean;
  websocketUrl: string;
  messageTypes?: {
    rowAdded?: string;
    rowUpdated?: string;
    rowDeleted?: string;
    refresh?: string;
  };
  reconnectStrategy?: {
    maxRetries?: number;
    backoffFactor?: number;
  };
  customMessageHandlers?: Record<string, (data: any[], message: any) => any[] | null>;
}

export interface WorkerProcessingConfig {
  enabled: boolean;
  workerUrl: string;
  operations?: ('sort' | 'filter' | 'aggregate')[];
}

export interface ProgressiveLoadingConfig {
  enabled: boolean;
  priorityColumns?: string[];
  deferredColumns?: string[];
  loadDelay?: number;
  placeholders?: Record<string, React.ReactNode>;
}

export interface ThemingConfig {
  enabled: boolean;
  theme?: 'light' | 'dark' | 'highContrast' | string;
  customTheme?: {
    header?: {
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
    };
    row?: {
      evenBackgroundColor?: string;
      oddBackgroundColor?: string;
      hoverBackgroundColor?: string;
      selectedBackgroundColor?: string;
      textColor?: string;
      borderColor?: string;
    };
    footer?: {
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
    };
    pagination?: {
      backgroundColor?: string;
      textColor?: string;
      activeColor?: string;
    };
    scrollbar?: {
      trackColor?: string;
      thumbColor?: string;
      thumbHoverColor?: string;
    };
  };
  componentStyles?: Record<string, (props: any) => Record<string, any>>;
}

export interface CustomRenderersConfig {
  enabled: boolean;
  renderers?: Record<string, (value: any, row: any, column: any) => React.ReactNode>;
  conditionalRenderers?: {
    condition: (value: any, row: any, column: any) => boolean;
    renderer: (value: any, row: any, column: any) => React.ReactNode;
  }[];
}

export interface LayoutTemplatesConfig {
  enabled: boolean;
  template?: 'standard' | 'compact' | 'comfortable' | 'dashboard' | 'report' | 'admin' | 'minimal' | string;
  customLayouts?: Record<string, {
    headerHeight?: number;
    rowHeight?: number;
    footerHeight?: number;
    density?: 'compact' | 'standard' | 'comfortable';
    showBorders?: boolean;
    borderRadius?: number;
    elevation?: number;
    padding?: number;
    headerFontSize?: number;
    bodyFontSize?: number;
    footerFontSize?: number;
    headerFontWeight?: number;
    bodyFontWeight?: number;
    footerFontWeight?: number;
    headerTextTransform?: string;
    rowHoverEffect?: 'background' | 'shadow' | 'none';
    rowSelectedEffect?: 'background' | 'border' | 'none';
    animation?: boolean;
  }>;
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

    // Advanced features
    pivotTable?: boolean | PivotTableConfig;
    customAggregations?: boolean | CustomAggregationsConfig;
    microCharts?: boolean;
    heatmap?: boolean | HeatmapConfig;
    ganttChart?: boolean | GanttChartConfig;
    realtime?: boolean | RealtimeConfig;
    workerProcessing?: boolean | WorkerProcessingConfig;
    progressiveLoading?: boolean | ProgressiveLoadingConfig;
    theming?: boolean | ThemingConfig;
    customRenderers?: boolean | CustomRenderersConfig;
    layoutTemplates?: boolean | LayoutTemplatesConfig;
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
