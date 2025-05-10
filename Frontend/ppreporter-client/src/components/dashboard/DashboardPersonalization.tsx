import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  Slider,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TimelineIcon from '@mui/icons-material/Timeline';
import TableChartIcon from '@mui/icons-material/TableChart';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import RestoreIcon from '@mui/icons-material/Restore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonalVideoIcon from '@mui/icons-material/PersonalVideo';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FilterListIcon from '@mui/icons-material/FilterList';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import dashboardAnalyticsService from '../../services/dashboardAnalyticsService';
import {
  DashboardPersonalizationProps,
  DashboardPersonalizationSettings,
  DashboardComponent,
  DashboardMetric,
  DashboardRecommendation,
  SnackbarState
} from '../../types/personalization';

/**
 * DashboardPersonalization component allows users to customize their dashboard
 * Implements adaptive interface features for personalized data storytelling
 */
const DashboardPersonalization: React.FC<DashboardPersonalizationProps> = ({
  open,
  onClose,
  onSave,
  currentSettings = {},
  isLoading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [settings, setSettings] = useState<DashboardPersonalizationSettings>({
    role: 'analyst',
    experienceLevel: 2,
    components: [],
    visibleMetrics: [],
    preferredChartTypes: {},
    dataRefreshInterval: 15,
    defaultDateRange: '30',
    showInsightSummary: true,
    insightLevel: 'moderate',
    enableNotifications: true,
    enableAnomalyAlerts: true,
    colorScheme: 'default',
    dashboardLayout: 'standard',
    dataFilterPresets: []
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [loading, setLoading] = useState<boolean>(isLoading);
  const [availableComponents, setAvailableComponents] = useState<DashboardComponent[]>([]);
  const [availableMetrics, setAvailableMetrics] = useState<DashboardMetric[]>([]);
  const [recommendations, setRecommendations] = useState<DashboardRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState<boolean>(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      // Load user's current settings
      if (Object.keys(currentSettings).length > 0) {
        setSettings({
          ...settings,
          ...currentSettings
        });
      }

      loadAvailableOptions();
    }
  }, [open, currentSettings]);

  const loadAvailableOptions = async (): Promise<void> => {
    try {
      setLoading(true);

      // Simulate loading available components and metrics
      // This would be replaced with API calls in a real implementation
      setAvailableComponents([
        { id: 'summary', name: 'Summary Statistics', icon: 'dashboard', default: true },
        { id: 'revenue_chart', name: 'Revenue Chart', icon: 'chart', default: true },
        { id: 'registrations_chart', name: 'Player Registrations', icon: 'chart', default: true },
        { id: 'top_games', name: 'Top Games', icon: 'table', default: true },
        { id: 'recent_transactions', name: 'Recent Transactions', icon: 'table', default: true },
        { id: 'insights', name: 'Data Insights', icon: 'insights', default: false },
        { id: 'anomalies', name: 'Anomaly Alerts', icon: 'alert', default: false },
        { id: 'trends', name: 'Trend Analysis', icon: 'trend', default: false },
        { id: 'annotations', name: 'Data Annotations', icon: 'notes', default: false },
        { id: 'forecasts', name: 'Revenue Forecast', icon: 'forecast', default: false },
        { id: 'player_segments', name: 'Player Segments', icon: 'segments', default: false },
        { id: 'correlation_matrix', name: 'Correlation Matrix', icon: 'matrix', default: false }
      ]);

      setAvailableMetrics([
        { id: 'total_revenue', name: 'Total Revenue', category: 'revenue', default: true },
        { id: 'avg_revenue_per_player', name: 'Avg. Revenue Per Player', category: 'revenue', default: true },
        { id: 'total_registrations', name: 'Total Registrations', category: 'player', default: true },
        { id: 'conversion_rate', name: 'Conversion Rate', category: 'player', default: true },
        { id: 'active_players', name: 'Active Players', category: 'player', default: true },
        { id: 'new_players', name: 'New Players', category: 'player', default: true },
        { id: 'churn_rate', name: 'Churn Rate', category: 'player', default: false },
        { id: 'retention_rate', name: 'Retention Rate', category: 'player', default: false },
        { id: 'deposit_success_rate', name: 'Deposit Success Rate', category: 'transaction', default: true },
        { id: 'avg_deposit_amount', name: 'Avg. Deposit Amount', category: 'transaction', default: false },
        { id: 'withdrawal_rate', name: 'Withdrawal Rate', category: 'transaction', default: false },
        { id: 'game_participation', name: 'Game Participation', category: 'game', default: true },
        { id: 'game_revenue', name: 'Game Revenue', category: 'game', default: true },
        { id: 'bonus_usage', name: 'Bonus Usage', category: 'promotion', default: false },
        { id: 'promotion_effectiveness', name: 'Promotion Effectiveness', category: 'promotion', default: false }
      ]);

      // Update components based on current settings or defaults
      if (!settings.components || settings.components.length === 0) {
        // Set defaults if no components are selected
        setSettings(prev => ({
          ...prev,
          components: availableComponents.filter(c => c.default).map(c => c.id),
          visibleMetrics: availableMetrics.filter(m => m.default).map(m => m.id)
        }));
      }
    } catch (error) {
      console.error('Error loading personalization options:', error);
      showSnackbarMessage('Error loading personalization options', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async (): Promise<void> => {
    try {
      setRecommendationsLoading(true);
      setShowRecommendations(true);

      // In a real implementation, this would call the dashboardAnalyticsService
      // const recommendations = await dashboardAnalyticsService.getRecommendedComponents();

      // Simulate API call response
      setTimeout(() => {
        setRecommendations([
          {
            id: 'anomalies',
            reason: 'Based on your role as an analyst, anomaly detection would help you identify unusual patterns.',
            confidence: 0.85
          },
          {
            id: 'trends',
            reason: 'Users with your experience level often find trend analysis helpful for deeper insights.',
            confidence: 0.92
          },
          {
            id: 'forecasts',
            reason: 'Revenue forecasting complements your current view of revenue metrics.',
            confidence: 0.78
          }
        ]);
        setRecommendationsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      showSnackbarMessage('Error loading recommendations', 'error');
      setRecommendationsLoading(false);
    }
  };

  const handleComponentToggle = (componentId: string): void => {
    setSettings(prev => {
      const currentComponents = [...prev.components];
      const index = currentComponents.indexOf(componentId);

      if (index === -1) {
        currentComponents.push(componentId);
      } else {
        currentComponents.splice(index, 1);
      }

      return {
        ...prev,
        components: currentComponents
      };
    });
  };

  const handleMetricToggle = (metricId: string): void => {
    setSettings(prev => {
      const currentMetrics = [...prev.visibleMetrics];
      const index = currentMetrics.indexOf(metricId);

      if (index === -1) {
        currentMetrics.push(metricId);
      } else {
        currentMetrics.splice(index, 1);
      }

      return {
        ...prev,
        visibleMetrics: currentMetrics
      };
    });
  };

  const handleRoleChange = (event: SelectChangeEvent<string>): void => {
    const newRole = event.target.value as 'executive' | 'analyst' | 'operator';
    setSettings(prev => ({
      ...prev,
      role: newRole
    }));

    // In a real implementation, you might want to adjust recommended components based on role
    if (showRecommendations) {
      loadRecommendations();
    }
  };

  const handleExperienceLevelChange = (_event: Event, newValue: number | number[]): void => {
    setSettings(prev => ({
      ...prev,
      experienceLevel: newValue as number
    }));
  };

  const handlePreferredChartChange = (metricId: string, chartType: string): void => {
    setSettings(prev => ({
      ...prev,
      preferredChartTypes: {
        ...prev.preferredChartTypes,
        [metricId]: chartType
      }
    }));
  };

  const handleDateRangeChange = (event: SelectChangeEvent<string>): void => {
    setSettings(prev => ({
      ...prev,
      defaultDateRange: event.target.value
    }));
  };

  const handleRefreshIntervalChange = (event: SelectChangeEvent<number>): void => {
    setSettings(prev => ({
      ...prev,
      dataRefreshInterval: event.target.value as number
    }));
  };

  const handleInsightLevelChange = (event: SelectChangeEvent<string>): void => {
    setSettings(prev => ({
      ...prev,
      insightLevel: event.target.value as 'basic' | 'moderate' | 'advanced'
    }));
  };

  const handleLayoutChange = (event: SelectChangeEvent<string>): void => {
    setSettings(prev => ({
      ...prev,
      dashboardLayout: event.target.value
    }));
  };

  const handleColorSchemeChange = (event: SelectChangeEvent<string>): void => {
    setSettings(prev => ({
      ...prev,
      colorScheme: event.target.value
    }));
  };

  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = event.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const applyRecommendation = (recommendation: DashboardRecommendation): void => {
    if (recommendation && recommendation.id) {
      // Add the recommended component if not already included
      if (!settings.components.includes(recommendation.id)) {
        handleComponentToggle(recommendation.id);
        showSnackbarMessage(`Added ${getComponentName(recommendation.id)} to your dashboard`, 'success');
      }
    }
  };

  const resetToDefaults = (): void => {
    // Reset to default settings based on available components and metrics
    setSettings({
      role: 'analyst',
      experienceLevel: 2,
      components: availableComponents.filter(c => c.default).map(c => c.id),
      visibleMetrics: availableMetrics.filter(m => m.default).map(m => m.id),
      preferredChartTypes: {},
      dataRefreshInterval: 15,
      defaultDateRange: '30',
      showInsightSummary: true,
      insightLevel: 'moderate',
      enableNotifications: true,
      enableAnomalyAlerts: true,
      colorScheme: 'default',
      dashboardLayout: 'standard',
      dataFilterPresets: []
    });

    showSnackbarMessage('Reset dashboard settings to defaults', 'info');
  };

  const saveSettings = (): void => {
    try {
      onSave(settings);
      showSnackbarMessage('Dashboard preferences saved successfully', 'success');
    } catch (error) {
      console.error('Error saving dashboard preferences:', error);
      showSnackbarMessage('Error saving preferences', 'error');
    }
  };

  const showSnackbarMessage = (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'info'): void => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = (): void => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const getComponentName = (componentId: string): string => {
    const component = availableComponents.find(c => c.id === componentId);
    return component ? component.name : componentId;
  };

  const getComponentIcon = (componentId: string): React.ReactNode => {
    const component = availableComponents.find(c => c.id === componentId);
    if (!component) return <DashboardIcon />;

    switch (component.icon) {
      case 'dashboard':
        return <DashboardIcon />;
      case 'chart':
        return <AutoGraphIcon />;
      case 'table':
        return <TableChartIcon />;
      case 'insights':
        return <VisibilityIcon />;
      case 'alert':
        return <NotificationsIcon />;
      case 'trend':
        return <TimelineIcon />;
      case 'notes':
        return <FormatListNumberedIcon />;
      case 'forecast':
        return <TimelineIcon />;
      case 'segments':
        return <AccountCircleIcon />;
      case 'matrix':
        return <FilterListIcon />;
      default:
        return <DashboardIcon />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* User Profile Section */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <AccountCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  User Profile
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="role-label">Role</InputLabel>
                      <Select
                        labelId="role-label"
                        value={settings.role}
                        label="Role"
                        onChange={handleRoleChange}
                      >
                        <MenuItem value="executive">Executive</MenuItem>
                        <MenuItem value="analyst">Analyst</MenuItem>
                        <MenuItem value="operator">Operator</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ width: '100%' }}>
                      <Typography id="experience-level-slider" gutterBottom>
                        Experience Level
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Beginner
                        </Typography>
                        <Slider
                          value={settings.experienceLevel}
                          onChange={handleExperienceLevelChange}
                          step={1}
                          marks
                          min={1}
                          max={3}
                          sx={{ mx: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Expert
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Dashboard Components Section */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Dashboard Components
                </Typography>
                <List>
                  {availableComponents.map((component) => (
                    <ListItem key={component.id} dense>
                      <ListItemIcon>
                        {getComponentIcon(component.id)}
                      </ListItemIcon>
                      <ListItemText
                        primary={component.name}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.components.includes(component.id)}
                            onChange={() => handleComponentToggle(component.id)}
                            color="primary"
                          />
                        }
                        label=""
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Metrics Section */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  <AutoGraphIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Visible Metrics
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Revenue Metrics
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableMetrics
                      .filter(metric => metric.category === 'revenue')
                      .map(metric => (
                        <Chip
                          key={metric.id}
                          label={metric.name}
                          color={settings.visibleMetrics.includes(metric.id) ? 'primary' : 'default'}
                          onClick={() => handleMetricToggle(metric.id)}
                          icon={settings.visibleMetrics.includes(metric.id) ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          variant={settings.visibleMetrics.includes(metric.id) ? 'filled' : 'outlined'}
                        />
                      ))}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Player Metrics
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableMetrics
                      .filter(metric => metric.category === 'player')
                      .map(metric => (
                        <Chip
                          key={metric.id}
                          label={metric.name}
                          color={settings.visibleMetrics.includes(metric.id) ? 'primary' : 'default'}
                          onClick={() => handleMetricToggle(metric.id)}
                          icon={settings.visibleMetrics.includes(metric.id) ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          variant={settings.visibleMetrics.includes(metric.id) ? 'filled' : 'outlined'}
                        />
                      ))}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Transaction Metrics
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableMetrics
                      .filter(metric => metric.category === 'transaction')
                      .map(metric => (
                        <Chip
                          key={metric.id}
                          label={metric.name}
                          color={settings.visibleMetrics.includes(metric.id) ? 'primary' : 'default'}
                          onClick={() => handleMetricToggle(metric.id)}
                          icon={settings.visibleMetrics.includes(metric.id) ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          variant={settings.visibleMetrics.includes(metric.id) ? 'filled' : 'outlined'}
                        />
                      ))}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Game & Promotion Metrics
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {availableMetrics
                      .filter(metric => ['game', 'promotion'].includes(metric.category))
                      .map(metric => (
                        <Chip
                          key={metric.id}
                          label={metric.name}
                          color={settings.visibleMetrics.includes(metric.id) ? 'primary' : 'default'}
                          onClick={() => handleMetricToggle(metric.id)}
                          icon={settings.visibleMetrics.includes(metric.id) ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          variant={settings.visibleMetrics.includes(metric.id) ? 'filled' : 'outlined'}
                        />
                      ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Display Settings */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <PersonalVideoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Display Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="layout-label">Dashboard Layout</InputLabel>
                      <Select
                        labelId="layout-label"
                        value={settings.dashboardLayout}
                        label="Dashboard Layout"
                        onChange={handleLayoutChange}
                      >
                        <MenuItem value="standard">Standard</MenuItem>
                        <MenuItem value="compact">Compact</MenuItem>
                        <MenuItem value="expanded">Expanded</MenuItem>
                        <MenuItem value="grid">Grid</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="color-scheme-label">Color Scheme</InputLabel>
                      <Select
                        labelId="color-scheme-label"
                        value={settings.colorScheme}
                        label="Color Scheme"
                        onChange={handleColorSchemeChange}
                      >
                        <MenuItem value="default">Default</MenuItem>
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="high-contrast">High Contrast</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.showInsightSummary}
                            onChange={handleSwitchChange}
                            name="showInsightSummary"
                          />
                        }
                        label="Show Insight Summary"
                      />
                    </FormGroup>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Data Settings */}
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <BusinessCenterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Data Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="date-range-label">Default Date Range</InputLabel>
                      <Select
                        labelId="date-range-label"
                        value={settings.defaultDateRange}
                        label="Default Date Range"
                        onChange={handleDateRangeChange}
                      >
                        <MenuItem value="7">Last 7 Days</MenuItem>
                        <MenuItem value="14">Last 14 Days</MenuItem>
                        <MenuItem value="30">Last 30 Days</MenuItem>
                        <MenuItem value="90">Last 90 Days</MenuItem>
                        <MenuItem value="180">Last 180 Days</MenuItem>
                        <MenuItem value="365">Last 365 Days</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="refresh-interval-label">Refresh Interval</InputLabel>
                      <Select
                        labelId="refresh-interval-label"
                        value={settings.dataRefreshInterval}
                        label="Refresh Interval"
                        onChange={handleRefreshIntervalChange}
                      >
                        <MenuItem value={5}>5 Minutes</MenuItem>
                        <MenuItem value={15}>15 Minutes</MenuItem>
                        <MenuItem value={30}>30 Minutes</MenuItem>
                        <MenuItem value={60}>1 Hour</MenuItem>
                        <MenuItem value={360}>6 Hours</MenuItem>
                        <MenuItem value={720}>12 Hours</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="insight-level-label">Insight Level</InputLabel>
                      <Select
                        labelId="insight-level-label"
                        value={settings.insightLevel}
                        label="Insight Level"
                        onChange={handleInsightLevelChange}
                      >
                        <MenuItem value="basic">Basic</MenuItem>
                        <MenuItem value="moderate">Moderate</MenuItem>
                        <MenuItem value="advanced">Advanced</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Notifications */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Notifications
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableNotifications}
                        onChange={handleSwitchChange}
                        name="enableNotifications"
                      />
                    }
                    label="Enable Dashboard Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableAnomalyAlerts}
                        onChange={handleSwitchChange}
                        name="enableAnomalyAlerts"
                      />
                    }
                    label="Enable Anomaly Alerts"
                  />
                </FormGroup>
              </Paper>
            </Grid>

            {/* Recommendations */}
            {showRecommendations && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <AutoGraphIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Personalized Recommendations
                  </Typography>

                  {recommendationsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <List>
                      {recommendations.map((recommendation) => (
                        <ListItem key={recommendation.id}>
                          <ListItemIcon>
                            {getComponentIcon(recommendation.id)}
                          </ListItemIcon>
                          <ListItemText
                            primary={getComponentName(recommendation.id)}
                            secondary={recommendation.reason}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => applyRecommendation(recommendation)}
                            disabled={settings.components.includes(recommendation.id)}
                          >
                            {settings.components.includes(recommendation.id) ? 'Added' : 'Add'}
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Box>
          <Button
            startIcon={<RestoreIcon />}
            onClick={resetToDefaults}
            color="secondary"
          >
            Reset to Defaults
          </Button>

          {!showRecommendations && (
            <Button
              onClick={loadRecommendations}
              sx={{ ml: 1 }}
              disabled={recommendationsLoading}
            >
              {recommendationsLoading ? <CircularProgress size={24} /> : 'Get Recommendations'}
            </Button>
          )}
        </Box>

        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={saveSettings}
          >
            Save Preferences
          </Button>
        </Box>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default DashboardPersonalization;