import React, { useCallback, memo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { SxProps, Theme } from '@mui/material/styles';
import { ColumnDef } from '../../types/common';

export interface VirtualizedTableProps<T> {
  data: T[];
  columns: ColumnDef[];
  height?: number;
  width?: number | string;
  rowHeight?: number;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  headerHeight?: number;
  sx?: SxProps<Theme>;
}

/**
 * VirtualizedTable component
 * A reusable virtualized table component using react-window for efficient rendering of large data sets
 */
function VirtualizedTable<T extends Record<string, any>>({
  data = [],
  columns = [],
  height = 400,
  width = '100%',
  rowHeight = 53,
  loading = false,
  emptyMessage = 'No data to display',
  onRowClick,
  headerHeight = 56,
  sx = {}
}: VirtualizedTableProps<T>): React.ReactElement {
  // Memoized row renderer to prevent unnecessary re-renders
  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const row = data[index];
      return (
        <TableRow
          component="div"
          hover
          onClick={onRowClick ? () => onRowClick(row) : undefined}
          style={{
            ...style,
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
            cursor: onRowClick ? 'pointer' : 'default'
          }}
        >
          {columns.map((column) => {
            const value = row[column.id];
            const cellWidth = `${100 / columns.length}%`;

            return (
              <TableCell
                component="div"
                key={column.id}
                align={column.align || 'left'}
                style={{
                  width: cellWidth,
                  display: 'flex',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {column.format ? column.format(value, row) : value}
              </TableCell>
            );
          })}
        </TableRow>
      );
    },
    [data, columns, onRowClick]
  );

  // If loading, return a loading message
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, ...sx }}>
        <CircularProgress />
      </Box>
    );
  }

  // If no data, return an empty message
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, ...sx }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ height, width, overflow: 'hidden', ...sx }}>
      <TableContainer component="div" sx={{ height: '100%', width: '100%' }}>
        <Table component="div" sx={{ display: 'block', width: '100%', height: '100%' }}>
          <TableHead component="div" sx={{ display: 'block', width: '100%' }}>
            <TableRow
              component="div"
              sx={{
                display: 'flex',
                width: '100%',
                height: headerHeight,
                alignItems: 'center'
              }}
            >
              {columns.map((column) => {
                const cellWidth = `${100 / columns.length}%`;

                return (
                  <TableCell
                    component="div"
                    key={column.id}
                    align={column.align || 'left'}
                    sx={{
                      width: cellWidth,
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      boxSizing: 'border-box'
                    }}
                  >
                    {column.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody
            component="div"
            sx={{
              display: 'block',
              width: '100%',
              height: `calc(${height}px - ${headerHeight}px)`,
              overflow: 'hidden'
            }}
          >
            <FixedSizeList
              height={height - headerHeight}
              width="100%"
              itemCount={data.length}
              itemSize={rowHeight}
              style={{ overflow: 'auto' }}
            >
              {Row}
            </FixedSizeList>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default memo(VirtualizedTable) as <T extends Record<string, any>>(props: VirtualizedTableProps<T>) => React.ReactElement;
