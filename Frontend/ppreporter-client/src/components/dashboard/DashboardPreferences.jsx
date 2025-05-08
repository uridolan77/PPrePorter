import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Tabs,
  Tab,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  InputLabel,
  Slider,
  Chip,
  Divider,
  Grid,
  Paper,
  CircularProgress,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InsightsIcon from '@mui/icons-material/Insights';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TimelineIcon from '@mui/icons-material/Timeline';
import UpdateIcon from '@mui/icons-material/Update';
import { TwitterPicker } from 'react-color';
import dashboardService from '../../services/dashboardService';

const chartTypes = [
  { label: 'Line Chart', value: 'line', icon: <TimelineIcon color="primary" /> },
  { label: 'Bar Chart', value: 'bar', icon: <FormatListBulletedIcon color="primary" /> },
  { label: 'Area Chart', value: 'area', icon: <TimelineIcon color="primary" /> },
  { label: 'Scatter Plot', value: 'scatter', icon: <TimelineIcon color="primary" /> }
];

const timeRanges = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'week' },
  { label: 'Last 30 Days', value: 'month' },
  { label: 'Last 90 Days', value: 'quarter' },
  { label: 'Last 365 Days', value: 'year' },
  { label: 'Custom Range', value: 'custom' }
];

/**
 * DashboardPreferences component allows users to customize their dashboard experience
 */
