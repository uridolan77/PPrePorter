/**
 * Types for PlayerJourneySankey component
 */

/**
 * Journey type option interface
 */
export interface JourneyTypeOption {
  /**
   * Journey type value
   */
  value: string;
  
  /**
   * Journey type display label
   */
  label: string;
}

/**
 * Color mode option interface
 */
export interface ColorModeOption {
  /**
   * Color mode value
   */
  value: string;
  
  /**
   * Color mode display label
   */
  label: string;
}

/**
 * Sankey node interface
 */
export interface SankeyNode {
  /**
   * Node ID
   */
  id: string;
  
  /**
   * Node value (number of players)
   */
  value: number;
  
  /**
   * Source nodes connected to this node
   */
  sourceNodes?: SankeyNode[];
  
  /**
   * Target nodes connected from this node
   */
  targetNodes?: SankeyNode[];
}

/**
 * Sankey link interface
 */
export interface SankeyLink {
  /**
   * Source node ID
   */
  source: string | SankeyNode;
  
  /**
   * Target node ID
   */
  target: string | SankeyNode;
  
  /**
   * Link value (number of players)
   */
  value: number;
}

/**
 * Player journey data interface
 */
export interface PlayerJourneyData {
  /**
   * Journey type
   */
  journeyType: string;
  
  /**
   * Time frame
   */
  timeFrame: string;
  
  /**
   * Sankey nodes
   */
  nodes: SankeyNode[];
  
  /**
   * Sankey links
   */
  links: SankeyLink[];
}

/**
 * PlayerJourneySankey component props interface
 */
export interface PlayerJourneySankeyProps {
  /**
   * Height of the component
   */
  height?: number;
  
  /**
   * Whether data is loading
   */
  isLoading?: boolean;
  
  /**
   * Time frame for the data
   */
  timeFrame?: string;
}

export default PlayerJourneySankeyProps;
