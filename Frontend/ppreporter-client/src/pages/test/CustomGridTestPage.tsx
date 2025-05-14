import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import CustomGrid from '../../components/common/CustomGrid';

/**
 * Test page for the custom Grid component
 */
const CustomGridTestPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Custom Grid Component Test Page
      </Typography>
      <Typography variant="body1" paragraph>
        This page tests the custom Grid component that doesn't rely on @mui/material/Grid.
      </Typography>
      <Paper sx={{ p: 2, m: 2 }}>
        <Typography variant="h5" gutterBottom>
          Custom Grid Test
        </Typography>
        <CustomGrid container spacing={2}>
          <CustomGrid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
              Custom Grid Item 1
            </Paper>
          </CustomGrid>
          <CustomGrid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'white' }}>
              Custom Grid Item 2
            </Paper>
          </CustomGrid>
        </CustomGrid>
      </Paper>
    </Container>
  );
};

export default CustomGridTestPage;
