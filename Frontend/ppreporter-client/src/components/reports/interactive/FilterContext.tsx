import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Filter types
export type FilterType = 'category' | 'date' | 'value' | 'range' | 'search';

// Filter value types
export type FilterValue = string | number | Date | string[] | number[] | [Date, Date] | null;

// Filter object
export interface Filter {
  id: string;
  type: FilterType;
  field: string;
  value: FilterValue;
  operator?: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  source?: string; // Widget ID that created the filter
}

// Filter context state
interface FilterContextState {
  filters: Filter[];
  addFilter: (filter: Filter) => void;
  updateFilter: (id: string, value: FilterValue) => void;
  removeFilter: (id: string) => void;
  clearFilters: (source?: string) => void;
  getFiltersForSource: (source: string) => Filter[];
  getFiltersExceptSource: (source: string) => Filter[];
  applyFilters: <T extends object>(data: T[], excludeSource?: string) => T[];
}

// Create context
const FilterContext = createContext<FilterContextState | undefined>(undefined);

// Filter context provider props
interface FilterContextProviderProps {
  children: ReactNode;
}

/**
 * FilterContextProvider component
 * Provides filter state and methods for cross-filtering between widgets
 */
export const FilterContextProvider: React.FC<FilterContextProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<Filter[]>([]);

  // Add a new filter
  const addFilter = useCallback((filter: Filter) => {
    setFilters(prevFilters => {
      // Check if filter with same id already exists
      const existingFilterIndex = prevFilters.findIndex(f => f.id === filter.id);

      if (existingFilterIndex >= 0) {
        // Replace existing filter
        const newFilters = [...prevFilters];
        newFilters[existingFilterIndex] = filter;
        return newFilters;
      } else {
        // Add new filter
        return [...prevFilters, filter];
      }
    });
  }, []);

  // Update an existing filter
  const updateFilter = useCallback((id: string, value: FilterValue) => {
    setFilters(prevFilters => {
      const filterIndex = prevFilters.findIndex(f => f.id === id);
      if (filterIndex >= 0) {
        const newFilters = [...prevFilters];
        newFilters[filterIndex] = {
          ...newFilters[filterIndex],
          value
        };
        return newFilters;
      }
      return prevFilters;
    });
  }, []);

  // Remove a filter
  const removeFilter = useCallback((id: string) => {
    setFilters(prevFilters => prevFilters.filter(f => f.id !== id));
  }, []);

  // Clear all filters
  const clearFilters = useCallback((source?: string) => {
    if (source) {
      // Clear filters from specific source
      setFilters(prevFilters => prevFilters.filter(f => f.source !== source));
    } else {
      // Clear all filters
      setFilters([]);
    }
  }, []);

  // Get filters for a specific source
  const getFiltersForSource = useCallback((source: string) => {
    return filters.filter(f => f.source === source);
  }, [filters]);

  // Get filters except from a specific source
  const getFiltersExceptSource = useCallback((source: string) => {
    return filters.filter(f => f.source !== source);
  }, [filters]);

  // Apply filters to data
  const applyFilters = useCallback(<T extends object>(data: T[], excludeSource?: string): T[] => {
    // If no filters or no data, return original data
    if (filters.length === 0 || data.length === 0) {
      return data;
    }

    // Get filters to apply (exclude filters from specified source if provided)
    const filtersToApply = excludeSource
      ? filters.filter(f => f.source !== excludeSource)
      : filters;

    // If no filters to apply, return original data
    if (filtersToApply.length === 0) {
      return data;
    }

    // Apply each filter
    return data.filter(item => {
      return filtersToApply.every(filter => {
        const fieldValue = item[filter.field as keyof T];

        // Skip if field doesn't exist in item
        if (fieldValue === undefined) {
          return true;
        }

        switch (filter.type) {
          case 'category':
            if (filter.operator === 'in' && Array.isArray(filter.value)) {
              // Ensure we're comparing strings
              const stringValue = String(fieldValue);
              return filter.value.some(val => String(val) === stringValue);
            } else {
              return fieldValue === filter.value;
            }

          case 'date':
            if (!filter.value) return true;

            const itemDate = fieldValue instanceof Date
              ? fieldValue
              : new Date(fieldValue as string);

            if (filter.operator === 'between' && Array.isArray(filter.value) && filter.value.length === 2) {
              const [startDate, endDate] = filter.value as [Date, Date];
              return itemDate >= startDate && itemDate <= endDate;
            } else if (filter.value instanceof Date) {
              return itemDate.toDateString() === (filter.value as Date).toDateString();
            }
            return true;

          case 'value':
            if (typeof fieldValue !== 'number') return true;

            if (filter.operator === 'greaterThan') {
              return fieldValue > (filter.value as number);
            } else if (filter.operator === 'lessThan') {
              return fieldValue < (filter.value as number);
            } else if (filter.operator === 'between' && Array.isArray(filter.value) && filter.value.length === 2) {
              const [min, max] = filter.value as [number, number];
              return fieldValue >= min && fieldValue <= max;
            } else {
              return fieldValue === filter.value;
            }

          case 'search':
            if (typeof fieldValue !== 'string') return true;

            return fieldValue.toLowerCase().includes((filter.value as string).toLowerCase());

          default:
            return true;
        }
      });
    });
  }, [filters]);

  // Context value
  const value: FilterContextState = {
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    clearFilters,
    getFiltersForSource,
    getFiltersExceptSource,
    applyFilters
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

// Custom hook to use filter context
export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterContextProvider');
  }
  return context;
};

export default FilterContext;
