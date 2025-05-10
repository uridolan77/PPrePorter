import React, { useCallback } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { Box, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

export interface VirtualizedListProps<T> {
  data: T[];
  renderRow: (props: { index: number; style: React.CSSProperties; data: T }) => React.ReactNode;
  height?: number;
  width?: number | string;
  itemSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  sx?: SxProps<Theme>;
}

/**
 * VirtualizedList component
 * A reusable virtualized list component using react-window for efficient rendering of large data sets
 */
function VirtualizedList<T>({
  data = [],
  renderRow,
  height = 400,
  width = '100%',
  itemSize = 50,
  loading = false,
  emptyMessage = 'No data to display',
  sx = {}
}: VirtualizedListProps<T>): React.ReactElement {
  // If loading, return a loading message
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, ...sx }}>
        <Typography variant="body1" color="text.secondary">
          Loading...
        </Typography>
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

  // Memoized row renderer to prevent unnecessary re-renders
  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => 
      renderRow({ index, style, data: data[index] }),
    [data, renderRow]
  );

  return (
    <Box sx={{ height, width, ...sx }}>
      <FixedSizeList
        height={height}
        width={width}
        itemCount={data.length}
        itemSize={itemSize}
      >
        {Row}
      </FixedSizeList>
    </Box>
  );
}

export default React.memo(VirtualizedList) as <T>(props: VirtualizedListProps<T>) => React.ReactElement;
