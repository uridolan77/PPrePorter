import { ReactNode, CSSProperties } from 'react';
import { SxProps, Theme } from '@mui/material';
import { ListChildComponentProps } from 'react-window';

/**
 * Common props for all components
 */
export interface CommonProps {
  className?: string;
  style?: CSSProperties;
  sx?: SxProps<Theme>;
}

/**
 * Error state interface
 */
export interface ErrorState {
  message: string;
  code?: string;
  details?: string;
  stack?: string;
}

/**
 * Card component props
 */
export interface CardProps extends CommonProps {
  children: ReactNode;
  title?: string;
  subheader?: string;
  action?: ReactNode;
  icon?: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  variant?: 'outlined' | 'elevation';
}

/**
 * KPI Card component props
 */
export interface KPICardProps extends CommonProps {
  id?: string;
  title: string;
  value: string | number | undefined | null;
  subtitle?: string;
  description?: string;
  trend?: number | null | undefined;
  trendLabel?: string;
  icon?: ReactNode;
  loading?: boolean;
  isLoading?: boolean; // Alias for loading
  error?: string | null;
  onMoreClick?: (event: React.MouseEvent<HTMLElement>) => void;
  color?: string;
  isInverse?: boolean;
  prefix?: string;
  valueFormatOptions?: Intl.NumberFormatOptions;
}

/**
 * Tab Panel component props
 */
export interface TabPanelProps extends CommonProps {
  children?: ReactNode;
  value: number | string;
  index: number | string;
  label?: string;
}

/**
 * Error Boundary component props
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode | ((error: ErrorState) => ReactNode);
}

/**
 * Error Boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: ErrorState | null;
}

/**
 * Empty State component props
 */
export interface EmptyStateProps extends CommonProps {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  description?: string;
}

/**
 * Loading Overlay component props
 */
export interface LoadingOverlayProps extends CommonProps {
  loading: boolean;
  children: ReactNode;
  message?: string;
  transparent?: boolean;
}

/**
 * Error Display component props
 */
export interface ErrorDisplayProps extends CommonProps {
  error: Error | string | null;
  title?: string;
  onRetry?: () => void;
  showDetails?: boolean;
}

/**
 * Filter definition for data filtering
 */
export interface FilterDef {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'text' | 'number' | 'date' | 'daterange' | 'boolean' | 'radio';
  options?: Array<{ value: string | number | boolean; label: string }>;
  defaultValue?: any;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  visible?: boolean;
  validate?: (value: any) => boolean | string;
  format?: (value: any) => string;
  parse?: (value: string) => any;
  [key: string]: any;
}

/**
 * Column definition for tables and data grids
 */
export interface ColumnDef {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: any) => ReactNode;
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'status' | 'sparkline' | 'progress' | 'bars' | 'date';
  sortable?: boolean;
  minWidth?: number;
  maxWidth?: string | number;
  disablePadding?: boolean;
  wrap?: boolean;
  valueKey?: string;
  comparativeKey?: string;
  target?: number;
  filterable?: boolean;
  visible?: boolean;
  hideable?: boolean;
  resizable?: boolean;
  width?: number | string;
  pinned?: 'left' | 'right';
  renderHeader?: (column: ColumnDef) => ReactNode;
  renderCell?: (value: any, row: any, column: ColumnDef) => ReactNode;
}

/**
 * Data grid props
 */
export interface DataGridProps<T = any> extends CommonProps {
  columns: ColumnDef[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  selectable?: boolean;
  selectedRows?: string[] | number[];
  onSelectRows?: (selectedIds: string[] | number[]) => void;
  onRefresh?: () => void;
  onSearch?: (searchTerm: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  emptyMessage?: string;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  idField?: string;
  virtualized?: boolean;
  virtualizedHeight?: number;
  rowHeight?: number;
}

/**
 * Dashboard tabs props
 */
export interface DashboardTabsProps extends CommonProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  dashboardData: any;
  isLoading?: boolean;
  error?: Error | null;
  theme?: Theme;
}

/**
 * Chart component props
 */
export interface ChartProps extends CommonProps {
  data: any[];
  isLoading?: boolean;
  error?: Error | null;
  height?: number;
  width?: number | string;
}

/**
 * Stat card props
 */
export interface StatCardProps extends CommonProps {
  title: string;
  value: number | string;
  prefix?: string;
  icon?: ReactNode;
  change?: number;
  changeIcon?: ReactNode;
  changeText?: string;
  isLoading?: boolean;
}

/**
 * Virtualized list props
 */
export interface VirtualizedListProps<T = any> extends CommonProps {
  data: T[];
  renderRow: (props: { index: number; style: React.CSSProperties; data: T }) => ReactNode;
  height?: number;
  width?: number | string;
  itemSize?: number;
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * Table props
 */
export interface TableProps<T = any> extends CommonProps {
  data: T[];
  columns: ColumnDef[];
  title?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRowClick?: (row: T) => void;
  maxHeight?: number | string;
  showHeader?: boolean;
  emptyMessage?: string;
}

/**
 * User interface
 */
export interface User {
  id: string;
  username?: string;
  email?: string;
  fullName?: string;
  avatar?: string;
  role?: string;
  permissions?: string[];
  active?: boolean;
  lastLogin?: Date;
  preferences?: Record<string, any>;
}
