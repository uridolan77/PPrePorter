import React from 'react';
import { Tooltip, TooltipProps } from '@mui/material';
import { ColumnDef } from '../types';

interface CellTooltipProps {
  column: ColumnDef;
  row: any;
  children: React.ReactNode;
}

/**
 * Cell tooltip component
 */
const CellTooltip: React.FC<CellTooltipProps> = ({
  column,
  row,
  children
}) => {
  // If no tooltip config, render children directly
  if (!column.tooltip || !column.tooltip.enabled) {
    return <>{children}</>;
  }
  
  // Get tooltip content
  let content: React.ReactNode;
  
  if (typeof column.tooltip.content === 'function') {
    content = column.tooltip.content(row[column.id], row);
  } else if (column.tooltip.content) {
    content = column.tooltip.content;
  } else {
    // Default to showing the cell value
    content = row[column.id];
  }
  
  // Get tooltip placement
  const placement = column.tooltip.placement || 'top';
  
  // Additional tooltip props
  const tooltipProps: Partial<TooltipProps> = {
    arrow: true,
    enterDelay: 500,
    leaveDelay: 200,
    ...(column.tooltip.props || {})
  };
  
  return (
    <Tooltip
      title={content}
      placement={placement}
      {...tooltipProps}
    >
      <div>{children}</div>
    </Tooltip>
  );
};

export default CellTooltip;
