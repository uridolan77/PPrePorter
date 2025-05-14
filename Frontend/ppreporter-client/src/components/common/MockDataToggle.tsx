import React, { useState, useEffect } from 'react';
import {
  FormControlLabel,
  Switch,
  Tooltip,
  Typography,
  Paper,
  IconButton,
  Collapse
} from '@mui/material';
import SimpleBox from './SimpleBox';
import { createSx } from '../../utils/styleUtils';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { isMockDataEnabled, toggleMockData } from '../../utils/mockDataToggle';

interface MockDataToggleProps {
  showDetails?: boolean;
  collapsed?: boolean;
}

/**
 * Component to toggle between mock data and real API calls
 */
const MockDataToggle: React.FC<MockDataToggleProps> = ({ showDetails = false, collapsed = false }) => {
  const [mockEnabled, setMockEnabled] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(showDetails);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsed);

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

  // Toggle collapsed state
  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  // If collapsed, show only an icon button
  if (isCollapsed) {
    return (
      <Tooltip title="API Selection">
        <IconButton
          onClick={toggleCollapsed}
          sx={{
            bgcolor: mockEnabled ? 'warning.light' : 'primary.light',
            color: 'white',
            '&:hover': {
              bgcolor: mockEnabled ? 'warning.main' : 'primary.main',
            }
          }}
        >
          <InfoIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: mockEnabled ? 'warning.light' : 'divider',
        bgcolor: mockEnabled ? 'warning.50' : 'background.paper'
      }}
    >
      <SimpleBox sx={createSx({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}>
        <SimpleBox sx={createSx({ display: 'flex', alignItems: 'center' })}>
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
        </SimpleBox>
        <SimpleBox sx={createSx({})}>
          <IconButton size="small" onClick={toggleDetails} sx={{ mr: 1 }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <IconButton size="small" onClick={toggleCollapsed} color="primary">
            <InfoIcon fontSize="small" />
          </IconButton>
        </SimpleBox>
      </SimpleBox>

      <Collapse in={expanded}>
        <SimpleBox sx={createSx({ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 })}>
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
        </SimpleBox>
      </Collapse>
    </Paper>
  );
};

export default MockDataToggle;
