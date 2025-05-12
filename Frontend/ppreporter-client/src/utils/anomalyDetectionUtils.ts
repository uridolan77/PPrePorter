import { SankeyData } from '../components/reports/visualizations/SankeyDiagram';

// Anomaly detection method types
export type AnomalyDetectionMethod = 'zscore' | 'iqr' | 'isolation' | 'dbscan' | 'autoencoder';

// Anomaly detection options
export interface AnomalyDetectionOptions {
  method: AnomalyDetectionMethod;
  threshold?: number; // Threshold for anomaly score
  minSamples?: number; // Minimum samples for DBSCAN
  epsilon?: number; // Epsilon for DBSCAN
  contamination?: number; // Expected proportion of anomalies
  features?: string[]; // Features to use for anomaly detection
}

// Anomaly result
export interface AnomalyResult {
  anomalies: {
    nodes: Array<{ id: string; name: string; score: number; reason: string }>;
    links: Array<{ source: string; target: string; score: number; reason: string }>;
  };
  metrics: {
    totalAnomalies: number;
    anomalyRatio: number;
    averageScore: number;
  };
}

/**
 * Detect anomalies in a Sankey diagram
 * @param data Sankey diagram data
 * @param options Anomaly detection options
 * @returns Anomaly detection results
 */
export const detectAnomalies = (
  data: SankeyData,
  options: AnomalyDetectionOptions
): AnomalyResult => {
  const { method, threshold = 3.0, minSamples = 3, epsilon = 0.5, contamination = 0.05 } = options;
  
  // Detect node anomalies
  const nodeAnomalies = detectNodeAnomalies(data, method, threshold, contamination);
  
  // Detect link anomalies
  const linkAnomalies = detectLinkAnomalies(data, method, threshold, contamination);
  
  // Calculate metrics
  const totalAnomalies = nodeAnomalies.length + linkAnomalies.length;
  const totalElements = data.nodes.length + data.links.length;
  const anomalyRatio = totalAnomalies / totalElements;
  
  const allScores = [...nodeAnomalies.map(a => a.score), ...linkAnomalies.map(a => a.score)];
  const averageScore = allScores.length > 0 
    ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
    : 0;
  
  return {
    anomalies: {
      nodes: nodeAnomalies,
      links: linkAnomalies
    },
    metrics: {
      totalAnomalies,
      anomalyRatio,
      averageScore
    }
  };
};

/**
 * Detect anomalies in Sankey diagram nodes
 * @param data Sankey diagram data
 * @param method Anomaly detection method
 * @param threshold Threshold for anomaly score
 * @param contamination Expected proportion of anomalies
 * @returns Array of node anomalies
 */
const detectNodeAnomalies = (
  data: SankeyData,
  method: AnomalyDetectionMethod,
  threshold: number,
  contamination: number
): Array<{ id: string; name: string; score: number; reason: string }> => {
  const { nodes, links } = data;
  
  // Calculate node features
  const nodeFeatures = nodes.map((node, index) => {
    // Calculate in-degree and out-degree
    const inDegree = links.filter(link => (link.target as number) === index).length;
    const outDegree = links.filter(link => (link.source as number) === index).length;
    
    // Calculate total in-flow and out-flow
    const inFlow = links
      .filter(link => (link.target as number) === index)
      .reduce((sum, link) => sum + link.value, 0);
    
    const outFlow = links
      .filter(link => (link.source as number) === index)
      .reduce((sum, link) => sum + link.value, 0);
    
    // Calculate flow ratio
    const flowRatio = outFlow > 0 ? inFlow / outFlow : inFlow > 0 ? Infinity : 1;
    
    // Calculate centrality (simplified)
    const centrality = (inDegree + outDegree) / (2 * nodes.length);
    
    return {
      id: node.id || index.toString(),
      name: node.name,
      inDegree,
      outDegree,
      inFlow,
      outFlow,
      flowRatio,
      centrality,
      value: node.value || 0
    };
  });
  
  // Detect anomalies based on the selected method
  let anomalies: Array<{ id: string; name: string; score: number; reason: string }> = [];
  
  switch (method) {
    case 'zscore':
      anomalies = detectZScoreAnomalies(nodeFeatures, threshold);
      break;
    case 'iqr':
      anomalies = detectIQRAnomalies(nodeFeatures, threshold);
      break;
    case 'isolation':
      anomalies = detectIsolationForestAnomalies(nodeFeatures, contamination);
      break;
    case 'dbscan':
      anomalies = detectDBSCANAnomalies(nodeFeatures);
      break;
    case 'autoencoder':
      anomalies = detectAutoencoderAnomalies(nodeFeatures, contamination);
      break;
    default:
      anomalies = detectZScoreAnomalies(nodeFeatures, threshold);
  }
  
  return anomalies;
};

