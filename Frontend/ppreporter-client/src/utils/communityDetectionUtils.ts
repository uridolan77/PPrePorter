import { GraphData, GraphNode, GraphLink } from '../components/reports/visualizations/NetworkGraph';

// Community detection algorithm types
export type CommunityDetectionAlgorithm = 'louvain' | 'leiden' | 'infomap' | 'fastGreedy' | 'walktrap' | 'labelPropagation';

// Community detection options
export interface CommunityDetectionOptions {
  algorithm: CommunityDetectionAlgorithm;
  resolution?: number; // For modularity-based methods (louvain, leiden)
  steps?: number; // For walktrap
  iterations?: number; // For label propagation
  randomSeed?: number; // For methods with randomness
  weightProperty?: string; // Property name for edge weights
}

// Community structure result
export interface CommunityStructure {
  communities: number[]; // Community assignment for each node
  modularity: number; // Modularity score of the partition
  communityCount: number; // Number of communities
  communitySizes: number[]; // Size of each community
  communityNodes: { [communityId: number]: string[] }; // Nodes in each community
}

/**
 * Detect communities in a network graph
 * @param graphData Graph data with nodes and links
 * @param options Community detection options
 * @returns Graph data with community assignments and community structure
 */
export const detectCommunities = (
  graphData: GraphData,
  options: CommunityDetectionOptions
): { graphData: GraphData; communityStructure: CommunityStructure } => {
  const { algorithm, resolution = 1.0, steps = 4, iterations = 100, randomSeed = 42, weightProperty = 'value' } = options;
  
  // Create adjacency matrix and node mapping
  const { adjacencyMatrix, nodeIds, nodeIndices } = createAdjacencyMatrix(graphData, weightProperty);
  
  // Detect communities using the specified algorithm
  let communityAssignments: number[];
  
  switch (algorithm) {
    case 'louvain':
      communityAssignments = louvainCommunityDetection(adjacencyMatrix, resolution, randomSeed);
      break;
    case 'leiden':
      communityAssignments = leidenCommunityDetection(adjacencyMatrix, resolution, randomSeed);
      break;
    case 'infomap':
      communityAssignments = infomapCommunityDetection(adjacencyMatrix, randomSeed);
      break;
    case 'fastGreedy':
      communityAssignments = fastGreedyCommunityDetection(adjacencyMatrix);
      break;
    case 'walktrap':
      communityAssignments = walktrapCommunityDetection(adjacencyMatrix, steps);
      break;
    case 'labelPropagation':
      communityAssignments = labelPropagationCommunityDetection(adjacencyMatrix, iterations, randomSeed);
      break;
    default:
      communityAssignments = louvainCommunityDetection(adjacencyMatrix, resolution, randomSeed);
  }
  
  // Calculate modularity
  const modularity = calculateModularity(adjacencyMatrix, communityAssignments);
  
  // Get community statistics
  const communityStats = getCommunityStatistics(communityAssignments, nodeIds);
  
  // Update graph data with community assignments
  const updatedNodes = graphData.nodes.map((node, index) => ({
    ...node,
    community: communityAssignments[nodeIndices[node.id]]
  }));
  
  // Create community structure result
  const communityStructure: CommunityStructure = {
    communities: communityAssignments,
    modularity,
    communityCount: communityStats.communityCount,
    communitySizes: communityStats.communitySizes,
    communityNodes: communityStats.communityNodes
  };
  
  return {
    graphData: {
      nodes: updatedNodes,
      links: graphData.links
    },
    communityStructure
  };
};

/**
 * Create adjacency matrix from graph data
 * @param graphData Graph data with nodes and links
 * @param weightProperty Property name for edge weights
 * @returns Adjacency matrix and node mappings
 */
const createAdjacencyMatrix = (
  graphData: GraphData,
  weightProperty: string
): { adjacencyMatrix: number[][]; nodeIds: string[]; nodeIndices: { [id: string]: number } } => {
  const { nodes, links } = graphData;
  
  // Create node ID to index mapping
  const nodeIds: string[] = nodes.map(node => node.id);
  const nodeIndices: { [id: string]: number } = {};
  
  nodeIds.forEach((id, index) => {
    nodeIndices[id] = index;
  });
  
  // Create adjacency matrix
  const n = nodes.length;
  const adjacencyMatrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
  
  // Fill adjacency matrix with edge weights
  links.forEach(link => {
    const sourceIndex = nodeIndices[link.source as string];
    const targetIndex = nodeIndices[link.target as string];
    
    if (sourceIndex !== undefined && targetIndex !== undefined) {
      // Use specified weight property or default to 1
      const weight = link[weightProperty] !== undefined ? Number(link[weightProperty]) : 1;
      
      // Ensure weight is a positive number
      const validWeight = isNaN(weight) || weight <= 0 ? 1 : weight;
      
      // Set weight in both directions (undirected graph)
      adjacencyMatrix[sourceIndex][targetIndex] = validWeight;
      adjacencyMatrix[targetIndex][sourceIndex] = validWeight;
    }
  });
  
  return { adjacencyMatrix, nodeIds, nodeIndices };
};

