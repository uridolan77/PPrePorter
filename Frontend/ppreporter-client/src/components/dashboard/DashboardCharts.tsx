import React, { memo, useMemo } from 'react';
import { Grid, Typography, Box, FormControl, InputLabel, Select, MenuItem, Skeleton, SelectChangeEvent } from '@mui/material';
import ErrorBoundary from '../common/ErrorBoundary';
import EmptyState from '../common/EmptyState';
import Card from '../common/Card';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CasinoRevenueChart from './CasinoRevenueChart';
import TopGamesChart from './TopGamesChart';
import { CommonProps } from '../../types/common';
import { DashboardChartData, TimePeriod } from '../../types/dashboard';

interface DashboardChartsProps extends CommonProps {
  data?: DashboardChartData | null;
  loading?: boolean;
  error?: Error | null;
  title?: string;
  timePeriod?: TimePeriod;
  onTimePeriodChange?: (period: TimePeriod) => void;
}

/**
 * DashboardCharts component
 * Displays charts and visualizations for dashboard data
 */
const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  data, 
  loading, 
  error, 
  title = 'Performance Metrics',
  timePeriod = 'week',
  onTimePeriodChange,
  sx
}) => {
  // If there's an error, return an error message
  if (error) {
    return (
      <EmptyState 
        message={`Error loading charts: ${error.message}`}
        icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
      />
    );
  }

  // Default data if none is provided
  const chartsData: DashboardChartData = data || {
    revenueByDay: [],
    playersByGame: []
  };

  // Memoize the revenue data to prevent unnecessary transformations
  const preparedRevenueData = useMemo(() => {
    return chartsData.revenueByDay.map(item => ({
      date: item.day,
      revenue: item.value
    }));
  }, [chartsData.revenueByDay]);

  // Handle time period change
  const handleTimePeriodChange = (event: SelectChangeEvent<string>) => {
    if (onTimePeriodChange) {
      onTimePeriodChange(event.target.value as TimePeriod);
    }
  };

  return (
    <ErrorBoundary fallback={<EmptyState message="Error displaying charts" />}>
      <Box sx={{ mb: 4, ...sx }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              title="Revenue Trends"
              action={
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
              {loading ? (
                <Box sx={{ p: 3 }}>
                  <Skeleton variant="rectangular" height={300} />
                </Box>
              ) : (
                <CasinoRevenueChart
                  data={preparedRevenueData}
                  isLoading={loading}
                />
              )}
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card title="Player Distribution by Game">
              {loading ? (
                <Box sx={{ p: 3 }}>
                  <Skeleton variant="rectangular" height={300} />
                </Box>
              ) : (
                <TopGamesChart
                  data={chartsData.playersByGame}
                  isLoading={loading}
                />
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(DashboardCharts);
