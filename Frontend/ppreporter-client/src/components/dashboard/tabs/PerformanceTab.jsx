import React, { useState } from 'react';
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
  MenuItem
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

// Utilities
import { formatCurrency, formatNumber, formatPercentage } from '../../../utils/formatters';

// Common components
import Card from '../../common/Card';
import KPICard from '../../common/KPICard';
import EmptyState from '../../common/EmptyState';

// Dashboard components
import CasinoRevenueChart from '../CasinoRevenueChart';
import TopGamesChart from '../TopGamesChart';
import TrendAnalysis from '../TrendAnalysis';

import {
  PieChart, Pie, Cell,
  Legend, ResponsiveContainer
} from 'recharts';

/**
 * Performance Tab component for the API Dashboard
 * Displays performance metrics, charts, and analysis
 */
const PerformanceTab = ({
  dashboardData,
  isLoading,
  theme = useTheme()
}) => {
  // State for chart type and time period
  const [chartType, setChartType] = useState('line');
  const [timePeriod, setTimePeriod] = useState('week');

  // Chart colors
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main
  ];

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

  // Revenue data for charts
  const revenueData = dashboardData?.charts?.revenueByDay || [
    { day: 'Mon', value: 2100 },
    { day: 'Tue', value: 2400 },
    { day: 'Wed', value: 1800 },
    { day: 'Thu', value: 2200 },
    { day: 'Fri', value: 2600 },
    { day: 'Sat', value: 3100 },
    { day: 'Sun', value: 2500 }
  ];

  // Player distribution data for charts
  const playerDistributionData = dashboardData?.charts?.playersByGame || [
    { game: 'Poker', value: 450 },
    { game: 'Slots', value: 380 },
    { game: 'Roulette', value: 240 },
    { game: 'Blackjack', value: 190 },
    { game: 'Baccarat', value: 165 }
  ];

  // KPI data
  const kpiData = dashboardData?.kpis || {
    averageSessionTime: 45,
    conversionRate: 3.2,
    churnRate: 5.7,
    revenuePerUser: 87.5
  };

  // Format currency for display
  const formatCurrency = (value) => {
    return value ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';
  };

  // Prepare revenue data for the chart
  const prepareRevenueData = () => {
    // Convert the revenueData to the format expected by CasinoRevenueChart
    return (dashboardData?.charts?.revenueByDay || []).map(item => ({
      date: item.day,
      revenue: item.value
    }));
  };

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
              <CasinoRevenueChart
                data={prepareRevenueData()}
                isLoading={isLoading}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card title="Player Distribution by Game">
              <TopGamesChart
                data={dashboardData?.charts?.playersByGame || []}
                isLoading={isLoading}
                valueKey="value"
                nameKey="game"
                showTotal={false}
                chartType="pie"
                emptyStateMessage="No player distribution data available"
              />
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
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Conversion Rate"
              value={`${kpiData.conversionRate}%`}
              icon={<TrendingUpIcon />}
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Churn Rate"
              value={`${kpiData.churnRate}%`}
              icon={<TrendingDownIcon />}
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Revenue Per User"
              value={formatCurrency(kpiData.revenuePerUser)}
              icon={<AttachMoneyIcon />}
              loading={isLoading}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PerformanceTab;
