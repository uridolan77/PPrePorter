import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Common components
import EmptyState from '../../common/EmptyState';
import ErrorBoundary from '../../common/ErrorBoundary';

// Dashboard components
import StatsSummary from '../overview/StatsSummary';
import TopGamesSection from '../overview/TopGamesSection';
import RecentTransactionsSection from '../overview/RecentTransactionsSection';

// Types
import { OverviewTabProps } from '../../../types/overviewTab';

/**
 * Overview Tab component for the API Dashboard
 * Displays key metrics, top games, and recent transactions
 */
const OverviewTab: React.FC<OverviewTabProps> = ({
  dashboardData,
  isLoading = false,
  error = null
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

  return (
    <ErrorBoundary fallback={<EmptyState message="Something went wrong loading the dashboard" icon={<ErrorOutlineIcon />} />}>
      <Box>
        {/* Stats Summary Section */}
        <StatsSummary
          stats={dashboardData?.stats}
          isLoading={isLoading}
        />

        {/* Top Games Section */}
        <TopGamesSection
          data={dashboardData?.topGames}
          isLoading={isLoading}
          onDownload={() => console.log('Download top games report')}
          onSettings={() => console.log('Open top games settings')}
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

export default OverviewTab;
