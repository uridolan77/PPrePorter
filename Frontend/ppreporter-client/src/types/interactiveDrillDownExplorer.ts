/**
 * Types for InteractiveDrillDownExplorer component
 */
import { ReactNode } from 'react';

/**
 * Node interface for hierarchical data
 */
export interface DataNode {
  /**
   * Node ID
   */
  id: string;
  
  /**
   * Node name
   */
  name: string;
  
  /**
   * Node value
   */
  value: number;
  
  /**
   * Child nodes
   */
  children?: DataNode[];
  
  /**
   * Reference to parent node (added during processing)
   */
  _parent?: DataNode;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Time series data point interface
 */
export interface TimeSeriesDataPoint {
  /**
   * Date string (format: YYYY-MM)
   */
  date: string;
  
  /**
   * Value for the date
   */
  value: number;
}

/**
 * Additional metrics interface
 */
export interface AdditionalMetrics {
  /**
   * Number of bets
   */
  bets: number;
  
  /**
   * Number of players
   */
  players: number;
  
  /**
   * Average bet amount
   */
  averageBet: number;
  
  /**
   * Return to player percentage
   */
  rtp: number;
  
  /**
   * Margin percentage
   */
  margin: number;
}

/**
 * Search result interface
 */
export interface SearchResult {
  /**
   * Node ID
   */
  id: string;
  
  /**
   * Node name
   */
  name: string;
  
  /**
   * Node value
   */
  value: number;
  
  /**
   * Path to the node (array of node IDs)
   */
  path: string[];
}

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  /**
   * Node ID
   */
  id: string;
  
  /**
   * Node name
   */
  name: string;
}

/**
 * Chart type options
 */
export type ChartType = 'pie' | 'bar' | 'treemap';

/**
 * Detail chart type options
 */
export type DetailChartType = 'line' | 'area' | 'bar';

/**
 * View mode options
 */
export type ViewMode = 'chart' | 'table';

/**
 * InteractiveDrillDownExplorer component props interface
 */
export interface InteractiveDrillDownExplorerProps {
  /**
   * Hierarchical data to visualize
   */
  data?: DataNode;
  
  /**
   * Component title
   */
  title?: string;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Initial chart type
   */
  initialChartType?: ChartType;
  
  /**
   * Initial view mode
   */
  initialViewMode?: ViewMode;
  
  /**
   * Callback when a node is selected
   */
  onNodeSelect?: (node: DataNode) => void;
  
  /**
   * Callback when data is exported
   */
  onExport?: (format: string) => void;
  
  /**
   * Custom colors for chart elements
   */
  colors?: string[];
}

export default InteractiveDrillDownExplorerProps;
