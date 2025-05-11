import React from 'react';
import { TableSortLabel, Tooltip } from '@mui/material';
import { ColumnDef, SortingConfig } from '../types';

interface SortingProps {
  column: ColumnDef;
  config: SortingConfig;
  activeColumn: string;
  direction: 'asc' | 'desc';
  onSort: (columnId: string) => void;
}

/**
 * Sorting component for table headers
 */
const Sorting: React.FC<SortingProps> = ({
  column,
  config,
  activeColumn,
  direction,
  onSort
}) => {
  // Don't render sorting for non-sortable columns
  if (column.sortable === false) {
    return <>{column.label}</>;
  }

  const handleSort = () => {
    onSort(column.id);
  };

  return (
    <Tooltip title={`Sort by ${column.label}`}>
      <TableSortLabel
        active={activeColumn === column.id}
        direction={activeColumn === column.id ? direction : 'asc'}
        onClick={handleSort}
      >
        {column.label}
      </TableSortLabel>
    </Tooltip>
  );
};

export default Sorting;
