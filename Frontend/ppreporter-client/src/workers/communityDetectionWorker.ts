// Community detection worker
// This worker runs community detection algorithms in a separate thread

import { GraphData } from '../components/reports/visualizations/NetworkGraph';
import { 
  CommunityDetectionAlgorithm, 
  CommunityDetectionOptions,
  CommunityStructure,
  detectCommunities
} from '../utils/communityDetectionUtils';

// Message types
export type CommunityDetectionWorkerInputMessage = {
  type: 'detect_communities';
  graphData: GraphData;
  options: CommunityDetectionOptions;
  requestId: string;
};

export type CommunityDetectionWorkerOutputMessage = {
  type: 'communities_detected' | 'progress_update' | 'error';
  graphData?: GraphData;
  communityStructure?: CommunityStructure;
  progress?: number;
  error?: string;
  requestId: string;
};

// Handle messages from the main thread
self.onmessage = (event: MessageEvent<CommunityDetectionWorkerInputMessage>) => {
  const { type, graphData, options, requestId } = event.data;
  
  if (type === 'detect_communities') {
    try {
      // Send initial progress update
      sendProgressUpdate(0, requestId);
      
      // Check if the graph is too large
      const nodeCount = graphData.nodes.length;
      const linkCount = graphData.links.length;
      
      if (nodeCount > 10000 || linkCount > 50000) {
        // For very large graphs, send progress updates during computation
        const result = detectCommunitiesWithProgress(graphData, options, requestId);
        sendResult(result, requestId);
      } else {
        // For smaller graphs, just run the algorithm
        const result = detectCommunities(graphData, options);
        sendProgressUpdate(50, requestId);
        
        // Simulate some additional processing time for very small graphs
        // to ensure progress updates are visible
        if (nodeCount < 100) {
          setTimeout(() => {
            sendProgressUpdate(100, requestId);
            sendResult(result, requestId);
          }, 300);
        } else {
          sendProgressUpdate(100, requestId);
          sendResult(result, requestId);
        }
      }
    } catch (error) {
      sendError((error as Error).message, requestId);
    }
  }
};

/**
 * Send progress update to main thread
 * @param progress Progress percentage (0-100)
 * @param requestId Request ID
 */
function sendProgressUpdate(progress: number, requestId: string): void {
  const message: CommunityDetectionWorkerOutputMessage = {
    type: 'progress_update',
    progress,
    requestId
  };
  
  self.postMessage(message);
}

/**
 * Send result to main thread
 * @param result Community detection result
 * @param requestId Request ID
 */
function sendResult(
  result: { graphData: GraphData; communityStructure: CommunityStructure },
  requestId: string
): void {
  const message: CommunityDetectionWorkerOutputMessage = {
    type: 'communities_detected',
    graphData: result.graphData,
    communityStructure: result.communityStructure,
    requestId
  };
  
  self.postMessage(message);
}

/**
 * Send error to main thread
 * @param errorMessage Error message
 * @param requestId Request ID
 */
function sendError(errorMessage: string, requestId: string): void {
  const message: CommunityDetectionWorkerOutputMessage = {
    type: 'error',
    error: errorMessage,
    requestId
  };
  
  self.postMessage(message);
}

/**
 * Detect communities with progress updates
 * This is a modified version of the detectCommunities function that sends progress updates
 * @param graphData Graph data
 * @param options Community detection options
 * @param requestId Request ID
 * @returns Community detection result
 */
