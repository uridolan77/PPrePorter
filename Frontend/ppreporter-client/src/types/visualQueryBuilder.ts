/**
 * Types for VisualQueryBuilder component
 */

/**
 * Field interface
 */
export interface Field {
  /**
   * Field ID
   */
  id: string;
  
  /**
   * Field name
   */
  name: string;
  
  /**
   * Field type
   */
  type: 'string' | 'number' | 'date' | 'currency';
  
  /**
   * Field group
   */
  group: string;
}

/**
 * Operator interface
 */
export interface Operator {
  /**
   * Operator ID
   */
  id: string;
  
  /**
   * Operator label
   */
  label: string;
  
  /**
   * Operator symbol
   */
  symbol: string;
}

/**
 * Sort direction interface
 */
export interface SortDirection {
  /**
   * Sort direction ID
   */
  id: 'asc' | 'desc';
  
  /**
   * Sort direction label
   */
  label: string;
  
  /**
   * Sort direction symbol
   */
  symbol: string;
}

/**
 * Filter interface
 */
export interface Filter {
  /**
   * Filter ID
   */
  id: string;
  
  /**
   * Filter field
   */
  field: Field;
  
  /**
   * Filter operator
   */
  operator: string | null;
  
  /**
   * Filter value
   */
  value: string | number | null;
  
  /**
   * Second filter value (for between operators)
   */
  secondValue?: string | number | null;
}

/**
 * Sort interface
 */
export interface Sort {
  /**
   * Sort ID
   */
  id: string;
  
  /**
   * Sort field
   */
  field: Field;
  
  /**
   * Sort direction
   */
  direction: 'asc' | 'desc';
}

/**
 * Query interface
 */
export interface Query {
  /**
   * Selected columns
   */
  columns: Field[];
  
  /**
   * Applied filters
   */
  filters: Filter[];
  
  /**
   * Sort criteria
   */
  sort: Sort[];
  
  /**
   * Group by fields
   */
  groupBy: Field[];
}

/**
 * VisualQueryBuilder component props interface
 */
export interface VisualQueryBuilderProps {
  /**
   * Callback when query changes
   */
  onQueryChange?: (query: Query) => void;
  
  /**
   * Initial query state
   */
  initialQuery?: Query;
  
  /**
   * Callback to execute query
   */
  onExecuteQuery?: (query: Query) => void;
  
  /**
   * Data preview
   */
  dataPreview?: any[] | null;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Error message
   */
  error?: string | null;
}

export default VisualQueryBuilderProps;
