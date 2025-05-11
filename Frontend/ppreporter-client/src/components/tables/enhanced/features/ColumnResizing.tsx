import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { ColumnResizingConfig } from '../types';

interface ColumnResizerProps {
  columnId: string;
  config: ColumnResizingConfig;
  onResize: (columnId: string, width: number) => void;
  initialWidth?: number;
}

/**
 * Column resizer component
 */
const ColumnResizer: React.FC<ColumnResizerProps> = ({
  columnId,
  config,
  onResize,
  initialWidth
}) => {
  const [resizing, setResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(initialWidth || 0);
  
  // Handle mouse down to start resizing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizing(true);
    startXRef.current = e.clientX;
    
    // Get current column width
    const headerCell = document.getElementById(`header-${columnId}`);
    if (headerCell) {
      startWidthRef.current = headerCell.offsetWidth;
    }
  };
  
  // Handle mouse move during resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
      
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(
        config.minWidth || 50,
        Math.min(config.maxWidth || 500, startWidthRef.current + diff)
      );
      
      onResize(columnId, newWidth);
    };
    
    const handleMouseUp = () => {
      setResizing(false);
    };
    
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, columnId, config.minWidth, config.maxWidth, onResize]);
  
  return (
    <Box
      sx={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 8,
        cursor: 'col-resize',
        zIndex: 1,
        '&:hover': {
          backgroundColor: 'action.hover'
        },
        ...(resizing && {
          backgroundColor: 'primary.main',
          opacity: 0.2,
          width: 2,
          right: -1
        })
      }}
      onMouseDown={handleMouseDown}
    />
  );
};

/**
 * Apply column widths to the table
 */
export const applyColumnWidths = (
  tableElement: HTMLElement | null,
  columnWidths: Record<string, number>
) => {
  if (!tableElement) return;
  
  // Find all header cells
  const headerCells = tableElement.querySelectorAll('th');
  
  headerCells.forEach(cell => {
    const columnId = cell.id.replace('header-', '');
    const width = columnWidths[columnId];
    
    if (width) {
      cell.style.width = `${width}px`;
      cell.style.minWidth = `${width}px`;
      cell.style.maxWidth = `${width}px`;
    }
  });
};

export default ColumnResizer;
