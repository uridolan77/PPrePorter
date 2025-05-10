import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import ApiHealthCheck from '../components/ApiHealthCheck';

/**
 * API Test Page to check API connectivity
 */
const ApiTestPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          API Connection Test
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" paragraph>
            This page tests the connection to the backend API. It checks if the API is accessible
            and responding correctly.
          </Typography>
          
          <ApiHealthCheck />
        </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Troubleshooting
          </Typography>
          
          <Typography variant="body2" component="div">
            <ul>
              <li>Make sure the backend API is running at the correct URL</li>
              <li>Check that CORS is properly configured on the backend</li>
              <li>Verify network connectivity between frontend and backend</li>
              <li>Check browser console for detailed error messages</li>
            </ul>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ApiTestPage;