function detectCommunitiesWithProgress(
  graphData: GraphData,
  options: CommunityDetectionOptions,
  requestId: string
): { graphData: GraphData; communityStructure: CommunityStructure } {
  // Create a copy of the graph data to avoid modifying the original
  const { nodes, links } = graphData;
  
  // Send progress update
  sendProgressUpdate(10, requestId);
  
  // Create adjacency matrix and node mapping
  const { adjacencyMatrix, nodeIds, nodeIndices } = createAdjacencyMatrix(links, nodes);
  
  // Send progress update
  sendProgressUpdate(30, requestId);
  
  // Detect communities using the specified algorithm
  let communityAssignments: number[];
  
  switch (options.algorithm) {
    case 'louvain':
      communityAssignments = louvainCommunityDetection(
        adjacencyMatrix, 
        options.resolution || 1.0, 
        options.randomSeed || 42,
        progress => sendProgressUpdate(30 + progress * 0.4, requestId)
      );
      break;
    case 'leiden':
      communityAssignments = leidenCommunityDetection(
        adjacencyMatrix, 
        options.resolution || 1.0, 
        options.randomSeed || 42,
        progress => sendProgressUpdate(30 + progress * 0.4, requestId)
      );
      break;
    // Add other algorithms with progress reporting
    default:
      communityAssignments = louvainCommunityDetection(
        adjacencyMatrix, 
        options.resolution || 1.0, 
        options.randomSeed || 42,
        progress => sendProgressUpdate(30 + progress * 0.4, requestId)
      );
  }
  
  // Send progress update
  sendProgressUpdate(70, requestId);
  
  // Calculate modularity
  const modularity = calculateModularity(adjacencyMatrix, communityAssignments);
  
  // Get community statistics
  const communityStats = getCommunityStatistics(communityAssignments, nodeIds);
  
  // Send progress update
  sendProgressUpdate(80, requestId);
  
  // Update graph data with community assignments
  const updatedNodes = nodes.map((node, index) => ({
    ...node,
    community: communityAssignments[nodeIndices[node.id]]
  }));
  
  // Send progress update
  sendProgressUpdate(90, requestId);
  
  // Create community structure result
  const communityStructure: CommunityStructure = {
    communities: communityAssignments,
    modularity,
    communityCount: communityStats.communityCount,
    communitySizes: communityStats.communitySizes,
    communityNodes: communityStats.communityNodes
  };
  
  // Send progress update
  sendProgressUpdate(100, requestId);
  
  return {
    graphData: {
      nodes: updatedNodes,
      links
    },
    communityStructure
  };
}

// Import necessary functions from communityDetectionUtils
// These are simplified versions for the worker

/**
 * Create adjacency matrix from graph data
 */
function createAdjacencyMatrix(links: any[], nodes: any[]): any {
  const nodeIds: string[] = nodes.map(node => node.id);
  const nodeIndices: { [id: string]: number } = {};
  
  nodeIds.forEach((id, index) => {
    nodeIndices[id] = index;
  });
  
  const n = nodes.length;
  const adjacencyMatrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
  
  links.forEach(link => {
    const sourceIndex = nodeIndices[link.source as string];
    const targetIndex = nodeIndices[link.target as string];
    
    if (sourceIndex !== undefined && targetIndex !== undefined) {
      const weight = link.value !== undefined ? Number(link.value) : 1;
      const validWeight = isNaN(weight) || weight <= 0 ? 1 : weight;
      
      adjacencyMatrix[sourceIndex][targetIndex] = validWeight;
      adjacencyMatrix[targetIndex][sourceIndex] = validWeight;
    }
  });
  
  return { adjacencyMatrix, nodeIds, nodeIndices };
}

/**
 * Louvain method for community detection with progress reporting
 */
