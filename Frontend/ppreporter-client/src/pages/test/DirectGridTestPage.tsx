import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid'; // Import Grid directly

/**
 * Test page with direct Grid import (no lazy loading)
 */
const DirectGridTestPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Direct Grid Component Test Page
      </Typography>
      <Typography variant="body1" paragraph>
        This page tests the direct loading of the Material-UI Grid component without lazy loading.
      </Typography>
      <Paper sx={{ p: 2, m: 2 }}>
        <Typography variant="h5" gutterBottom>
          Direct Grid Test
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
    </Container>
  );
};

export default DirectGridTestPage;
