/**
 * Report types for TypeScript components
 */

/**
 * Field type
 */
export type FieldType = 'number' | 'string' | 'date' | 'boolean' | 'enum';

/**
 * Operator type
 */
export type OperatorType = 
  | 'equals' 
  | 'not_equals' 
  | 'greater_than' 
  | 'less_than' 
  | 'greater_than_or_equals' 
  | 'less_than_or_equals'
  | 'contains' 
  | 'not_contains' 
  | 'starts_with' 
  | 'ends_with'
  | 'before' 
  | 'after' 
  | 'between'
  | 'in' 
  | 'not_in'
  | 'is_empty' 
  | 'is_not_empty';

/**
 * Field option interface
 */
export interface FieldOption {
  /**
   * Option value
   */
  value: string;
  
  /**
   * Option label
   */
  label: string;
}

/**
 * Field interface
 */
export interface Field {
  /**
   * Field ID
   */
  id: string;
  
  /**
   * Field label
   */
  label: string;
  
  /**
   * Field type
   */
  type: FieldType;
  
  /**
   * Field description
   */
  description?: string;
  
  /**
   * Field options (for enum type)
   */
  options?: FieldOption[];
  
  /**
   * Field category
   */
  category?: string;
}

/**
 * Date range interface
 */
export interface DateRange {
  /**
   * Start date
   */
  start: Date | null;
  
  /**
   * End date
   */
  end: Date | null;
}

/**
 * Filter value type
 */
export type FilterValue = string | number | boolean | string[] | DateRange | null;

/**
 * Filter interface
 */
export interface Filter {
  /**
   * Filter ID
   */
  id: string;
  
  /**
   * Field ID
   */
  fieldId: string;
  
  /**
   * Operator
   */
  operator: OperatorType;
  
  /**
   * Filter value
   */
  value: FilterValue;
}

/**
 * Operator interface
 */
export interface Operator {
  /**
   * Operator value
   */
  value: OperatorType;
  
  /**
   * Operator label
   */
  label: string;
}

/**
 * Filter preset interface
 */
export interface FilterPreset {
  /**
   * Preset ID
   */
  id?: string;
  
  /**
   * Preset name
   */
  name: string;
  
  /**
   * Preset filters
   */
  filters: Filter[];
  
  /**
   * Whether the preset is a system preset
   */
  isSystem?: boolean;
  
  /**
   * Preset description
   */
  description?: string;
}

/**
 * Report interface
 */
export interface Report {
  /**
   * Report ID
   */
  id: string;
  
  /**
   * Report name
   */
  name: string;
  
  /**
   * Report description
   */
  description?: string;
  
  /**
   * Report type
   */
  type: string;
  
  /**
   * Report filters
   */
  filters: Filter[];
  
  /**
   * Report creation date
   */
  createdAt: string;
  
  /**
   * Report update date
   */
  updatedAt: string;
  
  /**
   * Report owner
   */
  owner: string;
  
  /**
   * Report schedule
   */
  schedule?: ReportSchedule;
  
  /**
   * Report sharing settings
   */
  sharing?: ReportSharing;
}

/**
 * Report schedule interface
 */
export interface ReportSchedule {
  /**
   * Schedule ID
   */
  id: string;
  
  /**
   * Schedule frequency
   */
  frequency: 'daily' | 'weekly' | 'monthly';
  
  /**
   * Schedule time
   */
  time: string;
  
  /**
   * Schedule day (for weekly and monthly)
   */
  day?: number;
  
  /**
   * Schedule recipients
   */
  recipients: string[];
  
  /**
   * Schedule format
   */
  format: 'pdf' | 'excel' | 'csv';
  
  /**
   * Whether the schedule is active
   */
  isActive: boolean;
}

/**
 * Report sharing interface
 */
export interface ReportSharing {
  /**
   * Whether the report is public
   */
  isPublic: boolean;
  
  /**
   * Shared with users
   */
  sharedWith: string[];
  
  /**
   * Shared with teams
   */
  sharedWithTeams: string[];
  
  /**
   * Sharing permissions
   */
  permissions: 'view' | 'edit' | 'full';
}

export default Report;