/**
 * Detect anomalies in Sankey diagram links
 * @param data Sankey diagram data
 * @param method Anomaly detection method
 * @param threshold Threshold for anomaly score
 * @param contamination Expected proportion of anomalies
 * @returns Array of link anomalies
 */
const detectLinkAnomalies = (
  data: SankeyData,
  method: AnomalyDetectionMethod,
  threshold: number,
  contamination: number
): Array<{ source: string; target: string; score: number; reason: string }> => {
  const { nodes, links } = data;
  
  // Calculate link features
  const linkFeatures = links.map(link => {
    const sourceIndex = link.source as number;
    const targetIndex = link.target as number;
    
    // Get source and target nodes
    const sourceNode = nodes[sourceIndex];
    const targetNode = nodes[targetIndex];
    
    // Calculate source out-flow and target in-flow
    const sourceOutFlow = links
      .filter(l => (l.source as number) === sourceIndex)
      .reduce((sum, l) => sum + l.value, 0);
    
    const targetInFlow = links
      .filter(l => (l.target as number) === targetIndex)
      .reduce((sum, l) => sum + l.value, 0);
    
    // Calculate flow ratio
    const sourceRatio = sourceOutFlow > 0 ? link.value / sourceOutFlow : 0;
    const targetRatio = targetInFlow > 0 ? link.value / targetInFlow : 0;
    
    return {
      source: sourceNode.id || sourceIndex.toString(),
      sourceName: sourceNode.name,
      target: targetNode.id || targetIndex.toString(),
      targetName: targetNode.name,
      value: link.value,
      sourceRatio,
      targetRatio
    };
  });
  
  // Detect anomalies based on the selected method
  let anomalies: Array<{ source: string; target: string; score: number; reason: string }> = [];
  
  switch (method) {
    case 'zscore':
      anomalies = detectLinkZScoreAnomalies(linkFeatures, threshold);
      break;
    case 'iqr':
      anomalies = detectLinkIQRAnomalies(linkFeatures, threshold);
      break;
    case 'isolation':
      anomalies = detectLinkIsolationForestAnomalies(linkFeatures, contamination);
      break;
    case 'dbscan':
      anomalies = detectLinkDBSCANAnomalies(linkFeatures);
      break;
    case 'autoencoder':
      anomalies = detectLinkAutoencoderAnomalies(linkFeatures, contamination);
      break;
    default:
      anomalies = detectLinkZScoreAnomalies(linkFeatures, threshold);
  }
  
  return anomalies;
};

/**
 * Detect anomalies using Z-score method
 * @param features Array of feature objects
 * @param threshold Z-score threshold
 * @returns Array of anomalies
 */
const detectZScoreAnomalies = (
  features: any[],
  threshold: number
): Array<{ id: string; name: string; score: number; reason: string }> => {
  const anomalies: Array<{ id: string; name: string; score: number; reason: string }> = [];
  
  // Calculate mean and standard deviation for each numerical feature
  const stats: { [key: string]: { mean: number; std: number } } = {};
  const numericalFeatures = ['inDegree', 'outDegree', 'inFlow', 'outFlow', 'flowRatio', 'centrality', 'value'];
  
  numericalFeatures.forEach(feature => {
    if (features.some(f => f[feature] !== undefined)) {
      const values = features.map(f => f[feature]).filter(v => !isNaN(v) && v !== Infinity);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      
      stats[feature] = { mean, std };
    }
  });
  
  // Check each node for anomalies
  features.forEach(node => {
    let maxZScore = 0;
    let anomalousFeature = '';
    
    numericalFeatures.forEach(feature => {
      if (node[feature] !== undefined && stats[feature] && stats[feature].std > 0) {
        const zScore = Math.abs((node[feature] - stats[feature].mean) / stats[feature].std);
        
        if (zScore > maxZScore) {
          maxZScore = zScore;
          anomalousFeature = feature;
        }
      }
    });
    
    if (maxZScore > threshold) {
      anomalies.push({
        id: node.id,
        name: node.name,
        score: maxZScore,
        reason: `Unusual ${anomalousFeature} (${maxZScore.toFixed(2)} standard deviations from mean)`
      });
    }
  });
  
  return anomalies;
};

/**
 * Detect anomalies using IQR method
 * @param features Array of feature objects
 * @param threshold IQR multiplier
 * @returns Array of anomalies
 */