/**
 * Louvain method for community detection
 * @param adjacencyMatrix Adjacency matrix
 * @param resolution Resolution parameter (higher values = smaller communities)
 * @param randomSeed Random seed for reproducibility
 * @returns Community assignments for each node
 */
const louvainCommunityDetection = (
  adjacencyMatrix: number[][],
  resolution: number,
  randomSeed: number
): number[] => {
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
  
  // Calculate node weights (sum of edge weights for each node)
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
  while (improvement) {
    improvement = false;
    
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
};

/**
 * Calculate modularity gain for moving a node to a community
 * @param adjacencyMatrix Adjacency matrix
 * @param communities Current community assignments
 * @param nodeIndex Index of the node to move
 * @param targetCommunity Target community to move to
 * @param edgeWeightToCommunity Sum of edge weights from node to target community
 * @param nodeWeight Sum of edge weights for the node
 * @param totalWeight Total edge weight in the graph
 * @param resolution Resolution parameter
 * @returns Modularity gain
 */
const calculateModularityGain = (
  adjacencyMatrix: number[][],
  communities: number[],
  nodeIndex: number,
  targetCommunity: number,
  edgeWeightToCommunity: number,
  nodeWeight: number,
  totalWeight: number,
  resolution: number
): number => {
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
};

/**
 * Leiden algorithm for community detection (simplified version)
 * @param adjacencyMatrix Adjacency matrix
 * @param resolution Resolution parameter
 * @param randomSeed Random seed for reproducibility
 * @returns Community assignments for each node
 */
const leidenCommunityDetection = (
  adjacencyMatrix: number[][],
  resolution: number,
  randomSeed: number
): number[] => {
  // Start with Louvain communities
  let communities = louvainCommunityDetection(adjacencyMatrix, resolution, randomSeed);
  
  // Leiden refinement (simplified)
  // In a real implementation, this would include:
  // 1. Local moving of nodes
  // 2. Refinement of partitions
  // 3. Aggregation of the network
  
  return communities;
};

/**
 * Infomap algorithm for community detection (simplified version)
 * @param adjacencyMatrix Adjacency matrix
 * @param randomSeed Random seed for reproducibility
 * @returns Community assignments for each node
 */
const infomapCommunityDetection = (
  adjacencyMatrix: number[][],
  randomSeed: number
): number[] => {
  const n = adjacencyMatrix.length;
  
  // Initialize each node to its own community
  let communities = Array(n).fill(0).map((_, i) => i);
  
  // Simplified implementation
  // In a real implementation, this would:
  // 1. Simulate random walks on the network
  // 2. Encode the walks using a two-level description
  // 3. Minimize the description length
  
  // For this simplified version, we'll use a variant of label propagation
  // that's weighted by edge weights
  return labelPropagationCommunityDetection(adjacencyMatrix, 100, randomSeed);
};

/**
 * Fast greedy algorithm for community detection (simplified version)
 * @param adjacencyMatrix Adjacency matrix
 * @returns Community assignments for each node
 */
const fastGreedyCommunityDetection = (
  adjacencyMatrix: number[][]
): number[] => {
  const n = adjacencyMatrix.length;
  
  // Initialize each node to its own community
  let communities = Array(n).fill(0).map((_, i) => i);
  
  // Simplified implementation
  // In a real implementation, this would:
  // 1. Start with each node in its own community
  // 2. Repeatedly merge communities that result in the largest increase in modularity
  // 3. Stop when no merge improves modularity
  
  // For this simplified version, we'll merge communities based on edge weights
  let currentCommunities = n;
  const communityMerges: [number, number][] = [];
  
  while (currentCommunities > 1) {
    // Find the pair of communities with the strongest connection
    let maxWeight = 0;
    let bestPair: [number, number] = [-1, -1];
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (communities[i] !== communities[j] && adjacencyMatrix[i][j] > maxWeight) {
          maxWeight = adjacencyMatrix[i][j];
          bestPair = [communities[i], communities[j]];
        }
      }
    }
    
    if (bestPair[0] === -1 || maxWeight === 0) break;
    
    // Merge communities
    const [comm1, comm2] = bestPair;
    for (let i = 0; i < n; i++) {
      if (communities[i] === comm2) {
        communities[i] = comm1;
      }
    }
    
    communityMerges.push(bestPair);
    currentCommunities--;
  }
  
  // Renumber communities to be consecutive
  const uniqueCommunities = [...new Set(communities)];
  const communityMap: { [oldId: number]: number } = {};
  
  uniqueCommunities.forEach((community, index) => {
    communityMap[community] = index;
  });
  
  return communities.map(community => communityMap[community]);
};

/**
 * Walktrap algorithm for community detection (simplified version)
 * @param adjacencyMatrix Adjacency matrix
 * @param steps Number of steps for random walks
 * @returns Community assignments for each node
 */
