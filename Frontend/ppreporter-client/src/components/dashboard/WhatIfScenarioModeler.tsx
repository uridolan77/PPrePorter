import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Slider,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  useTheme,
  Paper,
  SelectChangeEvent
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  ReferenceArea,
  ReferenceLine,
  Label,
  Brush
} from 'recharts';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, addDays, eachDayOfInterval } from 'date-fns';
import { scaleLinear } from 'd3-scale';
import { interpolateRgb } from 'd3-interpolate';
import {
  WhatIfScenarioModelerProps,
  DataPoint,
  Parameters,
  ParameterImpacts,
  MetricColors,
  MetricLabels,
  ParameterLabels,
  Summary,
  SavedScenario
} from '../../types/whatIfScenarioModeler';

// Sample base data for what-if scenario modeling
const baseSampleData: DataPoint[] = [
  { date: '2025-04-01', revenue: 15240, bets: 45720, players: 3250, retention: 68, ftdConversion: 12.5 },
  { date: '2025-04-02', revenue: 14980, bets: 44650, players: 3180, retention: 67, ftdConversion: 12.2 },
  { date: '2025-04-03', revenue: 16120, bets: 47850, players: 3310, retention: 69, ftdConversion: 12.8 },
  { date: '2025-04-04', revenue: 17580, bets: 52740, players: 3590, retention: 71, ftdConversion: 13.1 },
  { date: '2025-04-05', revenue: 19340, bets: 58020, players: 3780, retention: 72, ftdConversion: 13.5 },
  { date: '2025-04-06', revenue: 18760, bets: 56280, players: 3710, retention: 71, ftdConversion: 13.3 },
  { date: '2025-04-07', revenue: 17890, bets: 53670, players: 3620, retention: 70, ftdConversion: 13.2 },
  { date: '2025-04-08', revenue: 16540, bets: 49620, players: 3450, retention: 69, ftdConversion: 12.9 },
  { date: '2025-04-09', revenue: 15980, bets: 47940, players: 3390, retention: 68, ftdConversion: 12.7 },
  { date: '2025-04-10', revenue: 16750, bets: 50250, players: 3490, retention: 69, ftdConversion: 13.0 },
  { date: '2025-04-11', revenue: 17680, bets: 53040, players: 3630, retention: 70, ftdConversion: 13.2 },
  { date: '2025-04-12', revenue: 19240, bets: 57720, players: 3760, retention: 72, ftdConversion: 13.4 },
  { date: '2025-04-13', revenue: 18560, bets: 55680, players: 3680, retention: 71, ftdConversion: 13.3 },
  { date: '2025-04-14', revenue: 17450, bets: 52350, players: 3570, retention: 70, ftdConversion: 13.1 }
];

/**
 * Custom tooltip props interface
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

/**
 * Interactive "What-If" scenario modeling component for visualizing
 * how parameter changes affect key performance metrics
 */