const detectIQRAnomalies = (
  features: any[],
  threshold: number
): Array<{ id: string; name: string; score: number; reason: string }> => {
  const anomalies: Array<{ id: string; name: string; score: number; reason: string }> = [];
  
  // Calculate quartiles for each numerical feature
  const stats: { [key: string]: { q1: number; q3: number; iqr: number } } = {};
  const numericalFeatures = ['inDegree', 'outDegree', 'inFlow', 'outFlow', 'flowRatio', 'centrality', 'value'];
  
  numericalFeatures.forEach(feature => {
    if (features.some(f => f[feature] !== undefined)) {
      const values = features.map(f => f[feature])
        .filter(v => !isNaN(v) && v !== Infinity)
        .sort((a, b) => a - b);
      
      if (values.length > 0) {
        const q1Index = Math.floor(values.length * 0.25);
        const q3Index = Math.floor(values.length * 0.75);
        
        const q1 = values[q1Index];
        const q3 = values[q3Index];
        const iqr = q3 - q1;
        
        stats[feature] = { q1, q3, iqr };
      }
    }
  });
  
  // Check each node for anomalies
  features.forEach(node => {
    let maxScore = 0;
    let anomalousFeature = '';
    
    numericalFeatures.forEach(feature => {
      if (node[feature] !== undefined && stats[feature] && stats[feature].iqr > 0) {
        const lowerBound = stats[feature].q1 - threshold * stats[feature].iqr;
        const upperBound = stats[feature].q3 + threshold * stats[feature].iqr;
        
        if (node[feature] < lowerBound || node[feature] > upperBound) {
          const distance = Math.max(
            Math.abs(node[feature] - lowerBound),
            Math.abs(node[feature] - upperBound)
          );
          const score = distance / stats[feature].iqr;
          
          if (score > maxScore) {
            maxScore = score;
            anomalousFeature = feature;
          }
        }
      }
    });
    
    if (maxScore > 0) {
      anomalies.push({
        id: node.id,
        name: node.name,
        score: maxScore,
        reason: `Unusual ${anomalousFeature} (${maxScore.toFixed(2)} times IQR from quartiles)`
      });
    }
  });
  
  return anomalies;
};

/**
 * Detect anomalies using Isolation Forest (simplified)
 * @param features Array of feature objects
 * @param contamination Expected proportion of anomalies
 * @returns Array of anomalies
 */
const detectIsolationForestAnomalies = (
  features: any[],
  contamination: number
): Array<{ id: string; name: string; score: number; reason: string }> => {
  // This is a simplified implementation
  // In practice, you would use a proper machine learning library
  
  // For simplicity, we'll use a combination of Z-score and IQR methods
  const zScoreAnomalies = detectZScoreAnomalies(features, 2.5);
  const iqrAnomalies = detectIQRAnomalies(features, 1.5);
  
  // Combine anomalies and sort by score
  const combinedAnomalies = [...zScoreAnomalies, ...iqrAnomalies]
    .sort((a, b) => b.score - a.score);
  
  // Remove duplicates
  const uniqueAnomalies = combinedAnomalies.filter((anomaly, index, self) =>
    index === self.findIndex(a => a.id === anomaly.id)
  );
  
  // Limit to expected contamination
  const maxAnomalies = Math.max(1, Math.ceil(features.length * contamination));
  return uniqueAnomalies.slice(0, maxAnomalies);
};

/**
 * Detect anomalies using DBSCAN (simplified)
 * @param features Array of feature objects
 * @returns Array of anomalies
 */
const detectDBSCANAnomalies = (
  features: any[]
): Array<{ id: string; name: string; score: number; reason: string }> => {
  // This is a simplified implementation
  // In practice, you would use a proper machine learning library
  
  // For simplicity, we'll use a combination of Z-score and IQR methods
  const zScoreAnomalies = detectZScoreAnomalies(features, 3.0);
  const iqrAnomalies = detectIQRAnomalies(features, 2.0);
  
  // Combine anomalies and sort by score
  const combinedAnomalies = [...zScoreAnomalies, ...iqrAnomalies]
    .sort((a, b) => b.score - a.score);
  
  // Remove duplicates
  const uniqueAnomalies = combinedAnomalies.filter((anomaly, index, self) =>
    index === self.findIndex(a => a.id === anomaly.id)
  );
  
  return uniqueAnomalies;
};

/**
 * Detect anomalies using Autoencoder (simplified)
 * @param features Array of feature objects
 * @param contamination Expected proportion of anomalies
 * @returns Array of anomalies
 */
const detectAutoencoderAnomalies = (
  features: any[],
  contamination: number
): Array<{ id: string; name: string; score: number; reason: string }> => {
  // This is a simplified implementation
  // In practice, you would use a proper deep learning library
  
  // For simplicity, we'll use a combination of Z-score and IQR methods with different thresholds
  const zScoreAnomalies = detectZScoreAnomalies(features, 2.0);
  const iqrAnomalies = detectIQRAnomalies(features, 1.0);
  
  // Combine anomalies and sort by score
  const combinedAnomalies = [...zScoreAnomalies, ...iqrAnomalies]
    .sort((a, b) => b.score - a.score);
  
  // Remove duplicates
  const uniqueAnomalies = combinedAnomalies.filter((anomaly, index, self) =>
    index === self.findIndex(a => a.id === anomaly.id)
  );
  
  // Limit to expected contamination
  const maxAnomalies = Math.max(1, Math.ceil(features.length * contamination));
  return uniqueAnomalies.slice(0, maxAnomalies);
};

