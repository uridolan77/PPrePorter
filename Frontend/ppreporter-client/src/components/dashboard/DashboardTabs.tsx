import React, { memo, useCallback, useMemo } from 'react';
import { Box, Tabs, Tab, Theme } from '@mui/material';
import TabPanel from '../common/TabPanel';
import ErrorBoundary from '../common/ErrorBoundary';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EmptyState from '../common/EmptyState';
import { CommonProps } from '../../types/common';
import { DashboardStats } from '../../types/dashboard';

// Tab components
import OverviewTab from './tabs/OverviewTab';
import EnhancedOverviewTab from './tabs/EnhancedOverviewTab';
import PerformanceTab from './tabs/PerformanceTab';
import PlayersTab from './tabs/PlayersTab';
import GamesTab from './tabs/GamesTab';

interface DashboardTabsProps extends CommonProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  dashboardData: any; // This should be typed more specifically based on your data structure
  isLoading: boolean;
  error: Error | null;
  theme: Theme;
}

// Tab interface
interface TabItem {
  id: number;
  label: string;
  component: React.ReactNode;
}

/**
 * Dashboard Tabs Component
 * Manages tab navigation and content rendering
 * Optimized with memoization to prevent unnecessary re-renders
 */
const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  onTabChange,
  dashboardData,
  isLoading,
  error,
  theme,
  sx
}) => {
  // Memoized tab change handler
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    if (onTabChange) {
      onTabChange(event, newValue);
    }
  }, [onTabChange]);

  // Memoized tab components to prevent unnecessary re-renders
  const tabComponents = useMemo((): TabItem[] => [
    {
      id: 0,
      label: "Dashboard Overview",
      component: (
        <EnhancedOverviewTab
          dashboardData={dashboardData}
          isLoading={isLoading}
          error={error}
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
        />
      )
    }
  ], [dashboardData, isLoading, error, theme]);

  // Memoized error fallback component
  const errorFallback = useCallback((message: string) => (
    <EmptyState
      message={message}
      icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
    />
  ), []);

  return (
    <div className="dashboard-tabs-container">
      {/* Dashboard Tabs */}
      <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', marginBottom: 24 }}>
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
      </div>

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
    </div>
  );
};

export default memo(DashboardTabs);
