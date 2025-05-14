import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import SafeGrid from '../../components/common/SafeGrid';

/**
 * Test page for the safe Grid component
 */
const SafeGridTestPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Safe Grid Component Test Page
      </Typography>
      <Typography variant="body1" paragraph>
        This page tests the safe Grid component that falls back to a custom implementation if the Material-UI Grid component fails to load.
      </Typography>
      <Paper sx={{ p: 2, m: 2 }}>
        <Typography variant="h5" gutterBottom>
          Safe Grid Test
        </Typography>
        <SafeGrid container spacing={2}>
          <SafeGrid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
              Safe Grid Item 1
            </Paper>
          </SafeGrid>
          <SafeGrid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'white' }}>
              Safe Grid Item 2
            </Paper>
          </SafeGrid>
        </SafeGrid>
      </Paper>
    </Container>
  );
};

export default SafeGridTestPage;
