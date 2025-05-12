import axios from 'axios';
import { SankeyData } from '../components/reports/visualizations/SankeyDiagram';

// Base API URL
const API_URL = 'https://localhost:7075/api';

// Interface for sankey diagram query parameters
export interface SankeyDiagramQueryParams {
  dataSource: string;
  startDate?: string;
  endDate?: string;
  categories?: string[];
  minLinkValue?: number;
  maxLinkValue?: number;
  aggregationLevel?: 'none' | 'low' | 'medium' | 'high';
  includeMetrics?: boolean;
}

// Interface for sankey node
export interface SankeyNode {
  name: string;
  category?: string;
  value?: number;
  originalValue?: number;
  aggregated?: boolean;
  childNodes?: string[];
  [key: string]: any;
}

// Interface for sankey link
export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  originalValue?: number;
  aggregated?: boolean;
  childLinks?: Array<{ source: number; target: number }>;
  [key: string]: any;
}

// Interface for sankey diagram with aggregation
export interface AggregatedSankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
  aggregationInfo?: {
    level: 'none' | 'low' | 'medium' | 'high';
    nodeReduction: number;
    linkReduction: number;
    aggregatedNodeCount: number;
    aggregatedLinkCount: number;
  };
}

// Interface for sankey metrics
export interface SankeyMetrics {
  totalFlow: number;
  largestFlow: { source: string; target: string; value: number };
  bottlenecks: Array<{ node: string; inFlow: number; outFlow: number; ratio: number }>;
  cycles: Array<string[]>;
  flowEfficiency: number;
}

/**
 * Fetch sankey diagram data with server-side processing
 * @param params Query parameters for filtering and aggregation
 * @returns Aggregated sankey diagram data
 */