const WhatIfScenarioModeler: React.FC<WhatIfScenarioModelerProps> = ({
  data = baseSampleData,
  isLoading = false,
  onSaveScenario = () => {}
}) => {
  const theme = useTheme();
  const [targetMetric, setTargetMetric] = useState<string>('revenue');
  const [scenarioData, setScenarioData] = useState<DataPoint[]>([...data]);
  const [baselineData, setBaselineData] = useState<DataPoint[]>([...data]);
  const [parameters, setParameters] = useState<Parameters>({
    marketingBudget: 100, // 100% of baseline
    bonusAmount: 100, // 100% of baseline
    retentionEffort: 100, // 100% of baseline
    playerAcquisition: 100, // 100% of baseline
    gamePortfolio: 100 // 100% of baseline
  });
  const [parameterImpacts, setParameterImpacts] = useState<ParameterImpacts>({
    marketingBudget: { revenue: 0.7, bets: 0.6, players: 0.8, retention: 0.3, ftdConversion: 0.7 },
    bonusAmount: { revenue: 0.6, bets: 0.8, players: 0.5, retention: 0.6, ftdConversion: 0.6 },
    retentionEffort: { revenue: 0.5, bets: 0.4, players: 0.3, retention: 0.9, ftdConversion: 0.2 },
    playerAcquisition: { revenue: 0.6, bets: 0.5, players: 0.9, retention: 0.3, ftdConversion: 0.7 },
    gamePortfolio: { revenue: 0.8, bets: 0.7, players: 0.5, retention: 0.5, ftdConversion: 0.4 }
  });
  const [forecastDays, setForecastDays] = useState<number>(7);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  const [chartType, setChartType] = useState<string>('line');
  const [showBaseline, setShowBaseline] = useState<boolean>(true);
  const [chartMode, setChartMode] = useState<string>('compare'); // 'compare' or 'difference'

  // Color scales for different metrics
  const metricColors: MetricColors = {
    revenue: theme.palette.primary.main,
    bets: theme.palette.secondary.main,
    players: theme.palette.success.main,
    retention: theme.palette.warning.main,
    ftdConversion: theme.palette.info.main
  };

  // Formatted labels for metrics
  const metricLabels: MetricLabels = {
    revenue: 'Revenue (£)',
    bets: 'Number of Bets',
    players: 'Active Players',
    retention: 'Retention Rate (%)',
    ftdConversion: 'FTD Conversion (%)'
  };

  // Formatted labels for parameters
  const parameterLabels: ParameterLabels = {
    marketingBudget: 'Marketing Budget',
    bonusAmount: 'Bonus Amount',
    retentionEffort: 'Retention Efforts',
    playerAcquisition: 'Player Acquisition',
    gamePortfolio: 'Game Portfolio'
  };

  // Initialize with a default forecast
  useEffect(() => {
    if (data.length > 0) {
      setBaselineData([...data]);
      generateForecast();
    }
  }, [data]);

  // Handle auto-play animation
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isAutoPlaying) {
      intervalId = setInterval(() => {
        setAnimationStep(prev => {
          const nextStep = prev + 1;
          if (nextStep > 100) {
            setIsAutoPlaying(false);
            return 100;
          }
          return nextStep;
        });
      }, 200 / animationSpeed);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoPlaying, animationSpeed]);

  // Update forecast when animation step changes
  useEffect(() => {
    if (animationStep > 0) {
      const interpolatedParameters = Object.keys(parameters).reduce<Parameters>((acc, key) => {
        const paramKey = key as keyof Parameters;
        const baseValue = 100; // Starting at 100% of baseline
        const targetValue = parameters[paramKey];
        const currentValue = baseValue + (animationStep / 100) * (targetValue - baseValue);
        acc[paramKey] = currentValue;
        return acc;
      }, {} as Parameters);

      generateForecast(interpolatedParameters);
    }
  }, [animationStep]);

  // Calculate the impact of parameter changes on metrics
  const calculateParameterImpact = (param: keyof Parameters, paramValue: number, metric: keyof MetricLabels): number => {
    const deviation = (paramValue - 100) / 100; // How far from baseline (positive or negative)
    const impact = deviation * parameterImpacts[param][metric];
    return impact;
  };

  // Generate forecast data based on parameter changes
  const generateForecast = (customParams: Parameters = parameters): void => {
    // Start with the baseline data
    const lastDate = parseISO(data[data.length - 1].date);

    // Generate future dates for forecast
    const futureDates = eachDayOfInterval({
      start: addDays(lastDate, 1),
      end: addDays(lastDate, forecastDays)
    });

    // Calculate the average values from the last 7 days as baseline
    const lastWeekData = data.slice(-7);
    const baselineAverages = lastWeekData.reduce<Record<string, number>>(
      (acc, day) => {
        Object.keys(day).forEach(key => {
          if (key !== 'date') {
            acc[key] = (acc[key] || 0) + (day as any)[key];
          }
        });
        return acc;
      },
      {}
    );

    Object.keys(baselineAverages).forEach(key => {
      baselineAverages[key] = baselineAverages[key] / lastWeekData.length;
    });

    // Generate scenario data
    const newData: DataPoint[] = [...data];

    // Generate forecast data for each future date
    futureDates.forEach((date, index) => {
      // Calculate cumulative impact of all parameters on each metric
      const metricImpacts: Record<string, number> = {};

      (Object.keys(metricLabels) as Array<keyof MetricLabels>).forEach(metric => {
        let cumulativeImpact = 0;

        (Object.keys(customParams) as Array<keyof Parameters>).forEach(param => {
          cumulativeImpact += calculateParameterImpact(param, customParams[param], metric);
        });

        // Apply some randomness to make the forecast look more realistic
        const randomFactor = 0.95 + Math.random() * 0.1; // Random factor between 0.95 and 1.05

        // Calculate forecasted value with some trend based on the day index
        const trendFactor = 1 + (index * 0.005); // Small increasing trend over time

        metricImpacts[metric] = baselineAverages[metric] * (1 + cumulativeImpact) * randomFactor * trendFactor;
      });

      // Add the new forecasted day
      newData.push({
        date: format(date, 'yyyy-MM-dd'),
        revenue: Math.round(metricImpacts.revenue),
        bets: Math.round(metricImpacts.bets),
        players: Math.round(metricImpacts.players),
        retention: parseFloat(metricImpacts.retention.toFixed(1)),
        ftdConversion: parseFloat(metricImpacts.ftdConversion.toFixed(1)),
        isForecast: true
      });
    });

    setScenarioData(newData);
  };

  // Handle parameter change from sliders
  const handleParameterChange = (param: keyof Parameters, value: number): void => {
    const newParameters = { ...parameters, [param]: value };
    setParameters(newParameters);
    setAnimationStep(0); // Reset animation when parameters change
  };

  // Handle chart type change
  const handleChartTypeChange = (event: SelectChangeEvent): void => {
    setChartType(event.target.value);
  };

  // Handle target metric change
  const handleTargetMetricChange = (event: SelectChangeEvent): void => {
    setTargetMetric(event.target.value);
  };

  // Toggle auto-play animation
  const toggleAutoPlay = (): void => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
    } else {
      setAnimationStep(0); // Reset animation
      setIsAutoPlaying(true);
    }
  };

  // Reset parameters to baseline
  const resetParameters = (): void => {
    setParameters({
      marketingBudget: 100,
      bonusAmount: 100,
      retentionEffort: 100,
      playerAcquisition: 100,
      gamePortfolio: 100
    });
    setAnimationStep(0);
    setScenarioData([...baselineData]);
  };

  // Format dates for the chart
  const formatDate = (dateStr: string): string => {
    try {
      return format(parseISO(dateStr), 'MMM d');
    } catch (e) {
      return dateStr;
    }
  };

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Custom tooltip for the chart
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 1, boxShadow: 3, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" gutterBottom>
            {formatDate(label || '')} {payload[0]?.payload?.isForecast ? '(Forecast)' : ''}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
              <Box sx={{
                width: 12,
                height: 12,
                backgroundColor: entry.color,
                mr: 1,
                borderRadius: '50%'
              }} />
              <Typography variant="body2">
                {entry.name}: {
                  entry.name === 'Revenue'
                    ? formatCurrency(entry.value)
                    : entry.value.toLocaleString()
                }
              </Typography>
            </Box>
          ))}
        </Card>
      );
    }
    return null;
  };

  // Calculate summary metrics for the forecast
  const calculateSummary = (): Summary => {
    // Calculate metrics for baseline data
    const baselineEndIndex = data.length - 1;
    const baselineLast7Days = data.slice(-7);

    const baselineAverage = baselineLast7Days.reduce((sum, item) => {
      const value = item[targetMetric as keyof DataPoint];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0) / 7;

    // Calculate metrics for scenario data
    const scenarioForecastOnly = scenarioData.filter(item => item.isForecast);

    if (scenarioForecastOnly.length === 0) return { change: 0, average: 0 };

    const scenarioAverage = scenarioForecastOnly.reduce((sum, item) => {
      const value = item[targetMetric as keyof DataPoint];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0) / scenarioForecastOnly.length;

    // Calculate percentage change
    const change = ((scenarioAverage - baselineAverage) / baselineAverage) * 100;

    return {
      change: parseFloat(change.toFixed(1)),
      average: scenarioAverage
    };
  };

  const summary = calculateSummary();

  // Get color for the percentage change
  const getChangeColor = (change: number): string => {
    if (change > 0) return theme.palette.success.main;
    if (change < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  // Prepare chart data showing the difference between baseline and scenario
  const prepareChartData = (): DataPoint[] => {
    if (chartMode === 'compare') {
      // Return both baseline and scenario data for comparison
      return scenarioData.map((item, index) => {
        const baselineItem = index < baselineData.length ? baselineData[index] : null;

        return {
          ...item,
          baselineValue: baselineItem ? baselineItem[targetMetric as keyof DataPoint] as number : null
        };
      });
    } else {
      // Return the difference between scenario and baseline
      return scenarioData.map((item, index) => {
        const baselineItem = index < baselineData.length ? baselineData[index] : null;

        // For forecast data beyond baseline, just show the scenario value
        if (!baselineItem) {
          return {
            ...item,
            differenceValue: item[targetMetric as keyof DataPoint] as number
          };
        }

        return {
          ...item,
          differenceValue: (item[targetMetric as keyof DataPoint] as number) - (baselineItem[targetMetric as keyof DataPoint] as number)
        };
      });
    }
  };

  const chartData = prepareChartData();

  // Save the current scenario
  const handleSaveScenario = (): void => {
    const scenarioToSave: SavedScenario = {
      parameters: { ...parameters },
      forecastDays,
      targetMetric,
      data: scenarioData.filter(item => item.isForecast),
      summary,
      createdAt: new Date().toISOString(),
      name: `Scenario ${new Date().toLocaleString()}`
    };

    onSaveScenario(scenarioToSave);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 600 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader
        title="What-If Scenario Modeler"
        subheader="Forecast the impact of business decisions on key metrics"
        action={
          <Tooltip title="This tool allows you to model different business scenarios by adjusting parameters and seeing their projected impact on key metrics">
            <IconButton>
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={3}>
          {/* Parameter Controls */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Scenario Parameters
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Adjust parameters to model different business scenarios
                </Typography>

                {/* Parameter Sliders */}
                {Object.keys(parameters).map((param) => {
                  const paramKey = param as keyof Parameters;
                  return (
                    <Box key={param} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {parameterLabels[paramKey]}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {parameters[paramKey]}%
                        </Typography>
                      </Box>
                      <Slider
                        value={parameters[paramKey]}
                        onChange={(_, value) => handleParameterChange(paramKey, value as number)}
                        min={50}
                        max={150}
                        step={5}
                        marks={[
                          { value: 50, label: '50%' },
                          { value: 100, label: '100%' },
                          { value: 150, label: '150%' }
                        ]}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}%`}
                      />
                    </Box>
                  );
                })}

                {/* Forecast Days Control */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Forecast Days
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {forecastDays} days
                    </Typography>
                  </Box>
                  <Slider
                    value={forecastDays}
                    onChange={(_, value) => setForecastDays(value as number)}
                    min={1}
                    max={30}
                    step={1}
                    marks={[
                      { value: 1, label: '1d' },
                      { value: 7, label: '7d' },
                      { value: 30, label: '30d' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>

                {/* Animation Controls */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RestartAltIcon />}
                    onClick={resetParameters}
                  >
                    Reset
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={isAutoPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    onClick={toggleAutoPlay}
                    color="primary"
                  >
                    {isAutoPlaying ? 'Pause' : 'Animate'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Chart Area */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
                    <InputLabel id="target-metric-label">Target Metric</InputLabel>
                    <Select
                      labelId="target-metric-label"
                      value={targetMetric}
                      label="Target Metric"
                      onChange={handleTargetMetricChange}
                    >
                      {Object.keys(metricLabels).map(key => (
                        <MenuItem key={key} value={key}>
                          {metricLabels[key as keyof MetricLabels]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="chart-type-label">Chart Type</InputLabel>
                    <Select
                      labelId="chart-type-label"
                      value={chartType}
                      label="Chart Type"
                      onChange={handleChartTypeChange}
                    >
                      <MenuItem value="line">Line Chart</MenuItem>
                      <MenuItem value="area">Area Chart</MenuItem>
                      <MenuItem value="bar">Bar Chart</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<CompareArrowsIcon />}
                    onClick={() => setChartMode(chartMode === 'compare' ? 'difference' : 'compare')}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    {chartMode === 'compare' ? 'Show Difference' : 'Show Comparison'}
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleSaveScenario}
                    size="small"
                  >
                    Save Scenario
                  </Button>
                </Box>
              </Box>

              {/* Summary Stats */}
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 2,
                p: 2,
                bgcolor: theme.palette.background.default,
                borderRadius: 1
              }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Forecast Impact on {metricLabels[targetMetric as keyof MetricLabels]}
                  </Typography>
                  <Typography variant="h5" sx={{ color: getChangeColor(summary.change) }}>
                    {summary.change > 0 ? '+' : ''}{summary.change}%
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Forecast Average
                  </Typography>
                  <Typography variant="h5">
                    {targetMetric === 'revenue'
                      ? formatCurrency(summary.average)
                      : summary.average.toLocaleString()}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Forecast Period
                  </Typography>
                  <Typography variant="h5">
                    {forecastDays} days
                  </Typography>
                </Box>
              </Box>

              {/* Chart */}
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis
                        tickFormatter={(value) => targetMetric === 'revenue'
                          ? `£${(value / 1000).toFixed(0)}k`
                          : value.toLocaleString()
                        }
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />

                      {/* Baseline data */}
                      {showBaseline && chartMode === 'compare' && (
                        <Line
                          type="monotone"
                          dataKey="baselineValue"
                          name="Baseline"
                          stroke={theme.palette.grey[500]}
                          strokeDasharray="5 5"
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      )}

                      {/* Scenario data */}
                      <Line
                        type="monotone"
                        dataKey={targetMetric}
                        name={metricLabels[targetMetric as keyof MetricLabels]}
                        stroke={metricColors[targetMetric as keyof MetricColors]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                      />

                      {/* Difference data */}
                      {chartMode === 'difference' && (
                        <Line
                          type="monotone"
                          dataKey="differenceValue"
                          name="Difference"
                          stroke={theme.palette.secondary.main}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 6 }}
                        />
                      )}

                      {/* Reference area for forecast */}
                      <ReferenceArea
                        x1={data[data.length - 1]?.date}
                        x2={scenarioData[scenarioData.length - 1]?.date}
                        strokeOpacity={0.3}
                        fill={theme.palette.primary.light}
                        fillOpacity={0.1}
                      >
                        <Label
                          value="Forecast"
                          position="insideTopRight"
                          fill={theme.palette.text.secondary}
                        />
                      </ReferenceArea>
                    </LineChart>
                  ) : chartType === 'area' ? (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis
                        tickFormatter={(value) => targetMetric === 'revenue'
                          ? `£${(value / 1000).toFixed(0)}k`
                          : value.toLocaleString()
                        }
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />

                      {/* Baseline data */}
                      {showBaseline && chartMode === 'compare' && (
                        <Area
                          type="monotone"
                          dataKey="baselineValue"
                          name="Baseline"
                          stroke={theme.palette.grey[500]}
                          fill={theme.palette.grey[200]}
                          fillOpacity={0.3}
                          strokeDasharray="5 5"
                          activeDot={{ r: 6 }}
                        />
                      )}

                      {/* Scenario data */}
                      <Area
                        type="monotone"
                        dataKey={targetMetric}
                        name={metricLabels[targetMetric as keyof MetricLabels]}
                        stroke={metricColors[targetMetric as keyof MetricColors]}
                        fill={metricColors[targetMetric as keyof MetricColors]}
                        fillOpacity={0.3}
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />

                      {/* Reference area for forecast */}
                      <ReferenceArea
                        x1={data[data.length - 1]?.date}
                        x2={scenarioData[scenarioData.length - 1]?.date}
                        strokeOpacity={0.3}
                        fill={theme.palette.primary.light}
                        fillOpacity={0.1}
                      >
                        <Label
                          value="Forecast"
                          position="insideTopRight"
                          fill={theme.palette.text.secondary}
                        />
                      </ReferenceArea>
                    </AreaChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis
                        tickFormatter={(value) => targetMetric === 'revenue'
                          ? `£${(value / 1000).toFixed(0)}k`
                          : value.toLocaleString()
                        }
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />

                      {/* Baseline data */}
                      {showBaseline && chartMode === 'compare' && (
                        <Bar
                          dataKey="baselineValue"
                          name="Baseline"
                          fill={theme.palette.grey[400]}
                          fillOpacity={0.7}
                          stroke={theme.palette.grey[600]}
                          strokeWidth={1}
                        />
                      )}

                      {/* Scenario data */}
                      <Bar
                        dataKey={targetMetric}
                        name={metricLabels[targetMetric as keyof MetricLabels]}
                        fill={metricColors[targetMetric as keyof MetricColors]}
                        fillOpacity={0.8}
                        stroke={metricColors[targetMetric as keyof MetricColors]}
                        strokeWidth={1}
                      />

                      {/* Reference line for forecast start */}
                      <ReferenceLine
                        x={data[data.length - 1]?.date}
                        stroke={theme.palette.primary.main}
                        strokeDasharray="3 3"
                        label={{
                          value: 'Forecast Start',
                          position: 'top',
                          fill: theme.palette.text.secondary
                        }}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WhatIfScenarioModeler;