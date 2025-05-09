import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ErrorBoundary from '../common/ErrorBoundary';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * Test Panel Component
 * Provides controls for testing different data scenarios
 */
const TestPanel = ({
  testScenario,
  onTestScenarioChange,
  onClose
}) => {
  return (
    <ErrorBoundary
      fallback={
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'error.light', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ErrorOutlineIcon sx={{ mr: 2 }} />
            <Typography variant="body1">
              Error loading test panel
            </Typography>
          </Box>
        </Paper>
      }
    >
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Test Data Scenarios
        </Typography>
        <Tooltip title="Close test panel">
          <IconButton onClick={onClose} size="small" aria-label="Close test panel">
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select a test scenario to simulate different data conditions and test the dashboard's behavior.
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="test-scenario-label">Test Scenario</InputLabel>
        <Select
          labelId="test-scenario-label"
          id="test-scenario-select"
          value={testScenario}
          label="Test Scenario"
          onChange={onTestScenarioChange}
          aria-label="Select test scenario"
        >
          <MenuItem value="normal">Normal Data</MenuItem>
          <MenuItem value="empty">Empty Data</MenuItem>
          <MenuItem value="partial">Partial Data</MenuItem>
          <MenuItem value="large">Large Dataset</MenuItem>
          <MenuItem value="error">Error State</MenuItem>
          <MenuItem value="loading">Loading State</MenuItem>
        </Select>
      </FormControl>
      <Typography variant="body2" color="text.secondary">
        Current scenario: <strong>{testScenario}</strong>
      </Typography>
    </Paper>
    </ErrorBoundary>
  );
};

export default TestPanel;
