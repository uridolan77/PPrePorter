import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Common components
import EmptyState from '../../common/EmptyState';
import ErrorBoundary from '../../common/ErrorBoundary';

// Dashboard components
import DashboardMetrics from '../DashboardMetrics';
import DashboardCharts from '../DashboardCharts';
import RecentTransactionsSection from '../overview/RecentTransactionsSection';

/**
 * Enhanced Overview Tab component for the API Dashboard
 * Uses the new modular components for better organization and performance
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.dashboardData - Dashboard data
 * @param {boolean} props.isLoading - Loading state
 * @param {Object} props.error - Error object
 * @returns {React.ReactNode} - Rendered component
 */
const EnhancedOverviewTab = ({
  dashboardData,
  isLoading,
  error
}) => {
  // Handle error state
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Dashboard Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message || "An unexpected error occurred. Please try again later."}
        </Typography>
      </Box>
    );
  }

  // Prepare metrics data for DashboardMetrics component
  const metricsData = {
    revenue: dashboardData?.stats?.revenue || { value: 0, change: 0 },
    players: dashboardData?.stats?.players || { value: 0, change: 0 },
    games: { 
      value: dashboardData?.topGames?.length || 0, 
      change: 0 
    },
    engagement: { 
      value: dashboardData?.stats?.engagementRate || 0, 
      change: dashboardData?.stats?.engagementChange || 0 
    }
  };

  // Prepare charts data for DashboardCharts component
  const chartsData = {
    revenueByDay: dashboardData?.charts?.revenueByDay || [],
    playersByGame: dashboardData?.charts?.playersByGame || []
  };

  // State for time period filter
  const [timePeriod, setTimePeriod] = React.useState('week');

  // Handle time period change
  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
    // In a real app, you would fetch new data based on the time period
    console.log(`Time period changed to ${period}`);
  };

  return (
    <ErrorBoundary fallback={<EmptyState message="Something went wrong loading the dashboard" icon={<ErrorOutlineIcon />} />}>
      <Box>
        {/* Metrics Section */}
        <DashboardMetrics
          stats={metricsData}
          loading={isLoading}
          error={error}
          title="Key Performance Indicators"
        />

        {/* Charts Section */}
        <DashboardCharts
          data={chartsData}
          loading={isLoading}
          error={error}
          title="Performance Analytics"
          timePeriod={timePeriod}
          onTimePeriodChange={handleTimePeriodChange}
        />

        {/* Recent Transactions Section */}
        <RecentTransactionsSection
          data={dashboardData?.recentTransactions}
          isLoading={isLoading}
          onDownload={() => console.log('Download transactions report')}
          onSettings={() => console.log('Open transactions settings')}
        />
      </Box>
    </ErrorBoundary>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(EnhancedOverviewTab);
