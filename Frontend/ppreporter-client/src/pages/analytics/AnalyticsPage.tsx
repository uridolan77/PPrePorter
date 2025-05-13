import React, { memo, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Typography,
  Button,
  Tab,
  Tabs,
  CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import common components
import ErrorDisplay from '../../components/common/ErrorDisplay';
import LoadingOverlay from '../../components/common/LoadingOverlay';

// Import custom components for AnalyticsPage
import { HeaderFlexContainer } from './AnalyticsPageComponents';
import TabPanel from './TabPanel';
import ErrorBoundary from './components/ErrorBoundary';

// Import custom hooks
import { useDashboardData, useTabs } from './hooks';

// Import constants and styles
import { ANALYTICS_TABS } from './constants';
import { SECTION_STYLE, ERROR_CONTAINER_STYLE, TAB_CONTAINER_STYLE } from './styles';

// Lazy load tab components for better performance
const OverviewTab = lazy(() => import('./tabs/OverviewTab'));
const PerformanceTab = lazy(() => import('./tabs/PerformanceTab'));
const PlayerAnalysisTab = lazy(() => import('./tabs/PlayerAnalysisTab'));
const GameAnalysisTab = lazy(() => import('./tabs/GameAnalysisTab'));

/**
 * AnalyticsPage component
 * Provides a comprehensive analytics dashboard with multiple visualizations and insights
 */
const AnalyticsPage: React.FC = () => {
  // Use custom hooks for dashboard data and tab management
  const {
    summaryStats,
    recentTransactions,
    isLoading,
    error,
    formattedLastUpdated,
    refreshData
  } = useDashboardData();

  const {
    activeTab,
    handleTabChange
    // tabs variable is not used but is available from useTabs if needed
  } = useTabs({
    tabs: ANALYTICS_TABS,
    initialTab: 0
  });

  // Handle refresh button click
  const handleRefresh = () => {
    refreshData();
  };

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard | PPrePorter</title>
        <meta name="description" content="Analytics dashboard with comprehensive data visualizations and insights" />
      </Helmet>

      <Container maxWidth="xl">
        {/* Dashboard Header */}
        <header style={SECTION_STYLE}>
          <HeaderFlexContainer>
            <div>
              <Typography variant="h4" component="h1" style={{ marginBottom: '4px' }}>
                Analytics Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {formattedLastUpdated}
              </Typography>
            </div>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              aria-label="Refresh dashboard data"
            >
              Refresh Data
            </Button>
          </HeaderFlexContainer>
        </header>

        {/* Error Display */}
        {error && (
          <div style={ERROR_CONTAINER_STYLE}>
            <ErrorDisplay
              error={error}
              title="Failed to load dashboard data"
              onRetry={handleRefresh}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay />}

        {/* Dashboard Tabs */}
        <div style={TAB_CONTAINER_STYLE}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="analytics dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {ANALYTICS_TABS.map((tab) => (
              <Tab
                key={tab.id}
                label={tab.label}
                id={`tab-${tab.id}`}
                aria-controls={tab.ariaControls}
              />
            ))}
          </Tabs>
        </div>

        {/* Tab Content */}
        <main>
          <ErrorBoundary onReset={handleRefresh}>
            <Suspense fallback={
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                <CircularProgress size={40} />
              </div>
            }>
              <TabPanel value={activeTab} index={0} id={ANALYTICS_TABS[0].id} lazyLoad>
                <OverviewTab
                  summaryStats={summaryStats}
                  recentTransactions={recentTransactions}
                  isLoading={isLoading}
                  error={error}
                />
              </TabPanel>

              <TabPanel value={activeTab} index={1} id={ANALYTICS_TABS[1].id} lazyLoad>
                <PerformanceTab />
              </TabPanel>

              <TabPanel value={activeTab} index={2} id={ANALYTICS_TABS[2].id} lazyLoad>
                <PlayerAnalysisTab />
              </TabPanel>

              <TabPanel value={activeTab} index={3} id={ANALYTICS_TABS[3].id} lazyLoad>
                <GameAnalysisTab />
              </TabPanel>
            </Suspense>
          </ErrorBoundary>
        </main>
      </Container>
    </>
  );
};

export default memo(AnalyticsPage);
