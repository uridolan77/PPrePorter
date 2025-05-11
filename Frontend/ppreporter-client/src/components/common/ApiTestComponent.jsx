import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress, 
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import apiTest from '../../utils/apiTest';
import apiClient from '../../services/api/apiClient';

/**
 * API Test Component
 * 
 * This component provides a UI to test API connectivity and verify that
 * the application is using real API calls instead of mock data.
 */
const ApiTestComponent = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [mockDataEnabled, setMockDataEnabled] = useState(false);
  const [apiUrl, setApiUrl] = useState('');

  // Check if mock data is enabled on component mount
  useEffect(() => {
    setMockDataEnabled(apiTest.isMockDataEnabled());
    setApiUrl(process.env.REACT_APP_API_URL || 'https://localhost:7075/api');
  }, []);

  // Test API connectivity
  const handleTestConnectivity = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const result = await apiTest.testApiConnectivity();
      setTestResult({
        success: result,
        message: result ? 'API is reachable' : 'API is not reachable'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error testing API connectivity',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Make a test API call
  const handleTestApiCall = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const result = await apiTest.makeTestApiCall();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error making test API call',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Disable mock data
  const handleDisableMockData = () => {
    apiTest.disableMockData();
    setMockDataEnabled(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>
        API Connectivity Test
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Current Configuration:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="API URL" 
              secondary={apiUrl} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Mock Data Mode" 
              secondary={mockDataEnabled ? 'Enabled' : 'Disabled'} 
            />
          </ListItem>
        </List>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={handleTestConnectivity}
          disabled={loading}
        >
          Test API Connectivity
        </Button>
        
        <Button 
          variant="contained" 
          onClick={handleTestApiCall}
          disabled={loading}
        >
          Make Test API Call
        </Button>
        
        {mockDataEnabled && (
          <Button 
            variant="outlined" 
            color="warning"
            onClick={handleDisableMockData}
            disabled={loading}
          >
            Disable Mock Data
          </Button>
        )}
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      {testResult && (
        <Alert 
          severity={testResult.success ? 'success' : 'error'}
          sx={{ mt: 2 }}
        >
          <Typography variant="body1">
            {testResult.message}
          </Typography>
          
          {testResult.error && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Error: {testResult.error}
            </Typography>
          )}
          
          {testResult.data && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                Response Data:
              </Typography>
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '8px', 
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </Box>
          )}
        </Alert>
      )}
    </Paper>
  );
};

export default ApiTestComponent;
