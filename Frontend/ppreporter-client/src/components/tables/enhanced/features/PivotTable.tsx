import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { PivotTableConfig, AggregationFunction } from '../types';

interface PivotTableProps {
  data: any[];
  config: PivotTableConfig;
}

/**
 * Pivot table component
 */
const PivotTable: React.FC<PivotTableProps> = ({
  data,
  config
}) => {
  // Process data for pivot table
  const pivotData = useMemo(() => {
    if (!data.length || !config.enabled) return { rows: [], columns: [], values: {} };
    
    // Extract unique row and column values
    const rowValues: Record<string, Set<any>> = {};
    const columnValues: Record<string, Set<any>> = {};
    
    // Initialize row and column value sets
    config.rowFields.forEach(field => {
      rowValues[field] = new Set();
    });
    
    config.columnFields.forEach(field => {
      columnValues[field] = new Set();
    });
    
    // Collect unique values for rows and columns
    data.forEach(item => {
      config.rowFields.forEach(field => {
        rowValues[field].add(item[field]);
      });
      
      config.columnFields.forEach(field => {
        columnValues[field].add(item[field]);
      });
    });
    
    // Convert sets to arrays
    const rowValuesArray: Record<string, any[]> = {};
    const columnValuesArray: Record<string, any[]> = {};
    
    Object.entries(rowValues).forEach(([field, values]) => {
      rowValuesArray[field] = Array.from(values).sort();
    });
    
    Object.entries(columnValues).forEach(([field, values]) => {
      columnValuesArray[field] = Array.from(values).sort();
    });
    
    // Generate all possible combinations of column values
    const generateColumnCombinations = (fields: string[], currentIndex: number, currentCombination: Record<string, any> = {}): Record<string, any>[] => {
      if (currentIndex >= fields.length) {
        return [{ ...currentCombination }];
      }
      
      const field = fields[currentIndex];
      const values = columnValuesArray[field];
      const combinations: Record<string, any>[] = [];
      
      values.forEach(value => {
        const newCombination = { ...currentCombination, [field]: value };
        const subCombinations = generateColumnCombinations(fields, currentIndex + 1, newCombination);
        combinations.push(...subCombinations);
      });
      
      return combinations;
    };
    
    // Generate all possible combinations of row values
    const generateRowCombinations = (fields: string[], currentIndex: number, currentCombination: Record<string, any> = {}): Record<string, any>[] => {
      if (currentIndex >= fields.length) {
        return [{ ...currentCombination }];
      }
      
      const field = fields[currentIndex];
      const values = rowValuesArray[field];
      const combinations: Record<string, any>[] = [];
      
      values.forEach(value => {
        const newCombination = { ...currentCombination, [field]: value };
        const subCombinations = generateRowCombinations(fields, currentIndex + 1, newCombination);
        combinations.push(...subCombinations);
      });
      
      return combinations;
    };
    
    const columnCombinations = generateColumnCombinations(config.columnFields, 0);
    const rowCombinations = generateRowCombinations(config.rowFields, 0);
    
    // Create a map to store aggregated values
    const valueMap: Record<string, Record<string, number>> = {};
    
    // Initialize value map
    rowCombinations.forEach(rowComb => {
      const rowKey = config.rowFields.map(field => rowComb[field]).join('|');
      valueMap[rowKey] = {};
      
      columnCombinations.forEach(colComb => {
        const colKey = config.columnFields.map(field => colComb[field]).join('|');
        valueMap[rowKey][colKey] = 0;
      });
    });
    
    // Aggregate data
    data.forEach(item => {
      const rowKey = config.rowFields.map(field => item[field]).join('|');
      const colKey = config.columnFields.map(field => item[field]).join('|');
      
      if (valueMap[rowKey] && valueMap[rowKey][colKey] !== undefined) {
        const value = Number(item[config.valueField]) || 0;
        
        // Apply aggregation function
        switch (config.aggregationFunction) {
          case 'sum':
            valueMap[rowKey][colKey] += value;
            break;
          case 'avg':
            // For average, we need to track count and sum separately
            if (!valueMap[rowKey][`${colKey}_count`]) {
              valueMap[rowKey][`${colKey}_count`] = 0;
              valueMap[rowKey][`${colKey}_sum`] = 0;
            }
            valueMap[rowKey][`${colKey}_count`]++;
            valueMap[rowKey][`${colKey}_sum`] += value;
            valueMap[rowKey][colKey] = valueMap[rowKey][`${colKey}_sum`] / valueMap[rowKey][`${colKey}_count`];
            break;
          case 'min':
            if (valueMap[rowKey][colKey] === 0 || value < valueMap[rowKey][colKey]) {
              valueMap[rowKey][colKey] = value;
            }
            break;
          case 'max':
            if (value > valueMap[rowKey][colKey]) {
              valueMap[rowKey][colKey] = value;
            }
            break;
          case 'count':
            valueMap[rowKey][colKey]++;
            break;
          default:
            valueMap[rowKey][colKey] += value;
        }
      }
    });
    
    return {
      rows: rowCombinations,
      columns: columnCombinations,
      values: valueMap
    };
  }, [data, config]);
  
  // Format cell value based on type
  const formatValue = (value: number): string => {
    if (config.valueFormat === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    } else if (config.valueFormat === 'percentage') {
      return `${value.toFixed(2)}%`;
    } else {
      return value.toLocaleString();
    }
  };
  
  if (!config.enabled || !data.length) {
    return null;
  }
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ width: '100%', mb: 2 }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
        <Typography variant="h6">
          Pivot Table
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {config.valueField} by {config.rowFields.join(', ')} and {config.columnFields.join(', ')}
        </Typography>
      </Box>
      
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {/* Row header cells */}
              {config.rowFields.map(field => (
                <TableCell key={field} sx={{ fontWeight: 'bold' }}>
                  {field}
                </TableCell>
              ))}
              
              {/* Column header cells */}
              {pivotData.columns.map((column, index) => (
                <TableCell key={index} align="right" sx={{ fontWeight: 'bold' }}>
                  {config.columnFields.map(field => column[field]).join(' - ')}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {pivotData.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} hover>
                {/* Row value cells */}
                {config.rowFields.map(field => (
                  <TableCell key={field} sx={{ fontWeight: 'bold' }}>
                    {row[field]}
                  </TableCell>
                ))}
                
                {/* Data cells */}
                {pivotData.columns.map((column, colIndex) => {
                  const rowKey = config.rowFields.map(field => row[field]).join('|');
                  const colKey = config.columnFields.map(field => column[field]).join('|');
                  const value = pivotData.values[rowKey]?.[colKey] || 0;
                  
                  return (
                    <TableCell key={colIndex} align="right">
                      {formatValue(value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PivotTable;