function louvainCommunityDetection(
  adjacencyMatrix: number[][],
  resolution: number,
  randomSeed: number,
  progressCallback: (progress: number) => void
): number[] {
  const n = adjacencyMatrix.length;
  
  // Initialize each node to its own community
  let communities = Array(n).fill(0).map((_, i) => i);
  
  // Calculate total edge weight
  let totalWeight = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      totalWeight += adjacencyMatrix[i][j];
    }
  }
  totalWeight /= 2; // Undirected graph, count each edge once
  
  // Calculate node weights
  const nodeWeights = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      nodeWeights[i] += adjacencyMatrix[i][j];
    }
  }
  
  // Set random seed
  Math.seedrandom = (seed: number) => {
    let s = seed;
    return function() {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  };
  const random = Math.seedrandom(randomSeed);
  
  // Phase 1: Modularity optimization
  let improvement = true;
  let iteration = 0;
  const maxIterations = 10; // Prevent infinite loops
  
  while (improvement && iteration < maxIterations) {
    improvement = false;
    iteration++;
    
    // Report progress
    progressCallback(iteration / maxIterations);
    
    // Create random order of nodes
    const nodeOrder = Array(n).fill(0).map((_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [nodeOrder[i], nodeOrder[j]] = [nodeOrder[j], nodeOrder[i]];
    }
    
    for (const i of nodeOrder) {
      const currentCommunity = communities[i];
      
      // Calculate modularity gain for moving to each community
      const communityConnections: { [community: number]: number } = {};
      
      for (let j = 0; j < n; j++) {
        if (adjacencyMatrix[i][j] > 0) {
          const communityJ = communities[j];
          communityConnections[communityJ] = (communityConnections[communityJ] || 0) + adjacencyMatrix[i][j];
        }
      }
      
      // Remove node from its current community
      communities[i] = -1;
      
      // Find best community to move to
      let bestCommunity = currentCommunity;
      let bestGain = 0;
      
      for (const community in communityConnections) {
        const communityId = parseInt(community);
        
        // Skip if trying to move to the same community
        if (communityId === currentCommunity) continue;
        
        // Calculate modularity gain
        const gain = calculateModularityGain(
          adjacencyMatrix, communities, i, communityId, 
          communityConnections[communityId], nodeWeights[i], 
          totalWeight, resolution
        );
        
        if (gain > bestGain) {
          bestGain = gain;
          bestCommunity = communityId;
        }
      }
      
      // Move node to best community
      communities[i] = bestGain > 0 ? bestCommunity : currentCommunity;
      
      // Check if we made an improvement
      if (communities[i] !== currentCommunity) {
        improvement = true;
      }
    }
  }
  
  // Phase 2: Community aggregation (simplified)
  // Renumber communities to be consecutive
  const uniqueCommunities = [...new Set(communities)];
  const communityMap: { [oldId: number]: number } = {};
  
  uniqueCommunities.forEach((community, index) => {
    communityMap[community] = index;
  });
  
  return communities.map(community => communityMap[community]);
}

/**
 * Calculate modularity gain for moving a node to a community
 */
function calculateModularityGain(
  adjacencyMatrix: number[][],
  communities: number[],
  nodeIndex: number,
  targetCommunity: number,
  edgeWeightToCommunity: number,
  nodeWeight: number,
  totalWeight: number,
  resolution: number
): number {
  // Calculate sum of weights inside target community
  let communityWeight = 0;
  for (let i = 0; i < communities.length; i++) {
    if (communities[i] === targetCommunity) {
      for (let j = 0; j < communities.length; j++) {
        communityWeight += adjacencyMatrix[i][j];
      }
    }
  }
  
  // Calculate modularity gain
  return (
    edgeWeightToCommunity - resolution * (communityWeight * nodeWeight) / (2 * totalWeight)
  ) / totalWeight;
}

/**
 * Leiden algorithm for community detection (simplified version)
 */
function leidenCommunityDetection(
  adjacencyMatrix: number[][],
  resolution: number,
  randomSeed: number,
  progressCallback: (progress: number) => void
): number[] {
  // Start with Louvain communities
  return louvainCommunityDetection(adjacencyMatrix, resolution, randomSeed, progressCallback);
}

/**
 * Calculate modularity of a community partition
 */
function calculateModularity(
  adjacencyMatrix: number[][],
  communities: number[]
): number {
  const n = adjacencyMatrix.length;
  
  // Calculate total edge weight
  let totalWeight = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      totalWeight += adjacencyMatrix[i][j];
    }
  }
  totalWeight /= 2; // Undirected graph, count each edge once
  
  // Calculate node weights
  const nodeWeights = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      nodeWeights[i] += adjacencyMatrix[i][j];
    }
  }
  
  // Calculate modularity
  let modularity = 0;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (communities[i] === communities[j]) {
        modularity += adjacencyMatrix[i][j] - (nodeWeights[i] * nodeWeights[j]) / (2 * totalWeight);
      }
    }
  }
  
  return modularity / (2 * totalWeight);
}

/**
 * Get community statistics
 */
function getCommunityStatistics(
  communities: number[],
  nodeIds: string[]
): { communityCount: number; communitySizes: number[]; communityNodes: { [communityId: number]: string[] } } {
  // Count communities
  const uniqueCommunities = [...new Set(communities)];
  const communityCount = uniqueCommunities.length;
  
  // Calculate community sizes
  const communitySizes = Array(communityCount).fill(0);
  const communityNodes: { [communityId: number]: string[] } = {};
  
  communities.forEach((community, index) => {
    communitySizes[community]++;
    
    if (!communityNodes[community]) {
      communityNodes[community] = [];
    }
    
    communityNodes[community].push(nodeIds[index]);
  });
  
  return { communityCount, communitySizes, communityNodes };
}
