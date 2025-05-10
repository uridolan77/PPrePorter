/**
 * Types for ReportTemplate component
 */
import { ReactNode } from 'react';

/**
 * Visualization interface
 */
export interface Visualization {
  /**
   * Visualization ID
   */
  id: string;
  
  /**
   * Visualization type
   */
  type: string;
  
  /**
   * Visualization title
   */
  title: string;
  
  /**
   * Visualization configuration
   */
  config: Record<string, any>;
  
  /**
   * Data field to use for visualization
   */
  dataField: string;
  
  /**
   * Width of the visualization (in grid columns, 1-12)
   */
  width: number;
}

/**
 * Visualization type interface
 */
export interface VisualizationType {
  /**
   * Visualization type
   */
  type: string;
  
  /**
   * Visualization title
   */
  title: string;
  
  /**
   * Visualization description
   */
  description: string;
  
  /**
   * Visualization icon
   */
  icon: ReactNode;
  
  /**
   * Default configuration
   */
  defaultConfig: Record<string, any>;
}

/**
 * Section interface
 */
export interface Section {
  /**
   * Section ID
   */
  id: string;
  
  /**
   * Section title
   */
  title: string;
  
  /**
   * Section description
   */
  description: string;
  
  /**
   * Visualizations in the section
   */
  visualizations: Visualization[];
  
  /**
   * Whether the section is expanded
   */
  expanded: boolean;
}

/**
 * Data source interface
 */
export interface DataSource {
  /**
   * Data source ID
   */
  id: string;
  
  /**
   * Data source name
   */
  name: string;
  
  /**
   * Data source description
   */
  description?: string;
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
  field: string;
  
  /**
   * Filter operator
   */
  operator: string;
  
  /**
   * Filter value
   */
  value: any;
}

/**
 * Template interface
 */
export interface Template {
  /**
   * Template ID
   */
  id: string;
  
  /**
   * Template name
   */
  name: string;
  
  /**
   * Template description
   */
  description: string;
  
  /**
   * Template sections
   */
  sections: Section[];
  
  /**
   * Data source ID
   */
  dataSource: string | null;
  
  /**
   * Template filters
   */
  filters: Filter[];
  
  /**
   * Whether the template is public
   */
  isPublic: boolean;
  
  /**
   * User who created the template
   */
  createdBy: string;
  
  /**
   * Creation date
   */
  createdAt: Date | null;
  
  /**
   * Last update date
   */
  updatedAt: Date | null;
}

/**
 * ReportTemplate component props interface
 */
export interface ReportTemplateProps {
  /**
   * Current template
   */
  template?: Template;
  
  /**
   * Function called when template is saved
   */
  onSave?: (template: Template) => void;
  
  /**
   * Function called when editing is canceled
   */
  onCancel?: () => void;
  
  /**
   * Available visualizations for adding to template
   */
  availableVisualizations?: VisualizationType[];
  
  /**
   * Available data sources for the template
   */
  availableDataSources?: DataSource[];
}

export default ReportTemplateProps;
