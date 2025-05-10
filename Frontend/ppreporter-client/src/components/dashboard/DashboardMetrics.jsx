import React, { memo } from 'react';
import { Grid, Typography, Box } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import TimelineIcon from '@mui/icons-material/Timeline';
import KPICard from '../common/KPICard';
import { formatCurrency } from '../../utils/formatters';
import ErrorBoundary from '../common/ErrorBoundary';
import EmptyState from '../common/EmptyState';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * DashboardMetrics component
 * Displays key performance indicators in a grid of cards
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics data
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.error - Error object
 * @param {string} props.title - Section title
 * @returns {React.ReactNode} - Rendered component
 */
const DashboardMetrics = ({ stats, loading, error, title = 'Key Metrics' }) => {
  // If there's an error, return an error message
  if (error) {
    return (
      <EmptyState 
        message={`Error loading metrics: ${error.message}`}
        icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
      />
    );
  }

  // Default stats if none are provided
  const metricsData = stats || {
    revenue: { value: 0, change: 0 },
    players: { value: 0, change: 0 },
    games: { value: 0, change: 0 },
    engagement: { value: 0, change: 0 }
  };

  return (
    <ErrorBoundary fallback={<EmptyState message="Error displaying metrics" />}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Revenue"
              value={formatCurrency(metricsData.revenue.value)}
              change={metricsData.revenue.change}
              icon={<AttachMoneyIcon />}
              loading={loading}
              description="Total revenue across all games"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Active Players"
              value={metricsData.players.value.toLocaleString()}
              change={metricsData.players.change}
              icon={<PeopleIcon />}
              loading={loading}
              description="Number of active players"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Popular Games"
              value={metricsData.games.value}
              change={metricsData.games.change}
              icon={<VideogameAssetIcon />}
              loading={loading}
              description="Number of games with active players"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Engagement Rate"
              value={`${metricsData.engagement.value}%`}
              change={metricsData.engagement.change}
              icon={<TimelineIcon />}
              loading={loading}
              description="Average player engagement rate"
            />
          </Grid>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(DashboardMetrics);
