import React, { useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * VirtualizedList component
 * A reusable virtualized list component using react-window for efficient rendering of large data sets
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data items to render
 * @param {Function} props.renderRow - Function to render each row
 * @param {number} props.height - Height of the list
 * @param {number} props.width - Width of the list
 * @param {number} props.itemSize - Height of each item in the list
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.emptyMessage - Message to display when there is no data
 * @param {Object} props.sx - Additional styles
 * @returns {React.ReactNode} - Rendered component
 */
const VirtualizedList = ({
  data = [],
  renderRow,
  height = 400,
  width = '100%',
  itemSize = 50,
  loading = false,
  emptyMessage = 'No data to display',
  sx = {}
}) => {
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
    ({ index, style }) => renderRow({ index, style, data: data[index] }),
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
};

VirtualizedList.propTypes = {
  data: PropTypes.array,
  renderRow: PropTypes.func.isRequired,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  itemSize: PropTypes.number,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  sx: PropTypes.object
};

export default React.memo(VirtualizedList);
