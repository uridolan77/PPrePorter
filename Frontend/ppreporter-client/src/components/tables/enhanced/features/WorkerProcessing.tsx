import React, { useEffect, useRef } from 'react';
import { WorkerProcessingConfig } from '../types';

interface WorkerProcessingProps {
  config: WorkerProcessingConfig;
  data: any[];
  onProcessedData: (processedData: any[]) => void;
  operations: {
    sort?: {
      column: string;
      direction: 'asc' | 'desc';
    };
    filter?: {
      quickFilter: string;
      advancedFilters: Record<string, any>;
    };
    aggregate?: {
      groupBy: string | null;
      aggregations: { columnId: string; function: string }[];
    };
  };
}

/**
 * Worker processing component
 */
const WorkerProcessing: React.FC<WorkerProcessingProps> = ({
  config,
  data,
  onProcessedData,
  operations
}) => {
  const workerRef = useRef<Worker | null>(null);
  
  // Initialize worker
  useEffect(() => {
    if (!config.enabled || !config.workerUrl) {
      return;
    }
    
    try {
      const worker = new Worker(config.workerUrl);
      
      worker.onmessage = (event) => {
        const { type, data: processedData, error } = event.data;
        
        if (error) {
          console.error('Worker error:', error);
          return;
        }
        
        if (type === 'processed') {
          onProcessedData(processedData);
        }
      };
      
      worker.onerror = (error) => {
        console.error('Worker error:', error);
      };
      
      workerRef.current = worker;
      
      // Send initial data to worker
      worker.postMessage({
        type: 'init',
        data
      });
    } catch (err) {
      console.error('Failed to initialize worker:', err);
    }
    
    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [config.enabled, config.workerUrl, onProcessedData]);
  
  // Send data to worker when it changes
  useEffect(() => {
    if (!workerRef.current || !config.enabled) {
      return;
    }
    
    workerRef.current.postMessage({
      type: 'update',
      data
    });
  }, [data, config.enabled]);
  
  // Send operations to worker when they change
  useEffect(() => {
    if (!workerRef.current || !config.enabled) {
      return;
    }
    
    // Check if the operation is enabled in config
    const enabledOperations: Record<string, any> = {};
    
    if (operations.sort && config.operations?.includes('sort')) {
      enabledOperations.sort = operations.sort;
    }
    
    if (operations.filter && config.operations?.includes('filter')) {
      enabledOperations.filter = operations.filter;
    }
    
    if (operations.aggregate && config.operations?.includes('aggregate')) {
      enabledOperations.aggregate = operations.aggregate;
    }
    
    // Only send message if there are enabled operations
    if (Object.keys(enabledOperations).length > 0) {
      workerRef.current.postMessage({
        type: 'process',
        operations: enabledOperations
      });
    }
  }, [operations, config.enabled, config.operations]);
  
  return null;
};

/**
 * Create a worker script for data processing
 */
export const createWorkerScript = (): string => {
  return `
    // Table data processing worker
    
    let tableData = [];
    
    // Handle messages from main thread
    self.onmessage = function(event) {
      const { type, data, operations } = event.data;
      
      try {
        switch (type) {
          case 'init':
          case 'update':
            tableData = data;
            break;
            
          case 'process':
            const processedData = processData(tableData, operations);
            self.postMessage({ type: 'processed', data: processedData });
            break;
            
          default:
            console.warn('Unknown message type:', type);
        }
      } catch (error) {
        self.postMessage({ type: 'error', error: error.message });
      }
    };
    
    // Process data based on operations
    function processData(data, operations) {
      if (!data || !data.length) {
        return [];
      }
      
      let result = [...data];
      
      // Apply filtering
      if (operations.filter) {
        result = filterData(result, operations.filter);
      }
      
      // Apply sorting
      if (operations.sort) {
        result = sortData(result, operations.sort);
      }
      
      // Apply aggregation
      if (operations.aggregate) {
        result = aggregateData(result, operations.aggregate);
      }
      
      return result;
    }
    
    // Filter data
    function filterData(data, filter) {
      const { quickFilter, advancedFilters } = filter;
      let filteredData = data;
      
      // Apply quick filter
      if (quickFilter) {
        const lowerCaseSearchTerm = quickFilter.toLowerCase();
        filteredData = filteredData.filter(row => {
          return Object.keys(row).some(key => {
            const value = row[key];
            if (value === null || value === undefined) return false;
            if (typeof value === 'object') return false;
            return String(value).toLowerCase().includes(lowerCaseSearchTerm);
          });
        });
      }
      
      // Apply advanced filters
      if (advancedFilters && Object.keys(advancedFilters).length > 0) {
        filteredData = filteredData.filter(row => {
          return Object.entries(advancedFilters).every(([key, value]) => {
            if (value === null || value === undefined) return true;
            
            // Handle different filter types
            if (typeof value === 'object') {
              if ('min' in value && row[key] < value.min) return false;
              if ('max' in value && row[key] > value.max) return false;
              if ('values' in value && !value.values.includes(row[key])) return false;
              return true;
            }
            
            return row[key] === value;
          });
        });
      }
      
      return filteredData;
    }
    
    // Sort data
    function sortData(data, sort) {
      const { column, direction } = sort;
      
      return [...data].sort((a, b) => {
        const valueA = a[column];
        const valueB = b[column];
        
        // Handle null/undefined values
        if (valueA === null || valueA === undefined) return direction === 'asc' ? -1 : 1;
        if (valueB === null || valueB === undefined) return direction === 'asc' ? 1 : -1;
        
        // Compare based on type
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return direction === 'asc' ? valueA - valueB : valueB - valueA;
        }
        
        // Default string comparison
        return direction === 'asc'
          ? String(valueA).localeCompare(String(valueB))
          : String(valueB).localeCompare(String(valueA));
      });
    }
    
    // Aggregate data
    function aggregateData(data, aggregate) {
      const { groupBy, aggregations } = aggregate;
      
      if (!groupBy) {
        return data;
      }
      
      // Group data
      const groups = {};
      
      data.forEach(row => {
        const groupValue = String(row[groupBy] || 'Unknown');
        if (!groups[groupValue]) {
          groups[groupValue] = [];
        }
        groups[groupValue].push(row);
      });
      
      // Calculate aggregations
      const result = Object.entries(groups).map(([groupValue, rows]) => {
        const aggregatedRow = {
          [groupBy]: groupValue,
          _groupRows: rows.length,
          _isGroupRow: true
        };
        
        // Apply aggregations
        if (aggregations && aggregations.length > 0) {
          aggregations.forEach(agg => {
            const values = rows.map(row => Number(row[agg.columnId]) || 0);
            
            switch (agg.function) {
              case 'sum':
                aggregatedRow[agg.columnId] = values.reduce((sum, value) => sum + value, 0);
                break;
                
              case 'avg':
                aggregatedRow[agg.columnId] = values.length > 0
                  ? values.reduce((sum, value) => sum + value, 0) / values.length
                  : 0;
                break;
                
              case 'min':
                aggregatedRow[agg.columnId] = values.length > 0 ? Math.min(...values) : 0;
                break;
                
              case 'max':
                aggregatedRow[agg.columnId] = values.length > 0 ? Math.max(...values) : 0;
                break;
                
              case 'count':
                aggregatedRow[agg.columnId] = values.length;
                break;
                
              default:
                aggregatedRow[agg.columnId] = values.reduce((sum, value) => sum + value, 0);
            }
          });
        }
        
        return aggregatedRow;
      });
      
      return result;
    }
  `;
};

export default WorkerProcessing;
