import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface PlayerTableProps {
  data?: any[];
  loading?: boolean;
  error?: Error | null;
  onRowClick?: (row: any) => void;
}

/**
 * PlayerTable component - Displays player data in a table format
 * This is a stub component that will be implemented later
 */
const PlayerTable: React.FC<PlayerTableProps> = ({
  data = [],
  loading = false,
  error = null,
  onRowClick
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Player Table
      </Typography>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          This is a stub component that will be implemented later.
        </Typography>
      </Box>
    </Paper>
  );
};

export default PlayerTable;
