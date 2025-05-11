import React from 'react';
import { CustomAggregationsConfig } from '../types';

/**
 * Type for custom aggregation function
 */
export type CustomAggregationFunction = (values: number[], context?: any) => number;

/**
 * Standard aggregation functions
 */
export const StandardAggregations: Record<string, CustomAggregationFunction> = {
  sum: (values) => {
    return values.reduce((sum, value) => sum + value, 0);
  },
  
  avg: (values) => {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
  },
  
  min: (values) => {
    if (values.length === 0) return 0;
    return Math.min(...values);
  },
  
  max: (values) => {
    if (values.length === 0) return 0;
    return Math.max(...values);
  },
  
  count: (values) => {
    return values.length;
  },
  
  median: (values) => {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  },
  
  mode: (values) => {
    if (values.length === 0) return 0;
    
    const counts = new Map<number, number>();
    let maxCount = 0;
    let mode = values[0];
    
    values.forEach(value => {
      const count = (counts.get(value) || 0) + 1;
      counts.set(value, count);
      
      if (count > maxCount) {
        maxCount = count;
        mode = value;
      }
    });
    
    return mode;
  },
  
  variance: (values) => {
    if (values.length <= 1) return 0;
    
    const avg = StandardAggregations.avg(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    return StandardAggregations.avg(squareDiffs);
  },
  
  stdDev: (values) => {
    return Math.sqrt(StandardAggregations.variance(values));
  }
};

/**
 * Advanced aggregation functions
 */
export const AdvancedAggregations: Record<string, CustomAggregationFunction> = {
  weightedAvg: (values, weights) => {
    if (!weights || values.length !== weights.length || values.length === 0) {
      return StandardAggregations.avg(values);
    }
    
    let sum = 0;
    let weightSum = 0;
    
    for (let i = 0; i < values.length; i++) {
      sum += values[i] * weights[i];
      weightSum += weights[i];
    }
    
    return sum / (weightSum || 1);
  },
  
  movingAvg: (values, window = 3) => {
    if (values.length === 0) return 0;
    if (values.length <= window) return StandardAggregations.avg(values);
    
    // Use the last 'window' values
    const recentValues = values.slice(-window);
    return StandardAggregations.avg(recentValues);
  },
  
  percentile: (values, percentile = 0.5) => {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * percentile;
    const base = Math.floor(pos);
    const rest = pos - base;
    
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  },
  
  cumulative: (values) => {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0);
  },
  
  runningTotal: (values) => {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0);
  },
  
  firstValue: (values) => {
    if (values.length === 0) return 0;
    return values[0];
  },
  
  lastValue: (values) => {
    if (values.length === 0) return 0;
    return values[values.length - 1];
  },
  
  deltaFirstLast: (values) => {
    if (values.length < 2) return 0;
    return values[values.length - 1] - values[0];
  },
  
  percentChange: (values) => {
    if (values.length < 2 || values[0] === 0) return 0;
    return ((values[values.length - 1] - values[0]) / Math.abs(values[0])) * 100;
  }
};

/**
 * Apply aggregation function to data
 */
export const applyAggregation = (
  data: any[],
  columnId: string,
  aggregationFunction: string,
  customFunctions: Record<string, CustomAggregationFunction>,
  context?: any
): number => {
  // Extract values from data
  const values = data.map(row => Number(row[columnId]) || 0);
  
  // Check if it's a standard aggregation
  if (StandardAggregations[aggregationFunction]) {
    return StandardAggregations[aggregationFunction](values);
  }
  
  // Check if it's an advanced aggregation
  if (AdvancedAggregations[aggregationFunction]) {
    return AdvancedAggregations[aggregationFunction](values, context);
  }
  
  // Check if it's a custom aggregation
  if (customFunctions && customFunctions[aggregationFunction]) {
    return customFunctions[aggregationFunction](values, context);
  }
  
  // Default to sum
  return StandardAggregations.sum(values);
};

/**
 * Get all available aggregation functions
 */
export const getAllAggregationFunctions = (
  config: CustomAggregationsConfig
): Record<string, CustomAggregationFunction> => {
  return {
    ...StandardAggregations,
    ...AdvancedAggregations,
    ...(config.functions || {})
  };
};

export default {
  StandardAggregations,
  AdvancedAggregations,
  applyAggregation,
  getAllAggregationFunctions
};
