// Anomaly detection worker
// This worker runs anomaly detection algorithms in a separate thread

import { SankeyData } from '../components/reports/visualizations/SankeyDiagram';
import {
  AnomalyDetectionMethod,
  AnomalyDetectionOptions,
  AnomalyResult,
  detectAnomalies
} from '../utils/anomalyDetectionUtils';

// Message types
export type AnomalyDetectionWorkerInputMessage = {
  type: 'detect_anomalies';
  data: SankeyData;
  options: AnomalyDetectionOptions;
  requestId: string;
};

export type AnomalyDetectionWorkerOutputMessage = {
  type: 'anomalies_detected' | 'progress_update' | 'error';
  result?: AnomalyResult;
  progress?: number;
  error?: string;
  requestId: string;
};

// Handle messages from the main thread
self.onmessage = (event: MessageEvent<AnomalyDetectionWorkerInputMessage>) => {
  const { type, data, options, requestId } = event.data;
  
  if (type === 'detect_anomalies') {
    try {
      // Send initial progress update
      sendProgressUpdate(0, requestId);
      
      // Check if we have enough data
      const nodeCount = data.nodes.length;
      const linkCount = data.links.length;
      
      if (nodeCount < 3 || linkCount < 3) {
        sendError('Not enough data for anomaly detection (minimum 3 nodes and 3 links required)', requestId);
        return;
      }
      
      // For large datasets, use progressive updates
      if (nodeCount > 100 || linkCount > 200) {
        detectAnomaliesWithProgress(data, options, requestId);
      } else {
        // For smaller datasets, just run the algorithm
        sendProgressUpdate(20, requestId);
        const result = detectAnomalies(data, options);
        sendProgressUpdate(80, requestId);
        
        // Send result
        const message: AnomalyDetectionWorkerOutputMessage = {
          type: 'anomalies_detected',
          result,
          requestId
        };
        
        sendProgressUpdate(100, requestId);
        self.postMessage(message);
      }
    } catch (error) {
      sendError((error as Error).message, requestId);
    }
  }
};

/**
 * Detect anomalies with progress updates
 * @param data Sankey diagram data
 * @param options Anomaly detection options
 * @param requestId Request ID
 */
