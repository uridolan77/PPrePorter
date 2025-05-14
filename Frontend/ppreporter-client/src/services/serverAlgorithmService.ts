// Server algorithm service
// This service offloads computationally intensive algorithms to the server

import axios from 'axios';
import { GraphData } from '../components/reports/visualizations/NetworkGraph';
import { SankeyData } from '../components/reports/visualizations/SankeyDiagram';
import { SurfaceDataPoint } from '../components/reports/visualizations/Surface3DPlot';
import { CommunityDetectionOptions, CommunityStructure } from '../utils/communityDetectionUtils';
import { AnomalyDetectionOptions, AnomalyResult } from '../utils/anomalyDetectionUtils';
import { PredictionModelOptions } from '../utils/predictiveSurfaceUtils';
import workerManager from './workerManager';

// Base API URL - use the config
import config from '../config/appConfig';
const API_URL = config.api.baseUrl;

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache
const cache: Map<string, CacheEntry<any>> = new Map();

/**
 * Generate cache key
 * @param endpoint API endpoint
 * @param params Request parameters
 * @returns Cache key
 */
function generateCacheKey(endpoint: string, params: any): string {
  return `${endpoint}:${JSON.stringify(params)}`;
}

/**
 * Check if cache entry is valid
 * @param entry Cache entry
 * @returns Whether the entry is valid
 */
function isCacheValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Detect communities using server-side algorithm
 * @param graphData Graph data
 * @param options Community detection options
 * @param useCache Whether to use cache
 * @param onProgress Progress callback
 * @returns Promise with community detection result
 */
export async function detectCommunitiesServer(
  graphData: GraphData,
  options: CommunityDetectionOptions,
  useCache: boolean = true,
  onProgress?: (progress: number) => void
): Promise<{ graphData: GraphData; communityStructure: CommunityStructure }> {
  // Check cache
  const cacheKey = generateCacheKey('/algorithms/community-detection', { graphData, options });
  if (useCache) {
    const cachedResult = cache.get(cacheKey);
    if (isCacheValid(cachedResult)) {
      return cachedResult.data;
    }
  }

  try {
    // Send initial progress
    if (onProgress) onProgress(10);

    // Make API request
    const response = await axios.post(`${API_URL}/algorithms/community-detection`, {
      graphData,
      options
    });

    // Send completion progress
    if (onProgress) onProgress(100);

    // Cache result
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    return response.data;
  } catch (error) {
    // If server fails, fall back to client-side processing
    console.warn('Server-side community detection failed, falling back to client-side processing', error);

    return new Promise((resolve, reject) => {
      workerManager.detectCommunities(
        graphData,
        options,
        resolve,
        onProgress,
        reject
      );
    });
  }
}

/**
 * Detect anomalies using server-side algorithm
 * @param data Sankey diagram data
 * @param options Anomaly detection options
 * @param useCache Whether to use cache
 * @param onProgress Progress callback
 * @returns Promise with anomaly detection result
 */
export async function detectAnomaliesServer(
  data: SankeyData,
  options: AnomalyDetectionOptions,
  useCache: boolean = true,
  onProgress?: (progress: number) => void
): Promise<AnomalyResult> {
  // Check cache
  const cacheKey = generateCacheKey('/algorithms/anomaly-detection', { data, options });
  if (useCache) {
    const cachedResult = cache.get(cacheKey);
    if (isCacheValid(cachedResult)) {
      return cachedResult.data;
    }
  }

  try {
    // Send initial progress
    if (onProgress) onProgress(10);

    // Make API request
    const response = await axios.post(`${API_URL}/algorithms/anomaly-detection`, {
      data,
      options
    });

    // Send completion progress
    if (onProgress) onProgress(100);

    // Cache result
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    return response.data;
  } catch (error) {
    // If server fails, fall back to client-side processing
    console.warn('Server-side anomaly detection failed, falling back to client-side processing', error);

    return new Promise((resolve, reject) => {
      workerManager.detectAnomalies(
        data,
        options,
        resolve,
        onProgress,
        reject
      );
    });
  }
}

/**
 * Generate predictions using server-side algorithm
 * @param data Training data points
 * @param options Model options
 * @param xRange X-axis range
 * @param yRange Y-axis range
 * @param resolution Grid resolution
 * @param useCache Whether to use cache
 * @param onProgress Progress callback
 * @returns Promise with predictions
 */
export async function generatePredictionsServer(
  data: SurfaceDataPoint[],
  options: PredictionModelOptions,
  xRange: [number, number],
  yRange: [number, number],
  resolution: number,
  useCache: boolean = true,
  onProgress?: (progress: number) => void
): Promise<SurfaceDataPoint[]> {
  // Check cache
  const cacheKey = generateCacheKey('/algorithms/predictive-surface', {
    data, options, xRange, yRange, resolution
  });
  if (useCache) {
    const cachedResult = cache.get(cacheKey);
    if (isCacheValid(cachedResult)) {
      return cachedResult.data;
    }
  }

  try {
    // Send initial progress
    if (onProgress) onProgress(10);

    // Make API request
    const response = await axios.post(`${API_URL}/algorithms/predictive-surface`, {
      data,
      options,
      xRange,
      yRange,
      resolution
    });

    // Send completion progress
    if (onProgress) onProgress(100);

    // Cache result
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    return response.data;
  } catch (error) {
    // If server fails, fall back to client-side processing
    console.warn('Server-side prediction generation failed, falling back to client-side processing', error);

    return new Promise((resolve, reject) => {
      workerManager.generatePredictions(
        data,
        options,
        xRange,
        yRange,
        resolution,
        resolve,
        onProgress,
        reject
      );
    });
  }
}

