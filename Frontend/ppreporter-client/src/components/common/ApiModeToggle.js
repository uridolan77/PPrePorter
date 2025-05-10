import React, { useState, useEffect } from 'react';
import { Box, FormControlLabel, Switch, Typography, Paper, Button } from '@mui/material';
import { isMockDataEnabled, enableMockData, disableMockData } from '../../utils/mockDataToggle';

/**
 * Component to toggle between real API and mock data mode
 */
const ApiModeToggle = () => {
  const [useMockData, setUseMockData] = useState(false);
  
  // Initialize state from localStorage
  useEffect(() => {
    setUseMockData(isMockDataEnabled());
  }, []);
  
  // Handle toggle change
  const handleToggleChange = (event) => {
    const newValue = event.target.checked;
    setUseMockData(newValue);
    
    if (newValue) {
      enableMockData();
    } else {
      disableMockData();
    }
  };
  
  // Handle force reload
  const handleForceReload = () => {
    window.location.reload();
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        API Mode Settings
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={useMockData}
              onChange={handleToggleChange}
              color="primary"
            />
          }
          label={useMockData ? "Using Mock Data" : "Using Real API"}
        />
        
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleForceReload}
        >
          Reload Page
        </Button>
      </Box>
      
      <Typography variant="body2" color="text.secondary">
        {useMockData 
          ? "Mock data mode is enabled. The application is using local mock data instead of making real API calls."
          : "Real API mode is enabled. The application is making real API calls to the backend server."
        }
      </Typography>
      
      {useMockData && (
        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
          Note: Mock data is for development and testing purposes only. It does not reflect real data.
        </Typography>
      )}
    </Paper>
  );
};

export default ApiModeToggle;