/**
 * Detect link anomalies using Z-score method
 * @param features Array of link feature objects
 * @param threshold Z-score threshold
 * @returns Array of link anomalies
 */
const detectLinkZScoreAnomalies = (
  features: any[],
  threshold: number
): Array<{ source: string; target: string; score: number; reason: string }> => {
  const anomalies: Array<{ source: string; target: string; score: number; reason: string }> = [];
  
  // Calculate mean and standard deviation for each numerical feature
  const stats: { [key: string]: { mean: number; std: number } } = {};
  const numericalFeatures = ['value', 'sourceRatio', 'targetRatio'];
  
  numericalFeatures.forEach(feature => {
    if (features.some(f => f[feature] !== undefined)) {
      const values = features.map(f => f[feature]).filter(v => !isNaN(v) && v !== Infinity);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      
      stats[feature] = { mean, std };
    }
  });
  
  // Check each link for anomalies
  features.forEach(link => {
    let maxZScore = 0;
    let anomalousFeature = '';
    
    numericalFeatures.forEach(feature => {
      if (link[feature] !== undefined && stats[feature] && stats[feature].std > 0) {
        const zScore = Math.abs((link[feature] - stats[feature].mean) / stats[feature].std);
        
        if (zScore > maxZScore) {
          maxZScore = zScore;
          anomalousFeature = feature;
        }
      }
    });
    
    if (maxZScore > threshold) {
      anomalies.push({
        source: link.source,
        target: link.target,
        score: maxZScore,
        reason: `Unusual ${anomalousFeature} from ${link.sourceName} to ${link.targetName} (${maxZScore.toFixed(2)} standard deviations from mean)`
      });
    }
  });
  
  return anomalies;
};

/**
 * Detect link anomalies using IQR method
 * @param features Array of link feature objects
 * @param threshold IQR multiplier
 * @returns Array of link anomalies
 */
const detectLinkIQRAnomalies = (
  features: any[],
  threshold: number
): Array<{ source: string; target: string; score: number; reason: string }> => {
  // Implementation similar to node IQR anomaly detection
  const anomalies: Array<{ source: string; target: string; score: number; reason: string }> = [];
  
  // Calculate quartiles for each numerical feature
  const stats: { [key: string]: { q1: number; q3: number; iqr: number } } = {};
  const numericalFeatures = ['value', 'sourceRatio', 'targetRatio'];
  
  numericalFeatures.forEach(feature => {
    if (features.some(f => f[feature] !== undefined)) {
      const values = features.map(f => f[feature])
        .filter(v => !isNaN(v) && v !== Infinity)
        .sort((a, b) => a - b);
      
      if (values.length > 0) {
        const q1Index = Math.floor(values.length * 0.25);
        const q3Index = Math.floor(values.length * 0.75);
        
        const q1 = values[q1Index];
        const q3 = values[q3Index];
        const iqr = q3 - q1;
        
        stats[feature] = { q1, q3, iqr };
      }
    }
  });
  
  // Check each link for anomalies
  features.forEach(link => {
    let maxScore = 0;
    let anomalousFeature = '';
    
    numericalFeatures.forEach(feature => {
      if (link[feature] !== undefined && stats[feature] && stats[feature].iqr > 0) {
        const lowerBound = stats[feature].q1 - threshold * stats[feature].iqr;
        const upperBound = stats[feature].q3 + threshold * stats[feature].iqr;
        
        if (link[feature] < lowerBound || link[feature] > upperBound) {
          const distance = Math.max(
            Math.abs(link[feature] - lowerBound),
            Math.abs(link[feature] - upperBound)
          );
          const score = distance / stats[feature].iqr;
          
          if (score > maxScore) {
            maxScore = score;
            anomalousFeature = feature;
          }
        }
      }
    });
    
    if (maxScore > 0) {
      anomalies.push({
        source: link.source,
        target: link.target,
        score: maxScore,
        reason: `Unusual ${anomalousFeature} from ${link.sourceName} to ${link.targetName} (${maxScore.toFixed(2)} times IQR from quartiles)`
      });
    }
  });
  
  return anomalies;
};

// Simplified implementations for other link anomaly detection methods
const detectLinkIsolationForestAnomalies = detectIsolationForestAnomalies;
const detectLinkDBSCANAnomalies = detectDBSCANAnomalies;
const detectLinkAutoencoderAnomalies = detectAutoencoderAnomalies;
