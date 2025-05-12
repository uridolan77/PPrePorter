import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Tab,
  Tabs
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AppDispatch } from '../../store/store';
import {
  fetchDashboardSummary,
  fetchRevenueChart,
  fetchTopGames,
  fetchRecentTransactions
} from '../../store/slices/dashboardSlice';
import {
  selectSummaryStats,
  selectCasinoRevenue,
  selectTopGames,
  selectRecentTransactions,
  selectDashboardLoading,
  selectDashboardError
} from '../../store/selectors';

// Import dashboard components
import {
  DashboardMetrics,
  RecentTransactionsTable
} from '../../components/dashboard';

// Import common components
import ErrorDisplay from '../../components/common/ErrorDisplay';
import LoadingOverlay from '../../components/common/LoadingOverlay';

/**
 * AnalyticsPage component
 * Provides a comprehensive analytics dashboard with multiple visualizations and insights
 */
const AnalyticsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const summaryStats = useSelector(selectSummaryStats);
  const casinoRevenue = useSelector(selectCasinoRevenue);
  const topGames = useSelector(selectTopGames);
  const recentTransactions = useSelector(selectRecentTransactions);
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);

  // Local state
  const [activeTab, setActiveTab] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Function to load all dashboard data
  const loadDashboardData = useCallback(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchRevenueChart());
    dispatch(fetchTopGames());
    dispatch(fetchRecentTransactions());

    setLastUpdated(new Date());
  }, [dispatch]);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadDashboardData();
  };

  // Dashboard data for charts
  const dashboardData = {
    revenueByDay: casinoRevenue || [],
    playersByGame: topGames?.map(game => ({
      ...game,
      game: game.game || 'Unknown',
      value: game.value || 0
    })) || []
  };

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard | PPrePorter</title>
      </Helmet>

      <Container maxWidth="xl">
        {/* Dashboard Header */}
        <Box component="div" sx={{ mb: 3 }}>
          <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box component="div">
              <Typography variant="h4" component="h1" gutterBottom>
                Analytics Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh Data
            </Button>
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <ErrorDisplay
            error={error}
            title="Failed to load dashboard data"
            onRetry={handleRefresh}
            sx={{ mb: 3 }}
          />
        )}

        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay />}

        {/* Dashboard Tabs */}
        <Box component="div" sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="analytics dashboard tabs"
          >
            <Tab label="Overview" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Performance" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Player Analysis" id="tab-2" aria-controls="tabpanel-2" />
            <Tab label="Game Analysis" id="tab-3" aria-controls="tabpanel-3" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box component="div" role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Key Metrics */}
              <Grid item xs={12}>
                <DashboardMetrics
                  stats={summaryStats}
                  loading={isLoading}
                  error={error ? new Error(error.toString()) : null}
                  title="Key Analytics Metrics"
                />
              </Grid>

              {/* Charts */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Performance Overview</Typography>
                  <Box component="div" sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px dashed rgba(0, 0, 0, 0.12)', borderRadius: 1, p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Charts Placeholder
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      This component requires additional visualization packages which are not currently installed.
                      <br />
                      Please install the required packages to view the charts.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Recent Transactions */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
                  <RecentTransactionsTable
                    data={recentTransactions}
                    isLoading={isLoading}
                  />
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>

        <Box component="div" role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h5" gutterBottom>Performance Analytics</Typography>
                  <Typography variant="body1">
                    This section will contain detailed performance analytics including revenue analysis,
                    player registrations, and performance heatmaps.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>

        <Box component="div" role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2" aria-labelledby="tab-2">
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h5" gutterBottom>Player Analysis</Typography>
                  <Typography variant="body1">
                    This section will contain detailed player analytics including player journey analysis,
                    segment comparison, and player behavior insights.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>

        <Box component="div" role="tabpanel" hidden={activeTab !== 3} id="tabpanel-3" aria-labelledby="tab-3">
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h5" gutterBottom>Game Analysis</Typography>
                  <Typography variant="body1">
                    This section will contain detailed game analytics including top games analysis,
                    game performance explorer, and game-specific metrics.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Container>
    </>
  );
};

export default AnalyticsPage;