function detectAnomaliesWithProgress(
  data: SankeyData,
  options: AnomalyDetectionOptions,
  requestId: string
): void {
  // Clone data to avoid modifying the original
  const clonedData: SankeyData = {
    nodes: JSON.parse(JSON.stringify(data.nodes)),
    links: JSON.parse(JSON.stringify(data.links))
  };
  
  sendProgressUpdate(10, requestId);
  
  // Extract features for nodes
  const nodeFeatures = extractNodeFeatures(clonedData);
  
  sendProgressUpdate(30, requestId);
  
  // Extract features for links
  const linkFeatures = extractLinkFeatures(clonedData);
  
  sendProgressUpdate(50, requestId);
  
  // Detect node anomalies
  const nodeAnomalies = detectNodeAnomalies(nodeFeatures, options);
  
  sendProgressUpdate(70, requestId);
  
  // Detect link anomalies
  const linkAnomalies = detectLinkAnomalies(linkFeatures, options);
  
  sendProgressUpdate(90, requestId);
  
  // Calculate metrics
  const totalAnomalies = nodeAnomalies.length + linkAnomalies.length;
  const totalElements = clonedData.nodes.length + clonedData.links.length;
  const anomalyRatio = totalAnomalies / totalElements;
  
  const allScores = [...nodeAnomalies.map(a => a.score), ...linkAnomalies.map(a => a.score)];
  const averageScore = allScores.length > 0 
    ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
    : 0;
  
  // Create result
  const result: AnomalyResult = {
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
  
  // Send result
  const message: AnomalyDetectionWorkerOutputMessage = {
    type: 'anomalies_detected',
    result,
    requestId
  };
  
  sendProgressUpdate(100, requestId);
  self.postMessage(message);
}

/**
 * Extract features for nodes
 * @param data Sankey diagram data
 * @returns Node features
 */
function extractNodeFeatures(data: SankeyData): any[] {
  const { nodes, links } = data;
  
  return nodes.map((node, index) => {
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
}

/**
 * Extract features for links
 * @param data Sankey diagram data
 * @returns Link features
 */
function extractLinkFeatures(data: SankeyData): any[] {
  const { nodes, links } = data;
  
  return links.map(link => {
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
}

/**
 * Detect node anomalies
 * @param nodeFeatures Node features
 * @param options Anomaly detection options
 * @returns Node anomalies
 */
function detectNodeAnomalies(
  nodeFeatures: any[],
  options: AnomalyDetectionOptions
): Array<{ id: string; name: string; score: number; reason: string }> {
  const { method, threshold = 3.0, contamination = 0.05 } = options;
  
  // Calculate statistics for each numerical feature
  const numericalFeatures = ['inDegree', 'outDegree', 'inFlow', 'outFlow', 'flowRatio', 'centrality', 'value'];
  const stats: { [key: string]: { mean?: number; std?: number; q1?: number; q3?: number; iqr?: number } } = {};
  
  numericalFeatures.forEach(feature => {
    if (nodeFeatures.some(f => f[feature] !== undefined)) {
      const values = nodeFeatures.map(f => f[feature]).filter(v => !isNaN(v) && v !== Infinity);
      
      // Calculate mean and standard deviation
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      
      // Calculate quartiles
      const sortedValues = [...values].sort((a, b) => a - b);
      const q1Index = Math.floor(sortedValues.length * 0.25);
      const q3Index = Math.floor(sortedValues.length * 0.75);
      const q1 = sortedValues[q1Index];
      const q3 = sortedValues[q3Index];
      const iqr = q3 - q1;
      
      stats[feature] = { mean, std, q1, q3, iqr };
    }
  });
  
  // Detect anomalies based on the selected method
  let anomalies: Array<{ id: string; name: string; score: number; reason: string }> = [];
  
  switch (method) {
    case 'zscore':
      // Z-score method
      anomalies = nodeFeatures.map(node => {
        let maxZScore = 0;
        let anomalousFeature = '';
        
        numericalFeatures.forEach(feature => {
          if (node[feature] !== undefined && stats[feature]?.std && stats[feature].std! > 0) {
            const zScore = Math.abs((node[feature] - stats[feature].mean!) / stats[feature].std!);
            
            if (zScore > maxZScore) {
              maxZScore = zScore;
              anomalousFeature = feature;
            }
          }
        });
        
        return {
          id: node.id,
          name: node.name,
          score: maxZScore,
          reason: `Unusual ${anomalousFeature} (${maxZScore.toFixed(2)} standard deviations from mean)`
        };
      }).filter(node => node.score > threshold);
      break;
      
    case 'iqr':
      // IQR method
      anomalies = nodeFeatures.map(node => {
        let maxScore = 0;
        let anomalousFeature = '';
        
        numericalFeatures.forEach(feature => {
          if (node[feature] !== undefined && stats[feature]?.iqr && stats[feature].iqr! > 0) {
            const lowerBound = stats[feature].q1! - threshold * stats[feature].iqr!;
            const upperBound = stats[feature].q3! + threshold * stats[feature].iqr!;
            
            if (node[feature] < lowerBound || node[feature] > upperBound) {
              const distance = Math.max(
                Math.abs(node[feature] - lowerBound),
                Math.abs(node[feature] - upperBound)
              );
              const score = distance / stats[feature].iqr!;
              
              if (score > maxScore) {
                maxScore = score;
                anomalousFeature = feature;
              }
            }
          }
        });
        
        return {
          id: node.id,
          name: node.name,
          score: maxScore,
          reason: `Unusual ${anomalousFeature} (${maxScore.toFixed(2)} times IQR from quartiles)`
        };
      }).filter(node => node.score > 0);
      break;
      
    default:
      // Default to Z-score
      anomalies = nodeFeatures.map(node => {
        let maxZScore = 0;
        let anomalousFeature = '';
        
        numericalFeatures.forEach(feature => {
          if (node[feature] !== undefined && stats[feature]?.std && stats[feature].std! > 0) {
            const zScore = Math.abs((node[feature] - stats[feature].mean!) / stats[feature].std!);
            
            if (zScore > maxZScore) {
              maxZScore = zScore;
              anomalousFeature = feature;
            }
          }
        });
        
        return {
          id: node.id,
          name: node.name,
          score: maxZScore,
          reason: `Unusual ${anomalousFeature} (${maxZScore.toFixed(2)} standard deviations from mean)`
        };
      }).filter(node => node.score > threshold);
  }
  
  // Limit to expected contamination
  if (method === 'isolation' || method === 'dbscan' || method === 'autoencoder') {
    const maxAnomalies = Math.max(1, Math.ceil(nodeFeatures.length * contamination));
    anomalies.sort((a, b) => b.score - a.score);
    anomalies = anomalies.slice(0, maxAnomalies);
  }
  
  return anomalies;
}

/**
 * Detect link anomalies
 * @param linkFeatures Link features
 * @param options Anomaly detection options
 * @returns Link anomalies
 */
function detectLinkAnomalies(
  linkFeatures: any[],
  options: AnomalyDetectionOptions
): Array<{ source: string; target: string; score: number; reason: string }> {
  const { method, threshold = 3.0, contamination = 0.05 } = options;
  
  // Calculate statistics for each numerical feature
  const numericalFeatures = ['value', 'sourceRatio', 'targetRatio'];
  const stats: { [key: string]: { mean?: number; std?: number; q1?: number; q3?: number; iqr?: number } } = {};
  
  numericalFeatures.forEach(feature => {
    if (linkFeatures.some(f => f[feature] !== undefined)) {
      const values = linkFeatures.map(f => f[feature]).filter(v => !isNaN(v) && v !== Infinity);
      
      // Calculate mean and standard deviation
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      
      // Calculate quartiles
      const sortedValues = [...values].sort((a, b) => a - b);
      const q1Index = Math.floor(sortedValues.length * 0.25);
      const q3Index = Math.floor(sortedValues.length * 0.75);
      const q1 = sortedValues[q1Index];
      const q3 = sortedValues[q3Index];
      const iqr = q3 - q1;
      
      stats[feature] = { mean, std, q1, q3, iqr };
    }
  });
  
  // Detect anomalies based on the selected method
  let anomalies: Array<{ source: string; target: string; score: number; reason: string }> = [];
  
  switch (method) {
    case 'zscore':
      // Z-score method
      anomalies = linkFeatures.map(link => {
        let maxZScore = 0;
        let anomalousFeature = '';
        
        numericalFeatures.forEach(feature => {
          if (link[feature] !== undefined && stats[feature]?.std && stats[feature].std! > 0) {
            const zScore = Math.abs((link[feature] - stats[feature].mean!) / stats[feature].std!);
            
            if (zScore > maxZScore) {
              maxZScore = zScore;
              anomalousFeature = feature;
            }
          }
        });
        
        return {
          source: link.source,
          target: link.target,
          score: maxZScore,
          reason: `Unusual ${anomalousFeature} from ${link.sourceName} to ${link.targetName} (${maxZScore.toFixed(2)} standard deviations from mean)`
        };
      }).filter(link => link.score > threshold);
      break;
      
    case 'iqr':
      // IQR method
      anomalies = linkFeatures.map(link => {
        let maxScore = 0;
        let anomalousFeature = '';
        
        numericalFeatures.forEach(feature => {
          if (link[feature] !== undefined && stats[feature]?.iqr && stats[feature].iqr! > 0) {
            const lowerBound = stats[feature].q1! - threshold * stats[feature].iqr!;
            const upperBound = stats[feature].q3! + threshold * stats[feature].iqr!;
            
            if (link[feature] < lowerBound || link[feature] > upperBound) {
              const distance = Math.max(
                Math.abs(link[feature] - lowerBound),
                Math.abs(link[feature] - upperBound)
              );
              const score = distance / stats[feature].iqr!;
              
              if (score > maxScore) {
                maxScore = score;
                anomalousFeature = feature;
              }
            }
          }
        });
        
        return {
          source: link.source,
          target: link.target,
          score: maxScore,
          reason: `Unusual ${anomalousFeature} from ${link.sourceName} to ${link.targetName} (${maxScore.toFixed(2)} times IQR from quartiles)`
        };
      }).filter(link => link.score > 0);
      break;
      
    default:
      // Default to Z-score
      anomalies = linkFeatures.map(link => {
        let maxZScore = 0;
        let anomalousFeature = '';
        
        numericalFeatures.forEach(feature => {
          if (link[feature] !== undefined && stats[feature]?.std && stats[feature].std! > 0) {
            const zScore = Math.abs((link[feature] - stats[feature].mean!) / stats[feature].std!);
            
            if (zScore > maxZScore) {
              maxZScore = zScore;
              anomalousFeature = feature;
            }
          }
        });
        
        return {
          source: link.source,
          target: link.target,
          score: maxZScore,
          reason: `Unusual ${anomalousFeature} from ${link.sourceName} to ${link.targetName} (${maxZScore.toFixed(2)} standard deviations from mean)`
        };
      }).filter(link => link.score > threshold);
  }
  
  // Limit to expected contamination
  if (method === 'isolation' || method === 'dbscan' || method === 'autoencoder') {
    const maxAnomalies = Math.max(1, Math.ceil(linkFeatures.length * contamination));
    anomalies.sort((a, b) => b.score - a.score);
    anomalies = anomalies.slice(0, maxAnomalies);
  }
  
  return anomalies;
}

/**
 * Send progress update to main thread
 * @param progress Progress percentage (0-100)
 * @param requestId Request ID
 */
function sendProgressUpdate(progress: number, requestId: string): void {
  const message: AnomalyDetectionWorkerOutputMessage = {
    type: 'progress_update',
    progress,
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
  const message: AnomalyDetectionWorkerOutputMessage = {
    type: 'error',
    error: errorMessage,
    requestId
  };
  
  self.postMessage(message);
}
