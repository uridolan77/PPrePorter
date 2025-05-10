import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

interface PlayerDetailsProps {
  player?: any;
  loading?: boolean;
  error?: Error | null;
}

/**
 * PlayerDetails component - Displays detailed information about a player
 * This is a stub component that will be implemented later
 */
const PlayerDetails: React.FC<PlayerDetailsProps> = ({
  player = {},
  loading = false,
  error = null
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Player Details
      </Typography>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          This is a stub component that will be implemented later.
        </Typography>
      </Box>
    </Paper>
  );
};

export default PlayerDetails;
