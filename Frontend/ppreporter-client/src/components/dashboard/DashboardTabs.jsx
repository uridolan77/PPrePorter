import React, { memo, useCallback, useMemo } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import TabPanel from '../common/TabPanel';
import ErrorBoundary from '../common/ErrorBoundary';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EmptyState from '../common/EmptyState';

// Tab components
import OverviewTab from './tabs/OverviewTab';
import EnhancedOverviewTab from './tabs/EnhancedOverviewTab';
import PerformanceTab from './tabs/PerformanceTab';
import PlayersTab from './tabs/PlayersTab';
import GamesTab from './tabs/GamesTab';

/**
 * Dashboard Tabs Component
 * Manages tab navigation and content rendering
 * Optimized with memoization to prevent unnecessary re-renders
 */
const DashboardTabs = ({
  activeTab,
  onTabChange,
  dashboardData,
  isLoading,
  error,
  theme
}) => {
  // Memoized tab change handler
  const handleTabChange = useCallback((event, newValue) => {
    if (onTabChange) {
      onTabChange(event, newValue);
    }
  }, [onTabChange]);

  // Memoized tab components to prevent unnecessary re-renders
  const tabComponents = useMemo(() => [
    {
      id: 0,
      label: "Dashboard Overview",
      component: (
        <EnhancedOverviewTab
          dashboardData={dashboardData}
          isLoading={isLoading}
          error={error}
          theme={theme}
        />
      )
    },
    {
      id: 1,
      label: "Performance Metrics",
      component: (
        <PerformanceTab
          dashboardData={dashboardData}
          isLoading={isLoading}
          error={error}
          theme={theme}
        />
      )
    },
    {
      id: 2,
      label: "Player Analytics",
      component: (
        <PlayersTab
          dashboardData={dashboardData}
          isLoading={isLoading}
          error={error}
          theme={theme}
        />
      )
    },
    {
      id: 3,
      label: "Game Analytics",
      component: (
        <GamesTab
          dashboardData={dashboardData}
          isLoading={isLoading}
          error={error}
          theme={theme}
        />
      )
    }
  ], [dashboardData, isLoading, error, theme]);

  // Memoized error fallback component
  const errorFallback = useCallback((message) => (
    <EmptyState
      message={message}
      icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
    />
  ), []);

  return (
    <>
      {/* Dashboard Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          role="tablist"
        >
          {tabComponents.map((tab) => (
            <Tab
              key={tab.id}
              label={tab.label.split(' ')[0]} // Just use the first word for the tab label
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabComponents.map((tab) => (
        <TabPanel key={tab.id} value={activeTab} index={tab.id} label={tab.label}>
          <ErrorBoundary
            fallback={errorFallback(`Something went wrong loading the ${tab.label.toLowerCase()}`)}
          >
            {tab.component}
          </ErrorBoundary>
        </TabPanel>
      ))}
    </>
  );
};

export default memo(DashboardTabs);
