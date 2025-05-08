import React, { useState, useEffect } from 'react';
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
  useTheme
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

// Sample base data for what-if scenario modeling
const baseSampleData = [
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
 * Interactive "What-If" scenario modeling component for visualizing
 * how parameter changes affect key performance metrics
 */
const WhatIfScenarioModeler = ({ 
  data = baseSampleData,
  isLoading = false,
  onSaveScenario = () => {}
}) => {
  const theme = useTheme();
  const [targetMetric, setTargetMetric] = useState('revenue');
  const [scenarioData, setScenarioData] = useState([...data]);
  const [baselineData, setBaselineData] = useState([...data]);
  const [parameters, setParameters] = useState({
    marketingBudget: 100, // 100% of baseline
    bonusAmount: 100, // 100% of baseline
    retentionEffort: 100, // 100% of baseline
    playerAcquisition: 100, // 100% of baseline
    gamePortfolio: 100 // 100% of baseline
  });
  const [parameterImpacts, setParameterImpacts] = useState({
    marketingBudget: { revenue: 0.7, bets: 0.6, players: 0.8, retention: 0.3, ftdConversion: 0.7 },
    bonusAmount: { revenue: 0.6, bets: 0.8, players: 0.5, retention: 0.6, ftdConversion: 0.6 },
    retentionEffort: { revenue: 0.5, bets: 0.4, players: 0.3, retention: 0.9, ftdConversion: 0.2 },
    playerAcquisition: { revenue: 0.6, bets: 0.5, players: 0.9, retention: 0.3, ftdConversion: 0.7 },
    gamePortfolio: { revenue: 0.8, bets: 0.7, players: 0.5, retention: 0.5, ftdConversion: 0.4 }
  });
  const [forecastDays, setForecastDays] = useState(7);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [chartType, setChartType] = useState('line');
  const [showBaseline, setShowBaseline] = useState(true);
  const [chartMode, setChartMode] = useState('compare'); // 'compare' or 'difference'
  
  // Color scales for different metrics
  const metricColors = {
    revenue: theme.palette.primary.main,
    bets: theme.palette.secondary.main,
    players: theme.palette.success.main,
    retention: theme.palette.warning.main,
    ftdConversion: theme.palette.info.main
  };
  
  // Formatted labels for metrics
  const metricLabels = {
    revenue: 'Revenue (£)',
    bets: 'Number of Bets',
    players: 'Active Players',
    retention: 'Retention Rate (%)',
    ftdConversion: 'FTD Conversion (%)'
  };
  
  // Formatted labels for parameters
  const parameterLabels = {
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
    let intervalId;
    
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
      const interpolatedParameters = Object.keys(parameters).reduce((acc, key) => {
        const baseValue = 100; // Starting at 100% of baseline
        const targetValue = parameters[key];
        const currentValue = baseValue + (animationStep / 100) * (targetValue - baseValue);
        acc[key] = currentValue;
        return acc;
      }, {});
      
      generateForecast(interpolatedParameters);
    }
  }, [animationStep]);

  // Calculate the impact of parameter changes on metrics
  const calculateParameterImpact = (param, paramValue, metric) => {
    const deviation = (paramValue - 100) / 100; // How far from baseline (positive or negative)
    const impact = deviation * parameterImpacts[param][metric];
    return impact;
  };
  
  // Generate forecast data based on parameter changes
  const generateForecast = (customParams = parameters) => {
    // Start with the baseline data
    const lastDate = parseISO(data[data.length - 1].date);
    
    // Generate future dates for forecast
    const futureDates = eachDayOfInterval({
      start: addDays(lastDate, 1),
      end: addDays(lastDate, forecastDays)
    });
    
    // Calculate the average values from the last 7 days as baseline
    const lastWeekData = data.slice(-7);
    const baselineAverages = lastWeekData.reduce(
      (acc, day) => {
        Object.keys(day).forEach(key => {
          if (key !== 'date') {
            acc[key] = (acc[key] || 0) + day[key];
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
    const newData = [...data];
    
    // Generate forecast data for each future date
    futureDates.forEach((date, index) => {
      // Calculate cumulative impact of all parameters on each metric
      const metricImpacts = {};
      
      Object.keys(metricLabels).forEach(metric => {
        let cumulativeImpact = 0;
        
        Object.keys(customParams).forEach(param => {
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
  const handleParameterChange = (param, value) => {
    const newParameters = { ...parameters, [param]: value };
    setParameters(newParameters);
    setAnimationStep(0); // Reset animation when parameters change
  };
  
  // Handle chart type change
  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };
  
  // Handle target metric change
  const handleTargetMetricChange = (event) => {
    setTargetMetric(event.target.value);
  };
  
  // Toggle auto-play animation
  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
    } else {
      setAnimationStep(0); // Reset animation
      setIsAutoPlaying(true);
    }
  };
  
  // Reset parameters to baseline
  const resetParameters = () => {
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
  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'MMM d');
    } catch (e) {
      return dateStr;
    }
  };
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 1, boxShadow: 3, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" gutterBottom>
            {formatDate(label)} {payload[0]?.payload?.isForecast ? '(Forecast)' : ''}
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
  const calculateSummary = () => {
    // Calculate metrics for baseline data
    const baselineEndIndex = data.length - 1;
    const baselineLast7Days = data.slice(-7);
    
    const baselineAverage = baselineLast7Days.reduce((sum, item) => sum + item[targetMetric], 0) / 7;
    
    // Calculate metrics for scenario data
    const scenarioForecastOnly = scenarioData.filter(item => item.isForecast);
    
    if (scenarioForecastOnly.length === 0) return { change: 0, average: 0 };
    
    const scenarioAverage = scenarioForecastOnly.reduce((sum, item) => sum + item[targetMetric], 0) / scenarioForecastOnly.length;
    
    // Calculate percentage change
    const change = ((scenarioAverage - baselineAverage) / baselineAverage) * 100;
    
    return {
      change: parseFloat(change.toFixed(1)),
      average: scenarioAverage
    };
  };
  
  const summary = calculateSummary();
  
  // Get color for the percentage change
  const getChangeColor = (change) => {
    if (change > 0) return theme.palette.success.main;
    if (change < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };
  
  // Prepare chart data showing the difference between baseline and scenario
  const prepareChartData = () => {
    if (chartMode === 'compare') {
      // Return both baseline and scenario data for comparison
      return scenarioData.map((item, index) => {
        const baselineItem = index < baselineData.length ? baselineData[index] : null;
        
        return {
          ...item,
          baselineValue: baselineItem ? baselineItem[targetMetric] : null
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
            differenceValue: item[targetMetric]
          };
        }
        
        return {
          ...item,
          differenceValue: item[targetMetric] - baselineItem[targetMetric]
        };
      });
    }
  };
  
  const chartData = prepareChartData();
  
  // Save the current scenario
  const handleSaveScenario = () => {
    const scenarioToSave = {
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

  // Render the appropriate chart type
  const renderChart = () => {
    const baseProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 20, bottom: 30 }
    };
    
    // Determine which value to plot based on chart mode
    const dataKey = chartMode === 'compare' ? targetMetric : 'differenceValue';
    const baselineKey = 'baselineValue';
    
    // Determine the domain for Y axis
    const allValues = chartData.map(item => item[dataKey]).filter(val => val !== null);
    if (chartMode === 'compare' && showBaseline) {
      allValues.push(...chartData.map(item => item[baselineKey]).filter(val => val !== null));
    }
    
    const minValue = Math.min(...allValues) * 0.9;
    const maxValue = Math.max(...allValues) * 1.1;
    
    // Marker for forecast start
    const forecastStartIndex = data.length - 1;
    const forecastStartDate = data[forecastStartIndex]?.date;
    
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...baseProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                domain={[minValue, maxValue]}
                tickFormatter={targetMetric === 'revenue' ? formatCurrency : undefined}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Forecast reference area */}
              <ReferenceArea 
                x1={forecastStartDate} 
                x2={chartData[chartData.length - 1]?.date} 
                label="Forecast" 
                fill={theme.palette.grey[200]} 
                fillOpacity={0.3} 
              />
              
              {/* Scenario line */}
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                name={metricLabels[targetMetric]} 
                stroke={metricColors[targetMetric]} 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5, strokeWidth: 1 }}
              />
              
              {/* Baseline line (if in compare mode and showBaseline is true) */}
              {chartMode === 'compare' && showBaseline && (
                <Line 
                  type="monotone" 
                  dataKey={baselineKey} 
                  name="Baseline" 
                  stroke={theme.palette.grey[600]} 
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...baseProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                domain={[minValue, maxValue]}
                tickFormatter={targetMetric === 'revenue' ? formatCurrency : undefined}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Reference area for forecast */}
              <ReferenceArea 
                x1={forecastStartDate} 
                x2={chartData[chartData.length - 1]?.date} 
                label="Forecast" 
                fill={theme.palette.grey[200]} 
                fillOpacity={0.3} 
              />
              
              {/* Baseline area (if in compare mode and showBaseline is true) */}
              {chartMode === 'compare' && showBaseline && (
                <Area 
                  type="monotone" 
                  dataKey={baselineKey} 
                  name="Baseline" 
                  fill={theme.palette.grey[300]} 
                  stroke={theme.palette.grey[600]}
                  fillOpacity={0.3}
                />
              )}
              
              {/* Scenario area */}
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                name={metricLabels[targetMetric]} 
                fill={metricColors[targetMetric]} 
                stroke={metricColors[targetMetric]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...baseProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                domain={[minValue, maxValue]}
                tickFormatter={targetMetric === 'revenue' ? formatCurrency : undefined}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Baseline bars (if in compare mode and showBaseline is true) */}
              {chartMode === 'compare' && showBaseline && (
                <Bar 
                  dataKey={baselineKey} 
                  name="Baseline" 
                  fill={theme.palette.grey[400]} 
                  fillOpacity={0.7}
                />
              )}
              
              {/* Scenario bars */}
              <Bar 
                dataKey={dataKey} 
                name={metricLabels[targetMetric]} 
                fill={metricColors[targetMetric]} 
                fillOpacity={0.8}
              />
              
              {/* Reference line for forecast start */}
              <ReferenceLine
                x={forecastStartDate}
                stroke={theme.palette.grey[600]}
                strokeDasharray="3 3"
                label={{ value: 'Forecast Start', position: 'top', fill: theme.palette.text.secondary }}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart {...baseProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate} 
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                domain={[minValue, maxValue]}
                tickFormatter={targetMetric === 'revenue' ? formatCurrency : undefined}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Reference area for forecast */}
              <ReferenceArea 
                x1={forecastStartDate} 
                x2={chartData[chartData.length - 1]?.date} 
                label="Forecast" 
                fill={theme.palette.grey[200]} 
                fillOpacity={0.3} 
              />
              
              {/* Baseline line (if in compare mode and showBaseline is true) */}
              {chartMode === 'compare' && showBaseline && (
                <Line 
                  type="monotone" 
                  dataKey={baselineKey} 
                  name="Baseline" 
                  stroke={theme.palette.grey[600]} 
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
              
              {/* Scenario line and bars */}
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                name={metricLabels[targetMetric]} 
                stroke={metricColors[targetMetric]} 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5, strokeWidth: 1 }}
              />
              <Bar 
                dataKey={dataKey} 
                name={`${metricLabels[targetMetric]} (Bar)`} 
                fill={metricColors[targetMetric]} 
                fillOpacity={0.3}
                barSize={8}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardHeader 
          title="What-If Scenario Modeler" 
          subheader="Adjust parameters to model how they might affect future performance"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RestartAltIcon />}
                onClick={resetParameters}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveScenario}
              >
                Save Scenario
              </Button>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Parameter Controls */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Scenario Parameters
                    <Tooltip title="Adjust these parameters to see how they might affect future performance. Values are percentage relative to baseline (100% = no change).">
                      <InfoOutlinedIcon fontSize="small" sx={{ ml: 1 }} />
                    </Tooltip>
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {Object.keys(parameters).map(param => (
                      <Grid item xs={12} key={param}>
                        <Typography variant="subtitle2" gutterBottom>
                          {parameterLabels[param]}: {parameters[param]}%
                        </Typography>
                        <Grid container spacing={1} alignItems="center">
                          <Grid item xs>
                            <Slider
                              value={parameters[param]}
                              onChange={(e, value) => handleParameterChange(param, value)}
                              min={50}
                              max={200}
                              step={5}
                              valueLabelDisplay="auto"
                              valueLabelFormat={(value) => `${value}%`}
                              sx={{
                                color: parameters[param] > 100 
                                  ? theme.palette.success.main 
                                  : parameters[param] < 100 
                                    ? theme.palette.error.main 
                                    : theme.palette.primary.main
                              }}
                            />
                          </Grid>
                          <Grid item>
                            <TextField
                              value={parameters[param]}
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                if (!isNaN(value) && value >= 50 && value <= 200) {
                                  handleParameterChange(param, value);
                                }
                              }}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              }}
                              size="small"
                              sx={{ width: 80 }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    ))}
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Forecast Days
                      </Typography>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs>
                          <Slider
                            value={forecastDays}
                            onChange={(e, value) => setForecastDays(value)}
                            min={7}
                            max={30}
                            step={1}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${value} days`}
                          />
                        </Grid>
                        <Grid item>
                          <TextField
                            value={forecastDays}
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10);
                              if (!isNaN(value) && value >= 7 && value <= 30) {
                                setForecastDays(value);
                              }
                            }}
                            size="small"
                            sx={{ width: 60 }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => generateForecast()}
                          sx={{ minWidth: 120 }}
                        >
                          Apply Changes
                        </Button>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            Animation:
                          </Typography>
                          <IconButton 
                            color="primary"
                            onClick={toggleAutoPlay}
                          >
                            {isAutoPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                          </IconButton>
                          <Slider
                            value={animationSpeed}
                            onChange={(e, value) => setAnimationSpeed(value)}
                            min={0.5}
                            max={2}
                            step={0.1}
                            sx={{ width: 80 }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              {/* Chart Area */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {metricLabels[targetMetric]} Forecast
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Metric</InputLabel>
                        <Select
                          value={targetMetric}
                          onChange={handleTargetMetricChange}
                          label="Metric"
                        >
                          {Object.keys(metricLabels).map(metric => (
                            <MenuItem key={metric} value={metric}>
                              {metricLabels[metric]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Chart Type</InputLabel>
                        <Select
                          value={chartType}
                          onChange={handleChartTypeChange}
                          label="Chart Type"
                        >
                          <MenuItem value="line">Line</MenuItem>
                          <MenuItem value="area">Area</MenuItem>
                          <MenuItem value="bar">Bar</MenuItem>
                          <MenuItem value="composed">Composed</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CompareArrowsIcon />}
                        onClick={() => setChartMode(prev => prev === 'compare' ? 'difference' : 'compare')}
                      >
                        {chartMode === 'compare' ? 'Show Difference' : 'Show Comparison'}
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Forecast Summary */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                          Forecast Summary:
                        </Typography>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="bold"
                          color={getChangeColor(summary.change)}
                        >
                          {summary.change > 0 ? '+' : ''}{summary.change}% 
                          {' '}{targetMetric === 'revenue' ? formatCurrency(summary.average) : summary.average.toLocaleString()}
                          {' '}average over {forecastDays} days
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                      <FormControl component="fieldset">
                        <Button
                          variant={showBaseline ? "contained" : "outlined"}
                          size="small"
                          color={showBaseline ? "primary" : "default"}
                          onClick={() => setShowBaseline(!showBaseline)}
                        >
                          {showBaseline ? "Hide Baseline" : "Show Baseline"}
                        </Button>
                      </FormControl>
                    </Grid>
                  </Grid>
                  
                  {/* Chart */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${targetMetric}-${chartType}-${chartMode}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderChart()}
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Animation Progress */}
                  {animationStep > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Animation Progress:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {animationStep}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 4,
                          backgroundColor: theme.palette.grey[200],
                          borderRadius: 2,
                          mt: 0.5,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${animationStep}%`,
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: 2,
                            transition: 'width 0.2s ease-in-out'
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default WhatIfScenarioModeler;