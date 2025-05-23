/**
 * Network Graph Mock Data
 */
import { GraphData, GraphNode, GraphLink } from '../../components/reports/visualizations/NetworkGraph';
import { NetworkGraphMetrics } from '../../services/networkGraphService';

/**
 * Generate player relationship network
 * @param nodeCount Number of nodes to generate
 * @param linkDensity Density of links (0-1)
 * @returns Graph data with nodes and links
 */
export const generatePlayerRelationshipNetwork = (
  nodeCount: number = 50,
  linkDensity: number = 0.1
): GraphData => {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Generate player nodes
  for (let i = 0; i < nodeCount; i++) {
    // Determine player group (VIP level)
    const groups = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const group = groups[Math.floor(Math.random() * groups.length)];

    // Determine player value (based on deposits)
    const value = Math.floor(Math.random() * 1000) + 100;

    nodes.push({
      id: `player-${i + 1}`,
      name: `Player ${i + 1}`,
      group,
      value,
      type: 'player',
      deposits: value,
      bets: Math.floor(value * (Math.random() * 5 + 3)),
      wins: Math.floor(value * (Math.random() * 4 + 2)),
      registrationDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString()
    });
  }

  // Generate links between players (referrals, similar game preferences, etc.)
  const maxLinks = Math.floor(nodeCount * (nodeCount - 1) * linkDensity / 2);

  for (let i = 0; i < maxLinks; i++) {
    const sourceIndex = Math.floor(Math.random() * nodeCount);
    let targetIndex = Math.floor(Math.random() * nodeCount);

    // Ensure source and target are different
    while (targetIndex === sourceIndex) {
      targetIndex = Math.floor(Math.random() * nodeCount);
    }

    const source = nodes[sourceIndex].id;
    const target = nodes[targetIndex].id;

    // Check if link already exists
    const linkExists = links.some(link =>
      (link.source === source && link.target === target) ||
      (link.source === target && link.target === source)
    );

    if (!linkExists) {
      // Determine relationship strength
      const value = Math.floor(Math.random() * 10) + 1;

      // Determine relationship type
      const relationshipTypes = ['referral', 'similar_games', 'same_session', 'same_deposit_pattern', 'same_region'];
      const relationshipType = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];

      links.push({
        source,
        target,
        value,
        type: relationshipType,
        label: relationshipType.replace('_', ' ')
      });
    }
  }

  return { nodes, links };
};

/**
 * Generate game relationship network
 * @param nodeCount Number of nodes to generate
 * @param linkDensity Density of links (0-1)
 * @returns Graph data with nodes and links
 */
export const generateGameRelationshipNetwork = (
  nodeCount: number = 30,
  linkDensity: number = 0.2
): GraphData => {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Game categories
  const categories = ['Slots', 'Table Games', 'Live Casino', 'Jackpot', 'Video Poker'];

  // Generate game nodes
  for (let i = 0; i < nodeCount; i++) {
    // Determine game category
    const category = categories[Math.floor(Math.random() * categories.length)];

    // Determine game popularity
    const value = Math.floor(Math.random() * 1000) + 100;

    nodes.push({
      id: `game-${i + 1}`,
      name: `Game ${i + 1}`,
      group: category,
      value,
      type: 'game',
      plays: value,
      revenue: Math.floor(value * (Math.random() * 10 + 5)),
      uniquePlayers: Math.floor(value * 0.8),
      releaseDate: new Date(Date.now() - Math.floor(Math.random() * 730 * 24 * 60 * 60 * 1000)).toISOString()
    });
  }

  // Generate links between games (players who play both games)
  const maxLinks = Math.floor(nodeCount * (nodeCount - 1) * linkDensity / 2);

  for (let i = 0; i < maxLinks; i++) {
    const sourceIndex = Math.floor(Math.random() * nodeCount);
    let targetIndex = Math.floor(Math.random() * nodeCount);

    // Ensure source and target are different
    while (targetIndex === sourceIndex) {
      targetIndex = Math.floor(Math.random() * nodeCount);
    }

    const source = nodes[sourceIndex].id;
    const target = nodes[targetIndex].id;

    // Check if link already exists
    const linkExists = links.some(link =>
      (link.source === source && link.target === target) ||
      (link.source === target && link.target === source)
    );

    if (!linkExists) {
      // Determine number of shared players
      const value = Math.floor(Math.random() * 100) + 10;

      links.push({
        source,
        target,
        value,
        type: 'shared_players',
        label: `${value} shared players`
      });
    }
  }

  return { nodes, links };
};

/**
 * Generate network graph metrics
 * @param data Graph data
 * @returns Network graph metrics
 */
export const calculateNetworkMetrics = (data: GraphData): NetworkGraphMetrics => {
  const { nodes, links } = data;

  // Calculate node degrees
  const nodeDegrees = new Map<string, number>();

  links.forEach(link => {
    const source = typeof link.source === 'string' ? link.source : (link.source as any)?.id || link.source;
    const target = typeof link.target === 'string' ? link.target : (link.target as any)?.id || link.target;

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

  return {
    totalNodes: nodes.length,
    totalLinks: links.length,
    density,
    averageDegree,
    maxDegree,
    communities: Math.floor(Math.random() * 5) + 3, // Mock community count
    centralNodes: centralNodes.slice(0, 5) // Limit to top 5
  };
};

export default {
  generatePlayerRelationshipNetwork,
  generateGameRelationshipNetwork,
  calculateNetworkMetrics
};
