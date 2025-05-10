/**
 * Report types for TypeScript components
 */

/**
 * Report data structure
 */
export interface ReportData {
  /**
   * Report identifier
   */
  id: string;
  
  /**
   * Report title
   */
  title: string;
  
  /**
   * Report description
   */
  description?: string;
  
  /**
   * Report creation date
   */
  createdAt: string | Date;
  
  /**
   * Report last update date
   */
  updatedAt: string | Date;
  
  /**
   * Report creator
   */
  createdBy?: string;
  
  /**
   * Report data
   */
  data: any;
  
  /**
   * Report configuration
   */
  config: ReportConfig;
  
  /**
   * Report status
   */
  status?: 'draft' | 'published' | 'archived';
  
  /**
   * Report tags
   */
  tags?: string[];
  
  /**
   * Report sharing settings
   */
  sharing?: {
    isPublic: boolean;
    sharedWith: string[];
  };
}

/**
 * Report configuration
 */
export interface ReportConfig {
  /**
   * Report type
   */
  type: ReportType;
  
  /**
   * Data source
   */
  dataSource: string;
  
  /**
   * Visualization type
   */
  visualizationType: VisualizationType;
  
  /**
   * Selected columns
   */
  columns: string[];
  
  /**
   * Filters
   */
  filters?: ReportFilter[];
  
  /**
   * Group by
   */
  groupBy?: string[];
  
  /**
   * Sort by
   */
  sortBy?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  
  /**
   * Limit
   */
  limit?: number;
  
  /**
   * Refresh interval in minutes
   */
  refreshInterval?: number;
}

/**
 * Report type
 */
export type ReportType = 
  | 'player' 
  | 'revenue' 
  | 'game' 
  | 'transaction' 
  | 'marketing' 
  | 'custom';

/**
 * Visualization type
 */
export type VisualizationType = 
  | 'table' 
  | 'bar' 
  | 'line' 
  | 'pie' 
  | 'area' 
  | 'scatter' 
  | 'map' 
  | 'heatmap' 
  | 'mixed';

/**
 * Report filter
 */
export interface ReportFilter {
  /**
   * Column to filter
   */
  column: string;
  
  /**
   * Filter operator
   */
  operator: FilterOperator;
  
  /**
   * Filter value
   */
  value: any;
}

/**
 * Filter operator
 */
export type FilterOperator = 
  | '=' 
  | '!=' 
  | '>' 
  | '>=' 
  | '<' 
  | '<=' 
  | 'contains' 
  | 'not_contains' 
  | 'starts_with' 
  | 'ends_with' 
  | 'in' 
  | 'not_in' 
  | 'between' 
  | 'is_null' 
  | 'is_not_null';

/**
 * Report section
 */
export interface ReportSection {
  /**
   * Section identifier
   */
  id: string;
  
  /**
   * Section title
   */
  title: string;
  
  /**
   * Section description
   */
  description?: string;
  
  /**
   * Section content
   */
  content: React.ReactNode;
}

/**
 * Report export format
 */
export type ReportExportFormat = 
  | 'pdf' 
  | 'excel' 
  | 'csv' 
  | 'json' 
  | 'image';

/**
 * Report template
 */
export interface ReportTemplate {
  /**
   * Template identifier
   */
  id: string;
  
  /**
   * Template name
   */
  name: string;
  
  /**
   * Template description
   */
  description?: string;
  
  /**
   * Template configuration
   */
  config: ReportConfig;
  
  /**
   * Template category
   */
  category?: string;
  
  /**
   * Template tags
   */
  tags?: string[];
  
  /**
   * Template thumbnail
   */
  thumbnail?: string;
}

export default ReportData;
