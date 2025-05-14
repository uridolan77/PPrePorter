import React from 'react';
import { Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid'; // Import Grid directly, not from @mui/material

/**
 * Test component to verify Grid component loading
 */
const GridTest: React.FC = () => {
  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Grid Test Component
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
            Grid Item 1
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'white' }}>
            Grid Item 2
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GridTest;
