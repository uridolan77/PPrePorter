import { AggregationFunction, TableState } from './types';

/**
 * Format a number as currency
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a number with thousands separators
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format a number as a percentage
 */
export const formatPercentage = (value: number): string => {
  return `${value}%`;
};

/**
 * Calculate aggregation for a column
 */
export const calculateAggregation = (
  data: any[],
  columnId: string,
  aggregationFunction: AggregationFunction
): number => {
  if (!data.length) return 0;

  switch (aggregationFunction) {
    case 'sum':
      return data.reduce((sum, row) => {
        const value = Number(row[columnId]) || 0;
        return sum + value;
      }, 0);

    case 'avg':
      const sum = data.reduce((acc, row) => {
        const value = Number(row[columnId]) || 0;
        return acc + value;
      }, 0);
      return sum / data.length;

    case 'min':
      return Math.min(...data.map(row => Number(row[columnId]) || 0));

    case 'max':
      return Math.max(...data.map(row => Number(row[columnId]) || 0));

    case 'count':
      return data.length;

    default:
      return 0;
  }
};

/**
 * Group data by a column
 */
export const groupData = (data: any[], groupByColumn: string): Record<string, any[]> => {
  const groups: Record<string, any[]> = {};

  data.forEach(row => {
    const groupValue = String(row[groupByColumn] || 'Unknown');
    if (!groups[groupValue]) {
      groups[groupValue] = [];
    }
    groups[groupValue].push(row);
  });

  return groups;
};

/**
 * Sort data by a column
 */
export const sortData = (
  data: any[],
  columnId: string,
  direction: 'asc' | 'desc'
): any[] => {
  return [...data].sort((a, b) => {
    const valueA = a[columnId];
    const valueB = b[columnId];

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
};

/**
 * Filter data based on quick filter and advanced filters
 */
export const filterData = (
  data: any[],
  quickFilter: string,
  advancedFilters: Record<string, any>
): any[] => {
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
  if (Object.keys(advancedFilters).length > 0) {
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
};

/**
 * Encode table state to URL parameters
 */
export const encodeStateToUrl = (state: TableState): string => {
  const params = new URLSearchParams();
  
  // Encode sorting
  params.set('sort', `${state.sorting.column},${state.sorting.direction}`);
  
  // Encode filtering
  if (state.filtering.quickFilter) {
    params.set('q', state.filtering.quickFilter);
  }
  
  if (Object.keys(state.filtering.advancedFilters).length > 0) {
    params.set('filters', JSON.stringify(state.filtering.advancedFilters));
  }
  
  // Encode pagination
  params.set('page', state.pagination.page.toString());
  params.set('pageSize', state.pagination.pageSize.toString());
  
  // Encode grouping
  if (state.grouping.groupByColumn) {
    params.set('groupBy', state.grouping.groupByColumn);
  }
  
  // Encode columns
  params.set('columns', state.columns.visible.join(','));
  params.set('columnOrder', state.columns.order.join(','));
  params.set('stickyColumns', state.columns.sticky.join(','));
  
  // Encode aggregation
  if (state.aggregation.enabled.length > 0) {
    params.set('aggregations', state.aggregation.enabled.join(','));
  }
  
  return params.toString();
};

/**
 * Decode table state from URL parameters
 */
export const decodeStateFromUrl = (url: string, defaultState: TableState): TableState => {
  const params = new URLSearchParams(url);
  const state = { ...defaultState };
  
  // Decode sorting
  const sort = params.get('sort');
  if (sort) {
    const [column, direction] = sort.split(',');
    state.sorting.column = column;
    state.sorting.direction = direction as 'asc' | 'desc';
  }
  
  // Decode filtering
  const quickFilter = params.get('q');
  if (quickFilter) {
    state.filtering.quickFilter = quickFilter;
  }
  
  const filters = params.get('filters');
  if (filters) {
    try {
      state.filtering.advancedFilters = JSON.parse(filters);
    } catch (e) {
      console.error('Error parsing filters from URL', e);
    }
  }
  
  // Decode pagination
  const page = params.get('page');
  if (page) {
    state.pagination.page = parseInt(page, 10);
  }
  
  const pageSize = params.get('pageSize');
  if (pageSize) {
    state.pagination.pageSize = parseInt(pageSize, 10);
  }
  
  // Decode grouping
  const groupBy = params.get('groupBy');
  if (groupBy) {
    state.grouping.groupByColumn = groupBy;
  }
  
  // Decode columns
  const columns = params.get('columns');
  if (columns) {
    state.columns.visible = columns.split(',');
  }
  
  const columnOrder = params.get('columnOrder');
  if (columnOrder) {
    state.columns.order = columnOrder.split(',');
  }
  
  const stickyColumns = params.get('stickyColumns');
  if (stickyColumns) {
    state.columns.sticky = stickyColumns.split(',');
  }
  
  // Decode aggregation
  const aggregations = params.get('aggregations');
  if (aggregations) {
    state.aggregation.enabled = aggregations.split(',');
  }
  
  return state;
};
