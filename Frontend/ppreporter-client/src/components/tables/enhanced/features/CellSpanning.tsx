import React from 'react';
import { TableCell } from '@mui/material';
import { ColumnDef } from '../types';

interface SpanningCellProps {
  column: ColumnDef;
  row: any;
  rowIndex: number;
  data: any[];
  children: React.ReactNode;
}

/**
 * Calculate row and column spans for a cell
 */
export const calculateCellSpans = (
  column: ColumnDef,
  row: any,
  rowIndex: number,
  data: any[]
): { rowSpan: number; colSpan: number } => {
  let rowSpan = 1;
  let colSpan = 1;
  
  if (column.spanConfig) {
    // Calculate row span if configured
    if (typeof column.spanConfig.rowSpan === 'function') {
      rowSpan = column.spanConfig.rowSpan(row, rowIndex, data);
    } else if (typeof column.spanConfig.rowSpan === 'number') {
      rowSpan = column.spanConfig.rowSpan;
    }
    
    // Calculate column span if configured
    if (typeof column.spanConfig.colSpan === 'function') {
      colSpan = column.spanConfig.colSpan(row, rowIndex, data);
    } else if (typeof column.spanConfig.colSpan === 'number') {
      colSpan = column.spanConfig.colSpan;
    }
  }
  
  // Ensure spans are valid
  rowSpan = Math.max(1, Math.min(rowSpan, data.length - rowIndex));
  colSpan = Math.max(1, colSpan);
  
  return { rowSpan, colSpan };
};

/**
 * Check if a cell should be rendered or is covered by a spanning cell
 */
export const shouldRenderCell = (
  rowIndex: number,
  colIndex: number,
  spanMap: Map<string, { rowSpan: number; colSpan: number }>
): boolean => {
  // Check if this cell is covered by a previous cell's span
  for (let r = rowIndex; r >= 0; r--) {
    for (let c = colIndex; c >= 0; c--) {
      const spanKey = `${r}_${c}`;
      const span = spanMap.get(spanKey);
      
      if (span) {
        const rowCovered = r + span.rowSpan > rowIndex;
        const colCovered = c + span.colSpan > colIndex;
        
        if (rowCovered && colCovered && (r !== rowIndex || c !== colIndex)) {
          return false;
        }
      }
      
      // Only need to check the current column in previous rows
      if (r !== rowIndex) {
        break;
      }
    }
  }
  
  return true;
};

/**
 * Spanning cell component
 */
const SpanningCell: React.FC<SpanningCellProps> = ({
  column,
  row,
  rowIndex,
  data,
  children
}) => {
  const { rowSpan, colSpan } = calculateCellSpans(column, row, rowIndex, data);
  
  // If no spanning, render as normal
  if (rowSpan === 1 && colSpan === 1) {
    return <>{children}</>;
  }
  
  return (
    <TableCell
      rowSpan={rowSpan}
      colSpan={colSpan}
      align={column.align || 'left'}
      sx={{
        ...(column.cellProps || {}),
        whiteSpace: column.wrap ? 'normal' : 'nowrap',
        maxWidth: column.maxWidth || 'auto',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      {children}
    </TableCell>
  );
};

export default SpanningCell;
