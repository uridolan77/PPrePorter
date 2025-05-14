import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  SelectChangeEvent,
  IconButton,
  Tooltip
} from '@mui/material';
import SimpleBox from '../../components/common/SimpleBox';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Import common components
import ErrorBoundary from '../../components/common/ErrorBoundary';
import EmptyState from '../../components/common/EmptyState';

// Import context providers
import { FilterContextProvider } from '../../components/reports/interactive/FilterContext';
import { AnnotationContextProvider } from '../../components/reports/interactive/AnnotationSystem';

// Import tab content components
import {
  OverviewTabContent,
  PerformanceTabContent,
  PlayerAnalysisTabContent,
  GameAnalysisTabContent,
  AdvancedVisualizationsTabContent
} from './components';

// Import mock data
import dashboardMockData from '../../mockData/dashboard';

/**
 * Analytics tab interface
 */
interface AnalyticsTab {
  /** Unique identifier for the tab */
  id: string;
  /** Display label for the tab */
  label: string;
}

/**
 * Revenue data point interface
 */
interface RevenueDataPoint {
  date: string;
  revenue: number;
  deposits?: number;
  withdrawals?: number;
  netRevenue?: number;
  [key: string]: any;
}

/**
 * Player data point interface
 */
interface PlayerDataPoint {
  date: string;
  registrations: number;
  activeUsers?: number;
  newPlayers?: number;
  churn?: number;
  [key: string]: any;
}

/**
 * Game data interface
 */
interface GameData {
  id: string;
  name: string;
  category: string;
  plays: number;
  uniquePlayers: number;
  revenue: number;
  [key: string]: any;
}

/**
 * KPI metric interface
 */
interface KpiMetric {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  vsTarget?: number;
  forecast?: number;
}

/**
 * KPI metrics interface
 */
interface KpiMetrics {
  totalRevenue?: number;
  totalPlayers?: number;
  activeUsers?: number;
  conversionRate?: KpiMetric;
  averageSessionTime?: number;
  churnRate?: KpiMetric;
  revenue?: KpiMetric;
  ggr?: KpiMetric;
  ngr?: KpiMetric;
  deposits?: KpiMetric;
  withdrawals?: KpiMetric;
  activePlayers?: KpiMetric;
  newPlayers?: KpiMetric;
  firstTimeDepositors?: KpiMetric;
  averageDepositAmount?: KpiMetric;
  ltv?: KpiMetric;
  marketingCost?: KpiMetric;
  cpa?: KpiMetric;
  roi?: KpiMetric;
  players?: KpiMetric;
  [key: string]: any;
}

/**
 * Dashboard data interface
 */
interface DashboardData {
  /** Revenue data */
  revenue: RevenueDataPoint[];
  /** Player data */
  players: PlayerDataPoint[];
  /** Top games data */
  topGames: GameData[];
  /** KPI metrics data */
  kpi: KpiMetrics;
  /** Recent transactions data */
  recentTransactions?: any[];
}

// Define analytics tabs
const ANALYTICS_TABS: AnalyticsTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'performance', label: 'Performance' },
  { id: 'players', label: 'Player Analysis' },
  { id: 'games', label: 'Game Analysis' },
  { id: 'advanced', label: 'Advanced Visualizations' }
];

/**
 * AdvancedAnalyticsPage component
 *
 * A comprehensive analytics dashboard with various chart types and visualizations.
 * Features include:
 * - Multiple tabs for different analytics views (Overview, Performance, Players, Games, Advanced)
 * - Interactive charts and visualizations
 * - Time period filtering
 * - Data refresh functionality
 * - Responsive design for mobile and desktop
 *
 * @returns React component
 */
const AdvancedAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<string>('month');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    revenue: [],
    players: [],
    topGames: [],
    kpi: {
      totalRevenue: 0,
      totalPlayers: 0,
      activeUsers: 0,
      averageSessionTime: 0
    },
    recentTransactions: []
  });

  /**
   * Load dashboard data based on selected time period
   */
  const loadDashboardData = useCallback(async (period: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch data from mock services
      const revenueData = dashboardMockData.casinoRevenueMockData.getRevenueData({ period });
      const playerData = dashboardMockData.playerRegistrationsMockData.getRegistrationsData({ period });
      const topGamesData = dashboardMockData.topGamesMockData.getTopGames();
      const rawKpiData = dashboardMockData.kpiMockData.kpiData;

      // Convert raw KPI data to the correct type
      const convertTrendValue = (trend: string): 'up' | 'down' | 'stable' => {
        if (trend === 'up') return 'up';
        if (trend === 'down') return 'down';
        return 'stable';
      };

      // Create a properly typed KpiMetrics object
      const kpiData: KpiMetrics = {
        totalRevenue: 0,
        totalPlayers: 0,
        activeUsers: 0,
        averageSessionTime: 0
      };

      // Add converted properties from rawKpiData
      if (rawKpiData) {
        // Add simple properties
        Object.keys(rawKpiData).forEach(key => {
          // Use type assertion to fix TS7053 error
          const value = rawKpiData[key as keyof typeof rawKpiData];

          // Check if the value is an object with a trend property
          if (value && typeof value === 'object' && 'trend' in value) {
            // Convert the trend value to the correct type
            kpiData[key] = {
              ...value,
              trend: convertTrendValue(value.trend)
            };
          } else {
            // For simple values, just copy them
            kpiData[key] = value;
          }
        });
      }

      // Update state with fetched data, ensuring all data is properly formatted
      setDashboardData({
        revenue: Array.isArray(revenueData) ? revenueData : [],
        players: Array.isArray(playerData) ? playerData : [],
        topGames: Array.isArray(topGamesData) ? topGamesData : [],
        kpi: kpiData
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data when time period changes
  useEffect(() => {
    if (timePeriod !== 'refreshing') {
      loadDashboardData(timePeriod);
    }
  }, [timePeriod, loadDashboardData]);

  /**
   * Handle tab change
   * @param _event - React synthetic event
   * @param newValue - New tab index
   */
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  }, []);

  /**
   * Handle time period change
   * @param event - Select change event
   */
  const handleTimePeriodChange = useCallback((event: SelectChangeEvent): void => {
    setTimePeriod(event.target.value);
  }, []);

  /**
   * Handle refresh button click
   * Reloads dashboard data with current settings
   */
  const handleRefresh = useCallback((): void => {
    setLastUpdated(new Date());
    loadDashboardData(timePeriod);
  }, [timePeriod, loadDashboardData]);

  /**
   * Format last updated time for display
   * Memoized to prevent unnecessary recalculations
   */
  const formattedLastUpdated = useMemo(() => {
    return lastUpdated.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [lastUpdated]);

  return (
    <>
      <Helmet>
        <title>Advanced Analytics | PPrePorter</title>
        <meta name="description" content="Advanced analytics dashboard with comprehensive data visualizations and insights" />
      </Helmet>

      {/* Wrap the entire content with context providers */}
      <FilterContextProvider>
        <AnnotationContextProvider>
          <Container maxWidth="xl">
            {/* Header */}
            <SimpleBox
              component="header"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                mt: 2
              }}
            >
              <Typography variant="h4" component="h1">
                Advanced Analytics
              </Typography>
              <SimpleBox sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mr: 2 }}
                  aria-live="polite"
                >
                  Last updated: {formattedLastUpdated}
                </Typography>
                <Tooltip title="Refresh data">
                  <span>
                    <IconButton
                      onClick={handleRefresh}
                      disabled={isLoading}
                      aria-label="Refresh data"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </SimpleBox>
            </SimpleBox>

            {/* Tabs */}
            <SimpleBox
              component="nav"
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              role="navigation"
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="Analytics dashboard tabs"
                variant={isMobile ? 'scrollable' : 'standard'}
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                {ANALYTICS_TABS.map((tab, index) => (
                  <Tab
                    key={tab.id}
                    label={tab.label}
                    id={`tab-${tab.id}`}
                    aria-controls={`tabpanel-${tab.id}`}
                    disabled={isLoading}
                  />
                ))}
              </Tabs>
            </SimpleBox>

            {/* Error display - memoized to prevent unnecessary re-renders */}
            {useMemo(() => {
              if (!error) return null;

              return (
                <Paper
                  sx={{ p: 3, mb: 3, bgcolor: 'error.light' }}
                  role="alert"
                  aria-live="assertive"
                >
                  <Typography color="error" variant="h6">
                    Error
                  </Typography>
                  <Typography color="error">{error}</Typography>
                </Paper>
              );
            }, [error])}

            {/* Tab Content */}
            <SimpleBox component="main">
              <ErrorBoundary
                fallback={
                  <EmptyState
                    message="Something went wrong loading the analytics dashboard"
                    icon={<InfoOutlinedIcon />}
                  />
                }
              >
                {/* Render tab panels - memoized to prevent unnecessary re-renders */}
                {useMemo(() => (
                  ANALYTICS_TABS.map((tab, index) => (
                    <div
                      key={tab.id}
                      role="tabpanel"
                      hidden={activeTab !== index}
                      id={`tabpanel-${tab.id}`}
                      aria-labelledby={`tab-${tab.id}`}
                    >
                      {activeTab === index && (
                        <>
                          {index === 0 && (
                            <OverviewTabContent
                              dashboardData={dashboardData}
                              isLoading={isLoading}
                              timePeriod={timePeriod}
                              onTimePeriodChange={handleTimePeriodChange}
                            />
                          )}

                          {index === 1 && (
                            <PerformanceTabContent
                              dashboardData={dashboardData}
                              isLoading={isLoading}
                            />
                          )}

                          {index === 2 && (
                            <PlayerAnalysisTabContent
                              dashboardData={dashboardData}
                              isLoading={isLoading}
                            />
                          )}

                          {index === 3 && (
                            <GameAnalysisTabContent
                              dashboardData={dashboardData}
                              isLoading={isLoading}
                            />
                          )}

                          {index === 4 && (
                            <AdvancedVisualizationsTabContent
                              dashboardData={dashboardData}
                              isLoading={isLoading}
                            />
                          )}
                        </>
                      )}
                    </div>
                  ))
                ), [activeTab, dashboardData, handleTimePeriodChange, isLoading, timePeriod])}
              </ErrorBoundary>
            </SimpleBox>
          </Container>
        </AnnotationContextProvider>
      </FilterContextProvider>
    </>
  );
};

export default AdvancedAnalyticsPage;
