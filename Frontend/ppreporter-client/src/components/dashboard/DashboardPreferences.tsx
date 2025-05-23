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
import SimpleBox from '../common/SimpleBox';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TimelineIcon from '@mui/icons-material/Timeline';
import UpdateIcon from '@mui/icons-material/Update';
import { TwitterPicker } from 'react-color';
import dashboardService from '../../services/api/dashboardService';
import { CommonProps } from '../../types/common';
import { DashboardPreferences as DashboardPreferencesType } from '../../types/dashboard';

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
  const [preferences, setPreferences] = useState<DashboardPreferencesType>({
    colorScheme: {
      baseTheme: 'light',
      colorMode: 'standard',
      primaryColor: theme.palette.primary.main,
      secondaryColor: theme.palette.secondary.main,
      positiveColor: theme.palette.success.main,
      negativeColor: theme.palette.error.main,
      neutralColor: theme.palette.info.main,
      contrastLevel: 1
    },
    informationDensity: 'medium',
    preferredChartTypes: {
      revenue: 'line',
      registrations: 'bar',
      topGames: 'pie',
      transactions: 'table'
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
    if (section === 'colorScheme') {
      setPreferences({
        ...preferences,
        colorScheme: {
          ...preferences.colorScheme,
          [name]: event.target.checked ? 'high-contrast' : 'standard'
        }
      });
    } else {
      // For other sections
      setPreferences({
        ...preferences,
        [section as keyof DashboardPreferencesType]: event.target.checked ? 'high' : 'medium'
      });
    }
  };

  const handleSelectChange = (section: string, name: string) => (event: SelectChangeEvent<string>): void => {
    if (section === 'colorScheme') {
      setPreferences({
        ...preferences,
        colorScheme: {
          ...preferences.colorScheme,
          [name]: event.target.value
        }
      });
    } else if (section === 'preferredChartTypes') {
      setPreferences({
        ...preferences,
        preferredChartTypes: {
          ...preferences.preferredChartTypes,
          [name]: event.target.value
        }
      });
    } else {
      // For informationDensity
      setPreferences({
        ...preferences,
        informationDensity: event.target.value as 'low' | 'medium' | 'high'
      });
    }
  };

  const handleSliderChange = (section: string, name: string) => (event: Event, newValue: number | number[]): void => {
    if (section === 'colorScheme') {
      setPreferences({
        ...preferences,
        colorScheme: {
          ...preferences.colorScheme,
          [name]: newValue
        }
      });
    }
  };

  const handleColorChange = (color: string, colorName: string): void => {
    setPreferences({
      ...preferences,
      colorScheme: {
        ...preferences.colorScheme,
        [colorName]: color
      }
    });
  };

  const handleSave = async (): Promise<void> => {
    if (onSave) {
      onSave(preferences);
    } else {
      try {
        await dashboardService.saveUserPreferences(preferences);
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
      </Tabs>

      {/* Appearance Tab */}
      {activeTab === 0 && (
        <SimpleBox>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="theme-select-label">Theme</InputLabel>
                <Select
                  labelId="theme-select-label"
                  id="theme-select"
                  value={preferences.colorScheme.baseTheme}
                  label="Theme"
                  onChange={handleSelectChange('colorScheme', 'baseTheme')}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System Default</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="density-select-label">Information Density</InputLabel>
                <Select
                  labelId="density-select-label"
                  id="density-select"
                  value={preferences.informationDensity}
                  label="Information Density"
                  onChange={handleSelectChange('informationDensity', '')}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.colorScheme.colorMode === 'high-contrast'}
                      onChange={handleSwitchChange('colorScheme', 'colorMode')}
                    />
                  }
                  label="High contrast mode"
                />
              </FormGroup>

              <Typography gutterBottom>
                Contrast Level
              </Typography>
              <SimpleBox sx={{ px: 2 }}>
                <Slider
                  value={preferences.colorScheme.contrastLevel}
                  onChange={handleSliderChange('colorScheme', 'contrastLevel')}
                  step={0.1}
                  marks={[
                    { value: 0.5, label: 'Low' },
                    { value: 1, label: 'Medium' },
                    { value: 1.5, label: 'High' }
                  ]}
                  min={0.5}
                  max={1.5}
                  valueLabelDisplay="auto"
                />
              </SimpleBox>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Color Scheme
              </Typography>
              <SimpleBox sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Primary Color
                </Typography>
                <TwitterPicker
                  color={preferences.colorScheme.primaryColor}
                  onChangeComplete={(color) => handleColorChange(color.hex, 'primaryColor')}
                  triangle="hide"
                />
              </SimpleBox>
              <SimpleBox>
                <Typography variant="body2" gutterBottom>
                  Secondary Color
                </Typography>
                <TwitterPicker
                  color={preferences.colorScheme.secondaryColor}
                  onChangeComplete={(color) => handleColorChange(color.hex, 'secondaryColor')}
                  triangle="hide"
                />
              </SimpleBox>
              <SimpleBox sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Positive Color
                </Typography>
                <TwitterPicker
                  color={preferences.colorScheme.positiveColor}
                  onChangeComplete={(color) => handleColorChange(color.hex, 'positiveColor')}
                  triangle="hide"
                />
              </SimpleBox>
            </Grid>
          </Grid>
        </SimpleBox>
      )}

      {/* Charts Tab */}
      {activeTab === 1 && (
        <SimpleBox>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="revenue-chart-type-select-label">Revenue Chart Type</InputLabel>
                <Select
                  labelId="revenue-chart-type-select-label"
                  id="revenue-chart-type-select"
                  value={preferences.preferredChartTypes.revenue}
                  label="Revenue Chart Type"
                  onChange={handleSelectChange('preferredChartTypes', 'revenue')}
                >
                  {chartTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <SimpleBox sx={{ display: 'flex', alignItems: 'center' }}>
                        {type.icon}
                        <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                      </SimpleBox>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="registrations-chart-type-select-label">Registrations Chart Type</InputLabel>
                <Select
                  labelId="registrations-chart-type-select-label"
                  id="registrations-chart-type-select"
                  value={preferences.preferredChartTypes.registrations}
                  label="Registrations Chart Type"
                  onChange={handleSelectChange('preferredChartTypes', 'registrations')}
                >
                  {chartTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <SimpleBox sx={{ display: 'flex', alignItems: 'center' }}>
                        {type.icon}
                        <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                      </SimpleBox>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="topGames-chart-type-select-label">Top Games Chart Type</InputLabel>
                <Select
                  labelId="topGames-chart-type-select-label"
                  id="topGames-chart-type-select"
                  value={preferences.preferredChartTypes.topGames}
                  label="Top Games Chart Type"
                  onChange={handleSelectChange('preferredChartTypes', 'topGames')}
                >
                  {chartTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <SimpleBox sx={{ display: 'flex', alignItems: 'center' }}>
                        {type.icon}
                        <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                      </SimpleBox>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="transactions-chart-type-select-label">Transactions Display Type</InputLabel>
                <Select
                  labelId="transactions-chart-type-select-label"
                  id="transactions-chart-type-select"
                  value={preferences.preferredChartTypes.transactions}
                  label="Transactions Display Type"
                  onChange={handleSelectChange('preferredChartTypes', 'transactions')}
                >
                  <MenuItem value="table">Table</MenuItem>
                  <MenuItem value="line">Line Chart</MenuItem>
                  <MenuItem value="bar">Bar Chart</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </SimpleBox>
      )}



      <SimpleBox sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
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
      </SimpleBox>
    </Paper>
  );
};

export default DashboardPreferences;
