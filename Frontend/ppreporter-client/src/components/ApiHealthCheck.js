import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import ApiModeToggle from './common/ApiModeToggle';

/**
 * Component to check API health and display status
 */
const ApiHealthCheck = () => {
  const [status, setStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');

  // Function to check API health
  const checkApiHealth = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the API URL from environment variables
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://localhost:7075/api';
      const baseUrl = apiBaseUrl.replace('/api', '');
      setApiUrl(baseUrl);

      console.log('Checking API health at:', `${baseUrl}/health`);

      // Make the request
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API health response:', data);
        setStatus(data.status || 'healthy');
      } else {
        setStatus('unhealthy');
        setError(`API returned status ${response.status}`);
      }
    } catch (err) {
      console.error('API health check failed:', err);
      setStatus('error');
      setError(err.message || 'Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  return (
    <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        API Health Check
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        API URL: {apiUrl}/health
      </Typography>

      {/* API Mode Toggle */}
      <ApiModeToggle />

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Checking API health...</Typography>
        </Box>
      ) : (
        <>
          {status === 'healthy' && (
            <Alert severity="success">API is healthy and responding</Alert>
          )}

          {status === 'unhealthy' && (
            <Alert severity="warning">
              API is responding but reporting unhealthy status
              {error && <Typography variant="body2">{error}</Typography>}
            </Alert>
          )}

          {status === 'error' && (
            <Alert severity="error">
              Failed to connect to API
              {error && <Typography variant="body2">{error}</Typography>}
            </Alert>
          )}

          {status === 'unknown' && (
            <Alert severity="info">Checking API status...</Alert>
          )}
        </>
      )}

      <Box sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          onClick={checkApiHealth}
          disabled={loading}
        >
          Refresh Status
        </Button>
      </Box>
    </Box>
  );
};

export default ApiHealthCheck;