/**
 * Generate confidence intervals using server-side algorithm
 * @param data Training data points
 * @param predictions Predicted data points
 * @param options Model options
 * @param confidenceLevel Confidence level (0-1)
 * @param useCache Whether to use cache
 * @param onProgress Progress callback
 * @returns Promise with confidence intervals
 */
export async function generateConfidenceIntervalsServer(
  data: SurfaceDataPoint[],
  predictions: SurfaceDataPoint[],
  options: PredictionModelOptions,
  confidenceLevel: number = 0.95,
  useCache: boolean = true,
  onProgress?: (progress: number) => void
): Promise<{ upper: SurfaceDataPoint[]; lower: SurfaceDataPoint[]; level: number }> {
  // Check cache
  const cacheKey = generateCacheKey('/algorithms/confidence-intervals', {
    data, predictions, options, confidenceLevel
  });
  if (useCache) {
    const cachedResult = cache.get(cacheKey);
    if (isCacheValid(cachedResult)) {
      return cachedResult.data;
    }
  }

  try {
    // Send initial progress
    if (onProgress) onProgress(10);

    // Make API request
    const response = await axios.post(`${API_URL}/algorithms/confidence-intervals`, {
      data,
      predictions,
      options,
      confidenceLevel
    });

    // Send completion progress
    if (onProgress) onProgress(100);

    // Cache result
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    return response.data;
  } catch (error) {
    // If server fails, fall back to client-side processing
    console.warn('Server-side confidence interval generation failed, falling back to client-side processing', error);

    // For confidence intervals, we need to create the model first
    const modelFn = await new Promise<(x: number, y: number) => number>((resolve) => {
      import('../utils/predictiveSurfaceUtils').then(({ createPredictiveModel }) => {
        resolve(createPredictiveModel(data, options));
      });
    });

    // Then generate confidence intervals
    return new Promise((resolve) => {
      import('../utils/predictiveSurfaceUtils').then(({ generateConfidenceIntervals }) => {
        resolve(generateConfidenceIntervals(modelFn, data, predictions, confidenceLevel));
      });
    });
  }
}

/**
 * Generate forecast using server-side algorithm
 * @param data Time series data points
 * @param periods Number of periods to forecast
 * @param options Model options
 * @param useCache Whether to use cache
 * @param onProgress Progress callback
 * @returns Promise with forecast
 */
export async function generateForecastServer(
  data: SurfaceDataPoint[],
  periods: number,
  options: PredictionModelOptions,
  useCache: boolean = true,
  onProgress?: (progress: number) => void
): Promise<SurfaceDataPoint[]> {
  // Check cache
  const cacheKey = generateCacheKey('/algorithms/forecast', {
    data, periods, options
  });
  if (useCache) {
    const cachedResult = cache.get(cacheKey);
    if (isCacheValid(cachedResult)) {
      return cachedResult.data;
    }
  }

  try {
    // Send initial progress
    if (onProgress) onProgress(10);

    // Make API request
    const response = await axios.post(`${API_URL}/algorithms/forecast`, {
      data,
      periods,
      options
    });

    // Send completion progress
    if (onProgress) onProgress(100);

    // Cache result
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });

    return response.data;
  } catch (error) {
    // If server fails, fall back to client-side processing
    console.warn('Server-side forecast generation failed, falling back to client-side processing', error);

    // For forecasting, we need to import the function directly
    return new Promise((resolve) => {
      import('../utils/predictiveSurfaceUtils').then(({ generateForecast }) => {
        resolve(generateForecast(data, periods, options));
      });
    });
  }
}

/**
 * Clear cache
 * @param endpoint Optional API endpoint to clear cache for
 */
export function clearCache(endpoint?: string): void {
  if (endpoint) {
    // Clear cache for specific endpoint
    Array.from(cache.keys()).forEach(key => {
      if (key.startsWith(`${endpoint}:`)) {
        cache.delete(key);
      }
    });
  } else {
    // Clear all cache
    cache.clear();
  }
}

/**
 * Get cache size
 * @returns Number of cached items
 */
export function getCacheSize(): number {
  return cache.size;
}

/**
 * Get cache entries
 * @returns Array of cache entries
 */
export function getCacheEntries(): Array<{ key: string; timestamp: number; size: number }> {
  return Array.from(cache.entries()).map(([key, entry]) => ({
    key,
    timestamp: entry.timestamp,
    size: JSON.stringify(entry.data).length
  }));
}

export default {
  detectCommunitiesServer,
  detectAnomaliesServer,
  generatePredictionsServer,
  generateConfidenceIntervalsServer,
  generateForecastServer,
  clearCache,
  getCacheSize,
  getCacheEntries
};
