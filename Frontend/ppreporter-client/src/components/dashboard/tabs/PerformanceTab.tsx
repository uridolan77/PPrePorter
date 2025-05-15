import React, { useState, useMemo, ChangeEvent, MouseEvent } from 'react';
import {
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
  Paper,
  SelectChangeEvent,
  Theme
} from '@mui/material';
import SimpleBox from '../../common/SimpleBox';
import { createSx } from '../../../utils/styleUtils';
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

// Types
import {
  PerformanceTabProps,
  RevenueDataPoint,
  PlayerDistributionDataPoint,
  KPIData
} from '../../../types/performanceTab';

/**
 * Performance Tab component for the API Dashboard
 * Displays performance metrics, charts, and analysis
 */
const PerformanceTab: React.FC<PerformanceTabProps> = ({
  dashboardData,
  isLoading = false,
  error = null,
  theme
}) => {
  // Use theme from props or get it from useTheme hook
  const defaultTheme = useTheme();
  const currentTheme: Theme = theme || defaultTheme;

  // State for chart type and time period
  const [chartType, setChartType] = useState<string>('line');
  const [timePeriod, setTimePeriod] = useState<string>('week');

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
  const handleChartTypeChange = (_event: MouseEvent<HTMLElement>, newChartType: string | null): void => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  // Handle time period change
  const handleTimePeriodChange = (event: SelectChangeEvent): void => {
    setTimePeriod(event.target.value);
  };

  // Memoize revenue data for charts
  const revenueData: RevenueDataPoint[] = useMemo(() => {
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
  const playerDistributionData: PlayerDistributionDataPoint[] = useMemo(() => {
    return dashboardData?.charts?.playersByGame || [
      { game: 'Poker', value: 450 },
      { game: 'Slots', value: 380 },
      { game: 'Roulette', value: 240 },
      { game: 'Blackjack', value: 190 },
      { game: 'Baccarat', value: 165 }
    ];
  }, [dashboardData?.charts?.playersByGame]);

  // Memoize KPI data
  const kpiData: KPIData = useMemo(() => {
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
      <SimpleBox sx={createSx({ p: 3, textAlign: 'center' })}>
        <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Performance Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message || "An unexpected error occurred. Please try again later."}
        </Typography>
      </SimpleBox>
    );
  }

  // Render player distribution chart
  const renderPlayerDistributionChart = (): React.ReactNode => {
    if (isLoading) {
      return (
        <SimpleBox sx={createSx({ display: 'flex', justifyContent: 'center', p: 3, height: 300 })}>
          <CircularProgress />
        </SimpleBox>
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
            label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {playerDistributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(value: any, name: string | undefined, props: any) => [value, props.payload.game] as [any, any]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <ErrorBoundary fallback={<EmptyState message="Something went wrong loading the performance data" icon={<ErrorOutlineIcon />} />}>
      <SimpleBox>
        {/* Performance Metrics Section */}
        <SimpleBox sx={createSx({ mb: 4 })}>
          <SimpleBox sx={createSx({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 })}>
            <Typography variant="h5">
              Performance Metrics
            </Typography>
            <SimpleBox>
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
            </SimpleBox>
          </SimpleBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card
                title="Revenue Trends"
                action={
                  <SimpleBox sx={createSx({ display: 'flex', alignItems: 'center' })}>
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
                  </SimpleBox>
                }
              >
                {isLoading && revenueData.length === 0 ? (
                  <SimpleBox sx={createSx({ p: 3 })}>
                    <Skeleton variant="rectangular" height={300} />
                  </SimpleBox>
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
                  <SimpleBox sx={createSx({ p: 3 })}>
                    <Skeleton variant="rectangular" height={300} />
                  </SimpleBox>
                ) : (
                  <TopGamesChart
                    data={playerDistributionData.map((item, index) => ({
                      id: `game-${index}`,
                      name: item.game,
                      revenue: item.value,
                      players: item.value,
                      sessions: 0,
                      category: 'Game'
                    }))}
                    isLoading={isLoading}
                    valueKey="revenue"
                    nameKey="name"
                    emptyStateMessage="No player distribution data available"
                  />
                )}
              </Card>
            </Grid>
          </Grid>
        </SimpleBox>

        {/* KPI Section */}
        <SimpleBox sx={createSx({ mb: 4 })}>
          <SimpleBox sx={createSx({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 })}>
            <Typography variant="h5">
              Key Performance Indicators
            </Typography>
          </SimpleBox>
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
        </SimpleBox>
      </SimpleBox>
    </ErrorBoundary>
  );
};

export default PerformanceTab;
