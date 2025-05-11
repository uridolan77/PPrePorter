import React from 'react';
import { ColumnDef } from '../types';

/**
 * Process data to add calculated columns
 */
export const processCalculatedColumns = (
  data: any[],
  columns: ColumnDef[]
): any[] => {
  // Find columns with calculations
  const calculatedColumns = columns.filter(col => col.calculated && col.formula);
  
  if (calculatedColumns.length === 0) {
    return data;
  }
  
  // Create a new array with calculated values
  return data.map(row => {
    const newRow = { ...row };
    
    calculatedColumns.forEach(column => {
      if (column.formula) {
        try {
          // Apply the formula to calculate the value
          newRow[column.id] = column.formula(row);
        } catch (error) {
          console.error(`Error calculating column ${column.id}:`, error);
          newRow[column.id] = null;
        }
      }
    });
    
    return newRow;
  });
};

/**
 * Create a calculated column definition
 */
export const createCalculatedColumn = (
  id: string,
  label: string,
  formula: (row: any) => any,
  options: Partial<ColumnDef> = {}
): ColumnDef => {
  return {
    id,
    label,
    calculated: true,
    formula,
    ...options
  };
};

/**
 * Common calculation functions
 */
export const CalculationFunctions = {
  // Sum of multiple columns
  sum: (columnIds: string[]) => (row: any) => {
    return columnIds.reduce((sum, columnId) => {
      const value = Number(row[columnId]) || 0;
      return sum + value;
    }, 0);
  },
  
  // Product of multiple columns
  product: (columnIds: string[]) => (row: any) => {
    return columnIds.reduce((product, columnId) => {
      const value = Number(row[columnId]) || 0;
      return product * value;
    }, 1);
  },
  
  // Average of multiple columns
  average: (columnIds: string[]) => (row: any) => {
    if (columnIds.length === 0) return 0;
    
    const sum = columnIds.reduce((acc, columnId) => {
      const value = Number(row[columnId]) || 0;
      return acc + value;
    }, 0);
    
    return sum / columnIds.length;
  },
  
  // Difference between two columns
  difference: (columnA: string, columnB: string) => (row: any) => {
    const valueA = Number(row[columnA]) || 0;
    const valueB = Number(row[columnB]) || 0;
    return valueA - valueB;
  },
  
  // Percentage of one column relative to another
  percentage: (numerator: string, denominator: string) => (row: any) => {
    const num = Number(row[numerator]) || 0;
    const denom = Number(row[denominator]) || 1; // Avoid division by zero
    return (num / denom) * 100;
  },
  
  // Custom formula with JavaScript expression
  custom: (expression: string, columnMapping: Record<string, string>) => (row: any) => {
    // Create a function with column values as variables
    const variables: Record<string, any> = {};
    
    Object.entries(columnMapping).forEach(([variable, columnId]) => {
      variables[variable] = row[columnId];
    });
    
    // Create function with variables in scope
    const func = new Function(...Object.keys(variables), `return ${expression};`);
    
    // Execute the function with column values
    return func(...Object.values(variables));
  }
};

export default {
  processCalculatedColumns,
  createCalculatedColumn,
  CalculationFunctions
};
