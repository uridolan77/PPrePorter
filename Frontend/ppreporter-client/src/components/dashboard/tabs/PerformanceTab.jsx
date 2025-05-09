import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Paper
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Utilities
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '../../../utils/formatters';

// Common components
import Card from '../../common/Card';
import KPICard from '../../common/KPICard';
import EmptyState from '../../common/EmptyState';
import LoadingOverlay from '../../common/LoadingOverlay';
import ErrorBoundary from '../../common/ErrorBoundary';

// Dashboard components
import CasinoRevenueChart from '../CasinoRevenueChart';
import TopGamesChart from '../TopGamesChart';
import TrendAnalysis from '../TrendAnalysis';

import {
  PieChart, Pie, Cell,
  Legend, ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';

/**
 * Performance Tab component for the API Dashboard
 * Displays performance metrics, charts, and analysis
 */
const PerformanceTab = ({
  dashboardData,
  isLoading,
  error,
  theme
}) => {
  // Use theme from props or get it from useTheme hook
  const defaultTheme = useTheme();
  const currentTheme = theme || defaultTheme;
  // State for chart type and time period
  const [chartType, setChartType] = useState('line');
  const [timePeriod, setTimePeriod] = useState('week');

  // Chart colors - memoized to prevent recreation on each render
  const COLORS = useMemo(() => [
    currentTheme.palette.primary.main,
    currentTheme.palette.secondary.main,
    currentTheme.palette.success.main,
    currentTheme.palette.error.main,
    currentTheme.palette.warning.main,
    currentTheme.palette.info.main
  ], [currentTheme.palette]);

  // Handle chart type change
  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  // Handle time period change
  const handleTimePeriodChange = (event) => {
    setTimePeriod(event.target.value);
  };

  // Memoize revenue data for charts
  const revenueData = useMemo(() => {
    return dashboardData?.charts?.revenueByDay || [
      { day: 'Mon', value: 2100 },
      { day: 'Tue', value: 2400 },
      { day: 'Wed', value: 1800 },
      { day: 'Thu', value: 2200 },
      { day: 'Fri', value: 2600 },
      { day: 'Sat', value: 3100 },
      { day: 'Sun', value: 2500 }
    ];
  }, [dashboardData?.charts?.revenueByDay]);

  // Memoize player distribution data for charts
  const playerDistributionData = useMemo(() => {
    return dashboardData?.charts?.playersByGame || [
      { game: 'Poker', value: 450 },
      { game: 'Slots', value: 380 },
      { game: 'Roulette', value: 240 },
      { game: 'Blackjack', value: 190 },
      { game: 'Baccarat', value: 165 }
    ];
  }, [dashboardData?.charts?.playersByGame]);

  // Memoize KPI data
  const kpiData = useMemo(() => {
    return dashboardData?.kpis || {
      averageSessionTime: 45,
      conversionRate: 3.2,
      churnRate: 5.7,
      revenuePerUser: 87.5
    };
  }, [dashboardData?.kpis]);

  // Prepare revenue data for the chart - memoized to prevent recalculation
  const preparedRevenueData = useMemo(() => {
    // Convert the revenueData to the format expected by CasinoRevenueChart
    return revenueData.map(item => ({
      date: item.day,
      revenue: item.value
    }));
  }, [revenueData]);

  // Handle error state
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Performance Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message || "An unexpected error occurred. Please try again later."}
        </Typography>
      </Box>
    );
  }

  // Render player distribution chart
  const renderPlayerDistributionChart = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, height: 300 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={playerDistributionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="game"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {playerDistributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(value, name, props) => [value, props.payload.game]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <ErrorBoundary fallback={<EmptyState message="Something went wrong loading the performance data" icon={<ErrorOutlineIcon />} />}>
      <Box>
        {/* Performance Metrics Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              Performance Metrics
            </Typography>
            <Box>
              <Tooltip title="Download report">
                <IconButton size="small" sx={{ mr: 1 }}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton size="small">
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card
                title="Revenue Trends"
                actions={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel id="time-period-label">Period</InputLabel>
                      <Select
                        labelId="time-period-label"
                        id="time-period-select"
                        value={timePeriod}
                        label="Period"
                        onChange={handleTimePeriodChange}
                      >
                        <MenuItem value="day">Day</MenuItem>
                        <MenuItem value="week">Week</MenuItem>
                        <MenuItem value="month">Month</MenuItem>
                        <MenuItem value="quarter">Quarter</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                }
              >
                {isLoading && revenueData.length === 0 ? (
                  <Box sx={{ p: 3 }}>
                    <Skeleton variant="rectangular" height={300} />
                  </Box>
                ) : (
                  <CasinoRevenueChart
                    data={preparedRevenueData}
                    isLoading={isLoading}
                  />
                )}
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card title="Player Distribution by Game">
                {isLoading && playerDistributionData.length === 0 ? (
                  <Box sx={{ p: 3 }}>
                    <Skeleton variant="rectangular" height={300} />
                  </Box>
                ) : (
                  <TopGamesChart
                    data={playerDistributionData}
                    isLoading={isLoading}
                    valueKey="value"
                    nameKey="game"
                    showTotal={false}
                    chartType="pie"
                    emptyStateMessage="No player distribution data available"
                  />
                )}
              </Card>
            </Grid>
          </Grid>
        </Box>

      {/* KPI Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Key Performance Indicators
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Avg. Session Time"
              value={`${kpiData.averageSessionTime} min`}
              icon={<TimelineIcon />}
              loading={isLoading}
              description="Average time users spend in a single session"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Conversion Rate"
              value={`${kpiData.conversionRate}%`}
              icon={<TrendingUpIcon />}
              loading={isLoading}
              description="Percentage of visitors who register"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Churn Rate"
              value={`${kpiData.churnRate}%`}
              icon={<TrendingDownIcon />}
              loading={isLoading}
              description="Percentage of users who stop using the platform"
              isInverse={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Revenue Per User"
              value={formatCurrency(kpiData.revenuePerUser)}
              icon={<AttachMoneyIcon />}
              loading={isLoading}
              description="Average revenue generated per active user"
            />
          </Grid>
        </Grid>
      </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default PerformanceTab;
