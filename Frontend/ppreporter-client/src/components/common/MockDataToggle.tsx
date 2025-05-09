import React, { useState, useEffect } from 'react';
import { 
  Box, 
  FormControlLabel, 
  Switch, 
  Tooltip, 
  Typography, 
  Paper,
  IconButton,
  Collapse
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { isMockDataEnabled, toggleMockData } from '../../utils/mockDataToggle';

interface MockDataToggleProps {
  showDetails?: boolean;
}

/**
 * Component to toggle between mock data and real API calls
 */
const MockDataToggle: React.FC<MockDataToggleProps> = ({ showDetails = false }) => {
  const [mockEnabled, setMockEnabled] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(showDetails);

  // Initialize state from localStorage
  useEffect(() => {
    setMockEnabled(isMockDataEnabled());
  }, []);

  // Handle toggle
  const handleToggle = () => {
    const newState = toggleMockData();
    setMockEnabled(newState);
  };

  // Toggle details panel
  const toggleDetails = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2, 
        border: '1px solid', 
        borderColor: mockEnabled ? 'warning.light' : 'divider',
        bgcolor: mockEnabled ? 'warning.50' : 'background.paper'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={mockEnabled}
                onChange={handleToggle}
                color="warning"
              />
            }
            label={
              <Typography variant="body2" fontWeight={500}>
                {mockEnabled ? 'Using Mock Data' : 'Using Real API'}
              </Typography>
            }
          />
          <Tooltip title="Toggle between mock data and real API calls">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" color="info" />
            </IconButton>
          </Tooltip>
        </Box>
        <IconButton size="small" onClick={toggleDetails}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Current Mode:</strong> {mockEnabled ? 'Mock Data' : 'Real API'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {mockEnabled 
              ? 'Using simulated data for UI testing. No API calls are being made.'
              : 'Connected to the real API. All data is fetched from the server.'}
          </Typography>
          {mockEnabled && (
            <Typography variant="body2" color="warning.dark" sx={{ mt: 1 }}>
              Note: Mock data is for testing only and does not reflect real data.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default MockDataToggle;
