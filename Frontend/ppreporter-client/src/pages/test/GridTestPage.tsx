import React from 'react';
import { Container, Typography } from '@mui/material';
import GridTest from '../../components/test/GridTest';

/**
 * Test page to verify Grid component loading
 */
const GridTestPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Grid Component Test Page
      </Typography>
      <Typography variant="body1" paragraph>
        This page tests the loading of the Material-UI Grid component.
      </Typography>
      <GridTest />
    </Container>
  );
};

export default GridTestPage;
