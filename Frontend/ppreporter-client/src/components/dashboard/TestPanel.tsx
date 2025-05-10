import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface TestPanelProps {
  /**
   * Current test scenario
   */
  testScenario: string;
  
  /**
   * Handler for test scenario change
   */
  onTestScenarioChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Handler for closing the panel
   */
  onClose: () => void;
}

/**
 * Test panel component for simulating different data scenarios
 */
const TestPanel: React.FC<TestPanelProps> = ({
  testScenario,
  onTestScenarioChange,
  onClose
}) => {
  return (
    <Card sx={{ mb: 3, border: '1px dashed #999' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" color="primary">
            Test Panel
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          This panel allows you to simulate different data scenarios for testing purposes.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <FormControl component="fieldset">
          <FormLabel component="legend">Data Scenario</FormLabel>
          <RadioGroup
            aria-label="test-scenario"
            name="test-scenario"
            value={testScenario}
            onChange={onTestScenarioChange}
          >
            <FormControlLabel 
              value="normal" 
              control={<Radio />} 
              label="Normal - Fetch real data from API" 
            />
            <FormControlLabel 
              value="empty" 
              control={<Radio />} 
              label="Empty - No data available" 
            />
            <FormControlLabel 
              value="partial" 
              control={<Radio />} 
              label="Partial - Some data missing" 
            />
            <FormControlLabel 
              value="large" 
              control={<Radio />} 
              label="Large - Large dataset for performance testing" 
            />
            <FormControlLabel 
              value="error" 
              control={<Radio />} 
              label="Error - Simulate API error" 
            />
            <FormControlLabel 
              value="loading" 
              control={<Radio />} 
              label="Loading - Perpetual loading state" 
            />
          </RadioGroup>
        </FormControl>
        
        <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption" color="info.contrastText">
            Note: This panel is for development and testing purposes only and should be removed in production.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TestPanel;
