import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  useTheme,
  useMediaQuery,
  SelectChangeEvent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TimelineIcon from '@mui/icons-material/Timeline';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CompareIcon from '@mui/icons-material/Compare';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import SettingsIcon from '@mui/icons-material/Settings';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import dashboardAnalyticsService from '../../services/dashboardAnalyticsService';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  Scatter, ScatterChart, ZAxis, ReferenceLine, Area, AreaChart, ComposedChart
} from 'recharts';
import { format, subDays } from 'date-fns';
import {
  TrendAnalysisProps,
  TrendData,
  OutlierPoint,
  Pattern,
  AnalysisOptions
} from '../../types/trendAnalysis';

/**
 * TrendAnalysis component for visualizing and analyzing metric trends over time
 * Provides pattern detection, anomaly highlighting, and forecasting
 */
const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  open,
  onClose,
  metricKey,
  metricName,
  metricType = 'revenue', // revenue, registration
  dashboardParams = {}
}) => {
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [forecastData, setForecastData] = useState<OutlierPoint[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<string>('line');
  const [timeRange, setTimeRange] = useState<string>('30');
  const [showForecast, setShowForecast] = useState<boolean>(false);
  const [showSeasonality, setShowSeasonality] = useState<boolean>(false);
  const [showPatterns, setShowPatterns] = useState<boolean>(true);
  const [showOutliers, setShowOutliers] = useState<boolean>(true);
  const [options, setOptions] = useState<AnalysisOptions>({
    detectOutliers: true,
    includeSeasonality: true,
    timeWindowDays: 30,
    significanceThreshold: 0.05
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open && metricKey) {
      loadTrendData();
    }
  }, [open, metricKey, metricType, timeRange]);

  // Load trend data based on metric type
  const loadTrendData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      let data;
      const params = {
        ...dashboardParams,
        timeRange: parseInt(timeRange)
      };

      // Fetch the appropriate trend data based on metricType
      if (metricType === 'revenue') {
        data = await dashboardAnalyticsService.getRevenueTrends(params, options);
      } else if (metricType === 'registration') {
        data = await dashboardAnalyticsService.getRegistrationTrends(params, options);
      } else {
        throw new Error('Unsupported metric type');
      }

      setTrendData(data);

      // Use forecast data from the API if available
      if (data && data.ForecastData) {
        setForecastData(data.ForecastData);
      }
    } catch (err) {
      console.error('Error loading trend data:', err);
      setError('Unable to load trend analysis for this metric.');
    } finally {
      setLoading(false);
    }
  };

  // Handle view type change
  const handleViewTypeChange = (_event: React.MouseEvent<HTMLElement>, newValue: string): void => {
    if (newValue !== null) {
      setViewType(newValue);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent): void => {
    setTimeRange(event.target.value);
  };

  // Toggle forecast display
  const handleToggleForecast = (): void => {
    setShowForecast(!showForecast);
  };

  // Toggle seasonality display
  const handleToggleSeasonality = (): void => {
    setShowSeasonality(!showSeasonality);
  };

  // Toggle patterns display
  const handleTogglePatterns = (): void => {
    setShowPatterns(!showPatterns);
  };

  // Toggle outliers display
  const handleToggleOutliers = (): void => {
    setShowOutliers(!showOutliers);
  };

  // Reset all options to defaults
  const handleResetOptions = (): void => {
    setViewType('line');
    setShowForecast(false);
    setShowSeasonality(false);
    setShowPatterns(true);
    setShowOutliers(true);
    loadTrendData();
  };

  // Format date for chart display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM d');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get color for trend direction
  const getTrendColor = (direction: string | undefined): string => {
    if (!direction) return theme.palette.grey[500];

    switch (direction.toLowerCase()) {
      case 'increasing':
      case 'positive':
        return theme.palette.success.main;
      case 'decreasing':
      case 'negative':
        return theme.palette.error.main;
      case 'stable':
      case 'neutral':
      default:
        return theme.palette.info.main;
    }
  };

  // Get icon for trend direction
  const getTrendIcon = (direction: string | undefined): React.ReactNode => {
    if (!direction) return <TrendingFlatIcon />;

    switch (direction.toLowerCase()) {
      case 'increasing':
      case 'positive':
        return <TrendingUpIcon />;
      case 'decreasing':
      case 'negative':
        return <TrendingDownIcon />;
      case 'stable':
      case 'neutral':
      default:
        return <TrendingFlatIcon />;
    }
  };

  // Check if a date falls within pattern range
  const isInPattern = (date: string, patterns: Pattern[] | undefined): Pattern | false => {
    if (!patterns || !patterns.length) return false;

    const dateObj = new Date(date);

    for (const pattern of patterns) {
      const startDate = new Date(pattern.StartDate);
      const endDate = new Date(pattern.EndDate);

      if (dateObj >= startDate && dateObj <= endDate) {
        return pattern;
      }
    }

    return false;
  };

  // Check if a point is an outlier
  const isOutlier = (date: string, outliers: OutlierPoint[] | undefined): boolean => {
    if (!outliers || !outliers.length) return false;

    return outliers.some(outlier =>
      new Date(outlier.Date).getTime() === new Date(date).getTime() && outlier.isOutlier
    );
  };

  // Prepares a combined data array for charts (including forecasts if needed)
  const getChartData = (): OutlierPoint[] => {
    if (!trendData || !trendData.OutlierPoints) return [];

    const mainData = [...trendData.OutlierPoints];

    // Add forecast data if enabled
    if (showForecast && forecastData) {
      return [...mainData, ...forecastData];
    }

    return mainData;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TimelineIcon sx={{ mr: 1 }} />
          Trend Analysis: {metricName || metricKey}
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
        ) : error ? (
          <Typography color="error" sx={{ textAlign: 'center', py: 3 }}>
            {error}
          </Typography>
        ) : trendData ? (
          <Box>
            {/* Controls */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="time-range-label">Time Range</InputLabel>
                    <Select
                      labelId="time-range-label"
                      value={timeRange}
                      label="Time Range"
                      onChange={handleTimeRangeChange}
                    >
                      <MenuItem value="7">Last 7 days</MenuItem>
                      <MenuItem value="14">Last 14 days</MenuItem>
                      <MenuItem value="30">Last 30 days</MenuItem>
                      <MenuItem value="90">Last 90 days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={8} md={9}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <ToggleButtonGroup
                      value={viewType}
                      exclusive
                      onChange={handleViewTypeChange}
                      size="small"
                      aria-label="chart type"
                    >
                      <ToggleButton value="line" aria-label="line chart">
                        <Tooltip title="Line Chart">
                          <ShowChartIcon />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="bar" aria-label="bar chart">
                        <Tooltip title="Bar Chart">
                          <CalendarViewWeekIcon />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton value="area" aria-label="area chart">
                        <Tooltip title="Area Chart">
                          <BubbleChartIcon />
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>

                    <Tooltip title={showForecast ? "Hide Forecast" : "Show Forecast"}>
                      <Chip
                        icon={<CompareIcon />}
                        label="Forecast"
                        color={showForecast ? "primary" : "default"}
                        variant={showForecast ? "filled" : "outlined"}
                        onClick={handleToggleForecast}
                        size="small"
                      />
                    </Tooltip>

                    {trendData.SeasonalityDetected && (
                      <Tooltip title={showSeasonality ? "Hide Seasonality" : "Show Seasonality"}>
                        <Chip
                          icon={<EventRepeatIcon />}
                          label="Seasonality"
                          color={showSeasonality ? "primary" : "default"}
                          variant={showSeasonality ? "filled" : "outlined"}
                          onClick={handleToggleSeasonality}
                          size="small"
                        />
                      </Tooltip>
                    )}

                    <Tooltip title={showPatterns ? "Hide Patterns" : "Show Patterns"}>
                      <Chip
                        icon={<TimelineIcon />}
                        label="Patterns"
                        color={showPatterns ? "primary" : "default"}
                        variant={showPatterns ? "filled" : "outlined"}
                        onClick={handleTogglePatterns}
                        size="small"
                      />
                    </Tooltip>

                    <Tooltip title={showOutliers ? "Hide Outliers" : "Show Outliers"}>
                      <Chip
                        icon={<BubbleChartIcon />}
                        label="Outliers"
                        color={showOutliers ? "primary" : "default"}
                        variant={showOutliers ? "filled" : "outlined"}
                        onClick={handleToggleOutliers}
                        size="small"
                      />
                    </Tooltip>

                    <Tooltip title="Reset">
                      <IconButton size="small" onClick={handleResetOptions}>
                        <RotateLeftIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