const walktrapCommunityDetection = (
  adjacencyMatrix: number[][],
  steps: number
): number[] => {
  const n = adjacencyMatrix.length;
  
  // Initialize each node to its own community
  let communities = Array(n).fill(0).map((_, i) => i);
  
  // Simplified implementation
  // In a real implementation, this would:
  // 1. Compute transition probabilities for random walks
  // 2. Calculate distances between nodes based on random walks
  // 3. Hierarchically cluster nodes based on these distances
  
  // For this simplified version, we'll use a variant of fast greedy
  // that merges communities based on a simple distance metric
  let currentCommunities = n;
  
  while (currentCommunities > 1) {
    // Find the pair of communities with the shortest distance
    let minDistance = Infinity;
    let bestPair: [number, number] = [-1, -1];
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (communities[i] !== communities[j]) {
          // Simple distance metric: inverse of edge weight
          const distance = adjacencyMatrix[i][j] > 0 ? 1 / adjacencyMatrix[i][j] : Infinity;
          
          if (distance < minDistance) {
            minDistance = distance;
            bestPair = [communities[i], communities[j]];
          }
        }
      }
    }
    
    if (bestPair[0] === -1 || minDistance === Infinity) break;
    
    // Merge communities
    const [comm1, comm2] = bestPair;
    for (let i = 0; i < n; i++) {
      if (communities[i] === comm2) {
        communities[i] = comm1;
      }
    }
    
    currentCommunities--;
  }
  
  // Renumber communities to be consecutive
  const uniqueCommunities = [...new Set(communities)];
  const communityMap: { [oldId: number]: number } = {};
  
  uniqueCommunities.forEach((community, index) => {
    communityMap[community] = index;
  });
  
  return communities.map(community => communityMap[community]);
};

/**
 * Label propagation algorithm for community detection
 * @param adjacencyMatrix Adjacency matrix
 * @param iterations Maximum number of iterations
 * @param randomSeed Random seed for reproducibility
 * @returns Community assignments for each node
 */
const labelPropagationCommunityDetection = (
  adjacencyMatrix: number[][],
  iterations: number,
  randomSeed: number
): number[] => {
  const n = adjacencyMatrix.length;
  
  // Initialize each node to its own community
  let communities = Array(n).fill(0).map((_, i) => i);
  
  // Set random seed
  Math.seedrandom = (seed: number) => {
    let s = seed;
    return function() {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  };
  const random = Math.seedrandom(randomSeed);
  
  // Run label propagation
  for (let iter = 0; iter < iterations; iter++) {
    let changed = false;
    
    // Create random order of nodes
    const nodeOrder = Array(n).fill(0).map((_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [nodeOrder[i], nodeOrder[j]] = [nodeOrder[j], nodeOrder[i]];
    }
    
    // Update each node's community
    for (const i of nodeOrder) {
      // Count weighted votes for each community from neighbors
      const votes: { [community: number]: number } = {};
      
      for (let j = 0; j < n; j++) {
        if (adjacencyMatrix[i][j] > 0) {
          const communityJ = communities[j];
          votes[communityJ] = (votes[communityJ] || 0) + adjacencyMatrix[i][j];
        }
      }
      
      // Find community with most votes
      let bestCommunity = communities[i];
      let maxVotes = 0;
      
      for (const community in votes) {
        if (votes[community] > maxVotes) {
          maxVotes = votes[community];
          bestCommunity = parseInt(community);
        }
      }
      
      // Update community
      if (bestCommunity !== communities[i]) {
        communities[i] = bestCommunity;
        changed = true;
      }
    }
    
    // Stop if no changes were made
    if (!changed) break;
  }
  
  // Renumber communities to be consecutive
  const uniqueCommunities = [...new Set(communities)];
  const communityMap: { [oldId: number]: number } = {};
  
  uniqueCommunities.forEach((community, index) => {
    communityMap[community] = index;
  });
  
  return communities.map(community => communityMap[community]);
};

/**
 * Calculate modularity of a community partition
 * @param adjacencyMatrix Adjacency matrix
 * @param communities Community assignments
 * @returns Modularity score
 */
const calculateModularity = (
  adjacencyMatrix: number[][],
  communities: number[]
): number => {
  const n = adjacencyMatrix.length;
  
  // Calculate total edge weight
  let totalWeight = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      totalWeight += adjacencyMatrix[i][j];
    }
  }
  totalWeight /= 2; // Undirected graph, count each edge once
  
  // Calculate node weights (sum of edge weights for each node)
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
};

/**
 * Get community statistics
 * @param communities Community assignments
 * @param nodeIds Node IDs
 * @returns Community statistics
 */
const getCommunityStatistics = (
  communities: number[],
  nodeIds: string[]
): { communityCount: number; communitySizes: number[]; communityNodes: { [communityId: number]: string[] } } => {
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
};
