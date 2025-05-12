import axios from 'axios';
import { GraphData, GraphNode, GraphLink } from '../components/reports/visualizations/NetworkGraph';

// Base API URL
const API_URL = 'https://localhost:7075/api';

// Interface for network graph query parameters
export interface NetworkGraphQueryParams {
  dataSource: string;
  nodeLimit?: number;
  linkLimit?: number;
  minLinkValue?: number;
  maxLinkValue?: number;
  nodeGroups?: string[];
  nodeIds?: string[];
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  layout?: 'force' | 'circular' | 'hierarchical';
  includeMetrics?: boolean;
}

// Interface for network graph metrics
export interface NetworkGraphMetrics {
  totalNodes: number;
  totalLinks: number;
  density: number;
  averageDegree: number;
  maxDegree: number;
  communities: number;
  centralNodes: GraphNode[];
}

// Interface for paginated network graph response
export interface PaginatedNetworkGraphResponse {
  data: GraphData;
  metrics?: NetworkGraphMetrics;
  totalNodes: number;
  totalLinks: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetch network graph data with server-side processing
 * @param params Query parameters for filtering and pagination
 * @returns Paginated network graph data
 */
export const fetchNetworkGraphData = async (
  params: NetworkGraphQueryParams
): Promise<PaginatedNetworkGraphResponse> => {
  try {
    const response = await axios.get(`${API_URL}/reports/network-graph`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching network graph data:', error);
    throw error;
  }
};

/**
 * Fetch additional nodes for a network graph (progressive loading)
 * @param graphId ID of the graph to expand
 * @param nodeIds IDs of nodes to expand
 * @param depth Depth of expansion (how many hops)
 * @returns Additional nodes and links to add to the graph
 */
export const expandNetworkGraph = async (
  graphId: string,
  nodeIds: string[],
  depth: number = 1
): Promise<GraphData> => {
  try {
    const response = await axios.post(`${API_URL}/reports/network-graph/expand`, {
      graphId,
      nodeIds,
      depth
    });
    return response.data;
  } catch (error) {
    console.error('Error expanding network graph:', error);
    throw error;
  }
};

/**
 * Fetch network graph metrics
 * @param graphId ID of the graph to analyze
 * @returns Network graph metrics
 */
export const fetchNetworkGraphMetrics = async (
  graphId: string
): Promise<NetworkGraphMetrics> => {
  try {
    const response = await axios.get(`${API_URL}/reports/network-graph/${graphId}/metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching network graph metrics:', error);
    throw error;
  }
};

/**
 * Apply community detection algorithm to network graph
 * @param graphId ID of the graph to analyze
 * @param algorithm Algorithm to use ('louvain', 'leiden', 'infomap')
 * @returns Updated graph data with community assignments
 */
export const detectCommunities = async (
  graphId: string,
  algorithm: 'louvain' | 'leiden' | 'infomap' = 'louvain'
): Promise<GraphData> => {
  try {
    const response = await axios.post(`${API_URL}/reports/network-graph/${graphId}/communities`, {
      algorithm
    });
    return response.data;
  } catch (error) {
    console.error('Error detecting communities:', error);
    throw error;
  }
};

/**
 * Apply layout algorithm to network graph
 * @param graphData Graph data to layout
 * @param layout Layout algorithm to use
 * @returns Graph data with updated node positions
 */
export const applyNetworkLayout = async (
  graphData: GraphData,
  layout: 'force' | 'circular' | 'hierarchical' = 'force'
): Promise<GraphData> => {
  try {
    const response = await axios.post(`${API_URL}/reports/network-graph/layout`, {
      graphData,
      layout
    });
    return response.data;
  } catch (error) {
    console.error('Error applying network layout:', error);
    throw error;
  }
};

/**
 * Find shortest path between two nodes
 * @param graphId ID of the graph
 * @param sourceId Source node ID
 * @param targetId Target node ID
 * @returns Path as a list of node IDs
 */
export const findShortestPath = async (
  graphId: string,
  sourceId: string,
  targetId: string
): Promise<string[]> => {
  try {
    const response = await axios.get(
      `${API_URL}/reports/network-graph/${graphId}/path/${sourceId}/${targetId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error finding shortest path:', error);
    throw error;
  }
};

/**
 * Mock implementation for client-side processing when server is not available
 * Filters and processes network graph data on the client
 * @param data Full graph data
 * @param params Query parameters for filtering
 * @returns Filtered graph data
 */
export const processNetworkGraphDataLocally = (
  data: GraphData,
  params: NetworkGraphQueryParams
): PaginatedNetworkGraphResponse => {
  let { nodes, links } = data;
  
  // Apply filters
  if (params.nodeGroups && params.nodeGroups.length > 0) {
    nodes = nodes.filter(node => params.nodeGroups!.includes(node.group || 'default'));
  }
  
  if (params.nodeIds && params.nodeIds.length > 0) {
    nodes = nodes.filter(node => params.nodeIds!.includes(node.id));
  }
  
  if (params.searchTerm) {
    const term = params.searchTerm.toLowerCase();
    nodes = nodes.filter(node => 
      node.name.toLowerCase().includes(term) || 
      node.id.toLowerCase().includes(term)
    );
  }
  
  if (params.minLinkValue !== undefined) {
    links = links.filter(link => (link.value || 0) >= params.minLinkValue!);
  }
  
  if (params.maxLinkValue !== undefined) {
    links = links.filter(link => (link.value || 0) <= params.maxLinkValue!);
  }
  
  // Get filtered node IDs
  const filteredNodeIds = new Set(nodes.map(node => node.id));
  
  // Filter links that connect filtered nodes
  links = links.filter(link => 
    filteredNodeIds.has(link.source as string) && 
    filteredNodeIds.has(link.target as string)
  );
  
  // Apply pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 100;
  const totalNodes = nodes.length;
  const totalLinks = links.length;
  const totalPages = Math.ceil(totalNodes / pageSize);
  
  // Limit nodes based on pagination
  const startIndex = (page - 1) * pageSize;
  const paginatedNodes = nodes.slice(startIndex, startIndex + pageSize);
  
  // Get paginated node IDs
  const paginatedNodeIds = new Set(paginatedNodes.map(node => node.id));
  
  // Filter links that connect paginated nodes
  const paginatedLinks = links.filter(link => 
    paginatedNodeIds.has(link.source as string) && 
    paginatedNodeIds.has(link.target as string)
  );
  
  // Calculate metrics
  let metrics: NetworkGraphMetrics | undefined;
  
  if (params.includeMetrics) {
    // Calculate node degrees
    const nodeDegrees = new Map<string, number>();
    
    links.forEach(link => {
      const source = link.source as string;
      const target = link.target as string;
      
      nodeDegrees.set(source, (nodeDegrees.get(source) || 0) + 1);
      nodeDegrees.set(target, (nodeDegrees.get(target) || 0) + 1);
    });
    
    // Find max degree and central nodes
    let maxDegree = 0;
    const centralNodes: GraphNode[] = [];
    
    nodeDegrees.forEach((degree, nodeId) => {
      if (degree > maxDegree) {
        maxDegree = degree;
        centralNodes.length = 0;
        const node = nodes.find(n => n.id === nodeId);
        if (node) centralNodes.push(node);
      } else if (degree === maxDegree) {
        const node = nodes.find(n => n.id === nodeId);
        if (node) centralNodes.push(node);
      }
    });
    
    // Calculate average degree
    const averageDegree = Array.from(nodeDegrees.values()).reduce((sum, degree) => sum + degree, 0) / nodeDegrees.size;
    
    // Calculate density
    const density = (2 * links.length) / (nodes.length * (nodes.length - 1));
    
    metrics = {
      totalNodes: nodes.length,
      totalLinks: links.length,
      density,
      averageDegree,
      maxDegree,
      communities: 1, // Simple mock, would require community detection algorithm
      centralNodes: centralNodes.slice(0, 5) // Limit to top 5
    };
  }
  
  return {
    data: {
      nodes: paginatedNodes,
      links: paginatedLinks
    },
    metrics,
    totalNodes,
    totalLinks,
    page,
    pageSize,
    totalPages
  };
};

export default {
  fetchNetworkGraphData,
  expandNetworkGraph,
  fetchNetworkGraphMetrics,
  detectCommunities,
  applyNetworkLayout,
  findShortestPath,
  processNetworkGraphDataLocally
};
