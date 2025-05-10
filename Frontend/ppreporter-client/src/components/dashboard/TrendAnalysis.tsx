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

      // Ensure data conforms to the expected TrendData type
      const typedData: TrendData = {
        ...data,
        IdentifiedPatterns: data.IdentifiedPatterns?.map(pattern => ({
          ...pattern,
          Confidence: pattern.Confidence || 0.5 // Default confidence if not provided
        }))
      };

      setTrendData(typedData);

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

            {/* Overall trend summary */}
            <Paper sx={{ p: 2, mb: 3, backgroundColor: 'background.paper' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={9}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getTrendIcon(trendData.TrendDirection)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Overall {metricName || metricKey} Trend: {trendData.TrendDirection}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {metricName || metricKey} is {trendData.TrendDirection.toLowerCase()} with a
                    {trendData.PercentageChange !== null && trendData.PercentageChange !== undefined
                      ? ` ${Math.abs(trendData.PercentageChange).toFixed(1)}% ${trendData.PercentageChange >= 0 ? 'increase' : 'decrease'}`
                      : ' stable pattern'} over the selected period.
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{
                      color: getTrendColor(trendData.TrendDirection),
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {trendData.PercentageChange !== null && trendData.PercentageChange !== undefined
                        ? `${trendData.PercentageChange >= 0 ? '+' : ''}${trendData.PercentageChange.toFixed(1)}%`
                        : '0%'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Change over period
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Data visualization */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {viewType === 'line' ? (
                    <LineChart
                      data={getChartData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="Date"
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value: number, name: string | undefined, props: any) => [
                          props.payload.isForecasted ?
                            `${value.toFixed(2)} (forecast)` :
                            value.toFixed(2),
                          metricName || metricKey
                        ] as [string, string]}
                        labelFormatter={(label: string) => formatDate(label)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Value"
                        name={metricName || metricKey}
                        stroke={getTrendColor(trendData.TrendDirection)}
                        activeDot={{ r: 8 }}
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;

                          // Skip null values
                          if (!cx || !cy) return null;

                          // Different styling for forecasted points
                          if (payload.isForecasted) {
                            return (
                              <svg x={cx - 5} y={cy - 5} width={10} height={10} fill={theme.palette.grey[400]}>
                                <rect x="0" y="0" width="10" height="10" />
                              </svg>
                            );
                          }

                          // Highlight outliers
                          if (showOutliers && isOutlier(payload.Date, trendData.OutlierPoints)) {
                            return (
                              <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="red">
                                <circle cx="10" cy="10" r="6" stroke="red" strokeWidth="2" fill="white" />
                              </svg>
                            );
                          }

                          // Highlight pattern points
                          if (showPatterns && trendData.IdentifiedPatterns) {
                            const pattern = isInPattern(payload.Date, trendData.IdentifiedPatterns);
                            if (pattern) {
                              const patternColor =
                                pattern.PatternType === 'Spike' ? theme.palette.success.main :
                                pattern.PatternType === 'Dip' ? theme.palette.error.main :
                                theme.palette.warning.main;

                              return (
                                <svg x={cx - 5} y={cy - 5} width={10} height={10} fill={patternColor}>
                                  <circle cx="5" cy="5" r="5" />
                                </svg>
                              );
                            }
                          }

                          // Default dot
                          return (
                            <svg x={cx - 3} y={cy - 3} width={6} height={6} fill={getTrendColor(trendData.TrendDirection)}>
                              <circle cx="3" cy="3" r="3" />
                            </svg>
                          );
                        }}
                      />
                      {showForecast && forecastData && forecastData.length > 0 && (
                        <Area
                          type="monotone"
                          dataKey="Value"
                          stroke="none"
                          fill="none"
                          activeDot={false}
                        />
                      )}
                      {showForecast && forecastData && forecastData.length > 0 && (
                        <ReferenceLine
                          x={forecastData[0].Date}
                          stroke={theme.palette.grey[400]}
                          strokeDasharray="3 3"
                          label={{ value: 'Forecast Start', position: 'insideTopRight', fill: theme.palette.text.secondary, fontSize: 12 }}
                        />
                      )}
                      {showSeasonality && trendData.SeasonalityDetected && trendData.Seasonality && (
                        <ReferenceLine
                          y={trendData.OutlierPoints.reduce((sum, point) => sum + point.Value, 0) / trendData.OutlierPoints.length}
                          stroke={theme.palette.info.main}
                          strokeDasharray="3 3"
                          label={{ value: 'Average', position: 'right', fill: theme.palette.info.main }}
                        />
                      )}
                    </LineChart>
                  ) : viewType === 'bar' ? (
                    <BarChart
                      data={getChartData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="Date"
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value: number, name: string | undefined, props: any) => [
                          props.payload.isForecasted ?
                            `${value.toFixed(2)} (forecast)` :
                            value.toFixed(2),
                          metricName || metricKey
                        ] as [string, string]}
                        labelFormatter={(label: string) => formatDate(label)}
                      />
                      <Legend />
                      <Bar
                        dataKey="Value"
                        name={metricName || metricKey}
                        fill={getTrendColor(trendData.TrendDirection)}
                        shape={(props: any) => {
                          const { x, y, width, height, payload } = props;

                          // Different styling for forecasted points
                          if (payload.isForecasted) {
                            return (
                              <rect
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                fill={theme.palette.grey[400]}
                                stroke={theme.palette.grey[600]}
                                strokeWidth={1}
                                strokeDasharray="3 3"
                              />
                            );
                          }

                          // Highlight outliers
                          if (showOutliers && isOutlier(payload.Date, trendData.OutlierPoints)) {
                            return (
                              <rect
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                fill={theme.palette.error.main}
                                stroke={theme.palette.error.dark}
                                strokeWidth={1}
                              />
                            );
                          }

                          // Highlight pattern points
                          if (showPatterns && trendData.IdentifiedPatterns) {
                            const pattern = isInPattern(payload.Date, trendData.IdentifiedPatterns);
                            if (pattern) {
                              const patternColor =
                                pattern.PatternType === 'Spike' ? theme.palette.success.main :
                                pattern.PatternType === 'Dip' ? theme.palette.error.main :
                                theme.palette.warning.main;

                              return (
                                <rect
                                  x={x}
                                  y={y}
                                  width={width}
                                  height={height}
                                  fill={patternColor}
                                  stroke={theme.palette.grey[800]}
                                  strokeWidth={1}
                                />
                              );
                            }
                          }

                          // Default bar
                          return (
                            <rect
                              x={x}
                              y={y}
                              width={width}
                              height={height}
                              fill={getTrendColor(trendData.TrendDirection)}
                            />
                          );
                        }}
                      />
                      {showForecast && forecastData && forecastData.length > 0 && (
                        <ReferenceLine
                          x={forecastData[0].Date}
                          stroke={theme.palette.grey[400]}
                          strokeDasharray="3 3"
                          label={{ value: 'Forecast Start', position: 'insideTopRight', fill: theme.palette.text.secondary, fontSize: 12 }}
                        />
                      )}
                    </BarChart>
                  ) : (
                    <AreaChart
                      data={getChartData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="Date"
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value: number, name: string | undefined, props: any) => [
                          props.payload.isForecasted ?
                            `${value.toFixed(2)} (forecast)` :
                            value.toFixed(2),
                          metricName || metricKey
                        ] as [string, string]}
                        labelFormatter={(label: string) => formatDate(label)}
                      />
                      <Legend />
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={getTrendColor(trendData.TrendDirection)} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={getTrendColor(trendData.TrendDirection)} stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.grey[400]} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={theme.palette.grey[400]} stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="Value"
                        name={metricName || metricKey}
                        stroke={getTrendColor(trendData.TrendDirection)}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        activeDot={(props: any) => {
                          const { cx, cy, payload } = props;

                          // Skip null values
                          if (!cx || !cy) return null;

                          // Different styling for forecasted points
                          if (payload.isForecasted) {
                            return (
                              <svg x={cx - 5} y={cy - 5} width={10} height={10} fill={theme.palette.grey[400]}>
                                <rect x="0" y="0" width="10" height="10" />
                              </svg>
                            );
                          }

                          // Highlight outliers
                          if (showOutliers && isOutlier(payload.Date, trendData.OutlierPoints)) {
                            return (
                              <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="red">
                                <circle cx="10" cy="10" r="6" stroke="red" strokeWidth="2" fill="white" />
                              </svg>
                            );
                          }

                          return (
                            <svg x={cx - 5} y={cy - 5} width={10} height={10} fill={getTrendColor(trendData.TrendDirection)}>
                              <circle cx="5" cy="5" r="5" />
                            </svg>
                          );
                        }}
                      />
                      {showForecast && forecastData && forecastData.length > 0 && (
                        <ReferenceLine
                          x={forecastData[0].Date}
                          stroke={theme.palette.grey[400]}
                          strokeDasharray="3 3"
                          label={{ value: 'Forecast Start', position: 'insideTopRight', fill: theme.palette.text.secondary, fontSize: 12 }}
                        />
                      )}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </Box>
            </Paper>

            {/* Patterns and Insights */}
            {trendData.IdentifiedPatterns && trendData.IdentifiedPatterns.length > 0 && showPatterns && (
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Identified Patterns
                </Typography>
                <Grid container spacing={2}>
                  {trendData.IdentifiedPatterns.map((pattern, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderLeft: '4px solid',
                          borderLeftColor:
                            pattern.PatternType === 'Spike' ? theme.palette.success.main :
                            pattern.PatternType === 'Dip' ? theme.palette.error.main :
                            theme.palette.warning.main
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          {pattern.PatternType} Pattern
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {formatDate(pattern.StartDate)} - {formatDate(pattern.EndDate)}
                        </Typography>
                        <Typography variant="body2">
                          {pattern.Description || `A ${pattern.PatternType.toLowerCase()} pattern was detected with ${(pattern.Confidence * 100).toFixed(0)}% confidence.`}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Seasonality Insights */}
            {trendData.SeasonalityDetected && trendData.Seasonality && showSeasonality && (
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Seasonality Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EventRepeatIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                      <Typography variant="subtitle1">
                        {trendData.Seasonality.Type} Seasonality Detected
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      This metric shows a {trendData.Seasonality.Type.toLowerCase()} pattern with a period of approximately {trendData.Seasonality.PeriodDays} days.
                    </Typography>
                    <Typography variant="body2">
                      Seasonality strength: <strong>{(trendData.Seasonality.Strength * 100).toFixed(0)}%</strong>
                      {trendData.Seasonality.Strength > 0.7 ? ' (Strong)' :
                       trendData.Seasonality.Strength > 0.4 ? ' (Moderate)' : ' (Weak)'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Alert severity="info" sx={{ height: '100%' }}>
                      <Typography variant="body2">
                        Understanding seasonality can help with forecasting and planning. Consider this pattern when setting targets and evaluating performance.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Box>
        ) : (
          <Typography sx={{ textAlign: 'center', py: 3 }}>
            Select a metric to analyze trends
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrendAnalysis;
