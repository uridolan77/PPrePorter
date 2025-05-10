import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface PlayerActivityProps {
  playerId?: string;
  data?: any[];
  loading?: boolean;
  error?: Error | null;
}

/**
 * PlayerActivity component - Displays activity history for a player
 * This is a stub component that will be implemented later
 */
const PlayerActivity: React.FC<PlayerActivityProps> = ({
  playerId,
  data = [],
  loading = false,
  error = null
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Player Activity
      </Typography>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          This is a stub component that will be implemented later.
        </Typography>
      </Box>
    </Paper>
  );
};

export default PlayerActivity;
