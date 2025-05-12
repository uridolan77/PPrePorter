import React, { memo, useMemo, useCallback } from 'react';
import { Grid, Paper, Typography, styled } from '@mui/material';
import { DashboardMetrics, RecentTransactionsTable } from '../../../../components/dashboard';
import { ChartPlaceholderContainer } from '../../components/common';
import { ErrorBoundary } from '../../components/common';
import { OverviewTabProps } from '../../types';
import { CARD_STYLE, HEADING_STYLE } from '../../constants';

// Styled component for section container
const SectionContainer = styled('section')({
  width: '100%',
});

/**
 * OverviewTab component
 * Displays key metrics, performance overview, and recent transactions
 */
const OverviewTab: React.FC<OverviewTabProps> = ({
  summaryStats,
  recentTransactions,
  isLoading,
  error
}) => {
  // Convert error to Error object if it's a string
  const errorObject = useMemo(() => {
    if (!error) return null;
    return typeof error === 'string' ? new Error(error) : error;
  }, [error]);

  // Handle error retry
  const handleRetry = useCallback(() => {
    // This would typically dispatch an action to reload the data
    console.log('Retrying data load...');
  }, []);

  return (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12}>
        <ErrorBoundary onReset={handleRetry}>
          <SectionContainer aria-labelledby="metrics-heading">
            <DashboardMetrics
              stats={summaryStats}
              loading={isLoading}
              error={errorObject}
              title="Key Analytics Metrics"
              onRetry={handleRetry}
            />
          </SectionContainer>
        </ErrorBoundary>
      </Grid>

      {/* Charts */}
      <Grid item xs={12}>
        <ErrorBoundary>
          <Paper style={CARD_STYLE}>
            <Typography
              variant="h6"
              style={HEADING_STYLE}
              id="performance-heading"
            >
              Performance Overview
            </Typography>
            <ChartPlaceholderContainer>
              <Typography variant="h6" style={HEADING_STYLE}>
                Charts Placeholder
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                This component requires additional visualization packages which are not currently installed.
                <br />
                Please install the required packages to view the charts.
              </Typography>
            </ChartPlaceholderContainer>
          </Paper>
        </ErrorBoundary>
      </Grid>

      {/* Recent Transactions */}
      <Grid item xs={12}>
        <ErrorBoundary onReset={handleRetry}>
          <Paper style={CARD_STYLE}>
            <Typography
              variant="h6"
              style={HEADING_STYLE}
              id="transactions-heading"
            >
              Recent Transactions
            </Typography>
            <RecentTransactionsTable
              data={recentTransactions}
              isLoading={isLoading}
            />
          </Paper>
        </ErrorBoundary>
      </Grid>
    </Grid>
  );
};

export default memo(OverviewTab);