const DashboardPreferences = ({ open, onClose, onSave }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [preferences, setPreferences] = useState({
    // Theme preferences
    colorScheme: {
      baseTheme: 'light',
      colorMode: 'standard',
      primaryColor: theme.palette.primary.main,
      secondaryColor: theme.palette.secondary.main,
      positiveColor: '#4caf50',
      negativeColor: '#f44336',
      neutralColor: '#9e9e9e',
      contrastLevel: 3
    },
    
    // Layout preferences
    informationDensity: 'medium',
    preferredChartTypes: {
      revenue: 'line',
      registrations: 'bar',
      topGames: 'bar',
      transactions: 'line'
    },
    
    // Content preferences
    showAnnotations: true,
    showInsights: true,
    showAnomalies: true,
    showForecasts: true,
    defaultTimeRange: 'week',
    defaultDataGranularity: 7,
    insightImportanceThreshold: 4,
    
    // Component visibility
    componentVisibility: {
      summary: true,
      revenueChart: true,
      registrationChart: true,
      topGames: true,
      transactions: true,
      story: true
    },
    
    // Pinned metrics
    pinnedMetrics: ['Revenue', 'Registrations', 'FTD']
  });
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColorSetting, setCurrentColorSetting] = useState('');

  useEffect(() => {
    // Load user preferences from backend
    const loadPreferences = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would load preferences from the API
        // const userPrefs = await dashboardService.getUserPreferences();
        
        // For demo, just use a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use default preferences for now
        // setPreferences(userPrefs);
        setLoading(false);
      } catch (error) {
        console.error('Error loading preferences:', error);
        setLoading(false);
      }
    };
    
    if (open) {
      loadPreferences();
    }
  }, [open]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleCloseColorPicker = () => {
    setShowColorPicker(false);
    setCurrentColorSetting('');
  };

  const handleColorPickerOpen = (colorSetting) => {
    setCurrentColorSetting(colorSetting);
    setShowColorPicker(true);
  };

  const handleColorChange = (color) => {
    setPreferences(prev => ({
      ...prev,
      colorScheme: {
        ...prev.colorScheme,
        [currentColorSetting]: color.hex
      }
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleComponentVisibilityChange = (component) => {
    setPreferences(prev => ({
      ...prev,
      componentVisibility: {
        ...prev.componentVisibility,
        [component]: !prev.componentVisibility[component]
      }
    }));
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNestedChange = (group, name, value) => {
    setPreferences(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [name]: value
      }
    }));
  };

  const handleChartTypeChange = (metric, chartType) => {
    setPreferences(prev => ({
      ...prev,
      preferredChartTypes: {
        ...prev.preferredChartTypes,
        [metric]: chartType
      }
    }));
  };

  const handleSliderChange = (name, value) => {
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePinnedMetricToggle = (metric) => {
    setPreferences(prev => {
      const currentPinned = [...prev.pinnedMetrics];
      const index = currentPinned.indexOf(metric);
      
      if (index >= 0) {
        currentPinned.splice(index, 1);
      } else {
        currentPinned.push(metric);
      }
      
      return {
        ...prev,
        pinnedMetrics: currentPinned
      };
    });
  };

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      
      // Call your API to save preferences
      console.log('Saving preferences:', preferences);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would save using your service
      // await dashboardService.saveUserPreferences(preferences);
      
      setLoading(false);
      onSave(preferences);
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      setLoading(false);
    }
  };

  if (loading && !preferences) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 1 }} />
          Dashboard Preferences
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="preference tabs">
            <Tab icon={<ColorLensIcon />} label="Appearance" id="tab-0" />
            <Tab icon={<DashboardIcon />} label="Layout" id="tab-1" />
            <Tab icon={<InsightsIcon />} label="Content" id="tab-2" />
            <Tab icon={<VisibilityIcon />} label="Components" id="tab-3" />
          </Tabs>
        </Box>
        
        {/* APPEARANCE TAB */}
        {currentTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Theme Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Theme Mode
              </Typography>
              <RadioGroup
                name="baseTheme"
                value={preferences.colorScheme.baseTheme}
                onChange={(e) => handleNestedChange('colorScheme', 'baseTheme', e.target.value)}
                row
              >
                <FormControlLabel value="light" control={<Radio />} label="Light" />
                <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                <FormControlLabel value="system" control={<Radio />} label="System Default" />
              </RadioGroup>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Color Mode
              </Typography>
              <RadioGroup
                name="colorMode"
                value={preferences.colorScheme.colorMode}
                onChange={(e) => handleNestedChange('colorScheme', 'colorMode', e.target.value)}
                row
              >
                <FormControlLabel value="standard" control={<Radio />} label="Standard" />
                <FormControlLabel value="colorblind" control={<Radio />} label="Colorblind Friendly" />
                <FormControlLabel value="monochrome" control={<Radio />} label="Monochrome" />
                <FormControlLabel value="custom" control={<Radio />} label="Custom" />
              </RadioGroup>
            </Box>
            
            {preferences.colorScheme.colorMode === 'custom' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Custom Colors
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: preferences.colorScheme.primaryColor,
                          mr: 1,
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      />
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleColorPickerOpen('primaryColor')}
                      >
                        Primary Color
                      </Button>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: preferences.colorScheme.secondaryColor,
                          mr: 1,
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      />
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleColorPickerOpen('secondaryColor')}
                      >
                        Secondary Color
                      </Button>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: preferences.colorScheme.positiveColor,
                          mr: 1,
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      />
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleColorPickerOpen('positiveColor')}
                      >
                        Positive Color
                      </Button>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: preferences.colorScheme.negativeColor,
                          mr: 1,
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      />
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleColorPickerOpen('negativeColor')}
                      >
                        Negative Color
                      </Button>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: preferences.colorScheme.neutralColor,
                          mr: 1,
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      />
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleColorPickerOpen('neutralColor')}
                      >
                        Neutral Color
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
                
                {showColorPicker && (
                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">
                          Choose Color
                        </Typography>
                        <IconButton size="small" onClick={handleCloseColorPicker}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <TwitterPicker 
                        color={preferences.colorScheme[currentColorSetting]}
                        onChange={handleColorChange}
                        triangle="hide"
                        width="100%"
                      />
                    </Paper>
                  </Box>
                )}
              </Box>
            )}
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Contrast Level
              </Typography>
              <Box sx={{ px: 1, mb: 1 }}>
                <Slider
                  aria-label="Contrast Level"
                  value={preferences.colorScheme.contrastLevel}
                  onChange={(_, value) => handleNestedChange('colorScheme', 'contrastLevel', value)}
                  step={1}
                  marks
                  min={1}
                  max={5}
                  valueLabelDisplay="auto"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Low Contrast</Typography>
                <Typography variant="caption">High Contrast</Typography>
              </Box>
            </Box>
          </Box>
        )}
        
        {/* LAYOUT TAB */}
        {currentTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Layout Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Information Density
              </Typography>
              <RadioGroup
                name="informationDensity"
                value={preferences.informationDensity}
                onChange={handleRadioChange}
                row
              >
                <FormControlLabel value="compact" control={<Radio />} label="Compact" />
                <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                <FormControlLabel value="spacious" control={<Radio />} label="Spacious" />
              </RadioGroup>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>
              Preferred Chart Types
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Revenue Charts
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {chartTypes.map(chartType => (
                      <Chip
                        key={chartType.value}
                        label={chartType.label}
                        icon={chartType.icon}
                        onClick={() => handleChartTypeChange('revenue', chartType.value)}
                        variant={preferences.preferredChartTypes.revenue === chartType.value ? 'filled' : 'outlined'}
                        color={preferences.preferredChartTypes.revenue === chartType.value ? 'primary' : 'default'}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Registration Charts
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {chartTypes.map(chartType => (
                      <Chip
                        key={chartType.value}
                        label={chartType.label}
                        icon={chartType.icon}
                        onClick={() => handleChartTypeChange('registrations', chartType.value)}
                        variant={preferences.preferredChartTypes.registrations === chartType.value ? 'filled' : 'outlined'}
                        color={preferences.preferredChartTypes.registrations === chartType.value ? 'primary' : 'default'}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Pinned Metrics
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select metrics to pin to your dashboard summary
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <Chip
                label="Revenue"
                color={preferences.pinnedMetrics.includes('Revenue') ? 'primary' : 'default'}
                variant={preferences.pinnedMetrics.includes('Revenue') ? 'filled' : 'outlined'}
                onClick={() => handlePinnedMetricToggle('Revenue')}
                clickable
              />
              <Chip
                label="Registrations"
                color={preferences.pinnedMetrics.includes('Registrations') ? 'primary' : 'default'}
                variant={preferences.pinnedMetrics.includes('Registrations') ? 'filled' : 'outlined'}
                onClick={() => handlePinnedMetricToggle('Registrations')}
                clickable
              />
              <Chip
                label="First Time Depositors (FTD)"
                color={preferences.pinnedMetrics.includes('FTD') ? 'primary' : 'default'}
                variant={preferences.pinnedMetrics.includes('FTD') ? 'filled' : 'outlined'}
                onClick={() => handlePinnedMetricToggle('FTD')}
                clickable
              />
              <Chip
                label="Retention Rate"
                color={preferences.pinnedMetrics.includes('RetentionRate') ? 'primary' : 'default'}
                variant={preferences.pinnedMetrics.includes('RetentionRate') ? 'filled' : 'outlined'}
                onClick={() => handlePinnedMetricToggle('RetentionRate')}
                clickable
              />
              <Chip
                label="Average Revenue Per User"
                color={preferences.pinnedMetrics.includes('ARPU') ? 'primary' : 'default'}
                variant={preferences.pinnedMetrics.includes('ARPU') ? 'filled' : 'outlined'}
                onClick={() => handlePinnedMetricToggle('ARPU')}
                clickable
              />
              <Chip
                label="Deposits"
                color={preferences.pinnedMetrics.includes('Deposits') ? 'primary' : 'default'}
                variant={preferences.pinnedMetrics.includes('Deposits') ? 'filled' : 'outlined'}
                onClick={() => handlePinnedMetricToggle('Deposits')}
                clickable
              />
              <Chip
                label="Withdrawals"
                color={preferences.pinnedMetrics.includes('Withdrawals') ? 'primary' : 'default'}
                variant={preferences.pinnedMetrics.includes('Withdrawals') ? 'filled' : 'outlined'}
                onClick={() => handlePinnedMetricToggle('Withdrawals')}
                clickable
              />
            </Box>
          </Box>
        )}
        
        {/* CONTENT TAB */}
        {currentTab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Content Settings
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Data Features
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.showAnnotations}
                      onChange={handleSwitchChange}
                      name="showAnnotations"
                    />
                  }
                  label="Show Annotations"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.showInsights}
                      onChange={handleSwitchChange}
                      name="showInsights"
                    />
                  }
                  label="Show Insights"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.showAnomalies}
                      onChange={handleSwitchChange}
                      name="showAnomalies"
                    />
                  }
                  label="Show Anomalies"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.showForecasts}
                      onChange={handleSwitchChange}
                      name="showForecasts"
                    />
                  }
                  label="Show Forecasts"
                />
              </FormGroup>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Insight Importance Threshold
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Only show insights with importance above this threshold
              </Typography>
              <Box sx={{ px: 1, mb: 1 }}>
                <Slider
                  aria-label="Insight Importance Threshold"
                  value={preferences.insightImportanceThreshold}
                  onChange={(_, value) => handleSliderChange('insightImportanceThreshold', value)}
                  step={1}
                  marks
                  min={1}
                  max={10}
                  valueLabelDisplay="auto"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">All Insights</Typography>
                <Typography variant="caption">Important Only</Typography>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Default Time Range
              </Typography>
              <FormControl fullWidth sx={{ maxWidth: 300 }}>
                <Select
                  value={preferences.defaultTimeRange}
                  onChange={(e) => handleSliderChange('defaultTimeRange', e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Default time range' }}
                >
                  {timeRanges.map((range) => (
                    <MenuItem key={range.value} value={range.value}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Data Granularity
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Number of data points to show in charts
              </Typography>
              <Box sx={{ px: 1, mb: 1 }}>
                <Slider
                  aria-label="Data Granularity"
                  value={preferences.defaultDataGranularity}
                  onChange={(_, value) => handleSliderChange('defaultDataGranularity', value)}
                  step={null}
                  marks={[
                    { value: 5, label: '5' },
                    { value: 7, label: '7' },
                    { value: 14, label: '14' },
                    { value: 30, label: '30' },
                    { value: 60, label: '60' },
                    { value: 90, label: '90' }
                  ]}
                  min={5}
                  max={90}
                />
              </Box>
            </Box>
          </Box>
        )}
        
        {/* COMPONENTS TAB */}
        {currentTab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Component Visibility
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Show or hide dashboard components
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.componentVisibility.summary}
                      onChange={() => handleComponentVisibilityChange('summary')}
                    />
                  }
                  label="Summary Section"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.componentVisibility.revenueChart}
                      onChange={() => handleComponentVisibilityChange('revenueChart')}
                    />
                  }
                  label="Revenue Chart"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.componentVisibility.registrationChart}
                      onChange={() => handleComponentVisibilityChange('registrationChart')}
                    />
                  }
                  label="Registration Chart"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.componentVisibility.topGames}
                      onChange={() => handleComponentVisibilityChange('topGames')}
                    />
                  }
                  label="Top Games"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.componentVisibility.transactions}
                      onChange={() => handleComponentVisibilityChange('transactions')}
                    />
                  }
                  label="Transactions"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.componentVisibility.story}
                      onChange={() => handleComponentVisibilityChange('story')}
                    />
                  }
                  label="Dashboard Story"
                />
              </FormGroup>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSavePreferences} 
          variant="contained" 
          color="primary" 
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardPreferences;