import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import ApiTestComponent from '../components/common/ApiTestComponent';
import apiTest from '../utils/apiTest';

/**
 * API Test Page
 *
 * This page provides a UI to test API connectivity and verify that
 * the application is using real API calls instead of mock data.
 */
const ApiTestPage = () => {
  const [mockDataEnabled, setMockDataEnabled] = useState(false);
  const [apiUrl, setApiUrl] = useState('');

  // Check if mock data is enabled on component mount
  useEffect(() => {
    setMockDataEnabled(apiTest.isMockDataEnabled());
    setApiUrl(process.env.REACT_APP_API_URL || 'https://localhost:7075/api');
  }, []);

  // Disable mock data
  const handleDisableMockData = () => {
    apiTest.disableMockData();
    setMockDataEnabled(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          API Test Page
        </Typography>

        <Typography variant="body1" paragraph>
          This page allows you to test API connectivity and verify that the application
          is using real API calls instead of mock data.
        </Typography>

        {mockDataEnabled && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleDisableMockData}
              >
                Disable Mock Data
              </Button>
            }
          >
            <Typography variant="body1">
              Mock data mode is currently enabled. The application is using mock data instead of real API calls.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Configuration
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    API URL:
                  </Typography>
                  <Typography variant="body2">
                    {apiUrl}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mock Data Mode:
                  </Typography>
                  <Chip
                    label={mockDataEnabled ? "Enabled" : "Disabled"}
                    color={mockDataEnabled ? "warning" : "success"}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Environment:
                  </Typography>
                  <Typography variant="body2">
                    {process.env.NODE_ENV}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                {mockDataEnabled && (
                  <Button
                    size="small"
                    color="warning"
                    onClick={handleDisableMockData}
                  >
                    Disable Mock Data
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <ApiTestComponent />

        <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Troubleshooting Tips
          </Typography>

          <Typography variant="body2" paragraph>
            If you're having trouble connecting to the API, try the following:
          </Typography>

          <ol>
            <li>
              <Typography variant="body2">
                Ensure the API server is running at the configured URL.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Check that the API URL is correctly configured in the .env file.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Verify that mock data mode is disabled in localStorage and constants.ts.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Check for CORS issues in the browser console.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Ensure the API server has CORS enabled and allows requests from this origin.
              </Typography>
            </li>
          </ol>
        </Paper>
      </Box>
    </Container>
  );
};

export default ApiTestPage;
