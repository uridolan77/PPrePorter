import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Grid,
  Slider,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TimelineIcon from '@mui/icons-material/Timeline';
import UpdateIcon from '@mui/icons-material/Update';
import { TwitterPicker } from 'react-color';
import dashboardService from '../../services/api/dashboardService';
import { CommonProps } from '../../types/common';

interface ChartType {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

interface DashboardPreferencesProps extends CommonProps {
  onSave?: (preferences: any) => void;
  onCancel?: () => void;
  initialPreferences?: any;
  loading?: boolean;
}

const chartTypes: ChartType[] = [
  { label: 'Line Chart', value: 'line', icon: <TimelineIcon color="primary" /> },
  { label: 'Bar Chart', value: 'bar', icon: <FormatListBulletedIcon color="primary" /> },
  { label: 'Area Chart', value: 'area', icon: <TimelineIcon color="primary" /> },
  { label: 'Scatter Plot', value: 'scatter', icon: <TimelineIcon color="primary" /> }
];

/**
 * Dashboard Preferences component
 * Allows users to customize their dashboard experience
 */
const DashboardPreferences: React.FC<DashboardPreferencesProps> = ({
  onSave,
  onCancel,
  initialPreferences,
  loading = false,
  sx
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [preferences, setPreferences] = useState({
    appearance: {
      theme: 'light',
      colorScheme: {
        primary: theme.palette.primary.main,
        secondary: theme.palette.secondary.main,
        success: theme.palette.success.main,
        error: theme.palette.error.main,
        warning: theme.palette.warning.main,
        info: theme.palette.info.main
      },
      density: 'comfortable',
      animations: true,
      highContrast: false
    },
    charts: {
      defaultChartType: 'line',
      showLegends: true,
      showGridLines: true,
      showDataLabels: false,
      colorPalette: 'default'
    },
    data: {
      refreshInterval: 0, // 0 means manual refresh
      defaultDateRange: 'last7days',
      defaultMetrics: ['revenue', 'registrations', 'topGames', 'transactions'],
      showRawData: false
    },
    notifications: {
      enableAlerts: true,
      alertThreshold: 10,
      emailNotifications: false,
      desktopNotifications: true
    }
  });

  // Load initial preferences
  useEffect(() => {
    if (initialPreferences) {
      setPreferences(prevPreferences => ({
        ...prevPreferences,
        ...initialPreferences
      }));
    }
  }, [initialPreferences]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  const handleSwitchChange = (section: string, name: string) => (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPreferences({
      ...preferences,
      [section]: {
        ...preferences[section as keyof typeof preferences],
        [name]: event.target.checked
      }
    });
  };

  const handleSelectChange = (section: string, name: string) => (event: SelectChangeEvent<string>): void => {
    setPreferences({
      ...preferences,
      [section]: {
        ...preferences[section as keyof typeof preferences],
        [name]: event.target.value
      }
    });
  };

  const handleSliderChange = (section: string, name: string) => (event: Event, newValue: number | number[]): void => {
    setPreferences({
      ...preferences,
      [section]: {
        ...preferences[section as keyof typeof preferences],
        [name]: newValue
      }
    });
  };

  const handleColorChange = (color: string, colorName: string): void => {
    setPreferences({
      ...preferences,
      appearance: {
        ...preferences.appearance,
        colorScheme: {
          ...preferences.appearance.colorScheme,
          [colorName]: color
        }
      }
    });
  };

  const handleSave = async (): Promise<void> => {
    if (onSave) {
      onSave(preferences);
    } else {
      try {
        await dashboardService.saveDashboardPreferences(preferences);
        // Show success message or notification
      } catch (error) {
        console.error('Error saving preferences:', error);
        // Show error message
      }
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, ...sx }}>
      <Typography variant="h6" gutterBottom>
        Dashboard Preferences
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="Appearance" />
        <Tab label="Charts" />
        <Tab label="Data" />
        <Tab label="Notifications" />
      </Tabs>

      {/* Appearance Tab */}
      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="theme-select-label">Theme</InputLabel>
                <Select
                  labelId="theme-select-label"
                  id="theme-select"
                  value={preferences.appearance.theme}
                  label="Theme"
                  onChange={handleSelectChange('appearance', 'theme')}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System Default</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="density-select-label">Density</InputLabel>
                <Select
                  labelId="density-select-label"
                  id="density-select"
                  value={preferences.appearance.density}
                  label="Density"
                  onChange={handleSelectChange('appearance', 'density')}
                >
                  <MenuItem value="comfortable">Comfortable</MenuItem>
                  <MenuItem value="compact">Compact</MenuItem>
                  <MenuItem value="spacious">Spacious</MenuItem>
                </Select>
              </FormControl>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.appearance.animations}
                      onChange={handleSwitchChange('appearance', 'animations')}
                    />
                  }
                  label="Enable animations"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.appearance.highContrast}
                      onChange={handleSwitchChange('appearance', 'highContrast')}
                    />
                  }
                  label="High contrast mode"
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Color Scheme
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Primary Color
                </Typography>
                <TwitterPicker
                  color={preferences.appearance.colorScheme.primary}
                  onChangeComplete={(color) => handleColorChange(color.hex, 'primary')}
                  triangle="hide"
                />
              </Box>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Secondary Color
                </Typography>
                <TwitterPicker
                  color={preferences.appearance.colorScheme.secondary}
                  onChangeComplete={(color) => handleColorChange(color.hex, 'secondary')}
                  triangle="hide"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Charts Tab */}
      {activeTab === 1 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="chart-type-select-label">Default Chart Type</InputLabel>
                <Select
                  labelId="chart-type-select-label"
                  id="chart-type-select"
                  value={preferences.charts.defaultChartType}
                  label="Default Chart Type"
                  onChange={handleSelectChange('charts', 'defaultChartType')}
                >
                  {chartTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {type.icon}
                        <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="color-palette-select-label">Color Palette</InputLabel>
                <Select
                  labelId="color-palette-select-label"
                  id="color-palette-select"
                  value={preferences.charts.colorPalette}
                  label="Color Palette"
                  onChange={handleSelectChange('charts', 'colorPalette')}
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="monochrome">Monochrome</MenuItem>
                  <MenuItem value="pastel">Pastel</MenuItem>
                  <MenuItem value="vibrant">Vibrant</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.charts.showLegends}
                      onChange={handleSwitchChange('charts', 'showLegends')}
                    />
                  }
                  label="Show legends"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.charts.showGridLines}
                      onChange={handleSwitchChange('charts', 'showGridLines')}
                    />
                  }
                  label="Show grid lines"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.charts.showDataLabels}
                      onChange={handleSwitchChange('charts', 'showDataLabels')}
                    />
                  }
                  label="Show data labels"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Data Tab */}
      {activeTab === 2 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="date-range-select-label">Default Date Range</InputLabel>
                <Select
                  labelId="date-range-select-label"
                  id="date-range-select"
                  value={preferences.data.defaultDateRange}
                  label="Default Date Range"
                  onChange={handleSelectChange('data', 'defaultDateRange')}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="yesterday">Yesterday</MenuItem>
                  <MenuItem value="last7days">Last 7 Days</MenuItem>
                  <MenuItem value="last30days">Last 30 Days</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                </Select>
              </FormControl>

              <Typography gutterBottom>
                Auto-refresh Interval (minutes)
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={preferences.data.refreshInterval}
                  onChange={handleSliderChange('data', 'refreshInterval')}
                  step={5}
                  marks={[
                    { value: 0, label: 'Off' },
                    { value: 15, label: '15m' },
                    { value: 30, label: '30m' },
                    { value: 60, label: '1h' }
                  ]}
                  min={0}
                  max={60}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => value === 0 ? 'Off' : `${value}m`}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.data.showRawData}
                      onChange={handleSwitchChange('data', 'showRawData')}
                    />
                  }
                  label="Show raw data tables"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Notifications Tab */}
      {activeTab === 3 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.enableAlerts}
                      onChange={handleSwitchChange('notifications', 'enableAlerts')}
                    />
                  }
                  label="Enable alerts"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.emailNotifications}
                      onChange={handleSwitchChange('notifications', 'emailNotifications')}
                    />
                  }
                  label="Email notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications.desktopNotifications}
                      onChange={handleSwitchChange('notifications', 'desktopNotifications')}
                    />
                  }
                  label="Desktop notifications"
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>
                Alert Threshold (%)
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={preferences.notifications.alertThreshold}
                  onChange={handleSliderChange('notifications', 'alertThreshold')}
                  step={5}
                  marks={[
                    { value: 5, label: '5%' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' }
                  ]}
                  min={5}
                  max={50}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading ? <UpdateIcon /> : null}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </Box>
    </Paper>
  );
};

export default DashboardPreferences;
