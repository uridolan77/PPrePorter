import React, { memo, useMemo } from 'react';
import { Grid, Typography, FormControl, InputLabel, Select, MenuItem, Skeleton, SelectChangeEvent } from '@mui/material';
import SimpleBox from '../common/SimpleBox';
import { createSx } from '../../utils/styleUtils';
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

  // Memoize the games data to convert from GameDataPoint to GameData
  const preparedGamesData = useMemo(() => {
    return chartsData.playersByGame.map((item, index) => ({
      id: `game-${index}`,
      name: item.game,
      revenue: item.value,
      players: item.value,
      sessions: 0,
      category: 'Unknown'
    }));
  }, [chartsData.playersByGame]);

  // Handle time period change
  const handleTimePeriodChange = (event: SelectChangeEvent<string>) => {
    if (onTimePeriodChange) {
      onTimePeriodChange(event.target.value as TimePeriod);
    }
  };

  // If there's an error, return an error message
  if (error) {
    return (
      <EmptyState
        message={`Error loading charts: ${error.message}`}
        icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
      />
    );
  }

  return (
    <ErrorBoundary fallback={<EmptyState message="Error displaying charts" />}>
      <SimpleBox sx={createSx({ mb: 4, ...sx })}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {title}
        </Typography>
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
              {loading ? (
                <SimpleBox sx={createSx({ p: 3 })}>
                  <Skeleton variant="rectangular" height={300} />
                </SimpleBox>
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
                <SimpleBox sx={createSx({ p: 3 })}>
                  <Skeleton variant="rectangular" height={300} />
                </SimpleBox>
              ) : (
                <TopGamesChart
                  data={preparedGamesData}
                  isLoading={loading}
                />
              )}
            </Card>
          </Grid>
        </Grid>
      </SimpleBox>
    </ErrorBoundary>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(DashboardCharts);
