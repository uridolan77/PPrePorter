import React from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import TabPanel from '../common/TabPanel';
import ErrorBoundary from '../common/ErrorBoundary';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EmptyState from '../common/EmptyState';

// Tab components
import OverviewTab from './tabs/OverviewTab';
import PerformanceTab from './tabs/PerformanceTab';
import PlayersTab from './tabs/PlayersTab';
import GamesTab from './tabs/GamesTab';

/**
 * Dashboard Tabs Component
 * Manages tab navigation and content rendering
 */
const DashboardTabs = ({
  activeTab,
  onTabChange,
  dashboardData,
  isLoading,
  error,
  theme
}) => {
  return (
    <>
      {/* Dashboard Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={onTabChange}
          aria-label="dashboard tabs"
          role="tablist"
        >
          <Tab
            label="Overview"
            id="tab-0"
            aria-controls="tabpanel-0"
            tabIndex={activeTab === 0 ? 0 : -1}
          />
          <Tab
            label="Performance"
            id="tab-1"
            aria-controls="tabpanel-1"
            tabIndex={activeTab === 1 ? 0 : -1}
          />
          <Tab
            label="Players"
            id="tab-2"
            aria-controls="tabpanel-2"
            tabIndex={activeTab === 2 ? 0 : -1}
          />
          <Tab
            label="Games"
            id="tab-3"
            aria-controls="tabpanel-3"
            tabIndex={activeTab === 3 ? 0 : -1}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0} label="Dashboard Overview">
        <ErrorBoundary
          fallback={
            <EmptyState
              message="Something went wrong loading the overview tab"
              icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
            />
          }
        >
          <OverviewTab
            dashboardData={dashboardData}
            isLoading={isLoading}
            error={error}
            theme={theme}
          />
        </ErrorBoundary>
      </TabPanel>

      <TabPanel value={activeTab} index={1} label="Performance Metrics">
        <ErrorBoundary
          fallback={
            <EmptyState
              message="Something went wrong loading the performance tab"
              icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
            />
          }
        >
          <PerformanceTab
            dashboardData={dashboardData}
            isLoading={isLoading}
            error={error}
            theme={theme}
          />
        </ErrorBoundary>
      </TabPanel>

      <TabPanel value={activeTab} index={2} label="Player Analytics">
        <ErrorBoundary
          fallback={
            <EmptyState
              message="Something went wrong loading the players tab"
              icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
            />
          }
        >
          <PlayersTab
            dashboardData={dashboardData}
            isLoading={isLoading}
            error={error}
            theme={theme}
          />
        </ErrorBoundary>
      </TabPanel>

      <TabPanel value={activeTab} index={3} label="Game Analytics">
        <ErrorBoundary
          fallback={
            <EmptyState
              message="Something went wrong loading the games tab"
              icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
            />
          }
        >
          <GamesTab
            dashboardData={dashboardData}
            isLoading={isLoading}
            error={error}
            theme={theme}
          />
        </ErrorBoundary>
      </TabPanel>
    </>
  );
};

export default DashboardTabs;