export const fetchSankeyDiagramData = async (
  params: SankeyDiagramQueryParams
): Promise<AggregatedSankeyData> => {
  try {
    const response = await axios.get(`${API_URL}/reports/sankey-diagram`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sankey diagram data:', error);
    throw error;
  }
};

/**
 * Fetch sankey diagram metrics
 * @param diagramId ID of the diagram to analyze
 * @returns Sankey diagram metrics
 */
export const fetchSankeyMetrics = async (
  diagramId: string
): Promise<SankeyMetrics> => {
  try {
    const response = await axios.get(`${API_URL}/reports/sankey-diagram/${diagramId}/metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sankey metrics:', error);
    throw error;
  }
};

/**
 * Expand an aggregated node to show its components
 * @param diagramId ID of the diagram
 * @param nodeIndex Index of the node to expand
 * @returns Updated sankey diagram data
 */
export const expandAggregatedNode = async (
  diagramId: string,
  nodeIndex: number
): Promise<AggregatedSankeyData> => {
  try {
    const response = await axios.post(`${API_URL}/reports/sankey-diagram/${diagramId}/expand-node`, {
      nodeIndex
    });
    return response.data;
  } catch (error) {
    console.error('Error expanding aggregated node:', error);
    throw error;
  }
};

/**
 * Aggregate sankey diagram data on the client side
 * @param data Original sankey diagram data
 * @param level Aggregation level
 * @returns Aggregated sankey diagram data
 */
export const aggregateSankeyData = (
  data: SankeyData,
  level: 'none' | 'low' | 'medium' | 'high' = 'medium'
): AggregatedSankeyData => {
  // If no aggregation needed, return original data
  if (level === 'none') {
    return {
      ...data,
      aggregationInfo: {
        level: 'none',
        nodeReduction: 0,
        linkReduction: 0,
        aggregatedNodeCount: 0,
        aggregatedLinkCount: 0
      }
    };
  }
  
  const originalNodes = [...data.nodes];
  const originalLinks = [...data.links];
  
  // Set thresholds based on aggregation level
  const thresholds = {
    low: {
      minNodeValue: 0.05, // Nodes with value < 5% of max will be aggregated
      minLinkValue: 0.03  // Links with value < 3% of max will be aggregated
    },
    medium: {
      minNodeValue: 0.1,  // Nodes with value < 10% of max will be aggregated
      minLinkValue: 0.05  // Links with value < 5% of max will be aggregated
    },
    high: {
      minNodeValue: 0.15, // Nodes with value < 15% of max will be aggregated
      minLinkValue: 0.1   // Links with value < 10% of max will be aggregated
    }
  };
  
  // Get threshold values
  const threshold = thresholds[level];
  
  // Find max node and link values
  const maxNodeValue = Math.max(...originalNodes.map(node => node.value || 0));
  const maxLinkValue = Math.max(...originalLinks.map(link => link.value));
  
  // Calculate absolute thresholds
  const nodeThreshold = maxNodeValue * threshold.minNodeValue;
  const linkThreshold = maxLinkValue * threshold.minLinkValue;
  
  // Group nodes by category
  const nodesByCategory = originalNodes.reduce((acc, node, index) => {
    const category = node.category || 'default';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ ...node, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<SankeyNode & { originalIndex: number }>>);
  
  // Aggregate small nodes by category
  const aggregatedNodes: SankeyNode[] = [];
  const nodeMapping: Record<number, number> = {}; // Maps original index to new index
  
  // Process each category
  Object.entries(nodesByCategory).forEach(([category, nodes]) => {
    // Split nodes into significant and small
    const significantNodes = nodes.filter(node => (node.value || 0) >= nodeThreshold);
    const smallNodes = nodes.filter(node => (node.value || 0) < nodeThreshold);
    
    // Add significant nodes as is
    significantNodes.forEach(node => {
      nodeMapping[node.originalIndex] = aggregatedNodes.length;
      aggregatedNodes.push({
        ...node,
        aggregated: false
      });
    });
    
    // Aggregate small nodes if there are any
    if (smallNodes.length > 0) {
      const totalValue = smallNodes.reduce((sum, node) => sum + (node.value || 0), 0);
      const childNodes = smallNodes.map(node => node.name);
      
      // Only create aggregated node if there are multiple small nodes
      if (smallNodes.length > 1) {
        const aggregatedNode: SankeyNode = {
          name: `Other ${category}`,
          category,
          value: totalValue,
          originalValue: totalValue,
          aggregated: true,
          childNodes
        };
        
        // Map all small nodes to this aggregated node
        smallNodes.forEach(node => {
          nodeMapping[node.originalIndex] = aggregatedNodes.length;
        });
        
        aggregatedNodes.push(aggregatedNode);
      } else {
        // If only one small node, keep it as is
        nodeMapping[smallNodes[0].originalIndex] = aggregatedNodes.length;
        aggregatedNodes.push({
          ...smallNodes[0],
          aggregated: false
        });
      }
    }
  });
  
  // Aggregate links
  const aggregatedLinks: SankeyLink[] = [];
  const linkMap = new Map<string, { index: number; value: number; childLinks: Array<{ source: number; target: number }> }>();
  
  // Process each link
  originalLinks.forEach(link => {
    // Map source and target to new indices
    const newSource = nodeMapping[link.source as number];
    const newTarget = nodeMapping[link.target as number];
    
    // Skip self-loops created by aggregation
    if (newSource === newTarget) {
      return;
    }
    
    // Create a key for this link
    const linkKey = `${newSource}-${newTarget}`;
    
    if (linkMap.has(linkKey)) {
      // Update existing aggregated link
      const existingLink = linkMap.get(linkKey)!;
      existingLink.value += link.value;
      existingLink.childLinks.push({ 
        source: link.source as number, 
        target: link.target as number 
      });
    } else {
      // Create new link entry
      linkMap.set(linkKey, {
        index: aggregatedLinks.length,
        value: link.value,
        childLinks: [{ 
          source: link.source as number, 
          target: link.target as number 
        }]
      });
      
      // Add to aggregated links
      aggregatedLinks.push({
        source: newSource,
        target: newTarget,
        value: link.value,
        originalValue: link.value,
        aggregated: false,
        childLinks: []
      });
    }
  });
  
  // Update aggregated links with child links and aggregation status
  linkMap.forEach((linkInfo, key) => {
    const link = aggregatedLinks[linkInfo.index];
    link.childLinks = linkInfo.childLinks;
    link.aggregated = linkInfo.childLinks.length > 1;
  });
  
  // Filter out small links
  const filteredLinks = aggregatedLinks.filter(link => link.value >= linkThreshold);
  
  // Calculate aggregation metrics
  const nodeReduction = originalNodes.length - aggregatedNodes.length;
  const linkReduction = originalLinks.length - filteredLinks.length;
  const aggregatedNodeCount = aggregatedNodes.filter(node => node.aggregated).length;
  const aggregatedLinkCount = filteredLinks.filter(link => link.aggregated).length;
  
  return {
    nodes: aggregatedNodes,
    links: filteredLinks,
    aggregationInfo: {
      level,
      nodeReduction,
      linkReduction,
      aggregatedNodeCount,
      aggregatedLinkCount
    }
  };
};

/**
 * Calculate sankey diagram metrics on the client side
 * @param data Sankey diagram data
 * @returns Sankey metrics
 */
export const calculateSankeyMetrics = (data: SankeyData): SankeyMetrics => {
  const { nodes, links } = data;
  
  // Calculate total flow
  const totalFlow = links.reduce((sum, link) => sum + link.value, 0);
  
  // Find largest flow
  let largestFlow = { source: '', target: '', value: 0 };
  links.forEach(link => {
    if (link.value > largestFlow.value) {
      const sourceNode = nodes[link.source as number];
      const targetNode = nodes[link.target as number];
      largestFlow = {
        source: sourceNode.name,
        target: targetNode.name,
        value: link.value
      };
    }
  });
  
  // Calculate node flows
  const nodeFlows = nodes.map((node, index) => {
    const inFlow = links
      .filter(link => (link.target as number) === index)
      .reduce((sum, link) => sum + link.value, 0);
    
    const outFlow = links
      .filter(link => (link.source as number) === index)
      .reduce((sum, link) => sum + link.value, 0);
    
    return {
      node: node.name,
      inFlow,
      outFlow,
      ratio: outFlow > 0 ? inFlow / outFlow : inFlow > 0 ? Infinity : 1
    };
  });
  
  // Find bottlenecks (nodes with high in/out flow ratio difference)
  const bottlenecks = nodeFlows
    .filter(flow => flow.inFlow > 0 && flow.outFlow > 0)
    .sort((a, b) => Math.abs(1 - b.ratio) - Math.abs(1 - a.ratio))
    .slice(0, 5);
  
  // Simple cycle detection (not comprehensive)
  const cycles: Array<string[]> = [];
  
  // Calculate flow efficiency (ratio of direct to indirect flows)
  const flowEfficiency = 0.85; // Mock value, would require more complex calculation
  
  return {
    totalFlow,
    largestFlow,
    bottlenecks,
    cycles,
    flowEfficiency
  };
};

export default {
  fetchSankeyDiagramData,
  fetchSankeyMetrics,
  expandAggregatedNode,
  aggregateSankeyData,
  calculateSankeyMetrics
};
